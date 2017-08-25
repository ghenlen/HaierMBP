var dialog = new auiDialog({});
var userInfo = $api.getStorage("userInfo");
var currency = BUSINESS_GetCurrency();
var pageNo = 0;
var isProductListEnd = false;
var imgWidth;
var imgHeight;
var isLookPriceStock = false;
apiready = function() {
	initDom();
	bindEvent();
	
	//统计页面访问次数
	BUSINESS_PageAccessStatics();
	
	$(window).scroll(function(event){  
	    var wScrollY = window.scrollY; // 当前滚动条位置    
	    var wInnerH = window.innerHeight; // 设备窗口的高度（不会变）    
	    var bScrollH = document.body.scrollHeight; // 滚动条总高度   
	   	if(wScrollY > 0){
	   		$api.removeCls($api.byId('scrollTop'), 'aui-hide');
	   	}else{
	   		$api.addCls($api.byId('scrollTop'), 'aui-hide');
	   	}
	});
};

function initDom() {
	var $header = $api.dom('header');
	var $footer = $api.dom('footer');
	$api.fixIos7Bar($header);
	$api.fixStatusBar($header);
	var $main = $api.byId('main');
	var headerHeight = $api.offset($header).h;

	COMMON_openFrame({
		name : 'common_product_head',
		url : 'common_product_head.html',
		rect : {
			x : 0,
			y : 0,
			w : api.winWidth,
			h : headerHeight
		},
		animation : CONSTANT_FRAME_ANIMATION
	});
	
	var permissions = $api.getStorage("permissions");
	if (permissions.indexOf(CONSTANT_AUTH_PLACE_ORDER_CODE) >= 0) {
		var $addToCart = $api.dom($api.byId('productTemplate'), '.add_to_cart_btn');
		$api.attr($addToCart, 'onclick1', 'onclick');
		$api.removeCls($addToCart, 'aui-btn-default');
		$api.addCls($addToCart, 'aui-btn-info');
	}
	if (permissions.indexOf('109') >= 0) {
		var $oosRemind = $api.dom($api.byId('productTemplate'), '.oos_remind');
		$api.removeCls($oosRemind, 'aui-hide');
	}
	if (permissions.indexOf(CONSTANT_AUTH_PRICE_STOCK_CODE) >= 0) {
		isLookPriceStock = true;
		var $price = $api.dom($api.byId('productTemplate'), '.price-info');
		$api.removeCls($price, 'aui-hide');
		
		var $stock = $api.dom($api.byId('productTemplate'), '.stock-info');
		$api.removeCls($stock, 'aui-hide');
	}
	
	loadDealerList();

	loadCommonList();
	
	imgWidth = Math.floor(api.screenWidth/4);
	imgHeight = imgWidth;
}

function bindEvent() {
	api.addEventListener({
		name : "scrolltobottom",
		extra : {
			threshold : 10
		}
	}, function(ret, err) {
		loadCommonList();
	});
}

/**
 * 加载购物清单数据
 */
function loadCommonList() {
	if (isProductListEnd) {
		return;
	}
	var userId = userInfo.id;
	var customerId = $api.val($api.byId('customerId'));
	var url = ajaxReqHost + 'appListWishList.ajax';
	COMMON_Ajax_Post(url, {
		values : {
			from : 'app',
			pageSize : pageSize,
			pageNo : pageNo,
			userId : userId,
			customerId : customerId
		}
	}, function(ret) {
		var productCodes = [];
		var productIds = [];
		var imgObj = {};
		if (ret && ret.list) {
			var list = ret.list;
			$api.html($api.byId('sumPrice'), '0.00');
			for (var i = 0; i < list.length; i++) {
				var productTemplate = $api.byId('productTemplate');
				var productCloneObj = productTemplate.cloneNode(true);
				var product = list[i];
				$api.html($api.dom(productCloneObj, '.title'), product.productTitle || '');
				$api.html($api.dom(productCloneObj, '.price_tag'), currency);
				$api.html($api.dom(productCloneObj, '.model'), product.productModel);

				$api.attr($api.dom(productCloneObj, 'div .img_bx'), 'onclick', "lookDetail('" + list[i].productId + "')");
				$api.attr($api.dom(productCloneObj, 'div .title'), 'onclick', "lookDetail('" + list[i].productId + "')");
				if (product.path) {
					var imgSrc = CONSTANT_IMG_CROP_URL + product.path + '&width=' + imgWidth + '&height=' + imgHeight;
					imgObj[product.productCode] = imgSrc;
				}

				$api.addCls($api.dom(productCloneObj, 'li'), 'code' + product.productCode);
				$api.addCls($api.dom(productCloneObj, 'li'), 'id' + product.productId);
				$api.attr($api.dom(productCloneObj, 'li'), 'id', product.id);
				$api.attr($api.dom(productCloneObj, 'li'), 'productCode', product.productCode);
				$api.attr($api.dom(productCloneObj, 'li'), 'productId', product.productId);

				$api.attr($api.dom(productCloneObj, '.add_to_cart_btn'), 'productId', product.productId);
				$api.attr($api.dom(productCloneObj, '.oos_remind'), 'productId', product.productId);
				$api.attr($api.dom(productCloneObj, '.delete_item'), 'id', product.id);

				$api.append($api.byId('commonList'), $api.html(productCloneObj));

				productCodes.push(product.productCode);
				productIds.push(product.productId);
			}
			
			for (var key in imgObj) {
				var $li = $api.dom('.code' + key);
				var $img = $api.dom($li, '.img_bx');
				var url = imgObj[key];
				COMMON_CacheImg(url, $img);
			}
			if(ret.list.length > 0){
				if(isLookPriceStock){
					var priceParam = {
						orgCode : CONSTANT_SALE_COMPANY_CODE,
						saleOffice: $api.val($api.byId('saleOffice')),
						plant: '',
						customerCode : $api.val($api.byId('customerCode')),
						productCodes : productCodes.join(',')
					};
					//获取产品价格
					BUSINESS_BachGetProductPrice(priceParam, fillProductPrice);
					
					var stockParam = {
						saleOffice: $api.val($api.byId('saleOffice')),
						customerCode : $api.val($api.byId('customerCode')),
						cartLocation: '',
						productCodes : productCodes.join(',')
					};
					//获取库存
					BUSINESS_BachGetProductStock(stockParam, fillStock);
				}
			}
			
			
			if (pageNo == 0) {
				api.toast({
					msg : 'Total Quantity: ' + ret.totalCount,
					duration : CONSTANT_TOAST_DURATION
				});
			}

			if (ret.list.length == 0 && pageNo == 0) {
				$api.removeCls($api.byId('noDataInfo'), 'aui-hide');
				return;
			}

			if (ret.list.length < pageSize) {
				$api.removeCls($api.byId('footInfo'), 'aui-hide');
				isProductListEnd = true;
				return;
			}
			
			pageNo = pageNo + 1;
			
		}
	});
}

function fillProductPrice(productPriceRet) {
	if (productPriceRet && productPriceRet.length > 0) {
		for (var m = 0; m < productPriceRet.length; m++) {
			var $lis = $api.domAll('.code' + productPriceRet[m].matnr);
			for (var n = 0; n < $lis.length; n++) {
				$api.html($api.dom($lis[n], '.price_tag'), currency);
				$api.html($api.dom($lis[n], '.invoice_price'), COMMON_COMMON_FormatCurrency(productPriceRet[m].price2));
				$api.html($api.dom($lis[n], '.discount_price'), currency + COMMON_COMMON_FormatCurrency(productPriceRet[m].price1));
				$api.html($api.dom($lis[n], '.sale_price'), currency + '<del>' + (COMMON_COMMON_FormatCurrency(productPriceRet[m].price2+productPriceRet[m].price1)) + '</del>');
			}
		}
	}
}

function fillStock(productStockRet) {
	if (productStockRet && productStockRet.length > 0) {
		for (var m = 0; m < productStockRet.length; m++) {
			var $lis = $api.domAll('.code' + productStockRet[m].materialNumber);
			for (var n = 0; n < $lis.length; n++) {
				$api.html($api.dom($lis[n], '.stock'), productStockRet[m].quantity);
			}
		}
	}
}

function loadDealerList() {
	var relations = BUSINESS_GetRelations();

	var cacheDealer = BUSINESS_GetCurrentDealer(userInfo.id);
	if (cacheDealer) {
		$api.val($api.byId('customerCode'), cacheDealer.customerCode);
		$api.html($api.byId('customerTitle'), cacheDealer.customerTitle);
		$api.val($api.byId('customerId'), cacheDealer.customerId);
		$api.val($api.byId('saleOffice'), cacheDealer.saleOffice);
	} else {
		if (relations && relations.length > 0) {
			$api.val($api.byId('customerCode'), relations[0].customerCode);
			$api.val($api.byId('customerId'), relations[0]['customer.id']);
			$api.val($api.byId('saleOffice'), relations[0]['SALES_OFFICE']);
			$api.html($api.byId('customerTitle'), relations[0].customerTitle);
		}
	}
}

function showDealerActionSelector() {
	COMMON_OpenWin({
		name : 'dealer_select',
		url : 'dealer_select.html',
		pageParam : {
			winName : "common_product",
			selected: $api.html($api.byId('customerTitle'))
		}
	});
}

function UPDATE_DEALER(param){
	var customerCode = param.customerCode;
	var customerId = param.customerId;
	var title = param.title;
	var saleOffice = param.saleOffice;
	var orgCode = param.orgCode;
	
	$api.val($api.byId('customerCode'), customerCode);
	$api.val($api.byId('customerId'), customerId);
	$api.val($api.byId('saleOffice'), saleOffice);
	$api.val($api.byId('orgCode'), orgCode);
	$api.html($api.byId('customerTitle'), title);

	var dealer = {
		'customerCode' : customerCode,
		'customerTitle' : title,
		'customerId' : customerId,
		saleOffice:saleOffice,
		orgCode: orgCode
	};
	BUSINESS_UpdateCurrentDealer(userInfo.id, dealer);

	pageNo = 0;
	$api.html($api.byId('commonList'), '');
	$api.addCls($api.byId('noDataInfo'), 'aui-hide');
	$api.addCls($api.byId('footInfo'), 'aui-hide');
	isProductListEnd = false;
	loadCommonList();
}

//加入购物车
function addtocart(me) {
	var amount = '';
	var dialogBox = api.require('dialogBox');
	dialogBox.amount({
		texts : {
			title : $.i18n.prop('modifyPurchaseQty'),
			default : '1',
			leftBtnTitle : $.i18n.prop('cancel'),
			rightBtnTitle : $.i18n.prop('ok')
		},
		styles : {
			bg : '#fff',
			corner : 2,
			w : 300,
			h : 170,
			title : {
				marginT : 20,
				size : 16,
				color : '#555'
			},
			input : {
				w : 200,
				h : 35,
				marginT : 25,
				size : 14,
				color : '#555'
			},
			dividingLine : {
				marginT : 10,
				width : 0.5,
				color : '#eee'
			},
			left : {
				marginL : 10,
				w : 130,
				h : 35,
				corner : 14,
					bg : '#f1f1f1',
					size : 14,
					color : '#555'
			},
			right : {
				marginR : 10,
				w : 130,
				h : 35,
				corner : 14,
					bg : '#1B7BEA',
					size : 14,
					color : '#fff'
			}
		}
	}, function(ret) {
		amount = ret.amount;
		if (ret.eventType == 'left') {
			var dialogBox = api.require('dialogBox');
			dialogBox.close({
				dialogName : 'amount'
			});
		} else if (ret.eventType == 'right') {
			if (COMMON_ValidPositiveInt(amount) == false) {
				api.alert({
					title : 'Warning',
					msg : $.i18n.prop('WARNING_POSITIVE_INT')
				}, function(ret, err) {
				});
				return;
			}
			//产品参数id
			var productId = $api.attr(me, 'productId');
			//用户id
			var userid = userInfo.id;

			addToCart(userid, $api.val($api.byId('customerId')), $api.val($api.byId('customerCode')), productId, amount);
		}
		var dialogBox = api.require('dialogBox');
		dialogBox.close({
			dialogName : 'amount'
		});
	});
	window.event.preventDefault();
	window.event.stopPropagation();
}

function addToCart(userId, customerId, customerCode, productId, qty) {
	var url = ajaxReqHost + 'appSaveCart.ajax';
	COMMON_Ajax_Post(url, {
		values : {
			userId : userId,
			customerId : customerId,
			customerCode : customerCode,
			productId : productId,
			qty : qty,
			type : '+'
		}
	}, function(ret) {
		if (ret && ret.result == true) {
			COMMON_toastSuccess();
		} else {
			COMMON_ShowFailure();
		}
	});
}

//缺货提醒
function addOosRemind(me) {
var productId = $api.attr(me, 'productId');
var customerCode=$api.val($api.byId('customerCode'));
	//先判断是否已经加过
	var validExistUrl = ajaxReqHost + 'appExistOssRemind.ajax?productId=' + productId + '&customerCode=' + customerCode;
	COMMON_Ajax_Get(validExistUrl, function(ret) {
		if (ret) {
			if (ret == 'true') {
				COMMON_ShowConfirm('The data already exists, continue to add？', function(){
					saveOos(productId);
				});
			} else {
				saveOos(productId);
			}
		}
	}, 'text');

	window.event.preventDefault();
	window.event.stopPropagation();
}

function deleteWishList(me) {
	COMMON_ShowConfirm('Are you sure to perform this operation？', function(){
		var id = $api.attr(me, 'id');

			//先判断是否已经加过
			var url = ajaxReqHost + 'appdeleteWishList.ajax';
			COMMON_Ajax_Post(url, {
				values : {
					id : id
				}
			}, function(ret) {
				if (ret && ret.result == true) {
					COMMON_toastSuccess();
					var $li = $api.closest(me, 'li');
					$api.remove($li);
				}
			});
	});

	window.event.preventDefault();
	window.event.stopPropagation();
}

function saveOos(productId) {
	COMMON_OpenWin({
		name : 'oos_add',
		url : '../html/oos_add.html',
		pageParam : {
			productId : productId,
			customerId : $api.val($api.byId('customerId'))
		}
	});
	return;

	var dialogBox = api.require('dialogBox');
	dialogBox.list({
		tapClose : true,
		texts : {
			title : $.i18n.prop('oos'),
			enter : $.i18n.prop('submit')
		},
		listTitles : [$.i18n.prop('quantity') + ": ", $.i18n.prop('overtime') + ": ", $.i18n.prop('remark') + ": "],
		styles : {
			bg : '#fff',
			corner : 5,
			w : api.winWidth - 100,
			h : 260,
			title : {
				h : 60,
				size : 18,
				color : '#666'
			},
			list : {
				h : 120,
				row : 3,
				title : {
					marginL : 10,
					size : 14,
					color : '#666'
				},
				content : {
					marginL : 90,
					size : 14,
					color : '#666'
				}
			},
			dividingLine : {
				width : 1,
				color : '#efefef'
			},
			enter : {
				w : 130,
				h : 35,
				marginT : 10,
				bg : '#1B7BEA',
				color : '#fff',
				size : 14
			}
		}
	}, function(ret) {
		if (ret.eventType == 'enter') {
			var amounts = ret.amounts;
			var qty = amounts[0];
			if ($api.trimAll(qty) == '') {
				api.alert({
					title : 'Warning',
					msg : $.i18n.prop('emptyValid').replace('[FIELD_NAME]', $.i18n.prop('quantity'))
				}, function(ret, err) {
				});
				return;
			}
			if (COMMON_ValidPositiveInt(qty) == false) {
				api.alert({
					title : 'Warning',
					msg : $.i18n.prop('WARNING_POSITIVE_INT')
				}, function(ret, err) {
				});
				return;
			}

			var timeOutDateTemp = amounts[1];
			if ($api.trimAll(timeOutDateTemp) == '') {
				api.alert({
					title : 'Warning',
					msg : $.i18n.prop('emptyValid').replace('[FIELD_NAME]', $.i18n.prop('overtime'))
				}, function(ret, err) {
				});
				return;
			}

			if (COMMON_checkDate(timeOutDateTemp) == false) {
				api.alert({
					title : 'Warning',
					msg : $.i18n.prop('WARNING_DATE_FMT_ERROR').replace("[FIELD_NAME]", "yyyy-MM-dd or yyyy/MM/dd")
				}, function(ret, err) {
				});
				return;
			}

			var date1 = new Date();
			var date2 = new Date(timeOutDateTemp);
			if (Date.parse(date1) > Date.parse(date2) == true) {
				api.alert({
					title : 'Warning',
					msg : $.i18n.prop('WARNING_DATE_GT_TODAY')
				}, function(ret, err) {
				});
				return;
			}

			var remark = amounts[2];
			var dialogBox = api.require('dialogBox');
			dialogBox.close({
				dialogName : 'list'
			});

			var url = ajaxReqHost + 'appSaveOssRemind.ajax';
			COMMON_Ajax_Post(url, {
				values : {
					productId : productId,
					qty : qty,
					'customer.id' : $api.val($api.byId('customerId')),
					userId : userInfo.id,
					'org.id' : BUSINESS_GetOrgId(),
					remark : remark,
					timeOutDateTemp : timeOutDateTemp
				}
			}, function(ret) {
				if (ret && ret.result == true) {
					api.toast({
						msg : $.i18n.prop('success')
					});
				} else {
					api.toast({
						msg : $.i18n.prop('fail')
					});
				}
			});
		}
	});
}

function lookDetail(id) {
	var customerId = $api.val($api.byId('customerId'));
	COMMON_OpenWin({
		name : 'product_detail',
		url : 'product_detail.html',
		pageParam : {
			productId : id,
			customerId : customerId
		}
	});
}


var customerCode = "";
var customerId = "";
var saleOffice = "";
var orgCode = "";

var term = "";
var productGroup = "";
var productCatalog = "";
var currency = BUSINESS_GetCurrency();
var userInfo = $api.getStorage("userInfo");
var pageNo = 0;
var dialog = new auiDialog({});
var isListEnd = false;
var isPlaceOrder = false;
var isLookPriceStock = false;
var isWishList = false;
var imgWidth,imgHeight;
var winHeight;
var winWidth;

apiready = function() {
	customerCode = api.pageParam.customerCode;
	customerId = api.pageParam.customerId;
	saleOffice = api.pageParam.saleOffice;
	orgCode = api.pageParam.orgCode;
	
	winHeight = api.frameHeight;
	winWidth = api.frameWidth;
	
	term = api.pageParam.term;
	if (term) {

	}
	productCatalog = api.pageParam.productCatalog || '';
	productGroup = api.pageParam.productGroup || '';
	
	/*
	api.setRefreshHeaderInfo({
		visible : false
	}, function(ret, err) {
		api.refreshHeaderLoadDone();
	});
	*/
	
	//上拉加载
	api.addEventListener({
		name : "scrolltobottom",
		extra : {
			threshold : 10
		}
	}, function(ret, err) {
		loadList();
	});
	
	var permissions = $api.getStorage("permissions");
	if (permissions.indexOf(CONSTANT_AUTH_PLACE_ORDER_CODE) >= 0) {
		isPlaceOrder = true;
		$api.removeCls($api.byId('turnToCart'), 'aui-hide');
		
		var $addToCart = $api.dom($api.byId('template'), '.add_to_cart_btn');
		$api.attr($addToCart, 'onclick1', 'onclick');
		$api.removeCls($addToCart, 'aui-btn-default');
		$api.addCls($addToCart, 'aui-btn-info');
	}
	if (permissions.indexOf('109') >= 0) {
		var $oosRemind = $api.dom($api.byId('template'), '.oos_remind');
		$api.removeCls($oosRemind, 'aui-hide');
	}
	if (permissions.indexOf(CONSTANT_AUTH_PRICE_STOCK_CODE) >= 0) {
		isLookPriceStock = true;
		var $price = $api.dom($api.byId('template'), '.price-info');
		$api.removeCls($price, 'aui-hide');
		
		var $stock = $api.dom($api.byId('template'), '.stock-info');
		$api.removeCls($stock, 'aui-hide');
	}
	if (permissions.indexOf(CONSTANT_WISHLIST) >= 0) {
		isWishList = true;
		var $wishlist = $api.dom($api.byId('template'), '.add_to_wishlist');
		$api.attr($wishlist, 'onclick1', 'onclick');
		$api.removeCls($wishlist, 'aui-btn-default');
		$api.addCls($wishlist, 'aui-btn-info');
	}
	
	imgWidth = Math.floor(api.screenWidth/4);
	imgHeight = imgWidth;
	
	//第一次获取数据
	loadList();
	
	getShoppingNum();
	
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
	
	
}

var isDrag = false;
window.onload=function(){
    var indexbtn = document.getElementById("turnToCart");
    indexbtn.addEventListener('touchstart',touch,false);
    indexbtn.addEventListener('touchmove',touch,false);
    indexbtn.addEventListener('touchend',touch,false);
    var x,y;
    function touch(event){
        var event = event || window.event;
        switch(event.type){
            case "touchstart":
            	isDrag = true;
                x = parseInt(event.touches[0].clientX);
                y = parseInt(event.touches[0].clientY);
                break;
            case "touchend":
                y =  parseInt(event.changedTouches[0].clientY);
                x = parseInt(event.changedTouches[0].clientX);
               	
                if(y<40){
                	y = "10px";
                }else if((y+70)>winHeight){
                	y = (winHeight - 70)+"px";
                }else{
                	y = (y-40)+"px";
                }
                
                if(x<40){
                	x = "0px";
                }else if((x+80)>winWidth){
                	x = (winWidth - 80)+"px";
                }else{
                	x = (x-40)+"px";
                }
                
               	indexbtn.style.top = y;
	        	indexbtn.style.left = x;
	        	isDrag = false;
               
                setTimeout(function(){
                	if(!isDrag){
                		indexbtn.style.opacity = 0.8;
                	}
                }, 5000);
                break;
            case "touchmove":
                event.preventDefault();
                y =  parseInt(event.touches[0].clientY);
                x = parseInt(event.touches[0].clientX);
                
                if(y<40){
                	y = "10px";
                }else if((y+70)>winHeight){
                	y = (winHeight - 70)+"px";
                }else{
                	y = (y-40)+"px";
                }
                
                if(x<40){
                	x = "0px";
                }else if((x+80)>winWidth){
                	x = (winWidth - 80)+"px";
                }else{
                	x = (x-40)+"px";
                }
                
               indexbtn.style.top = y;
               indexbtn.style.left = x;
               indexbtn.style.opacity = 1;
               break;
        }
    }
}
//加载页面
function loadList() {
	if (isListEnd) {
		return;
	}
	
	
	var param = {
			pageSize : 6,
			pageNo : pageNo,
			from : 'app',
			customerCode : customerCode,
			term : term,
			productGroup: productGroup,
			productCatalog : productCatalog
		};
	
	/**请求地址**/
	COMMON_Ajax_Post(ajaxReqHost + 'appSearchProduct.ajax', {
		values : {
			pageSize : 6,
			pageNo : pageNo,
			from : 'app',
			customerCode : customerCode,
			term : term,
			productGroup: productGroup,
			productCatalog : productCatalog
		}
	}, function(ret) {
		if (ret && ret.list) {
			var data = ret.list;
			var productCodeList = [];
			var productIdList = [];
			var imgObj = {};
			for (var i = 0; i < data.length; i++) {
				var template = $api.byId('template');
				var cloneObj = template.cloneNode(true);
				
				if (data[i].imgPath) {
					var imgSrc = CONSTANT_IMG_CROP_URL + data[i].imgPath + '&width=' + imgWidth + '&height=' + imgHeight;
					imgObj[data[i].code] = imgSrc;
				}

				$api.html($api.dom(cloneObj, '.title'), data[i].title);
				$api.html($api.dom(cloneObj, '.model'), data[i].model);
				$api.attr($api.dom(cloneObj, 'li'), 'id', data[i].id);
				$api.addCls($api.dom(cloneObj, 'li'), 'code' + data[i].code);
				$api.addCls($api.dom(cloneObj, 'li'), 'id' + data[i].id);
				$api.attr($api.dom(cloneObj, '.add_to_cart_btn'), 'productId', data[i].id);
				$api.attr($api.dom(cloneObj, '.add_to_wishlist'), 'productId', data[i].id);
				$api.attr($api.dom(cloneObj, '.oos_remind'), 'productId', data[i].id);
				
				$api.attr($api.dom(cloneObj, 'li'), 'productId', data[i].id);
				$api.attr($api.dom(cloneObj, 'li'), 'productCode', data[i].code);
				$api.append($api.byId('productList'), $api.html(cloneObj));
				productCodeList.push(data[i].code);
				productIdList.push(data[i].id);
			}
			
			/*
			for(var key in imgList){
			var $li = $api.dom('.code' + key);
			var $img = $api.dom($li, '.img_bx');
			var url = imgList[key];
			COMMON_CacheImg(url, $img);
			}
			*/
			
			for (var key in imgObj) {
				var $li = $api.dom('.code' + key);
				var $img = $api.dom($li, '.img_bx');
				var url = imgObj[key];
				COMMON_CacheImg(url, $img);
			}
			
			if(data.length > 0){
				if(isLookPriceStock){
					var priceParam = {
						orgCode : CONSTANT_SALE_COMPANY_CODE, 
						saleOffice: saleOffice,
						plant: '',
						customerCode : customerCode,
						productCodes : productCodeList.join(',')
					};
					//获取产品价格
					BUSINESS_BachGetProductPrice(priceParam, fillProductPrice);
					
					var stockParam = {
						saleOffice: saleOffice,
						customerCode : customerCode,
						cartLocation: '',
						productCodes : productCodeList.join(',')
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

			if (data.length == 0 && pageNo == 0) {
				$api.removeCls($api.byId('noDataInfo'), 'aui-hide');
				isListEnd = true;
				return;
			}

			if (data.length < 6) {
				$api.removeCls($api.byId('footInfo'), 'aui-hide');
				isListEnd = true;
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
				$api.html($api.dom($lis[n], '.discount_price'), currency +COMMON_COMMON_FormatCurrency( productPriceRet[m].price1));
				$api.html($api.dom($lis[n], '.sale_price'), currency + '<del>' + COMMON_COMMON_FormatCurrency(productPriceRet[m].price1+productPriceRet[m].price2) + '</del>');
			}
		}
	}
}

function fillStock(productStockRet) {
	if (productStockRet && productStockRet.length > 0) {
		for (var m = 0; m < productStockRet.length; m++) {
			var $lis = $api.domAll('.code' + productStockRet[m].materialNumber);
			for (var n = 0; n < $lis.length; n++) {
				$api.html($api.dom($lis[n], '.stock'), 'Stock: '+productStockRet[m].quantity);
			}
		}
	}
}

//跳转页面
function lookDetail(me) {
	var productId = $api.attr(me, 'productId');
	var productCode = $api.attr(me, 'productCode');
	COMMON_OpenWin({
		name : 'product_detail',
		url : 'product_detail.html',
		pageParam : {
			productId : productId,
			customerId : customerId,
			productCode: productCode,
			customerCode: customerCode,
			saleOffice: saleOffice,
			orgCode: orgCode
		}
	});
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

			addToCart(userid, customerId, productId, amount);
		}
		var dialogBox = api.require('dialogBox');
		dialogBox.close({
			dialogName : 'amount'
		});
	});
	window.event.preventDefault();
	window.event.stopPropagation();
}

function addtocart1(){
	api.toast({
	    msg:'No Authentication!'
    });
	window.event.preventDefault();
	window.event.stopPropagation();
}

//缺货提醒
function addOosRemind(me) {
	var productId = $api.attr(me, 'productId');
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
	return;

	api.confirm({
		title : 'Tip',
		msg : 'Are you sure to perform this operation？',
		buttons : ['OK', 'Cancel']
	}, function(ret, err) {
		if (ret.buttonIndex == 1) {
			var productId = $api.attr(me, 'productId');

			//先判断是否已经加过
			var validExistUrl = ajaxReqHost + 'appExistOssRemind.ajax?productId=' + productId + '&customerCode=' + customerCode;
			COMMON_Ajax_Get(validExistUrl, function(ret) {
				if (ret) {
					if (ret == 'true') {
						api.confirm({
							title : $.i18n.prop('tip'),
							msg : $.i18n.prop('WARNING_DATA_EXIST'),
							buttons : [$.i18n.prop('new'), $.i18n.prop('update')]
						}, function(ret, err) {
							if (ret.buttonIndex == 1) {
								saveOos(productId);
							}
						});

					} else {
						saveOos(productId);
					}
				}
			}, 'text');
		}
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
			customerId : customerId
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
					'customer.id' : customerId,
					userId : userInfo.id,
					'org.id' : BUSINESS_GetOrgId(),
					remark :remark,
					timeOutDateTemp : timeOutDateTemp
				}
			}, function(ret) {
				if (ret && ret.result == true) {
					COMMON_toastSuccess();
				} else {
					COMMON_ShowFailure();
				}
			});
		}
	});
}

function addToCart(userId, customerId, productId, qty) {
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
			var startPosition = $('.id'+productId).offset();
			
			var addcar = $('.id'+productId);
			
			var endPosition = $("#turnToCart").position();
			
			var img = addcar.find('img').attr('src');
			var flyer = $('<img class="u-flyer" src="'+img+'">');
			flyer.fly({
				start: {
					left: startPosition.left,
					top: startPosition.top - $(window).scrollTop()
				},
				end: {
					left: endPosition.left+30,
					top: endPosition.top+30,
					width: 0,
					height: 0
				},
				onEnd: function(){
					this.destory();
				}
			});
			getShoppingNum();
			api.sendEvent({
	        	name:'updShoppingNum'
        	});
		} else {
			COMMON_ShowFailure();
		}
	});
}

function addtoWishlist(me) {
	//产品id
	var productId = $api.attr(me, 'productId');
	//用户id
	var userId = userInfo.id;
	var orgId = BUSINESS_GetOrgId();

	var isExistsWishUrl = ajaxReqHost + 'appExistsListWish.ajax';
	var paramExistsWish = {
		from : 'app',
		pageSize : 10,
		pageNo : 1,
		userId : userId,
		productId : productId,
		customerId : customerId
	}
	COMMON_Ajax_Post(isExistsWishUrl, {
		values : paramExistsWish
	}, function(ret) {
		if (ret.result) {
			api.toast({
				msg : 'The product have been collected'
			});
		}else{
			var url = ajaxReqHost + 'appSaveWishList.ajax';
			COMMON_Ajax_Post(url, {
				values : {
					userId : userId,
					orgId : orgId,
					customerId : customerId,
					productId : productId
				}
			}, function(ret) {
				if (ret && ret.result == true) {
					COMMON_toastSuccess();
				} else {
					COMMON_ShowFailure();
				}
			});
		}

	});
	
	window.event.preventDefault();
	window.event.stopPropagation();
}

function turnToCart() {
	var date = new Date();
	COMMON_OpenWin({
		name : 'main_page' + date.getTime(),
		url : 'index.html',
		pageParam: {
			index: 1,
			isNew: true
		}
	});
}

//更新数据库中的产品价格
function updateDbProductPrice(param) {
	var db = api.require('db');
	//先判断是否有该条记录
	var validExistSql = "select count(1) from product_price where  productCode = '" + param.productCode + "' and  customerCode= '" + param.customerCode + "'";
	db.selectSql({
		name : 'data',
		sql : validExistSql
	}, function(ret, err) {
		if (ret.status) {

		} else {
			COMMON_toastError(err);
		};
	});
	//如果有，则进行更新，没有则新增
	var addPirceSql = "insert into product_price ";
	db.executeSql({
		name : 'data',
		sql : addPirceSql
	}, function(ret, err) {
		if (ret.status) {

		} else {
			COMMON_toastError(err);
		};
	});

	var updProductPriceSql = "update product_price set invoicePrice = '" + param.invoicePrice + "',salePrice='" + param.salePrice + "',discountPrice='" + param.discountPrice + "'  where productCode = '" + param.productCode + "' and  customerCode= '" + param.customerCode + "'";
	db.executeSql({
		name : 'data',
		sql : updProductPriceSql
	}, function(ret, err) {
		if (ret.status) {

		} else {
			COMMON_toastError(err);
		};
	});
}

//获取购物车的数量
function getShoppingNum(){
	var userInfo = $api.getStorage("userInfo");
	var userId = userInfo.id;
	var customerId = "";
	
	var relations = BUSINESS_GetRelations();
	var cacheDealer = BUSINESS_GetCurrentDealer(userInfo.id);
	if (cacheDealer) {
		customerId = cacheDealer.customerId;
	} else {
		if (relations && relations.length > 0) {
			customerId = relations[0]['customer.id'];
		}
	}
	var url = ajaxReqHost + 'appListCart.ajax';
	COMMON_Ajax_Post(url, {
		values : {
			from : 'app',
			pageSize : '1',
			pageNo : '0',
			userId : userId,
			customerId : customerId
		}
	}, function(ret) {
		if (ret && ret.list) {
			if(ret.totalCount > 0){
				var $shoppingNum = $api.byId('cartNum');
				$api.html($shoppingNum, ret.totalCount);
			}
		}
	});
}


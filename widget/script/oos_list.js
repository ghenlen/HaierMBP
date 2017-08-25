var dialog = new auiDialog({});
var currency = BUSINESS_GetCurrency();
var page_no = 0;
var isListEnd = false;
var userInfo = $api.getStorage("userInfo");
var productModelTitle = "";

var productDivisionListData = [{
	'id' : '-1',
	'name' : 'Product Division'
}]

var statusList = [{
	'id' : '',
	'name' : 'All'
}, {
	'id' : '03',
	'name' : 'In Stock'
}, {
	'id' : '01',
	'name' : 'Out of Stock'
}, {
	'id' : '02',
	'name' : 'Expired'
}, {
	'id' : '04',
	'name' : 'Complete'
}];
var imgWidth,imgHeight;
apiready = function() {
	
	imgWidth = Math.floor(api.screenWidth/4);
	imgHeight = imgWidth;
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
	$api.fixIos7Bar($header);
	$api.fixStatusBar($header);
	var headerHeight = $api.offset($header).h;
	COMMON_openFrame({
		name : 'oos_list_head',
		url : 'oos_list_head.html',
		rect : {
			x : 0,
			y : 0,
			w : api.winWidth,
			h : headerHeight
		},
		animation : CONSTANT_FRAME_ANIMATION
	});
	initDealer();
	//getProductDivisionList();
	loadOosList();

	api.addEventListener({
		name : "scrolltobottom",
		extra : {
			threshold : 10
		}
	}, function(ret, err) {
		loadOosList();
	})
}

function initDealer() {
	//客户列表
	var relations = BUSINESS_GetRelations();

	var cacheDealer = BUSINESS_GetCurrentDealer(userInfo.id);
	if (cacheDealer) {
		$api.val($api.byId('customerId'), cacheDealer.customerId);
		$api.val($api.byId('customerCode'), cacheDealer.customerCode);
		$api.html($api.byId('dealerName'), cacheDealer.customerTitle);
		$api.val($api.byId('saleOffice'), cacheDealer.saleOffice);

	} else {
		if (relations && relations.length > 0) {
			$api.val($api.byId('customerId'), relations[0]['customer.id']);
			$api.val($api.byId('customerCode'), relations[0].customerCode);
			$api.val($api.byId('saleOffice'), relations[0].SALES_OFFICE);
			$api.html($api.byId('dealerName'), relations[0].customerTitle);
		}
	}
}

function getProductDivisionList() {
	var url = ajaxReqHost + 'appGetDictionary.ajax';
	COMMON_Ajax_Post(url, {
		values : {
			dicType : 'PRODUCT_GROUP_TYPE'
		}
	}, function(ret) {
		if (ret && ret.length > 0) {
			for (var i = 0; i < ret.length; i++) {
				productDivisionListData.push({
					'name' : ret[i].title,
					'id' : ret[i].value
				});

				if (i == 0) {
					$api.val($api.byId('productDivisionValue'), productDivisionListData[0].id);
					$api.html($api.byId('productDivisionText'), productDivisionListData[0].name);
				}
			}
		} else {
		}
	});
}

function showDealerActionSelector() {
	COMMON_OpenWin({
		name : 'dealer_select',
		url : 'dealer_select.html',
		pageParam : {
			winName : "oos_list",
			selected: $api.html($api.byId('dealerName'))
		}
	});
}

function UPDATE_DEALER(param){
	var customerCode = param.customerCode;
		var customerId = param.customerId;
		var title = param.title;
		var saleOffice = param.saleOffice;
		var orgCode = param.orgCode;

		$api.html($api.byId('dealerName'), title);
		$api.val($api.byId('customerCode'), customerCode);
		$api.val($api.byId('customerId'), customerId);
		$api.val($api.byId('saleOffice'), saleOffice);

		var dealer = {
			'customerCode' : customerCode,
			'customerTitle' : title,
			'customerId' : customerId,
			'saleOffice' : saleOffice,
			'orgCode' : orgCode,
		};
		BUSINESS_UpdateCurrentDealer(userInfo.id, dealer);

		page_no = 0;
		$api.addCls($api.byId('noDataInfo'), 'aui-hide');
		$api.addCls($api.byId('footInfo'), 'aui-hide');
		isListEnd = false;
		$api.html($api.byId('oosList'), '');
		loadOosList();
}

function UPDATE_PRODUCTGROUP(pg){
	$api.html($api.byId('productDivisionText'), pg.name);
	$api.val($api.byId('productDivisionValue'), pg.id);
	page_no = 0;
	$api.addCls($api.byId('noDataInfo'), 'aui-hide');
	$api.addCls($api.byId('footInfo'), 'aui-hide');
	isListEnd = false;
	$api.html($api.byId('oosList'), '');
	loadOosList();
}

function showProductDivisionActionSelector() {
	var productGroup = $api.val($api.byId('productDivisionValue'));
	COMMON_OpenWin({
		name: 'product_group',
		url: 'product_group.html',
		pageParam : {
			winName : "oos_list",
			selectedId: productGroup
		}
	});
	
	return;
	var buttons = [];
	for(var i=0; i<productDivisionListData.length; i++){
		buttons.push(productDivisionListData[i].name);
	}
	COMMON_actionSheet('Selected: '+$api.html($api.byId('productDivisionText')), buttons, function(ret){
		$api.html($api.byId('productDivisionText'), productDivisionListData[ret].name);
		$api.val($api.byId('productDivisionValue'), productDivisionListData[ret].id);
		page_no = 0;
		$api.addCls($api.byId('noDataInfo'), 'aui-hide');
		$api.addCls($api.byId('footInfo'), 'aui-hide');
		isListEnd = false;
		$api.html($api.byId('oosList'), '');
		loadOosList();
	});
	
return;
	
	COMMON_ActionSelector(productDivisionListData, function(ret) {
		$api.html($api.byId('productDivisionText'), ret.level1);
		$api.val($api.byId('productDivisionValue'), ret.selectedInfo[0].id);
		page_no = 0;
		$api.addCls($api.byId('noDataInfo'), 'aui-hide');
		$api.addCls($api.byId('footInfo'), 'aui-hide');
		isListEnd = false;
		$api.html($api.byId('oosList'), '');
		loadOosList();
	});
}

function showStatusActionSelector() {
	var buttons = [];
	for(var i=0; i<statusList.length; i++){
		buttons.push(statusList[i].name);
	}
	COMMON_actionSheet('Selected: '+$api.html($api.byId('status')), buttons, function(ret){
		var name = statusList[ret].name;
		if(name == 'All'){
			name = 'Status'
		}
		
		$api.html($api.byId('status'), name);
		$api.val($api.byId('statusId'), statusList[ret].id);
		page_no = 0;
		$api.addCls($api.byId('noDataInfo'), 'aui-hide');
		$api.addCls($api.byId('footInfo'), 'aui-hide');
		isListEnd = false;
		$api.html($api.byId('oosList'), '');
		loadOosList();
	});
	
return;

	COMMON_ActionSelector(statusList, function(ret) {
		$api.html($api.byId('status'), ret.level1);
		$api.val($api.byId('statusId'), ret.selectedInfo[0].id);
		page_no = 0;
		$api.addCls($api.byId('noDataInfo'), 'aui-hide');
		$api.addCls($api.byId('footInfo'), 'aui-hide');
		isListEnd = false;
		$api.html($api.byId('oosList'), '');
		loadOosList();
	});
}

function bindEvent() {
}

/**
 * 加载缺货清单数据
 */
function loadOosList() {
	if (isListEnd) {
		return;
	}
	//货币单位
	var customerCode=$api.val($api.byId('customerCode'))
	var userId = userInfo.id;
	var customerId = $api.html($api.byId('sumPrice'), '0.00');
	//$api.html($api.byId('oosList'), '');
	var status = $api.val($api.byId('statusId'));
	
	var productGroup = $api.val($api.byId('productDivisionValue'));
	if (productGroup == '-1') {
		productGroup = '';
	}
	var param={
			"from" : "app",
			pageSize : pageSize,
			pageNo : page_no,
			userId : userId,
			'customer.id' : $api.val($api.byId('customerId')),
			'status' : '',
			'isTimeOut':'N',
			'productGroup' : productGroup,
			'model':productModelTitle
		};
	var url = ajaxReqHost + 'appListOssRemind.ajax';
	COMMON_Ajax_Post(url, {
		values : param
	}, function(ret) {
		var productCodes = [];
		var productIds = [];
		var imgObj = {};
		if (ret && ret.list) {
			var list = ret.list;
			for (var i = 0; i < list.length; i++) {
				var productTemplate = $api.byId('productTemplate');
				var productCloneObj = productTemplate.cloneNode(true);
				var product = list[i];
				$api.html($api.dom(productCloneObj, '.product_name'), product.title);
				$api.html($api.dom(productCloneObj, '.price_tag'), currency);
				$api.html($api.dom(productCloneObj, '.model'), product.model);
				$api.html($api.dom(productCloneObj, '.qty'), product.surplusQty);
				$api.attr($api.dom(productCloneObj, '.li'),'surplusQty', product.surplusQty);

				$api.html($api.dom(productCloneObj, '.overtimeText'), formatTimeToTime(product.timeOutDate) || '');
				$api.html($api.dom(productCloneObj, '.remarkText'), product.remark || '');
				$api.html($api.dom(productCloneObj, '.purchasedNum'), product.qty - product.surplusQty);
				$api.html($api.dom(productCloneObj, '.soldToText'), product['customer.customerTitle'] || '');

				if (product.path) {
					var imgSrc = CONSTANT_IMG_CROP_URL + product.path + '&width=' + imgWidth + '&height=' + imgWidth;
					var productImg=product.code;
					imgObj[productImg] = imgSrc;
				}

				$api.addCls($api.dom(productCloneObj, 'li'), product.code);
				$api.addCls($api.dom(productCloneObj, 'li'), 'id' + product.productId);
				$api.attr($api.dom(productCloneObj, 'li'), 'id', product.id);
				$api.attr($api.dom(productCloneObj, 'li'), 'productCode', product.code);
				$api.attr($api.dom(productCloneObj, 'li'), 'productId', product.productId);

				$api.attr($api.dom(productCloneObj, 'div .produce_img'), 'onclick', "lookDetail('" + product.productId + "')");
				$api.attr($api.dom(productCloneObj, 'div .product_name'), 'onclick', "lookDetail('" + product.productId + "')");

				$api.attr($api.dom(productCloneObj, '.add_to_cart'), 'productId', product.productId);

				$api.attr($api.dom(productCloneObj, '.sub_btn'), 'id', product.id);
				$api.attr($api.dom(productCloneObj, '.plus_btn'), 'id', product.id);

				
				$api.append($api.byId('oosList'), $api.html(productCloneObj));

				productCodes.push(product.code);
				productIds.push(product.productId);

			}

			for (var key in imgObj) {
				var $li = $api.domAll('.'+key);
				for(var j=0;j<$li.length;j++){
					var $img = $api.dom($li[j], '.produce_img');
					var url = imgObj[key];
					COMMON_CacheImg(url, $img);
				}
				
			}
			if(ret.list.length > 0){
				var priceParam = {
					orgCode : CONSTANT_SALE_COMPANY_CODE,
					saleOffice : $api.val($api.byId('saleOffice')),
					plant : '',
					customerCode : customerCode,
					productCodes : productCodes.join(',')
				};
				//获取产品价格
				BUSINESS_BachGetProductPrice(priceParam, fillProductPrice);

				var stockParam = {
					saleOffice : $api.val($api.byId('saleOffice')),
					customerCode : customerCode,
					cartLocation : '',
					productCodes : productCodes.join(',')
				};
				//获取库存
				BUSINESS_BachGetProductStock(stockParam, fillStock);
			}

			if (page_no == 0) {
				api.toast({
					msg : 'Total Quantity: ' + ret.totalCount,
					duration : CONSTANT_TOAST_DURATION
				});
			}

			if (ret.list.length == 0 && page_no == 0) {
				$api.removeCls($api.byId('noDataInfo'), 'aui-hide');
				return;
			}

			if (ret.list.length == ret.totalCount) {
				$api.removeCls($api.byId('footInfo'), 'aui-hide');
				isListEnd = true;
				return;
			}

			if (ret.list.length < pageSize) {
				$api.removeCls($api.byId('footInfo'), 'aui-hide');
				isListEnd = true;
				return;
			}
			page_no = page_no + 1;
		}
	});
}

function fillProductPrice(productPriceRet) {
	if (productPriceRet && productPriceRet.length > 0) {
		for (var m = 0; m < productPriceRet.length; m++) {
			var $lis =$api.domAll('.'+productPriceRet[m].matnr);
			for (var n = 0; n < $lis.length; n++) {
				$api.html($api.dom($lis[n], '.invoice_price'), COMMON_COMMON_FormatCurrency(productPriceRet[m].price2));
				$api.html($api.dom($lis[n], '.discount_price'), currency + COMMON_COMMON_FormatCurrency(productPriceRet[m].price1));
				$api.html($api.dom($lis[n], '.sale_price'), currency + '<del>' + (COMMON_COMMON_FormatCurrency(productPriceRet[m].price2 + productPriceRet[m].price1)) + '</del>');
			}
		}
	}
}

function fillStock(productStockRet) {
	if (productStockRet && productStockRet.length > 0) {
		for (var m = 0; m < productStockRet.length; m++) {
			var $lis = $api.domAll('.' + productStockRet[m].materialNumber);
			for (var n = 0; n < $lis.length; n++) {
				$api.html($api.dom($lis[n], '.stock'), productStockRet[m].quantity);
				
				
				var qty = $api.html($api.dom($lis[n], '.qty'));
				var overtime = new Date($api.html($api.dom($lis[n], '.overtimeText')));
				var now =  new Date();
				
				var surplusQty = $api.attr($lis[n], 'surplusQty');
				if((overtime.getTime() - now.getTime())<0){ //过期
					//$api.removeAttr($api.dom($lis[n], '.add_to_cart'), 'onclick');
					$api.removeAttr($api.dom($lis[n], '.sub_btn'), 'onclick');
					$api.removeAttr($api.dom($lis[n], '.qty'), 'onclick');
					$api.removeAttr($api.dom($lis[n], '.plus_btn'), 'onclick');
					
					$api.removeCls($api.dom($lis[n], '.expired'), 'aui-hide');
					$api.removeCls($api.dom($lis[n], '.expired_text'), 'aui-hide');
				}else if((parseInt(productStockRet[m].quantity) - parseInt(qty))<0){ //缺货
					
				}else if((parseInt(productStockRet[m].quantity) - parseInt(qty))>0){ //有货
					$api.removeCls($api.dom($lis[n], '.instock'), 'aui-hide');
					$api.removeCls($api.dom($lis[n], '.instock_text'), 'aui-hide');
				}else if(parseInt(surplusQty) == 0){
					$api.removeCls($api.dom($lis[n], '.complete'), 'aui-hide');
					$api.removeCls($api.dom($lis[n], '.complete_text'), 'aui-hide');
				}
				
				var searchStatus = $api.val($api.byId('statusId'));
				if(searchStatus == '03'){
					if(((parseInt(productStockRet[m].quantity) - parseInt(qty))>0) && ((overtime.getTime() - now.getTime())>0) && (status != '4')){
					}else{
						$api.remove($lis[n]);
					}
				}else if(searchStatus == '01'){
					if(((parseInt(productStockRet[m].quantity) - parseInt(qty))<0) && ((overtime.getTime() - now.getTime())>0) && (status != '4')){ 
					}else{
						$api.remove($lis[n]);
					}
				}else if(searchStatus == '02'){
					if(((overtime.getTime() - now.getTime())<0) && (status != '4')){ 
					}else{
						$api.remove($lis[n]);
					}
				}else if(searchStatus == '04'){
					if(parseInt(surplusQty) == 0){ 
					}else{
						$api.remove($lis[n]);
					}
				}
			}
		}
	}
}

function updProductNum(qty, productId, inputEle) {
	$api.val(inputEle, qty);
}

//加入购物车
function addToCart(me) {
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
			var userId = userInfo.id;
			var customerId = $api.val($api.byId('customerId'));
			var customerCode = $api.val($api.byId('customerCode'));
			var url = ajaxReqHost + 'appSaveCart.ajax';
			COMMON_Ajax_Post(url, {
				values : {
					userId : userId,
					customerId : customerId,
					customerCode : customerCode,
					productId : productId,
					qty : amount,
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
		var dialogBox = api.require('dialogBox');
		dialogBox.close({
			dialogName : 'amount'
		});
	});
	window.event.preventDefault();
	window.event.stopPropagation();
}

//编辑购物数量
function editProductNum(me) {
	var num = $api.html(me);
	var dialogBox = api.require('dialogBox');
	dialogBox.amount({
		texts : {
			title : $.i18n.prop('modifyPurchaseQty'),
			default : parseInt(num),
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
		if (ret.eventType == 'right') {
			var inputNum = ret.amount;
			if ($api.trim(inputNum) == '' || $api.trim(inputNum) == '0') {
				api.toast({
					msg : $.i18n.prop('numValidGtZero')
				});
				return;
			}

			var reg = new RegExp("^[0-9]*$");
			if (!reg.test(inputNum)) {
				api.toast({
					msg : $.i18n.prop('numValidGtZero')
				});
				return;
			}

			inputNum = parseInt(inputNum);

			var parent = $api.closest(me, '.product');

			var id = $api.attr(parent, 'id');
			var purchasedNum = $api.html($api.dom(parent, '.purchasedNum'));
			updateSumNum(inputNum, purchasedNum, id, me);

		}
		var dialogBox = api.require('dialogBox');
		dialogBox.close({
			dialogName : 'amount'
		});
	});
}

function showDetailInfo(me) {
	$api.addCls(me, 'aui-hide');
	$api.toggleCls($api.dom($api.closest(me, 'li'), '.detailInfo'), 'aui-show');
}

function subProductNum(me) {
	var parent = $api.closest(me, '.product');
	var product_num_div = $api.dom(parent, '.qty');
	var val = $api.html(product_num_div);
	var purchasedNum = $api.html($api.dom(parent, '.purchasedNum'));
	val = parseInt(val);
	if (val != 1) {
		var newVal = val - 1;
		var id = $api.attr(parent, 'id');
		updateSumNum(newVal, purchasedNum, id, product_num_div);
	}
}

function addProductNum(me) {
	var parent = $api.closest(me, '.product');
	var product_num_div = $api.dom(parent, '.qty');
	var val = $api.html(product_num_div);
	var purchasedNum = $api.html($api.dom(parent, '.purchasedNum'));
	var newVal = parseInt(val) + 1;
	var id = $api.attr(parent, 'id');
	updateSumNum(newVal, purchasedNum, id, product_num_div);
}

function updateSumNum(qty, purchasedNum, id, qtyShowEle) {
	var sumNum = parseInt(qty) + parseInt(purchasedNum);
	var url = ajaxReqHost + 'appSaveOssRemind.ajax';
	COMMON_Ajax_Post(url, {
		values : {
			id : id,
			qty : sumNum
		}
	}, function(ret) {
		if (ret && ret.result == true) {
			COMMON_toastSuccess();
			$api.html(qtyShowEle, qty);
		} else {
			COMMON_ShowFailure();
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

function search() {
	COMMON_UISearchBar(function(ret) {
		var searchTitle=$api.trim(ret.text);
		$api.html($api.byId("productModel"), searchTitle);
		$api.css($api.byId('resetResolvedSearchBtn'), 'display:inline-block');
		$api.css($api.byId("searchBtn"),"display:none");
		page_no = 0;
		isListEnd = false;
		productModelTitle = searchTitle;
		$api.html($api.byId('oosList'), '');
		$api.addCls($api.byId('footInfo'), 'aui-hide');
		$api.addCls($api.byId('noDataInfo'), 'aui-hide');
		loadOosList();

	});
}

function resetResolvedSearch() {
	$api.css($api.byId("searchBtn"),"display:inline-block");
	$api.css($api.byId('resetResolvedSearchBtn'), 'display:none');
	$api.html($api.byId('productModel'), 'Product Model');
	page_no = 0;
	isListEnd = false;
	productModelTitle = '';
	$api.html($api.byId('oosList'), '');
	$api.addCls($api.byId('footInfo'), 'aui-hide');
	$api.addCls($api.byId('noDataInfo'), 'aui-hide');
	loadOosList();

}

function formatTimeToTime(time) {
	if (time) {
		var date = new Date(time);
		var year = date.getYear();
		if(year<2000){
			year=year+1900;
		}
		var month = date.getMonth() + 1;
		month = month < 10 ? '0' + month : month;
		var day = date.getDate();
		day = day < 10 ? '0' + day : day;
		return year + '-' + month + '-' + day ;
	} else {
		return "";
	}
}
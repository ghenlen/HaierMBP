var page_no = 0;
var page_count = 0;
var dialog = new auiDialog({});
var $select_all_btn;
var $select_btn_groups;
var shipToList = [];
var payToList = [];
var locationList = [];
var flag = '0';
var isShopListEnd = false;
var userInfo = $api.getStorage("userInfo");
var currency = BUSINESS_GetCurrency();
var db;
var imgWidth,imgHeight;
apiready = function() {
	var $header = $api.dom('header');
	var headerHeight = $api.offset($header).h;
	
	imgWidth = Math.floor(api.screenWidth/4);
	imgHeight = imgWidth;
	
	$api.css($api.byId('main'),'padding-top:'+headerHeight+'px');	
	if(api.systemType == 'ios'){
	 	if(api.winName == 'main_page'){
	 		api.addEventListener({
		        name: 'swiperight'
		    }, function (ret, err) {
		    });
	 	}
    }
	init();
	api.sendEvent({
		name:'updShoppingNum'
	});
	
	api.addEventListener({
	    name:'updList'
	}, function(ret, err){
		refresh();
	});
	/*
	 api.setRefreshHeaderInfo({
	 visible : true,
	 bgColor : '#efefef',
	 textColor : '#666',
	 textUp : $.i18n.prop('release4Upd'),
	 textDown : $.i18n.prop('updated'),
	 showTime:false
	 }, function(ret, err) {
	 api.refreshHeaderLoadDone();
	 $api.html($api.byId('shopingList'), '');
	 $api.html($api.byId('sumPrice'), '0.00');
	 loadShopingList();
	 });
	 */

	/*
	 setTimeout(function() {
	 api.setFrameAttr({
	 name : "shopping_list_head",
	 hidden : true
	 })
	 }, 1000);
	 */

	//页面访问次数统计
	BUSINESS_PageAccessStatics();

	api.addEventListener({
		name : "scrolltobottom",
		extra : {
			threshold : 50
		}
	}, function(ret, err) {
		loadShopingList();
	});

	db = api.require('db');
	
	$(window).scroll(function(event){  
	    var wScrollY = window.scrollY; // 当前滚动条位置    
	    var wInnerH = window.innerHeight; // 设备窗口的高度（不会变）    
	    var bScrollH = document.body.scrollHeight; // 滚动条总高度   
	   	if(wScrollY > 200){
	   		$api.removeCls($api.byId('scrollTop'), 'aui-hide');
	   	}else{
	   		$api.addCls($api.byId('scrollTop'), 'aui-hide');
	   	}
	});
	
	setTimeout(function(){
		$api.remove($api.byId('loadingPage'));
	}, 4000);
};

//初始化
function init() {
	//客户列表
	var relations = BUSINESS_GetRelations();
	var cacheDealer = BUSINESS_GetCurrentDealer(userInfo.id);
	if (cacheDealer) {
		$api.val($api.byId('soldToValue'), cacheDealer.customerCode);
		$api.html($api.byId('soldToText'), cacheDealer.customerTitle);
		$api.val($api.byId('customerId'), cacheDealer.customerId);
		$api.val($api.byId('saleOffice'), cacheDealer.saleOffice);
		$api.val($api.byId('orgCode'), cacheDealer.orgCode);
	} else {
		if (relations && relations.length > 0) {
			$api.val($api.byId('customerId'), relations[0]['customer.id']);
			$api.val($api.byId('soldToValue'), relations[0].customerCode);
			$api.html($api.byId('soldToText'), relations[0].customerTitle);
			$api.val($api.byId('saleOffice'), relations[0].SALES_OFFICE);
			$api.val($api.byId('orgCode'), relations[0].orgCode);
		}
	}

	initFourRelation($api.val($api.byId('customerId')));

	loadLocationList();
	//加载购物车中的产品列表
	//loadShopingList();

}

//加载库位
function loadLocationList() {
	var url = ajaxReqHost + 'appGetLocation.ajax';
	var param = {
		customerCode : $api.val($api.byId('soldToValue')),
		saleOffice : $api.val($api.byId('saleOffice'))
	}
	COMMON_Ajax_Post_NoLoading(url, {
		values : param
	}, function(ret) {
		locationList = [];
		if (ret && ret.length > 0) {
			for (var i = 0; i < ret.length; i++) {
				locationList.push({
					id : ret[i].LOCATION,
					name : ret[i].LOCATION,
					PLANT : ret[i].PLANT
				});
				if (i == 0) {
					$api.val($api.byId('locationValue'), ret[0].LOCATION);
					$api.html($api.byId('storageLocationText'), ret[0].LOCATION);
					$api.val($api.byId('plant'), ret[0].PLANT);
				}
			}
		} else {
			$api.val($api.byId('locationValue'), '');
			$api.html($api.byId('storageLocationText'), '');
			$api.val($api.byId('plant'), '');
		}
		
		loadShopingList();
	});
}

//客户对应的四方关系
function initFourRelation(customerId) {
	//获取四方关系
	var fourRelationUrl = ajaxReqHost + 'appCustomer.ajax?customerId=' + customerId;
	COMMON_Ajax_Post_NoLoading(fourRelationUrl, {}, function(fourRelationRet) {
		if (fourRelationRet && fourRelationRet != null) {
			var sendTo = fourRelationRet.sendTo;
			var payTo = fourRelationRet.payTo;
			var shipToData = [];

			var deleteCustomerPayerSql = "delete from customer_payer where customer_id = '" + customerId + "'";
			db.executeSql({
				name : 'data',
				sql : deleteCustomerPayerSql
			}, function(ret, err) {
			});

			var deleteCustomerShiptoSql = "delete from customer_shipto where customer_id = '" + customerId + "'";
			db.executeSql({
				name : 'data',
				sql : deleteCustomerShiptoSql
			}, function(ret, err) {
			});
	
			var soldCustomerCode = $api.val($api.byId('soldToValue'));
			for (var i = 0; i < sendTo.length; i++) {
				if(sendTo[i].code == soldCustomerCode){
					continue;
				}
				shipToData.push({
					id : sendTo[i].id,
					name : sendTo[i].title,
					code: sendTo[i].code,
					address : sendTo[i].address,
					customerCode : sendTo[i].customerCode
				});

				var insertCustomerShiptoSql = "insert into customer_shipto values('" + sendTo[i].id + "', '" + sendTo[i].code + "', '" + sendTo[i].title + "', '" + customerId + "')";
				db.executeSql({
					name : 'data',
					sql : insertCustomerShiptoSql
				}, function(ret, err) {
				});
			}
			shipToList = shipToData;
			if(shipToData.length>0){
				$api.val($api.byId('shipToValue'), shipToData[0].id);
				$api.val($api.byId('shipToCode'), shipToData[0].code);
				$api.html($api.byId('shipToText'), shipToData[0].name);
			}

			var payToData = [];
			for (var i = 0; i < payTo.length; i++) {
			
				if(payTo[i].code == soldCustomerCode){
					continue;
				}
				payToData.push({
					id : payTo[i].id,
					name : payTo[i].title,
					customerCode : payTo[i].customerCode,
					code:payTo[i].code
				});

				var insertCustomerPayerSql = "insert into customer_payer values('" + sendTo[i].id + "', '" + sendTo[i].code + "', '" + sendTo[i].title + "', '" + customerId + "')";
				db.executeSql({
					name : 'data',
					sql : insertCustomerPayerSql
				}, function(ret, err) {
				});
			}
			payToList = payToData;
			
			if (payToData.length > 0) {
					$api.val($api.byId('payerValue'), payToData[0].id);
					$api.val($api.byId('payerCode'), payToData[0].code);
					$api.html($api.byId('payToText'), payToData[0].name);
					
					/*
					BUSINESS_GetCustomerBalance(payTo[0].code, function(ret) {
						if (ret) {
							if(ret.result == false){
								$api.html($api.byId('balanceVal'), '0.0');
							}else{
								$api.html($api.byId('balanceVal'), (ret.balance));
							}
						}
					});
					*/
					
					 BUSINESS_GetCustomerBalance(payToData[0].code, function(ret) {
						if (ret) {
							if(ret.result!=null  && (ret.result == false)){
								$api.html($api.byId('balanceVal'), '0.0');
							}else{
								$api.html($api.byId('balanceVal'), COMMON_COMMON_FormatCurrency(math.chain(ret.balance).multiply(1)));
								$api.val($api.byId('balance_val'), math.chain(ret.balance).multiply(1));
							}
						}
					});
				}
		}
	});
}

/**
 * 加载购物车数据
 */
function loadShopingList() {
	if (isShopListEnd) {
		return;
	}

	//货币单位
	
	var userId = userInfo.id;
	var customerId = $api.val($api.byId('customerId'));
	var location = $api.val($api.byId('locationValue'));
	var url = ajaxReqHost + 'appListCart.ajax';

	COMMON_Ajax_Post_NoLoading(url, {
		values : {
			from : 'app',
			pageSize : pageSize,
			pageNo : page_no,
			userId : userId,
			customerId : customerId
		}
	}, function(ret) {
		var productCodes = [];
		var productIds = [];
		var imgObj = {};
		if (ret && ret.list) {
			var totalCount = ret.totalCount;
			api.sendEvent({
	            name:'updIndexCartNum',
	            extra: {
	            	num: totalCount
	            }
            });
            
			
			var list = ret.list;
			for (var i = 0; i < list.length; i++) {
				var sample = $api.byId('template');
				var cloneObj = sample.cloneNode(true);
				$api.html($api.dom(cloneObj, '.product_name'), list[i].productTitle);
				$api.html($api.dom(cloneObj, '.price_tag'), currency);
				$api.html($api.dom(cloneObj, '.price_market_tag'), currency);
				$api.html($api.dom(cloneObj, '.price_discount_tag'), currency);
				$api.html($api.dom(cloneObj, '.product_num'), parseInt(list[i].qty));
				$api.attr($api.dom(cloneObj, '.select_product'), 'flag', '3');
				$api.removeCls($api.dom(cloneObj, '.select_product'), 'select_btn_selected');
				$api.addCls($api.dom(cloneObj, '.select_product'), 'select_btn_disable');

				$api.html($api.dom(cloneObj, '.product_model'), list[i].productModel);
				$api.attr($api.dom(cloneObj, 'div .product_img'), 'onclick', "lookDetail('" + list[i].productId + "')");
				$api.attr($api.dom(cloneObj, 'div .product_name'), 'onclick', "lookDetail('" + list[i].productId + "')");

				if (list[i].imgPath) {
					var imgSrc = CONSTANT_IMG_CROP_URL + list[i].imgPath + '&width=' + imgWidth + '&height=' + imgWidth;
					imgObj[list[i].productCode] = imgSrc;
				}

				$api.addCls($api.dom(cloneObj, 'li'), list[i].productCode);
				$api.addCls($api.dom(cloneObj, 'li'), 'id' + list[i].productId);

				$api.attr($api.dom(cloneObj, 'li'), 'id', list[i].id);
				$api.attr($api.dom(cloneObj, 'li'), 'productCode', list[i].productCode);
				$api.attr($api.dom(cloneObj, 'li'), 'productId', list[i].productId);

				$api.append($api.byId('shopingList'), $api.html(cloneObj));

				productCodes.push(list[i].productCode);
				productIds.push(list[i].productId);
			}

			for (var key in imgObj) {
				var $li = $api.dom('.' + key);
				var $img = $api.dom($li, '.product_img');
				var url = imgObj[key];
				COMMON_CacheImg(url, $img);
			}
			
			if(list.length > 0){
				var $select_all_btn = $api.dom('.select_all_product');
				$api.removeCls($select_all_btn, 'select_all_btn_selected');
				$api.addCls($select_all_btn, 'select_all_btn');
				$api.attr($select_all_btn, 'flag', '1');
				
				var priceParam = {
					orgCode : CONSTANT_SALE_COMPANY_CODE, 
					saleOffice: $api.val($api.byId('saleOffice')),
					plant: $api.val($api.byId('plant')),
					customerCode : $api.val($api.byId('soldToValue')),
					productCodes : productCodes.join(',')
				};
				//获取产品价格
				BUSINESS_BachGetProductPrice(priceParam, fillProductPrice);
	
				var stockParam = {
					saleOffice : $api.val($api.byId('saleOffice')),
					customerCode : $api.val($api.byId('soldToValue')),
					cartLocation : $api.val($api.byId('locationValue')),
					productCodes : productCodes.join(',')
				};
				//获取库存
				BUSINESS_BachGetProductStock(stockParam, fillStock);
			}
			
			
			
			/*
			bindItemEvent();

			if (flag == '0') {
				flag = '1';
				bindSelectAllEvent();
			} else {
				$api.removeCls($select_all_btn, 'select_all_btn_selected');
				$api.addCls($select_all_btn, 'select_all_btn');
				$api.attr($select_all_btn, 'flag', '1');
			}
			*/

			if (page_no == 0) {
				
			}

			if (ret.list.length == 0 && page_no == 0) {
				$api.removeCls($api.byId('noDataInfo'), 'aui-hide');
				isShopListEnd = true;
				return;
			}

			if (ret.list.length < pageSize) {
				$api.removeCls($api.byId('shopFootInfo'), 'aui-hide');
				isShopListEnd = true;
				return;
			}

			page_no = page_no + 1;
		}
	});
}

function fillProductPrice(productPriceRet) {
	if (productPriceRet && productPriceRet.length > 0) {
		for (var m = 0; m < productPriceRet.length; m++) {
			var $lis = $api.domAll('.' + productPriceRet[m].matnr);
			for (var n = 0; n < $lis.length; n++) {
				if(COMMON_MoneyValid(productPriceRet[m].price2) == true){
					$api.html($api.dom($lis[n], '.product_price'), (productPriceRet[m].price2));
					$api.html($api.dom($lis[n], '.product_price1'), COMMON_COMMON_FormatCurrency(productPriceRet[m].price2));
				}else{
					$api.html($api.dom($lis[n], '.product_price'), '0.00');
					$api.html($api.dom($lis[n], '.product_price1'), '0.00');
				}
				
				$api.html($api.dom($lis[n], '.product_discount'),  (productPriceRet[m].price1));
				$api.html($api.dom($lis[n], '.product_discount1'),  COMMON_COMMON_FormatCurrency(productPriceRet[m].price1));
				$api.html($api.dom($lis[n], '.product_market_price'), (productPriceRet[m].price2 + productPriceRet[m].price1) + '</del>');
				$api.html($api.dom($lis[n], '.product_market_price1'), COMMON_COMMON_FormatCurrency(productPriceRet[m].price2 + productPriceRet[m].price1) + '</del>');
				
				if(productPriceRet[m].zp00 != '-1'){
					$api.removeCls($api.dom($lis[n], '.select_product'), 'select_btn_disable');
					$api.addCls($api.dom($lis[n], '.select_product'), 'select_btn');
					$api.attr($api.dom($lis[n], '.select_product'), 'flag', '1');
				}
			}
			
			if(productPriceRet[m].price5 != '0'){
				$api.html($api.byId('taxVal'), productPriceRet[m].price5 + '%');
				$api.val($api.byId('tax_val'), productPriceRet[m].price5*0.01);
			}
		}
	}
}

function fillStock(productStockRet) {
	if (productStockRet && productStockRet.length > 0) {
		for (var m = 0; m < productStockRet.length; m++) {
			var $lis = $api.domAll('.' + productStockRet[m].materialNumber);
			for (var n = 0; n < $lis.length; n++) {
				$api.html($api.dom($lis[n], '.product_stock'), productStockRet[m].quantity);
			}
		}
	}
}

//初始化产品选择事件
function bindItemEvent() {
	$select_btn_groups = $api.domAll('.select_btn');
	$select_all_btn = $api.dom('.select_all_product');

	for (var i = 0; i < $select_btn_groups.length; i++) {
		$api.addEvt($select_btn_groups[i], 'click', function() {
			var flag = $api.attr(this, 'flag');
			if (flag == '1') {
				$api.removeCls(this, 'select_btn');
				$api.addCls(this, 'select_btn_selected');
				$api.attr(this, 'flag', '2');
			} else if (flag == '2') {
				$api.removeCls($select_all_btn, 'select_all_btn_selected');
				$api.addCls($select_all_btn, 'select_all_btn');
				$api.attr($select_all_btn, 'flag', '1');
				$api.removeCls(this, 'select_btn_selected');
				$api.addCls(this, 'select_btn');
				$api.attr(this, 'flag', '1');
			}else if (flag == '3') {
				api.toast({
	                msg:'Abnormal price, order could not be created.'
                });
			}
			sumPriceCal();
		});
	}
}

function chkProduct(me){
	var $select_all_btn = $api.dom('.select_all_product');
	var flag = $api.attr(me, 'flag');
	if (flag == '1') {
		$api.removeCls(me, 'select_btn');
		$api.addCls(me, 'select_btn_selected');
		$api.attr(me, 'flag', '2');
	} else if (flag == '2') {
		$api.removeCls($select_all_btn, 'select_all_btn_selected');
		$api.addCls($select_all_btn, 'select_all_btn');
		$api.attr($select_all_btn, 'flag', '1');
		$api.removeCls(me, 'select_btn_selected');
		$api.addCls(me, 'select_btn');
		$api.attr(me, 'flag', '1');
	}else if (flag == '3') {
		api.toast({
            msg:'Abnormal price, order could not be created.'
        });
	}
	sumPriceCal();
}

function chkAllProduct(){
	var $select_all_btn = $api.dom('.select_all_product');
	var flag = $api.attr($select_all_btn, 'flag');
	if (flag == '1') {
		var $select_btn_groups = $api.domAll('.select_btn');
		$api.removeCls($select_all_btn, 'select_all_btn');
		$api.addCls($select_all_btn, 'select_all_btn_selected');
		$api.attr($select_all_btn, 'flag', '2');
		for (var i = 0; i < $select_btn_groups.length; i++) {
			var isAvaSelectFlag = $api.attr($select_btn_groups[i], 'flag');
			if(isAvaSelectFlag != '3'){
				$api.removeCls($select_btn_groups[i], 'select_btn');
				$api.addCls($select_btn_groups[i], 'select_btn_selected');
				$api.attr($select_btn_groups[i], 'flag', '2');
			}
		}
	} else if (flag == '2') {
		var $select_btn_groups = $api.domAll('.select_btn_selected');
		$api.removeCls($select_all_btn, 'select_all_btn_selected');
		$api.addCls($select_all_btn, 'select_all_btn');
		$api.attr($select_all_btn, 'flag', '1');
		
		for (var i = 0; i < $select_btn_groups.length; i++) {
			var isAvaSelectFlag = $api.attr($select_btn_groups[i], 'flag');
			if(isAvaSelectFlag != '3'){
				$api.removeCls($select_btn_groups[i], 'select_btn_selected');
				$api.addCls($select_btn_groups[i], 'select_btn');
				$api.attr($select_btn_groups[i], 'flag', '1');
			}
		}
	}
	sumPriceCal();
}

function bindSelectAllEvent() {
	$api.addEvt($select_all_btn, 'click', function() {
		var flag = $api.attr($select_all_btn, 'flag');
		if (flag == '1') {
			$api.removeCls($select_all_btn, 'select_all_btn');
			$api.addCls($select_all_btn, 'select_all_btn_selected');
			$api.attr($select_all_btn, 'flag', '2');
			for (var i = 0; i < $select_btn_groups.length; i++) {
				var isAvaSelectFlag = $api.attr($select_btn_groups[i], 'flag');
				if(isAvaSelectFlag != '3'){
					$api.removeCls($select_btn_groups[i], 'select_btn');
					$api.addCls($select_btn_groups[i], 'select_btn_selected');
					$api.attr($select_btn_groups[i], 'flag', '2');
				}
			}
		} else if (flag == '2') {
			$api.removeCls($select_all_btn, 'select_all_btn_selected');
			$api.addCls($select_all_btn, 'select_all_btn');
			$api.attr($select_all_btn, 'flag', '1');
			for (var i = 0; i < $select_btn_groups.length; i++) {
				var isAvaSelectFlag = $api.attr($select_btn_groups[i], 'flag');
				if(isAvaSelectFlag != '3'){
					$api.removeCls($select_btn_groups[i], 'select_btn_selected');
					$api.addCls($select_btn_groups[i], 'select_btn');
					$api.attr($select_btn_groups[i], 'flag', '1');
				}
			}
		}
		sumPriceCal();
	});
}

//计算总价格
function sumPriceCal() {
	var $select_btn_groups = $api.domAll('.select_btn_selected');
	var sumPrice = 0.0;
	for (var i = 0; i < $select_btn_groups.length; i++) {
		var flag = $api.attr($select_btn_groups[i], 'flag');
		if (flag == '2') {
			var parent = $api.closest($select_btn_groups[i], '.cartItemContainer');
			var product_price_div = $api.dom(parent, '.product_price');
			var productPrice = $api.html(product_price_div);
			if (productPrice != '' && productPrice != undefined) {
				var product_num_div = $api.dom(parent, '.product_num');
				var productNum = $api.html(product_num_div);
				sumPrice += math.chain(productPrice).multiply(productNum).done();
			}
		}
	}
	
	var tax = $api.val($api.byId('tax_val'));
	var taxAdd = math.chain(1).add(tax).done();
	$api.html($api.byId('sumPrice'), COMMON_COMMON_FormatCurrency(math.chain(sumPrice).multiply(taxAdd).done()));
	$api.val($api.byId('tatal_price_val'), math.chain(sumPrice).multiply(taxAdd).done());
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
				bg : '#f1f1f1',
				size : 14,
				color : '#555'
			},
			right : {
				marginR : 10,
				w : 130,
				h : 35,
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

			var parent = $api.closest(me, '.cartItemContainer');
			var productId = $api.attr(parent, 'productId');
			updCart(inputNum, productId, me);

		}
		var dialogBox = api.require('dialogBox');
		dialogBox.close({
			dialogName : 'amount'
		});
	});
}

function subProductNum(me) {
	var parent = $api.closest(me, '.cartItemContainer');
	var product_num_div = $api.dom(parent, '.product_num');
	var val = $api.html(product_num_div);
	val = parseInt(val);
	if (val != 1) {
		var newVal = val - 1;
		//$api.val(product_num_div, newVal);
		var parent = $api.closest(me, '.cartItemContainer');
		var productId = $api.attr(parent, 'productId');
		updCart(newVal, productId, product_num_div);
	}
	//sumPriceCal();
}

function addProductNum(me) {
	var parent = $api.closest(me, '.cartItemContainer');
	var product_num_div = $api.dom(parent, '.product_num');
	var val = $api.html(product_num_div);
	var newVal = parseInt(val) + 1;
	//$api.val(product_num_div, newVal);
	var parent = $api.closest(me, '.cartItemContainer');
	var productId = $api.attr(parent, 'productId');
	updCart(newVal, productId, product_num_div);
	//	sumPriceCal();
}

/**
 * 选择送达方
 */
function showShipToTypeSelect() {
	var buttons = [];
	for(var i=0; i<shipToList.length; i++){
		buttons.push(shipToList[i].name);
	}
	COMMON_actionSheet('Selected: '+$api.html($api.byId('shipToText')), buttons, function(ret){
		$api.html($api.byId('shipToText'), shipToList[ret].name);
		$api.val($api.byId('shipToValue'), shipToList[ret].id);
	});
	
	return;
	
	COMMON_ActionSelector(shipToList, function(ret) {
		$api.html($api.byId(shipToText), ret.level1);
		$api.val($api.byId(shipToValue), ret.selectedInfo[0].id);
	});
}

/**
 * 选择付款方
 */
function showPayToTypeSelect() {
	var buttons = [];
	for(var i=0; i<payToList.length; i++){
		buttons.push(payToList[i].name);
	}
	var title = 'Selected: '+ $api.html($api.byId('payToText'));
	COMMON_actionSheet(title, buttons, function(ret){
		$api.html($api.byId('payToText'), payToList[ret].name);
		$api.val($api.byId('payerValue'), payToList[ret].id);
		BUSINESS_GetCustomerBalance(payToList[ret].code, function(ret) {
			if (ret) {
				if(ret.result!=null  && (ret.result == false)){
					$api.html($api.byId('balanceVal'), '0.0');
				}else{
					$api.html($api.byId('balanceVal'), COMMON_COMMON_FormatCurrency(math.chain(ret.balance).multiply(1)));
					$api.val($api.byId('balance_val'), math.chain(ret.balance).multiply(1));
				}
			}
		});
	});
	
	return;
	
	COMMON_ActionSelector(payToList, function(ret) {
		$api.html($api.byId(payToText), ret.level1);
		$api.val($api.byId(payerValue), ret.selectedInfo[0].id);
		BUSINESS_GetCustomerBalance(ret.selectedInfo[0].code, function(ret) {
			if (ret) {
				if(ret.result!=null  && (ret.result == false)){
					$api.html($api.byId('balanceVal'), '0.0');
				}else{
					$api.html($api.byId('balanceVal'), COMMON_COMMON_FormatCurrency(math.chain(ret.balance).multiply(1)));
					$api.val($api.byId('balance_val'), math.chain(ret.balance).multiply(1));
				}
			}
		});
		
		/*
		 BUSINESS_GetCustomerBalance(ret.selectedInfo[0].code, function(ret) {
			if (ret) {
				if(ret.result == false){
					$api.html($api.byId('balanceVal'), '0.0');
				}else{
					$api.html($api.byId('balanceVal'), (ret.balance)*(-1));
				}
			}
		}); 
		*/
	});
}

function UPDATE_LOCATION(location){
	$api.html($api.byId('storageLocationText'), location.name);
	$api.val($api.byId('locationValue'), location.id);
	$api.val($api.byId('plant'), location.PLANT);
	$api.html($api.byId("shopingList"), '');
	isShopListEnd = false;
	page_no = 0;
	page_count = 0;
	$api.addCls($api.byId('noDataInfo'), 'aui-hide');
	$api.addCls($api.byId('shopFootInfo'), 'aui-hide');
	loadShopingList();
}

//选择库位
function showStorageLocationSelect() {
	if(locationList.length == 0){
		api.toast({
	        msg:'No Option'
        });
        return;
	}
	var locationValue = $api.val($api.byId('locationValue'));
	
	COMMON_OpenWin({
		name: 'location',
		url: 'location.html',
		pageParam : {
			winName: api.winName,
			frameName: 'frame1',
			selectedId: locationValue,
			datas: locationList
		}
	});
	
	return;
	var buttons = [];
	for(var i=0; i<locationList.length; i++){
		buttons.push(locationList[i].name);
	}
	COMMON_actionSheet('Selected: '+$api.html($api.byId('storageLocationText')), buttons, function(ret){
		$api.html($api.byId('storageLocationText'), locationList[ret].name);
		$api.val($api.byId('locationValue'), locationList[ret].id);
		$api.val($api.byId('plant'), locationList[ret].PLANT);
		$api.html($api.byId("shopingList"), '');
		isShopListEnd = false;
		page_no = 0;
		page_count = 0;
		$api.addCls($api.byId('noDataInfo'), 'aui-hide');
		$api.addCls($api.byId('shopFootInfo'), 'aui-hide');
		loadShopingList();
	});
	
	return;
	COMMON_ActionSelector(locationList, function(ret) {
		$api.html($api.byId('storageLocationText'), ret.level1);
		$api.val($api.byId('locationValue'), ret.selectedInfo[0].id);
		$api.val($api.byId('plant'), ret.selectedInfo[0].PLANT);
		$api.html($api.byId("shopingList"), '');
		isShopListEnd = false;
		page_no = 0;
		page_count = 0;
		$api.addCls($api.byId('noDataInfo'), 'aui-hide');
		$api.addCls($api.byId('shopFootInfo'), 'aui-hide');
		loadShopingList();
	})
}

//缺货提醒
function oosRemind(me) {
	var productId = $api.attr($api.closest(me, '.cartItemContainer'), 'productId');
	var userId = userInfo.id;
	var customerId = $api.val($api.byId('customerId'));
	var customerCode = $api.val($api.byId('soldToValue'));

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
			//先判断是否已经加过
			var validExistUrl = ajaxReqHost + 'appExistOssRemind.ajax?productId=' + productId + '&customerCode=' + customerCode;
			$api.get(validExistUrl, function(ret) {
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
			});
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

			var userId = userInfo.id;
			var url = ajaxReqHost + 'appSaveOssRemind.ajax';
			COMMON_Ajax_Post(url, {
				values : {
					productId : productId,
					qty : qty,
					'customer.id' : $api.val($api.byId('customerId')),
					userId : userId,
					'org.id' : BUSINESS_GetOrgId(),
					remark : remark,
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

//更新购物车数量
function updCart(qty, productId, inputEle) {
	var userInfo = $api.getStorage("userInfo");
	var userId = userInfo.id;
	var customerId = $api.val($api.byId('customerId'));
	var param = {
		userId : userId,
		customerId : customerId,
		productId : productId,
		qty : qty
	}

	var updCartUrl = ajaxReqHost + 'appSaveCart.ajax';
	COMMON_Ajax_Post(updCartUrl, {
		values : param
	}, function(ret) {
		if (ret && ret.result == true) {
			COMMON_toastSuccess();
			$api.html(inputEle, qty);
			sumPriceCal();
		} else {
			COMMON_ShowFailure();
		}
	});
}

//删除购物产品
function deleteCart(me) {
	COMMON_ShowConfirm($.i18n.prop('deleteTip'), function(){
		var cartId = $api.attr($api.closest(me, '.cartItemContainer'), 'id');
		var deleteUrl = ajaxReqHost + 'appdeleteCart.ajax';
		COMMON_Ajax_Post(deleteUrl, {
			values : {
				ids : cartId
			}
		}, function(ret) {
			if (ret && ret.result == true) {
				COMMON_toastSuccess();
				api.sendEvent({
			        name:'updShoppingNum'
		        });
			} else {
				COMMON_ShowFailure();
			}
			$api.remove($api.closest(me, '.cartItemContainer'));
			sumPriceCal();
		});
	});
}

//提交购物车
function checkout() {
	var $select_btn_groups = $api.domAll('.select_btn_selected');
	var productList = [];

	var stockWarningMsg = '';
	//总量
	var sumNum = 0;
	for (var i = 0; i < $select_btn_groups.length; i++) {
		var flag = $api.attr($select_btn_groups[i], 'flag');
		if (flag == '2') {
			var parent = $api.closest($select_btn_groups[i], '.cartItemContainer');
			var productId = $api.attr(parent, 'productId');
			var productCode = $api.attr(parent, 'productCode');
			var product_imgpath = $api.attr($api.dom(parent, '.product_img'), 'src');
			var product_title = $api.html($api.dom(parent, '.product_name'));
			var product_model = $api.html($api.dom(parent, '.product_model'));
			var product_stock = $api.html($api.dom(parent, '.product_stock'));
			var product_bill_price = $api.html($api.dom(parent, '.product_price'));
			var product_price = $api.html($api.dom(parent, '.product_market_price'));
			var product_discount_price = $api.html($api.dom(parent, '.product_discount'));
			var product_qty = $api.html($api.dom(parent, '.product_num'));
			if (product_model != '' && product_model != undefined) {
				if (parseInt(product_stock) < parseInt(product_qty)) {
					stockWarningMsg += '[' + product_title + ' ' + product_model + '] stock shortage. Quantity: x' + product_qty + '  Stock:x' + product_stock + '\n';
					product_qty = parseInt(product_stock);
				}
				productList.push({
					productId : productId,
					productCode : productCode,
					product_imgpath : product_imgpath,
					product_title : product_title,
					product_model : product_model,
					product_price : product_price,
					product_bill_price : product_bill_price,
					product_discount_price : product_discount_price,
					product_qty : product_qty,
					currency : currency
				});
				sumNum += parseInt(product_qty);
			}
		}
	}
	if (stockWarningMsg != '') {
		api.alert({
			title : 'Stock Shortage Tip',
			msg : stockWarningMsg
        },function(ret,err){
        });
	} else {
		var location = $api.val($api.byId('locationValue'));
		if(location == ''){
			api.alert({
				title : 'Tip',
				msg : 'Please Select Location!'
	        },function(ret,err){
	        });
		}else{
			saveOrder(productList, sumNum);
		}
	}
}

function saveOrder(productList, sumNum) {
	
	if (productList.length == 0) {
		api.toast({
			msg : $.i18n.prop('plsSelectProduct')
		});
		return;
	}

	var totalPrice = $api.val($api.byId('tatal_price_val'));
	var customerBalance = $api.val($api.byId('balance_val'));
	
	if(parseFloat(customerBalance)<0){
		api.toast({
			msg : 'Insufficient account balance.'
		});
		return;
	}else{
		if ((parseFloat(totalPrice) - parseFloat(customerBalance)) > 0) {
			api.toast({
				msg : 'Insufficient account balance.'
			});
			return;
		}
	}
	//总结

	var soldTo = {
		id : $api.val($api.byId('soldToValue')),
		name : $api.html($api.byId('soldToText'))
	};
	var shipTo = {
		id : $api.val($api.byId('shipToValue')),
		name : $api.html($api.byId('shipToText'))
	};
	var payTo = {
		id : $api.val($api.byId('payerValue')),
		name : $api.html($api.byId('payToText'))
	};
	var location = {
		id : $api.val($api.byId('locationValue')),
		name : $api.html($api.byId('storageLocationText'))
	};
	
	var plantValue = $api.val($api.byId('plant'));
	
	COMMON_OpenWin({
		name : 'orderConfirm',
		url : 'order_confirm.html',
		pageParam : {
			soldTo : soldTo,
			shipTo : shipTo,
			payTo : payTo,
			location : location,
			plantValue: plantValue,
			totalPrice : totalPrice,
			sumNum : sumNum,
			productList : productList
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

//选择赋值
function showDealerActionSelector() {
	COMMON_OpenWin({
		name : 'dealer_select',
		url : 'dealer_select.html',
		pageParam : {
			winName: api.winName,
			frameName: 'frame1',
			selected: $api.html($api.byId('soldToText'))
		}
	});
}

function showShipToSelectWin() {
	COMMON_OpenWin({
		name : 'shipto_select',
		url : 'shipto_select.html',
		pageParam : {
			winName: api.winName,
			frameName: 'frame1',
			datas: shipToList,
			selected: $api.html($api.byId('shipToText'))+' '+$api.val($api.byId('shipToCode'))
		}
	});
}

function showPayToSelectWin() {
	COMMON_OpenWin({
		name : 'payto_select',
		url : 'payto_select.html',
		pageParam : {
			winName: api.winName,
			frameName: 'frame1',
			datas: payToList,
			selected: $api.html($api.byId('payToText'))+' '+$api.val($api.byId('payerCode'))
		}
	});
}
function UPDATE_DEALER(param){
	var customerCode = param.customerCode;
	var customerId = param.customerId;
	var title = param.title;
	var saleOffice = param.saleOffice;
	var orgCode = param.orgCode;
		
	$api.html($api.byId("soldToText"), title);
	$api.val($api.byId("soldToValue"), customerCode);
	$api.val($api.byId("customerId"), customerId);
	$api.val($api.byId("saleOffice"), saleOffice);
	$api.val($api.byId("orgCode"), orgCode);
	$api.val($api.byId("plant"),"");
	var dealer = {
		'customerCode' : customerCode,
		'customerTitle' : title,
		'customerId' : customerId,
		'saleOffice' : saleOffice,
		'orgCode' : orgCode
	};
	BUSINESS_UpdateCurrentDealer(userInfo.id, dealer);
	
	initFourRelation(customerId);
	$api.html($api.byId('shopingList'), '');
	$api.html($api.byId('sumPrice'), '0.00');
	$api.html($api.byId("shopingList"), '');
	isShopListEnd = false;
	page_no = 0;
	page_count = 0;
	$api.addCls($api.byId('noDataInfo'), 'aui-hide');
	$api.addCls($api.byId('shopFootInfo'), 'aui-hide');
	loadLocationList();
	
	api.sendEvent({
        name:'updShoppingNum'
    });
}

function UPDATE_SHIPTO(param){
	$api.html($api.byId('shipToText'), param.name);
	$api.val($api.byId('shipToValue'), param.id);
	$api.val($api.byId('shipToCode'), param.code);
}

function UPDATE_PAYER(param){
	$api.html($api.byId('payToText'), param.name);
	$api.val($api.byId('payerValue'), param.id);
	$api.val($api.byId('payerCode'), param.code);
	BUSINESS_GetCustomerBalance(param.code, function(ret) {
		if (ret) {
			if(ret.result!=null  && (ret.result == false)){
				$api.html($api.byId('balanceVal'), '0.0');
			}else{
				$api.html($api.byId('balanceVal'), COMMON_COMMON_FormatCurrency(math.chain(ret.balance).multiply(1)));
				$api.val($api.byId('balance_val'), math.chain(ret.balance).multiply(1));
			}
		}
	});
}

function refresh(){
	$api.html($api.byId('shopingList'), '');
	$api.html($api.byId('sumPrice'), '0.00');
	$api.html($api.byId("shopingList"), '');
	isShopListEnd = false;
	page_no = 0;
	page_count = 0;
	$api.addCls($api.byId('noDataInfo'), 'aui-hide');
	$api.addCls($api.byId('shopFootInfo'), 'aui-hide');
	loadLocationList();
}

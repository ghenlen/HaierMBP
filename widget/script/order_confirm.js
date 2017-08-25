var dialog = new auiDialog({});
var shippingTypeList = [];
var measnOfTransportTypeList = [];
var incotermsList = [];
var productList = [];
var channel = '';
var userInfo = $api.getStorage("userInfo");
var currency = BUSINESS_GetCurrency();
apiready = function() {
	var $header = $api.dom('header');
	var $footer = $api.dom('footer');
	$api.fixIos7Bar($header);
	$api.fixStatusBar($header);
	var $main = $api.byId('main');
	var headerHeight = $api.offset($header);
	var footerHeight = $api.offset($footer);

	COMMON_openFrame({
		name : 'order_confirm_head',
		url : 'order_confirm_head.html',
		rect : {
			x : 0,
			y : 0,
			w : api.winWidth,
			h : headerHeight.h
		}
	});

	init();

};

//要求交货日期
function showDeliveryDateSelect() {
	COMMON_DatePicker('date', function(ret){
		$api.html($api.byId('deliveryDate'), ret.year + '-' + ret.month + '-' + ret.day);
		$api.val($api.byId('reqDeliveryDateVal'), ret.year + '-' + ret.month + '-' + ret.day);
	});
}

//选择运输类型
function showShippingTypeSelect() {
	showComboSelect(shippingTypeList, 'shippingTypeText', 'shippingTypeVal');
}

//交通工具类型
function showMttSelect() {
	showComboSelect(measnOfTransportTypeList, 'mtt', 'mttVal');
}

//贸易条款代码
function showIncotermsSelect() {
	showComboSelect(incotermsList, 'incoterms', 'incotermsVal');
}

function showComboSelect(selectData, showEle, valueEle) {
	COMMON_ActionSelector(selectData, function(ret){
		$api.html($api.byId(showEle), ret.level1);
		$api.val($api.byId(valueEle), ret.selectedInfo[0].code);
	});
}

/**
 * 初始化界面
 */
function init() {
	var pageParam = api.pageParam;
	var soldTo = pageParam.soldTo;
	var shipTo = pageParam.shipTo;
	var payTo = pageParam.payTo;
	var location = pageParam.location;
	channel = pageParam.channel;

	var totalPrice = pageParam.totalPrice;

	var sumNum = pageParam.sumNum;
	productList = pageParam.productList;

	$api.html($api.byId('soldToText'), soldTo.name);
	$api.val($api.byId('soldToValue'), soldTo.id);
	$api.html($api.byId('shipToText'), shipTo.name);
	$api.val($api.byId('shipToValue'), shipTo.id);
	$api.html($api.byId('payToText'), payTo.name);
	$api.val($api.byId('payToValue'), payTo.id);
	$api.html($api.byId('locationText'), location.name);
	$api.val($api.byId('locationValue'), location.id);
	$api.val($api.byId('plantValue'), pageParam.plantValue);

	$api.html($api.byId('sumPrice'), COMMON_COMMON_FormatCurrency(totalPrice));
	$api.html($api.byId('sumCurrency'), currency);
	$api.val($api.byId('sumNum'), sumNum);

	var date = new Date();
	var date_fmt = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();
	$api.html($api.byId('deliveryDate'), date_fmt);
	$api.val($api.byId('reqDeliveryDateVal'), date_fmt);

	for (var i = 0; i < productList.length; i++) {
		var sample = $api.byId('sample');
		var cloneObj = sample.cloneNode(true);
		var product_price = productList[i].product_bill_price;
		var product_num = productList[i].product_qty;
		var productSumPrice = COMMON_COMMON_FormatCurrency(product_price * product_num * 1.005);

		$api.html($api.dom(cloneObj, '.product_name'), productList[i].product_title);
		$api.html($api.dom(cloneObj, '.qty'), product_num);
		$api.html($api.dom(cloneObj, '.product_price'), currency + COMMON_COMMON_FormatCurrency(product_price));
		$api.html($api.dom(cloneObj, '.product_sumprice'), currency + COMMON_COMMON_FormatCurrency(productSumPrice));

		$api.html($api.dom(cloneObj, '.product_model'), productList[i].product_model);
		$api.attr($api.dom(cloneObj, '.produce_img'), 'src', productList[i].product_imgpath);
		$api.append($api.byId('shopingList'), '<li class="aui-list-item">' + $api.html(cloneObj) + '</li>');
	}

	//shipping type
	var shippingTypeUrl = ajaxReqHost + 'appGetDictionary.ajax?dicType=DELIVERY_TYPE';
	$api.post(shippingTypeUrl, {}, function(ret) {
		if (ret) {
			for (var i = 0; i < ret.length; i++) {
				shippingTypeList.push({
					name : ret[i].title,
					code : ret[i].code
				});
				if (i == 0) {
					$api.html($api.byId('shippingTypeText'), ret[i].title);
					$api.val($api.byId('shippingTypeVal'), ret[i].code);
				}
			}
		}
	});

	//means-of-transport type
	var shippingTypeUrl = ajaxReqHost + 'appGetDictionary.ajax?dicType=TRANSPORT_TYPE';
	$api.post(shippingTypeUrl, {}, function(ret) {
		if (ret) {
			for (var i = 0; i < ret.length; i++) {
				measnOfTransportTypeList.push({
					name : ret[i].title,
					code : ret[i].code
				});
				if (i == 0) {
					$api.html($api.byId('mtt'), ret[i].title);
					$api.val($api.byId('mttVal'), ret[i].code);
				}
			}
		}
	});

	//incoterms
	var incotermsUrl = ajaxReqHost + 'appGetDictionary.ajax?dicType=INCOTERMS_TYPE';
	$api.post(incotermsUrl, {}, function(ret) {
		if (ret) {
			for (var i = 0; i < ret.length; i++) {
				incotermsList.push({
					name : ret[i].title,
					code : ret[i].code
				});
				if (i == 0) {
					$api.html($api.byId('incoterms'), ret[i].title);
					$api.val($api.byId('incotermsVal'), ret[i].code);
				}
			}
		}
	});
}

function submitOrder() {
	COMMON_ShowConfirm('Are you sure to perform this operation?', function(){
		var date = new Date();
			var today = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();

			var customerCode = $api.val($api.byId('soldToValue'));

			var userId = userInfo.id;

			var totalQty = $api.val($api.byId('sumNum'));
			//总数量
			var remark = $api.val($api.byId('remarkVal'));
			//备注
			var orderType = 'COMMON';
			//订单类型
			var orderReason = '005';
			//订单原因   固定005
			//var requestedDeliveryDate = $api.val($api.byId('reqDeliveryDateVal'));
			//var deliveryType = $api.val($api.byId('shippingTypeVal'));
			//var deliveryType = '003';

			//运输方式
			//var meansOfTransportTypeCode = $api.val($api.byId('mttVal'));
			//var meansOfTransportTypeCode = 'TRANSPORT_2';

			//交通工具类型
			//var incotermsCode = $api.val($api.byId('incotermsVal'));
			//var incotermsCode = '001'
			//贸易条款
			var payToId = $api.val($api.byId('payToValue'));
			//付款方ID
			var billToId = $api.val($api.byId('payToValue'));
			//开票方id
			var sendToId = $api.val($api.byId('shipToValue'));
			//送达方ID

			var locationValue = $api.val($api.byId('locationValue'));
			var plantValue = $api.val($api.byId('plantValue'));
			var currencyVal = currency;

			var purchaseNoVal = "2222";

			var saveOrderUrl = ajaxReqHost + 'appSaveOrder.ajax';

			var order = {
				userId : userId,
				orgId : BUSINESS_GetOrgId(),
				customerCode : customerCode,
				orderReason : orderReason,
				buyNumber : purchaseNoVal,
				totalQty : totalQty,
				remark :remark,
				orderType : orderType,

				requestedDeliveryDateTemp : today,
				//deliveryType : deliveryType,
				//meansOfTransportTypeCode : meansOfTransportTypeCode,
				//incotermsCode : incotermsCode,
				payToId : payToId,
				billToId : payToId,
				sendToId : sendToId,
			}

			for (var i = 0; i < productList.length; i++) {
				var key_productId = 'orderLine[' + i + '].productId';
				var key_qty = 'orderLine[' + i + '].qty';
				var key_location = 'orderLine[' + i + '].location';
				var key_plant = 'orderLine[' + i + '].plant';
				var key_currency = 'orderLine[' + i + '].currentcy';
				var key_billPrice = 'orderLine[' + i + '].billPrice';
				var key_price = 'orderLine[' + i + '].price';
				var key_deduct = 'orderLine[' + i + '].deduct';
				
				order[key_productId] = productList[i].productId;
				order[key_qty] = productList[i].product_qty;
				order[key_location] = locationValue;
				order[key_plant] = plantValue;
				order[key_currency] = currencyVal;
				order[key_billPrice] = productList[i].product_bill_price;
				order[key_price] = productList[i].product_price;
				order[key_deduct] = productList[i].product_discount_price;
				
			}
			
			COMMON_Ajax_Post(saveOrderUrl, {
				//body : $api.jsonToStr(order)
				values : order
			}, function(orderRet) {
				log('order', orderRet);
				if (orderRet) {
					if (orderRet.result == true) {
						COMMON_toastSuccess();
						if (channel == 'OFFLINE_ORDER') {
							deleteOfflineProduct(customerCode);
							/*
							setTimeout(function() {
								deleteOfflineProduct(customerCode);
								api.closeWin({
								});
								api.sendEvent({
									name : 'refreshList'
								});
							}, 1000);
							*/
							api.execScript({
								name: 'fast_order',
	                            script: 'loadOfflineList()'
                            });
							
						} else {
							/*
							api.execScript({
								name: 'main_page',
								frameName: 'frame1',
	                            script: 'refresh()'
                            });
                            */
                            
                            api.sendEvent({
	                            name:'updList'
                            });
                            
						}
						
						setTimeout(function() {
							COMMON_OpenWin({
							name : 'order_success',
							url : 'order_success.html',
							slidBackEnabled: false,
							pageParam:{'orderNo': orderRet.values.b2bOrderCode}
						});
						}, 2000);
						
						setTimeout(function() {
							api.closeWin({
							});
						}, 4000);
					} else {
						COMMON_OpenWin({
							name : 'order_failure',
							url : 'order_failure.html',
							slidBackEnabled: false
						});
						
						setTimeout(function() {
							api.closeWin({
							});
						}, 4000);
					}
				}
			});
	});
}

function deleteOfflineProduct(customerCode) {
	var productIds = [];
	for (var i = 0; i < productList.length; i++) {
		productIds.push(productList[i].productId);
	}

	var db = api.require('db');
	var sql = " delete from offline_order where product_id in ('" + productIds.join(',') + "') and customer_code = '" + customerCode + "' ";
	db.executeSql({
		name : 'data',
		sql : sql
	}, function(ret, err) {
		if (ret && ret.status) {

		} else {
		};
	});
}
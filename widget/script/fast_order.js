/******************* 全局变量区 *******************/
var dialog = new auiDialog({});
var $select_all_btn;
var $select_btn_groups;
//本地数据库
var db;

//四方关系
var soldToList = [];
var shipToList = [];
var payToList = [];
var locationList = [];
var flag = 0;
var currency = BUSINESS_GetCurrency();
var userInfo = $api.getStorage("userInfo");
var db;
var imgWidth,imgHeight;
/******************* 初始入口 *******************/
apiready = function() {
	db = api.require('db');
	
	imgWidth = Math.floor(api.screenWidth/4);
	imgHeight = imgWidth;
	//初始化dom元素
	initDom();

	//绑定元素事件
	bindEvent();
	
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
	//初始化元素的位置
	var $header = $api.dom('header');
	var headerHeight = $api.offset($header);
	
	$api.css($api.byId('main'), 'padding-top:'+(headerHeight.h)+'px');
	
	//初始化数据库
	db = api.require('db');

	//加载经销商列表
	loadDealerList();

	var netChk = COMMON_IsNetWorkAvalible();
	if (netChk == true) {
		//加载库位列表
		loadLocationList();
	} else { 
		offlineAction();
	}
}

function bindEvent(){
	var $soldTo = $api.byId('soldToLi');
	$api.addEvt($soldTo, 'click', showSoldToTypeSelect);
	var $shipTo = $api.byId('shipToLi');
	$api.addEvt($shipTo, 'click', showShipToSelectWin);
	var $payerTo = $api.byId('payToLi');
	$api.addEvt($payerTo, 'click', showPayToSelectWin);
	var $location = $api.byId('locationLi');
	$api.addEvt($location, 'click', showLocationSelect);

	api.addEventListener({
		name : 'online'
	}, function(ret, err) {
		var $checkoutBtn = $api.byId('checkout_btn');
		$api.attr($checkoutBtn, 'onclick', 'checkout()');
		$api.removeCls($checkoutBtn, 'checkout_btn_unavailable');
		$api.addCls($checkoutBtn, 'checkout_btn_available');

		$api.css($api.byId('locationLi'), 'display:block');
		$api.css($api.byId('balanceLi'), 'display:block');
	
		//加载库位列表
		loadLocationList();
		showStockPriceImg();
		
		//获取产品最新价格和库存
		getPriceAndStock();
		validCustomerProduct();
		setReaded();
	});

	api.addEventListener({
		name : 'offline'
	}, function(ret, err) {
		if(ret){
			offlineAction();
		}
	});
	
	
	api.addEventListener({
	    name:'refreshList'
    },function(ret,err){
    	loadOfflineList();
    });
    
    api.addEventListener({
	    name:'selectProducts'
    },function(ret,err){
    	var products = ret.value.products;
    	for(var key in products){
    		selectItem(products[key]);
    	}
    });
}

function offlineAction(){
	api.toast({
		msg : 'Network service is not available.'
	});
	//提交按钮不可用
	var $checkoutBtn = $api.byId('checkout_btn');
	$api.removeAttr($checkoutBtn, 'onclick');
	$api.removeCls($checkoutBtn, 'checkout_btn_available');
	$api.addCls($checkoutBtn, 'checkout_btn_unavailable');

	//库位选择不可用
	$api.css($api.byId('locationLi'), 'display:none');
	$api.css($api.byId('balanceLi'), 'display:none');
	
	hideStockPriceImg();
	
	loadOfflineList();
}

function showStockPriceImg(){
	var productLis = $api.domAll('.product');
	for (var i = 0; i < productLis.length; i++) {
		$api.css($api.dom(productLis[i], '.stock_ring'), 'display:block');
		$api.css($api.dom(productLis[i], '.product_img_div'), 'display:block');
		$api.css($api.dom(productLis[i], '.price_tag'), 'display:inline-block');
		$api.css($api.dom(productLis[i], '.discount_price_tag'), 'display:inline-block');
		$api.css($api.dom(productLis[i], '.sale_price_tag'), 'display:inline-block');
		$api.css($api.dom(productLis[i], '.stock_tag'), 'display:block');
		$api.css($api.dom(productLis[i], '.invoice_price'), 'display:inline-block');
		$api.css($api.dom(productLis[i], '.discount_price'), 'display:inline-block');
		$api.css($api.dom(productLis[i], '.sale_price'), 'display:inline-block');
		$api.css($api.dom(productLis[i], '.stock'), 'display:block');
	}
}

function hideStockPriceImg(){
	var productLis = $api.domAll('.product');
	for (var i = 0; i < productLis.length; i++) {
		$api.css($api.dom(productLis[i], '.stock_ring'), 'display:none');
		$api.css($api.dom(productLis[i], '.product_img_div'), 'display:none');
		$api.css($api.dom(productLis[i], '.price_tag'), 'display:none');
		$api.css($api.dom(productLis[i], '.discount_price_tag'), 'display:none');
		$api.css($api.dom(productLis[i], '.sale_price_tag'), 'display:none');
		$api.css($api.dom(productLis[i], '.stock_tag'), 'display:none');
		$api.css($api.dom(productLis[i], '.invoice_price'), 'display:none');
		$api.css($api.dom(productLis[i], '.discount_price'), 'display:none');
		$api.css($api.dom(productLis[i], '.sale_price'), 'display:none');
		$api.css($api.dom(productLis[i], '.stock'), 'display:none');
	}
}


/**
 *加载经销商列表
 */
function loadDealerList() {
	var cacheDealer = BUSINESS_GetCurrentDealer(userInfo.id);
	if (cacheDealer) {
		$api.val($api.byId('customerId'), cacheDealer.customerId);
		$api.val($api.byId('soldToValue'), cacheDealer.customerCode);
		$api.html($api.byId('soldToText'), cacheDealer.customerTitle);
		$api.val($api.byId('saleOffice'), cacheDealer.saleOffice);
	} else {
		var relations = BUSINESS_GetRelations();
		if (relations && relations.length > 0) {
			$api.val($api.byId('customerId'), relations[0]['customer.id']);
			$api.val($api.byId('soldToValue'), relations[0].customerCode);
			$api.html($api.byId('soldToText'), relations[0].customerTitle);
			$api.val($api.byId('saleOffice'), relations[0].SALES_OFFICE);
		}
	}
	//loadLocationList();
	getShipPayerList();
	//从本地数据库加载离线订单列表
	//loadOfflineList();
}

/**
 * 加载库位列表
 */
function loadLocationList() {
locationList=[];
	var url = ajaxReqHost + 'appGetLocation.ajax';
	var param = {
		customerCode : $api.val($api.byId('soldToValue')),
		saleOffice : $api.val($api.byId('saleOffice'))
	}
	COMMON_Ajax_Post(url, {
		values : param
	}, function(ret) {
		if (ret && ret.length) {
			for (var i = 0; i < ret.length; i++) {
				locationList.push({
					name : ret[i].LOCATION,
					id : ret[i].LOCATION,
					PLANT : ret[i].PLANT
				});
				if (i == 0) {
					$api.val($api.byId('locationValue'), ret[0].LOCATION);
					$api.html($api.byId('locationText'), ret[0].LOCATION);
					$api.val($api.byId('plant'), ret[0].PLANT);
				}
			}
		}else{
			$api.val($api.byId('locationValue'), '');
			$api.html($api.byId('locationText'), '');
			$api.val($api.byId('plant'), '');
			
		}
		
		loadOfflineList();
	});
}

/**
 * 加载购物清单数据
 */
function loadOfflineList() {
clearProduct();
	var customerCode = $api.val($api.byId('soldToValue'));
	var sql = "select b.*, a.qty, a.is_read from offline_order a , product b where a.product_code = b.code and  a.customer_code = '" + customerCode + "'";
	db.selectSql({
		name : 'data',
		sql : sql
	}, function(ret, err) {
		$api.html($api.byId('offlineList'), '');
		if (ret && ret.status) {
			var data = ret.data;
			if (data.length > 0) {
				for (var i = 0; i < data.length; i++) {
					var productTemplate = $api.byId('productTemplate');
					var cloneObj = productTemplate.cloneNode(true);
					var isRead = data[i].is_read;
					if(isRead == ''){
						
					}
					
					$api.html($api.dom(cloneObj, '.product_name'), data[i].title);
					
					var productImg = data[i].product_img;
					if(productImg){
						var imgSrc = CONSTANT_IMG_CROP_URL + productImg + '&width='+imgWidth+'&height='+imgHeight;
						$api.attr($api.dom(cloneObj, '.product_img'), 'src', encodeURI(imgSrc));
					}
					
					$api.attr($api.dom(cloneObj, '.fast_order_selectbtn'), 'flag', '3');
					$api.removeCls($api.dom(cloneObj, '.fast_order_selectbtn'), 'select_btn_selected');
					$api.addCls($api.dom(cloneObj, '.fast_order_selectbtn'), 'select_btn_disable');
					
					$api.html($api.dom(cloneObj, '.qty'), data[i].qty);
					$api.html($api.dom(cloneObj, '.model'), data[i].model);
					$api.addCls($api.dom(cloneObj, 'li'), data[i].code);
					$api.addCls($api.dom(cloneObj, 'li'), 'id'+data[i].id);
					$api.addCls($api.dom(cloneObj, 'li'), 'product');
					
					$api.attr($api.dom(cloneObj, 'li'), 'productCode', data[i].code);
					$api.attr($api.dom(cloneObj, 'li'), 'productId', data[i].id);
					$api.attr($api.dom(cloneObj, '.stock_ring'), 'productId', data[i].id);
					
					$api.append($api.byId('offlineList'), $api.html(cloneObj));
				}
				//bindSelectSingleEvent1('offlineList');
				
				/*
				if (flag == '0') {
					flag = '1';
					bindSelectAllEvent();
				} else {
					$api.removeCls($select_all_btn, 'select_all_btn_selected');
					$api.addCls($select_all_btn, 'select_all_btn');
					$api.attr($select_all_btn, 'flag', '1');
				}
				*/

				//判断网络是否可用，如果可用，则需要获取产品的最新价格
				var netChk = COMMON_IsNetWorkAvalible();
				if (netChk == true) {
					getPriceAndStock();
					validCustomerProduct();
					showStockPriceImg();
					setReaded();
				} else { 
					hideStockPriceImg();
				}
			}
		}
	});
}



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



//获取产品价格和库存
function getPriceAndStock() {
	var offlineLiList = $api.domAll($api.byId('offlineList'), '.product');
	var productCodeArray = [];
	for (var i = 0; i < offlineLiList.length; i++) {
		var productCode = $api.attr(offlineLiList[i], 'productCode');
		var productId = $api.attr(offlineLiList[i], 'productId');
		productCodeArray.push(productCode);
	}
	if (productCodeArray.length > 0) {
		var customerCode = $api.val($api.byId('soldToValue'));
		var saleOffice = $api.val($api.byId('saleOffice'));
		var orgCode = $api.val($api.byId('orgCode'));
		var plant = $api.val($api.byId('plant'));
		var locationValue = $api.val($api.byId('locationValue'));
		
		var priceParam = {
			orgCode : CONSTANT_SALE_COMPANY_CODE, 
			saleOffice: saleOffice,
			plant: plant,
			customerCode : customerCode,
			productCodes : productCodeArray.join(',')
		};
		//获取产品价格
		BUSINESS_BachGetProductPrice(priceParam, fillProductPrice);

		var stockParam = {
			saleOffice: saleOffice,
			customerCode : customerCode,
			cartLocation: locationValue,
			productCodes : productCodeArray.join(',')
		};
		//获取库存
		BUSINESS_BachGetProductStock(stockParam, fillStock);
	}
}

function fillProductPrice(productPriceRet) {
	if (productPriceRet && productPriceRet.length > 0) {
		for (var m = 0; m < productPriceRet.length; m++) {
			var $lis = $api.domAll('.' + productPriceRet[m].matnr);
			for (var n = 0; n < $lis.length; n++) {
				$api.html($api.dom($lis[n], '.price_tag'), currency);
				$api.html($api.dom($lis[n], '.discount_price_tag'), currency);
				$api.html($api.dom($lis[n], '.sale_price_tag'), currency);
				
				if(COMMON_MoneyValid(productPriceRet[m].price2) == true){
					$api.html($api.dom($lis[n], '.invoice_price'), productPriceRet[m].price2);
				}else{
					$api.html($api.dom($lis[n], '.invoice_price'), '0');
				}
				
				$api.html($api.dom($lis[n], '.discount_price'), productPriceRet[m].price1);
				$api.html($api.dom($lis[n], '.sale_price'),  (productPriceRet[m].price2+productPriceRet[m].price1));
				
				if(productPriceRet[m].zp00 != '-1'){
					$api.removeCls($api.dom($lis[n], '.fast_order_selectbtn'), 'select_btn_disable');
					$api.addCls($api.dom($lis[n], '.fast_order_selectbtn'), 'select_btn');
					$api.attr($api.dom($lis[n], '.fast_order_selectbtn'), 'flag', '1');
				}
				
			}
			if(productPriceRet[m].price5 != 0){
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
				$api.html($api.dom($lis[n], '.stock'), productStockRet[m].quantity);
			}
		}
	}
}

function getShipPayerList() {
	var customerId = $api.val($api.byId('customerId'));
	var soldCustomerCode = $api.val($api.byId("soldToValue"));
	var netChk = COMMON_IsNetWorkAvalible();
	if (netChk == true) {
		var fourRelationUrl = ajaxReqHost + 'appCustomer.ajax?customerId=' + customerId;
		COMMON_Ajax_Post(fourRelationUrl, {}, function(fourRelationRet) {
			if (fourRelationRet && fourRelationRet != null) {
				shipToList = [];
				payToList = [];
				var sendTo = fourRelationRet.sendTo;
				var payTo = fourRelationRet.payTo;
				shipToList=[];
				payToList=[];
				
				for (var i = 0; i < sendTo.length; i++) {
					if(soldCustomerCode == sendTo[i].code){
						continue;
					}
					shipToList.push({
						id : sendTo[i].id,
						name : sendTo[i].title,
						code: sendTo[i].code,
					});
				}
				if (shipToList.length>0) {
						$api.val($api.byId('shipToValue'), shipToList[0].id);
						$api.val($api.byId('shipToCode'), shipToList[0].code);
						$api.html($api.byId('shipToText'), shipToList[0].name);
					}
	
				for (var i = 0; i < payTo.length; i++) {
					if(soldCustomerCode == payTo[i].code){
						continue;
					}
					payToList.push({
						id : payTo[i].id,
						name : payTo[i].title,
						code:payTo[i].code
					});
				}
				
				if (payToList.length>0) {						
					$api.val($api.byId('payerValue'), payToList[0].id);
					$api.val($api.byId('payerCode'), payToList[0].code);
					$api.html($api.byId('payerText'), payToList[0].name);
					
					BUSINESS_GetCustomerBalance(payToList[0].code, function(ret) {
						if (ret) {
							if(ret.result!=null  && (ret.result == false)){
								$api.html($api.byId('balanceVal'), '0.00');
								$api.val($api.byId('balance_val'), '0.00');
							}else{
								$api.html($api.byId('balanceVal'), COMMON_COMMON_FormatCurrency(math.chain(ret.balance).multiply(1)));
								$api.val($api.byId('balance_val'), math.chain(ret.balance).multiply(1));
							}
						}
					});
				}
			}
		});
	} else { 
		
		shipToList = [];
		payToList = [];
	
		var queryShipSql = " select * from customer_shipto where customer_id = '" + customerId + "'";
		db.selectSql({
			name : 'data',
			sql : queryShipSql
		}, function(ret, err) {
			if (ret && ret.status) {
				var shipListData = ret.data;
				if (shipListData.length > 0) {
					for (var j = 0; j < shipListData.length; j++) {
						if(soldCustomerCode == sendTo[i].code){
							continue;
						}
						
						shipToList.push({
							id : shipListData[j].id,
							name : shipListData[j].title,
							code: shipListData[j].code,
						});
					}
					
					if (shipToList.length>0) {
						$api.val($api.byId('shipToValue'), shipToList[0].id);
						$api.val($api.byId('shipToCode'), shipToList[0].code);
						$api.html($api.byId('shipToText'), shipToList[0].name);
					}
				} else {
					$api.val($api.byId('shipToValue'), '');
					$api.html($api.byId('shipToText'), '');
					$api.val($api.byId('shipToCode'), '');
				}
			}
		});
	
		var queryPayerSql = " select * from customer_payer where customer_id = '" + customerId + "' ";
		db.selectSql({
			name : 'data',
			sql : queryPayerSql
		}, function(ret, err) {
			if (ret &&　ret.status) {
				var payerData = ret.data;
				if (payerData.length > 0) {
					for (var k = 0; k < payerData.length; k++){
						if(soldCustomerCode == payTo[i].code){
							continue;
						}
						
						payToList.push({
							id : payerData[k].id,
							name : payerData[k].customer_title,
							code:payerData[k].customer_code
						});
					}
					if (payToList.length>0) {						
						$api.val($api.byId('payerValue'), payToList[0].id);
						$api.val($api.byId('payerCode'), payToList[0].code);
						$api.html($api.byId('payerText'), payToList[0].name);
						
						BUSINESS_GetCustomerBalance(payToList[0].code, function(ret) {
							if (ret) {
								if(ret.result!=null  && (ret.result == false)){
									$api.html($api.byId('balanceVal'), '0.00');
									$api.val($api.byId('balance_val'), '0.00');
								}else{
									$api.html($api.byId('balanceVal'), COMMON_COMMON_FormatCurrency(math.chain(ret.balance).multiply(1)));
									$api.val($api.byId('balance_val'), math.chain(ret.balance).multiply(1));
								}
							}
						});
					}
				} else{
					$api.val($api.byId('payerValue'), '');
					$api.html($api.byId('payerText'), '');
					$api.val($api.byId('payerCode'), '');
				}
			}
		});
	}
}

/**
 * 选择送达方
 */
function showSoldToTypeSelect(){
	COMMON_OpenWin({
		name : 'dealer_select',
		url : 'dealer_select.html',
		pageParam : {
			winName : "fast_order",
			selected: $api.html($api.byId('soldToText'))
		}
	});
}

function UPDATE_DEALER(param){
	var customerCode = param.customerCode;
	var customerId = param.customerId;
	var title = param.title;
	var saleOffice=param.saleOffice;
	var orgCode=param.orgCode;
	
	$api.html($api.byId("soldToText"), title);
	$api.val($api.byId("soldToValue"), customerCode);
	$api.val($api.byId("customerId"), customerId);
	$api.val($api.byId("saleOffice"), saleOffice);
	$api.val($api.byId("orgCode"), orgCode);
	
	var dealer = {
		'customerCode' : customerCode,
		'customerTitle' : title,
		'customerId' : customerId,
		'saleOffice': saleOffice,
		'orgCode': orgCode
	};
	BUSINESS_UpdateCurrentDealer(userInfo.id, dealer);
	
	loadLocationList();
	getShipPayerList();
	$api.html($api.byId('offlineList'), '');
}

/**
 * 选择送达方
 */
function showShipToSelect(){
	var buttons = [];
	for(var i=0; i<shipToList.length; i++){
		buttons.push(shipToList[i].name);
	}
	COMMON_actionSheet('Selected: '+$api.html($api.byId('shipToText')), buttons, function(ret){
		$api.html($api.byId('shipToText'), shipToList[ret].name);
		$api.val($api.byId('shipToValue'), shipToList[ret].id);
		$api.val($api.byId('shipToCode'), shipToList[ret].code);
	});
	
	return;

	COMMON_ActionSelector(shipToList, function(ret){
		$api.html($api.byId('shipToText'), ret.level1);
		$api.val($api.byId('shipToValue'), ret.selectedInfo[0].id);
		$api.val($api.byId('shipToCode'), ret.selectedInfo[0].code);
	});
}

/**
 * 选择付款方
 */
function showPayToTypeSelect(){
	var buttons = [];
	for(var i=0; i<payToList.length; i++){
		buttons.push(payToList[i].name);
	}
	var title = 'Selected: '+ $api.html($api.byId('payerText'));
	COMMON_actionSheet(title, buttons, function(ret){
		$api.html($api.byId('payerText'), payToList[ret].name);
		$api.val($api.byId('payerValue'), payToList[ret].id);
		$api.val($api.byId('payerCode'), ret.selectedInfo[0].code);
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
	COMMON_ActionSelector(payToList, function(ret){
		$api.html($api.byId('payerText'), ret.level1);
		$api.val($api.byId('payerValue'), ret.selectedInfo[0].id);
		$api.val($api.byId('payerCode'), ret.selectedInfo[0].code);
		
		BUSINESS_GetCustomerBalance(ret.selectedInfo[0].code, function(ret) {
			
			if (ret) {
				if(ret.result!=null  && (ret.result == false)){
					$api.html($api.byId('balanceVal'), '0.00');
					$api.val($api.byId('balance_val'), '0.00');
				}else{
					$api.html($api.byId('balanceVal'), COMMON_COMMON_FormatCurrency(math.chain(ret.balance).multiply(1)));
					$api.val($api.byId('balance_val'), math.chain(ret.balance).multiply(1));
				}
			}
		});
	});
}

function UPDATE_LOCATION(location){
	$api.html($api.byId('locationText'), location.name);
	$api.val($api.byId('locationValue'), location.id);
	$api.val($api.byId('plant'), location.PLANT);
	loadOfflineList();
	
}

//选择库位
function showLocationSelect(){
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
			winName: 'fast_order',
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
		$api.html($api.byId('locationText'), locationList[ret].name);
		$api.val($api.byId('locationValue'), locationList[ret].id);
		$api.val($api.byId('plant'), locationList[ret].PLANT);
		loadOfflineList();
	});
	
	return;
	
	COMMON_ActionSelector(locationList, function(ret){
			$api.html($api.byId('locationText'), ret.level1);
			$api.val($api.byId('locationValue'), ret.selectedInfo[0].id);
			$api.val($api.byId('plant'), ret.selectedInfo[0].PLANT);
			loadOfflineList();
		});
}

//更新购物车数量
function updProductNum(qty, productId, inputEle){
	var customerCode = $api.val($api.byId('soldToValue'));
	
	var updSql = " update offline_order set qty=" + qty + "  where product_id='" + productId + "' and customer_code='" + customerCode + "' ";
	db.executeSql({
		name : 'data',
		sql : updSql
	}, function(ret, err) {
		if (ret && ret.status) {
			$api.html(inputEle, qty);
			calSumPrice();
		}
	});

}

//把未读更改为已读
function setReaded(){
	var sql = " update offline_order set is_read=1 where is_read = 0 ";
	db.executeSql({
		name : 'data',
		sql : sql
	}, function(ret, err) {
		if (ret.status) {
		}
	});
}

//删除购物产品

function deleteProduct(me) {
	var dialogBox = api.require('dialogBox');
	dialogBox.alert({
		texts : {
			title : $.i18n.prop('tip'),
			content : $.i18n.prop('deleteTip'),
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
				icon : '',
				iconSize : 40,
				titleSize : 14,
				titleColor : '#555'
			},
			content : {
				marginT : 20,
				marginB : 20,
				color : '#555',
				size : 12
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
		if (ret.eventType == 'left') {
			var dialogBox = api.require('dialogBox');
			dialogBox.close({
				dialogName : 'alert'
			});
		} else if (ret.eventType == 'right') {
			var dialogBox = api.require('dialogBox');
			dialogBox.close({
				dialogName : 'alert'
			});
			var parent = $api.closest(me, '.product');
			var productCode = $api.attr(parent, 'productCode');
			var customerCode = $api.val($api.byId('soldToValue'));

			var deleteSql = " delete from offline_order where product_code='" + productCode + "' and customer_code='" + customerCode + "' ";
			db.executeSql({
				name : 'data',
				sql : deleteSql
			}, function(ret, err) {
				if (ret.status) {
					$api.remove(parent);
					calSumPrice();
				}
			});
		}
	});
}


function selectItem(product){
	var productCode = product.code;
	var productId = product.id;
	var customerCode = $api.val($api.byId('soldToValue'));
	var isAddedSql = "select * from offline_order where product_code = '" + productCode + "' and customer_code='" + customerCode + "'";
	db.selectSql({
		name : 'data',
		sql : isAddedSql
	}, function(ret, err) {
		if (ret.status) {
			var data = ret.data;
			if (data.length > 0) {
				
			} else {
				var offlineData = {
					'product_code' : productCode,
					'qty' : 1,
					'customer_code' : customerCode,
					'product_id': productId
				};
				saveOfflineOrder(offlineData);
			}
		}
	});
}

function saveOfflineOrder(offlineData) {
	var isRead = 0;
	var netChk = COMMON_IsNetWorkAvalible();
	if (netChk == true) {
		isRead = 1;
	}

	var sql = "insert into offline_order values('" + offlineData.product_code + "',  '" + offlineData.qty + "', '" + offlineData.customer_code + "', '" + offlineData.product_id + "',"+isRead+" )";
	db.executeSql({
		name : 'data',
		sql : sql
	}, function(ret, err) {
		if (ret && ret.status) {
			loadOfflineList();
		} else {
			COMMON_ShowFailure();
		};
	});
}

function checkout() {
	var $select_btn_groups = $api.domAll('.select_btn_selected');
	var productList = [];
	
	var stockWarningMsg = '';
	
	//总量
	var sumNum = 0;
	for (var i = 0; i < $select_btn_groups.length; i++) {
		var flag = $api.attr($select_btn_groups[i], 'flag');
		if (flag == '2') {
			var parent = $api.closest($select_btn_groups[i], '.product');
			var productId = $api.attr(parent, 'productId');
			var productCode = $api.attr(parent, 'productCode');
			var product_imgpath = $api.attr($api.dom(parent, '.product_img'), 'src');
			var product_title = $api.html($api.dom(parent, '.product_name'));
			var product_stock = $api.html($api.dom(parent, '.stock'));
			var product_model = $api.html($api.dom(parent, '.model'));
			var product_bill_price = $api.html($api.dom(parent, '.invoice_price'));
			var product_price = $api.html($api.dom(parent, '.sale_price'));
			var product_discount_price = $api.html($api.dom(parent, '.discount_price'));
			var product_qty = $api.html($api.dom(parent, '.qty'));
			
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
					product_bill_price : product_bill_price,
					product_price : product_price,
					product_deduct_price : product_discount_price,
					product_qty : product_qty,
					currency: currency
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
        	//coding...
        });
	}else{
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

function saveOrder(productList, sumNum){
	if (productList.length == 0) {
		api.toast({
			msg : $.i18n.prop('plsSelectProduct')
		});
		return;
	}
	
	//总额
	var totalPrice = $api.val($api.byId('total_price_val'));
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
		name : $api.html($api.byId('payerText'))
	};
	var location = {
		id : $api.val($api.byId('locationValue')),
		name : $api.html($api.byId('locationText'))
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
			productList : productList,
			channel:'OFFLINE_ORDER'
		}
	});
}

function addOosRemind(me) {
	var productId = $api.attr(me, 'productId');
	//先判断是否已经加过
	var validExistUrl = ajaxReqHost + 'appExistOssRemind.ajax?productId=' + productId + '&customerCode=' + $api.val($api.byId('soldToValue'));
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

function saveOos(productId) {
	COMMON_OpenWin({
		name : 'oos_add',
		url : '../html/oos_add.html',
		pageParam : {
			productId : productId,
			customerId : $api.val($api.byId('customerId'))
		}
	});
}

//验证客户是否能看到某个产品 
function validCustomerProduct(){
	var offlineLiList = $api.domAll($api.byId('offlineList'), '.product');
	var productCodeArray = [];
	for (var i = 0; i < offlineLiList.length; i++) {
		var productCode = $api.attr(offlineLiList[i], 'productCode');
		productCodeArray.push(productCode);
	}
	if (productCodeArray.length > 0) {
		var customerCode = $api.val($api.byId('soldToValue'));
		var url = ajaxReqHost + 'appCustomerProduct.ajax';
		COMMON_Ajax_Post(url, {
			values : {
				customerCode : customerCode,
				productCodes : productCodeArray.join(',')
			}
		}, function(ret) {
			if(ret){
				for(var key in ret){
					var result = ret[key];
					if(result == false){
						var $lis = $api.domAll('.' + key);
						for (var n = 0; n < $lis.length; n++) {
							$api.remove($api.dom($lis[n]));
						}
					}
				}
			}
		});
	}
}

function getShiptoPayer(){
	
}


function openSearchWin() {
	var sql = "SELECT count(*)counts FROM product a limit 0, 10";
	db.selectSql({
		name : 'data',
		sql : sql
	}, function(ret, err) {
		if (ret.data[0].counts<=0) {
			var dialogBox = api.require('dialogBox');
			dialogBox.alert({
				texts : {
					title : 'Tip',
					content : 'Please update offline data!',
					leftBtnTitle : 'Cancel',
					rightBtnTitle : 'OK'
				},
				styles : {
					bg : '#fff',
					w : 300,
					title : {
						marginT : 20,
						icon : 'widget://res/gou.png',
						iconSize : 40,
						titleSize : 16,
						titleColor : '#555'
					},
					content : {
						color : '#555',
						size : 14
					},
					left : {
						marginB : 7,
						marginL : 20,
						w : 130,
						h : 35,
						corner : 0,
						bg : '#efefef',
						color: '#555',
						size : 14
					},
					right : {
						marginB : 7,
						marginL : 10,
						w : 130,
						h : 35,
						corner : 0,
						bg : '#1B7BEA',
						color: '#fff',
						size : 14
					}
				}
			}, function(ret) {
				if (ret.eventType == 'left') {
					dialogBox.close({
						dialogName : 'alert'
					});
				} else {
					dialogBox.close({
						dialogName : 'alert'
					});
					COMMON_OpenWin({
						name : 'update_offline_data',
						url : 'update_offline_data.html'
					});

				}
			});
		} else {
			COMMON_OpenWin({
				name : 'fast_order_search',
				url : 'fast_order_search.html'
			});
		}

	});

}

//跳转页面
function lookDetail(me) {
	var parent = $api.closest(me, 'li');
	var productId = $api.attr(parent, 'productId');
	var productCode = $api.attr(parent, 'productCode');
	var customerId=$api.val($api.byId("customerId"));
	var customerCode=$api.val($api.byId("customerCode"));
	var saleOffice=$api.val($api.byId("saleOffice"));
	var orgCode=$api.val($api.byId("orgCode"));
	var values={
			productId : productId,
			customerId : customerId,
			productCode: productCode,
			customerCode: customerCode,
			saleOffice: saleOffice,
			orgCode: orgCode
		}
	COMMON_OpenWin({
		name : 'product_detail',
		url : 'product_detail.html',
		pageParam : values
	});
}


function clearProduct() {
	var $select_all_btn = $api.dom('.select_all_product');
	var $select_btn_groups = $api.domAll('.select_btn_selected');
	$api.removeCls($select_all_btn, 'select_all_btn_selected');
	$api.addCls($select_all_btn, 'select_all_btn');
	$api.attr($select_all_btn, 'flag', '1');

	for (var i = 0; i < $select_btn_groups.length; i++) {
		var isAvaSelectFlag = $api.attr($select_btn_groups[i], 'flag');
		if (isAvaSelectFlag != '3') {
			$api.removeCls($select_btn_groups[i], 'select_btn_selected');
			$api.addCls($select_btn_groups[i], 'select_btn');
			$api.attr($select_btn_groups[i], 'flag', '1');
		}
	}
	calSumPrice();
}


function showShipToSelectWin() {
	COMMON_OpenWin({
		name : 'shipto_select',
		url : 'shipto_select.html',
		pageParam : {
			winName: 'fast_order',
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
			winName: 'fast_order',
			datas: payToList,
			selected: $api.html($api.byId('payerText'))+' '+$api.val($api.byId('payerCode'))
		}
	});
}

function UPDATE_SHIPTO(param){
	$api.html($api.byId('shipToText'), param.name);
	$api.val($api.byId('shipToValue'), param.id);
	$api.val($api.byId('shipToCode'), param.code);
}

function UPDATE_PAYER(param){
	$api.html($api.byId('payerText'), param.name);
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
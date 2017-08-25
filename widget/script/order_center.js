var dealerList = [];
var isListEnd = false;
var page_no = 0;
var userInfo = $api.getStorage("userInfo");
var currency = BUSINESS_GetCurrency();
var imgWidth,imgHeight;
apiready = function() {
	
	imgWidth = Math.floor(api.screenWidth/4);
	imgHeight = imgWidth;
	var relations = BUSINESS_GetRelations();
	//	for (var i = 0; i < relations.length; i++) {
	//		dealerList.push({
	//			customerId : relations[i]['customer.id'],
	//			name : relations[i].customerTitle,
	//			id : relations[i].customerCode
	//		});
	//	}

	var $header = $api.dom('header');
	$api.fixIos7Bar($header);
	$api.fixStatusBar($header);
	var headerHeight = $api.offset($header).h;
	$api.css($api.byId('container'),'padding-top:'+headerHeight+'px');
	
	var cacheDealer = BUSINESS_GetCurrentDealer(userInfo.id);
	
	if (cacheDealer) {
		$api.html($api.byId('customerId'), cacheDealer.customerId);
		$api.html($api.byId('delearCode'), cacheDealer.customerCode);
		$api.html($api.byId('delearTitle'), cacheDealer.customerTitle);
	} else {
		if (relations && relations.length > 0) {
			$api.html($api.byId('customerId'), relations[0].customerId);
			$api.html($api.byId('delearCode'), relations[0].customerCode);
			$api.html($api.byId('delearTitle'), relations[0].customerTitle);
		}
	}
	
	var pageParam = api.pageParam;
	if(pageParam){
		var orderNo = pageParam.orderNo;
		if(orderNo){
			$api.val($api.byId('orderNoKey'), orderNo);
			$api.css($api.byId('resetSearchBtn'), 'display:inline-block');
		}
	}
	
	loadlist();

	api.addEventListener({
		name : "scrolltobottom",
		extra : {
			threshold : 100
		}
	}, function(ret, err) {
		loadlist();
	})

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

function opendetail(orderId, orderErpId, orderStatus) {
	COMMON_OpenWin({
		name : "order_detail",
		url : "order_detail.html",
		pageParam : {
			"orderId" : orderId,
			"orderErpId" : orderErpId,
			'orderStatus' : orderStatus,
			'customerId': $api.html($api.byId("customerId"))
		}
	});
}

function loadlist() {
	if (isListEnd) {
		return;
	}
	
	var customor = $api.html($api.byId("delearCode"));
	var param = {
			"from" : "app",
			customerCode : customor,
			pageNo : page_no,
			pageSize : pageSize
		};
		
	var orderNo = $api.val($api.byId("orderNoKey"));
	if(orderNo != ''){
		param.orderNumber = orderNo;
	}
	
	COMMON_Ajax_Post(ajaxReqHost + 'appGetOrderList.ajax', {
		values : param
	}, function(ret) {
		var list = ret.list;
		for (var i = 0; i < list.length; i++) {
			addOrder(list[i]);
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

	}, 'json');
}

function addOrder(order) {
	var orderNo = $api.byId('orderNo');
	//订单号
	var data = $api.byId('data');
	//商品
	var total = $api.byId('total');
	//总计
	var orderNoM = $api.byId('orderNoM');
	//子订单编号
	var copyOrderNo = orderNo.cloneNode(true);
	var copyData = data.cloneNode(true);
	var copyTotal = total.cloneNode(true);
	

	//添加订单号
	$api.html($api.dom(copyOrderNo, '.orderNo'), order.orderNumber);
	$api.attr($api.dom(copyOrderNo, '.toggle_product'), "orderNo", order.orderNumber);
	$api.append($api.byId('orderList'), '<li class="aui-list-item aui-list-item-middle copy title order"  style="border-top:1px solid #fff">' + $api.html(copyOrderNo) + '</li>');
	var productList = order.orderLine;
	//添加产品信息
	for (var j = 0; j < productList.length; j++) {
		var imgSrc = CONSTANT_IMG_CROP_URL + productList[j].imgPath + '&width=' + imgWidth + '&height=' + imgWidth;
		$api.attr($api.dom(copyData, ".produce_img"), 'src', encodeURI(imgSrc));

		//商品图片
		$api.html($api.dom(copyData, ".No"), productList[j].title);
		//商品编号
		$api.html($api.dom(copyData, ".price"), currency + "" + COMMON_COMMON_FormatCurrency(productList[j].billPrice));
		//商品价格
		$api.html($api.dom(copyData, ".model"), productList[j].model);
		//商品model
		$api.html($api.dom(copyData, ".count"), "×" + productList[j].qty);

		//商品件数
		//$api.append($api.byId('orderList'), '<li class="aui-list-item aui-list aui-media-list copy detail data " style="border-bottom:1px solid #efeded" onclick="opendetail(\''+orders[t].id+'\',\''+orderLine[j].id+'\')">' + $api.html(copyData) + '</li>');
		$api.append($api.byId('orderList'), '<li class="aui-list-item aui-list aui-media-list copy detail data ' + order.orderNumber + '" style="border-top:1px solid #fff" onclick="lookDetail(' + productList[j].productId + ')">' + $api.html(copyData) + '</li>');
	}
	//添加产品信息
	$api.html($api.dom(copyTotal, ".totalNum"), "Total : <span class='aui-text-info'>" + order.totalQty + "</span>&nbsp;&nbsp; Products  Amount : ");
	$api.html($api.dom(copyTotal, ".totalPrice"), currency + "" + COMMON_COMMON_FormatCurrency(math.chain(order.totalAmount).multiply(1.005).done()));
	$api.append($api.byId('orderList'), '<li class="aui-list-item aui-list-item-middle copy tyle " id="total" style="border-top:1px solid #fff">' + $api.html(copyTotal) + '</li>');
	//添加子订单
	var erpOrderList = order.orderErp;
	for (var k = 0; k < erpOrderList.length; k++) {
		var copyOrderNoM = orderNoM.cloneNode(true);
		$api.html($api.dom(copyOrderNoM, ".productGroup"), erpOrderList[k].productGroupName);
		var status = erpOrderList[k].status;
		status = CONSTANT_ORDER_STATUS[status];
		
		$api.html($api.dom(copyOrderNoM, ".ZSONo"), erpOrderList[k].erpOrderNumber);
		
		var submitStatus = erpOrderList[k].submitStatus;
		if (submitStatus == 'FAILURE') {
			$api.css($api.dom(copyOrderNoM, ".failmsg"), "display:block");
			$api.html($api.dom(copyOrderNoM, ".failReason"), erpOrderList[k].msg);
		}else{
			$api.css($api.dom(copyOrderNoM, ".failmsg"), "display:none");
			$api.html($api.dom(copyOrderNoM, ".failReason"), erpOrderList[k].msg);
		}
		$api.html($api.dom(copyOrderNoM, ".issuccess"), submitStatus);

		if (k == erpOrderList.length - 1) {
			$api.append($api.byId('orderList'), '<li class="aui-list-item copy aui-margin-b-5" id="orderNoM"' + ' style="border-top:1px solid #fff;" onclick="opendetail(\'' + order.id + '\',\'' + erpOrderList[k].id + '\',\'' + status + '\')">' + $api.html(copyOrderNoM) + '</li>');
		} else {
			$api.append($api.byId('orderList'), '<li class="aui-list-item copy " id="orderNoM"' + ' style="margin-bottom:1px;" onclick="opendetail(\'' + order.id + '\',\'' + erpOrderList[k].id + '\',\'' + status + '\')">' + $api.html(copyOrderNoM) + '</li>');
		}

	}
}

function toggleProducts(me) {
	var flag = $api.attr(me, 'flag');
	var orderNo = $api.attr(me, 'orderNo');
	if (flag == '0') {
		var productLis = $api.domAll('.' + orderNo);
		for (var i = 0; i < productLis.length; i++) {
			$api.css(productLis[i], 'display:none');
		}

		$api.attr(me, 'flag', '1');
		$api.removeCls(me, 'aui-icon-minus');
		$api.addCls(me, 'aui-icon-plus');
	} else {
		var productLis = $api.domAll('.' + orderNo);
		for (var i = 0; i < productLis.length; i++) {
			$api.css(productLis[i], 'display:block');
		}

		$api.attr(me, 'flag', '0');
		$api.removeCls(me, 'aui-icon-plus');
		$api.addCls(me, 'aui-icon-minus');
	}
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
			winName : "order_center",
			selected: $api.html($api.byId('delearTitle'))
		}
	});
}

function UPDATE_DEALER(param){
	var customerCode = param.customerCode;
		var customerId = param.customerId;
		var title = param.title;
		var lis = $api.domAll($api.byId("orderList"), ".copy");
		for (var p = 0; p < lis.length; p++) {
			$api.remove(lis[p]);
		}
		$api.html($api.byId("delearTitle"), title);
		$api.html($api.byId("delearCode"), customerCode);
		$api.html($api.byId("customerId"), customerId);

		var dealer = {
			'customerCode' : customerCode,
			'customerTitle' : title,
			'customerId' : customerId
		};
		
		$api.setStorage(userInfo.id + '_dealer', dealer);

		$api.addCls($api.byId('noDataInfo'), 'aui-hide');
		$api.addCls($api.byId('footInfo'), 'aui-hide');
		page_no = 0;
		isListEnd = false;
		loadlist();
}

function searchByOrderNo() {
	COMMON_UISearchBar(function(ret) {
		var key = $api.trimAll(ret.text);
		if (key != '') {
			$api.val($api.byId('orderNoKey'), key);
			$api.css($api.byId('resetSearchBtn'), 'display:inline-block');
			
			isListEnd = false;
			page_no = 0;
			$api.html($api.byId('orderList'), '');
			loadlist();
		}
	});
}

function resetOrderNoSearch() {
	$api.val($api.byId('orderNoKey'), '');
	$api.css($api.byId('resetSearchBtn'), 'display:none');
	
	isListEnd = false;
	page_no = 0;
	$api.html($api.byId('orderList'), '');
	loadlist();
	
	window.event.preventDefault();
	window.event.stopPropagation();
}
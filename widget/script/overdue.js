var currency = BUSINESS_GetCurrency();
var dealer = "";
var page_no = 0;
var isListEnd = false;
var page_total = 0;
var data = [];
var payerCodeList = [];
var userInfo = $api.getStorage("userInfo");
apiready = function() {
	var $header = $api.dom('header');
	$api.fixIos7Bar($header);
	$api.fixStatusBar($header);
	var $header = $api.dom('header');
	var headerHeight = $api.offset($header).h;
	
	COMMON_openFrame({
		name : 'overdue_head',
		url : 'overdue_head.html',
		rect : {
			x : 0,
			y : 0,
			w : api.winWidth,
			h : headerHeight
		}
	});
	
	var calendar = new lCalendar();
	calendar.init({
		'trigger': '#dateText',
		'type': 'date',
		'callback': function(){
			page_no = 0;
			isListEnd = false;
			$api.html($api.byId('container'), '');
			$api.addCls($api.byId('noDataInfo'), 'aui-hide');
			$api.addCls($api.byId('footInfo'), 'aui-hide');
			loadData();
		}
	});
	
	var date = new Date();
	var month = date.getMonth() + 1;
	var day = date.getDate();
	if (month < 10) {
		month = "0" + month;
	}
	if (day < 10) {
		day = "0" + day;
	}
	var date_fmt1 = date.getFullYear() + '-' + month + '-' + day;
	$api.val($api.byId('dateText'), date_fmt1);

	loadDealerList()

	//	var scroll = new auiScroll({
	//		listen : true, //是否监听滚动高度，开启后将实时返回滚动高度
	//		distance : 50 //判断到达底部的距离，isToBottom为true
	//	}, function(ret) {
	//		loadData();
	//	});

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
}
function loadData() {
	if (isListEnd) {
		return;
	}

	var dateText = $api.val($api.byId("dateText"));
	var colors = ['#0099FF', '#00897B', '#673AB7', '#BF0A10', '#FF9900'];
	var url = ajaxReqHost + 'appGetCustomerOverdue.ajax';
	var param = {
		date : dateText
	}
	param.payerCodes = payerCodeList.join(",");
	COMMON_Ajax_Post(url, {
		values : param
	}, function(ret) {
		if (ret) {
			var data = ret;
			log('overdue', ret);
			for (var i = 0; i < data.length; i++) {
				var template = $api.byId('template');
				var cloneObj = template.cloneNode(true);
				$api.css($api.dom(cloneObj, '.bg'), 'background:' + colors[i % (colors.length)]);
				$api.html($api.dom(cloneObj, '.dealer'), '&nbsp;&nbsp;'+data[i].customername);
				$api.html($api.dom(cloneObj, '.code'), data[i].accountNumber);
				$api.html($api.dom(cloneObj, '.days1-30'), currency + COMMON_COMMON_FormatCurrency(data[i]['d1to30Days']));
				$api.html($api.dom(cloneObj, '.days31-60'), currency + COMMON_COMMON_FormatCurrency(data[i]['d31to60Days']));
				$api.html($api.dom(cloneObj, '.days61-90'), currency + COMMON_COMMON_FormatCurrency(data[i]['d61to90Days']));
				$api.html($api.dom(cloneObj, '.days91-120'), currency + COMMON_COMMON_FormatCurrency(data[i]['d91to120Days']));
				$api.html($api.dom(cloneObj, '.days121-180'), currency + COMMON_COMMON_FormatCurrency(data[i]['d121to180Days']));
				$api.html($api.dom(cloneObj, '.days181-365'), currency + COMMON_COMMON_FormatCurrency(data[i]['d181to365Days']));
				$api.html($api.dom(cloneObj, '.daysSum'), currency + COMMON_COMMON_FormatCurrency(data[i]['big365days']));
				$api.html($api.dom(cloneObj, '.creditMemo'), data[i]['creditmemo'] || '');
				
				$api.append($api.byId('container'), $api.html(cloneObj));
			}

			if (data.length == 0) {
				//$api.removeCls($api.byId('noDataInfo'), 'aui-hide');
			} else if (data.length > 0) {
				//$api.removeCls($api.byId('footInfo'), 'aui-hide');
			} else {
				$api.removeCls($api.byId('noDataInfo'), 'aui-hide');
			}

			//			if (page_no == 0) {
			//				api.toast({
			//					msg : 'Total Quantity: ' + data.length,
			//					duration : 2000
			//				});
			//			}
			//
			//			if (data.length == 0 && page_no == 0) {
			//				$api.removeCls($api.byId('noDataInfo'), 'aui-hide');
			//				isListEnd = true;
			//				return;
			//			}
			//
			//			if (data.length < pageSize) {
			//				$api.removeCls($api.byId('footInfo'), 'aui-hide');
			//				isListEnd = true;
			//				return;
			//			}
			//
			//			page_no = page_no + 1;
		}
	});

}

function getPayerCodeList() {
	var url = ajaxReqHost + 'appCustomer.ajax';
	COMMON_Ajax_Post(url, {
		values : {
			customerId : $api.val($api.byId('customerId'))
		}
	}, function(ret) {
		if (ret && ret.payTo) {
			var payToList = ret.payTo;
			payerCodeList = [];
			for (var i = 0; i < payToList.length; i++) {
				payerCodeList.push(payToList[i].code);
			}
			loadData();
		}
	});

}

function showDealerActionSelector() {
	COMMON_OpenWin({
		name : 'dealer_select',
		url : 'dealer_select.html',
		pageParam : {
			winName : "overdue",
			selected: $api.html($api.byId('productDivisionText'))
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
		$api.html($api.byId('productDivisionText'), title);

		var dealer = {
			'customerCode' : customerCode,
			'customerTitle' : title,
			'customerId' : customerId,
			'saleOffice' : saleOffice,
			'orgCode' : orgCode
		};
		BUSINESS_UpdateCurrentDealer(userInfo.id, dealer);

		page_no = 0;
		isListEnd = false;
		$api.html($api.byId('container'), '');
		$api.addCls($api.byId('noDataInfo'), 'aui-hide');
		$api.addCls($api.byId('footInfo'), 'aui-hide');
		getPayerCodeList();
}

function loadDealerList() {
	//客户列表
	var relations = BUSINESS_GetRelations();

	var cacheDealer = BUSINESS_GetCurrentDealer(userInfo.id);
	if (cacheDealer) {
		$api.val($api.byId('customerCode'), cacheDealer.customerCode);
		$api.html($api.byId('productDivisionText'), cacheDealer.customerTitle);
		$api.val($api.byId('customerId'), cacheDealer.customerId);
	} else {
		if (relations && relations.length > 0) {
			$api.val($api.byId('customerCode'), relations[0].customerCode);
			$api.val($api.byId('customerId'), relations[0]['customer.id']);
			$api.html($api.byId('productDivisionText'), relations[0].customerTitle);
		}
	}
	getPayerCodeList();
}

function showDateSelect() {
	COMMON_DatePicker('date', function(ret) {
		var year = ret.year;
		var month = ret.month;
		var day = ret.day;
		if (month < 10) {
			month = "0" + month;
		}
		if (day < 10) {
			day = "0" + day;
		}
		$api.html($api.byId("dateText"), year + '-' + month + '-' + day);
		page_no = 0;
		isListEnd = false;
		$api.html($api.byId('container'), '');
		$api.addCls($api.byId('noDataInfo'), 'aui-hide');
		$api.addCls($api.byId('footInfo'), 'aui-hide');
		loadData();
	});
}
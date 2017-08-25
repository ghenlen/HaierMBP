var productDivisionListData = [];
var dateDataList = [];
var page_no = 0;
var isListEnd = false;
var userInfo = $api.getStorage("userInfo");
apiready = function() {
	var $header = $api.dom('header');
	$api.fixIos7Bar($header);
	$api.fixStatusBar($header);
	var $header = $api.dom('header');
	var headerHeight = $api.offset($header).h;
	COMMON_openFrame({
		name : 'monthly_sale_target_head',
		url : 'monthly_sale_target_head.html',
		rect : {
			x : 0,
			y : 0,
			w : api.winWidth,
			h : headerHeight
		}
	});
	
//	var calendar = new lCalendar();
//	calendar.init({
//		'trigger' : '#time',
//		'type' : 'date1',
//		'callback' : function() {
//			$api.html($api.byId("monthlySaleTarList"), '');
//			$api.addCls($api.byId('noDataInfo'), 'aui-hide');
//			$api.addCls($api.byId('footInfo'), 'aui-hide');
//			page_no = 0;
//			isListEnd = false;
//			loadData();
//			loadDetailData();
//		}
//	}); 

	
	/*
	var param = {};
	var post = BUSINESS_JudgeOrgType();
	if(post == 'SBU'){
		param['userId'] = userInfo.id;
	}else if(post == 'BRANCH'){
		param['branchCode'] = BUSINESS_GetOrgCode();
		$api.addCls($api.byId("notBranchDiv"), "aui-show");
		initDealer();
	}else if(post == 'REGION'){
		param['regionCode'] = BUSINESS_GetOrgCode();
		
		$api.addCls($api.byId("branchDiv"), "aui-show");
		$api.removeCls($api.byId("timeDiv"), "aui-col-xs-4");
		$api.removeCls($api.byId("productDivisionDiv"), "aui-col-xs-4");
		$api.addCls($api.byId("timeDiv"), "aui-col-xs-6");
		$api.addCls($api.byId("productDivisionDiv"), "aui-col-xs-6");
		api.sendEvent({
			name : 'lockEvent',
			extra : {
				lockFlag : 'LOCK'
			}
		});
		
		$api.html($api.byId('regionTitle'), "Region:" + BUSINESS_GetOrgTitle());
		$api.html($api.byId('branchTitle'), "Branch:ALL");
		$api.val($api.byId('regionCode'), BUSINESS_GetOrgCode());
		$api.val($api.byId('branchCode'), "-1");
	}else if(post == 'HO'){
		$api.addCls($api.byId("branchDiv"), "aui-show");
		$api.removeCls($api.byId("timeDiv"), "aui-col-xs-4");
		$api.removeCls($api.byId("productDivisionDiv"), "aui-col-xs-4");
		$api.addCls($api.byId("timeDiv"), "aui-col-xs-6");
		$api.addCls($api.byId("productDivisionDiv"), "aui-col-xs-6");
		api.sendEvent({
			name : 'lockEvent',
			extra : {
				lockFlag : 'LOCK'
			}
		});
		
		$api.html($api.byId('regionTitle'), "Region:ALL");
		$api.html($api.byId('branchTitle'), "Branch:ALL");
		$api.val($api.byId('regionCode'), "-1");
		$api.val($api.byId('branchCode'), "-1");
	}
	*/
	
	//initDealer();
	loadMonthData();

	api.addEventListener({
		name : "scrolltobottom",
		extra : {
			threshold : 100
		}
	}, function(ret, err) {
		loadDetailData();
	})


	/*
	api.addEventListener({
		name : 'selectOrg'
	}, function(ret, err) {
		$api.html($api.byId('regionTitle'), "Region:" + ret.value.regionTitle);
		$api.html($api.byId('branchTitle'), "Branch:" + ret.value.branchTitle);
		$api.val($api.byId('regionCode'), ret.value.regionCode);
		$api.val($api.byId('branchCode'), ret.value.branchCode);

		$api.html($api.byId("monthlySaleTarList"), '');
		$api.addCls($api.byId('noDataInfo'), 'aui-hide');
		$api.addCls($api.byId('footInfo'), 'aui-hide');
		page_no = 0;
		isListEnd = false;
		loadData();
		loadDetailData();
	});
	*/
	
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
function initDealer() {
	//客户列表
	var relations = BUSINESS_GetRelations();
	if (relations && relations.length > 0) {
		$api.html($api.byId('dealerName'), relations[0].customerTitle);
		$api.val($api.byId('customerCode'), relations[0].customerCode);
		$api.val($api.byId('customerId'), relations[0]['customer.id']);
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
			productDivisionListData.push({
				'name' : 'Product Division',
				'id' : ''
			});
			for (var i = 0; i < ret.length; i++) {
				productDivisionListData.push({
					'name' : ret[i].title,
					'id' : ret[i].value
				});

			}
			if (productDivisionListData.length > 0) {
				$api.val($api.byId('productDivisionVal'), productDivisionListData[0].id);
				$api.html($api.byId('productDivisionText'), productDivisionListData[0].name);
			}

			$api.html($api.byId("monthlySaleTarList"), '');
			$api.addCls($api.byId('noDataInfo'), 'aui-hide');
			$api.addCls($api.byId('footInfo'), 'aui-hide');
			page_no = 0;
			isListEnd = false;
			loadData();
			loadDetailData();
		}
	});
}


function showTimeSelect() {
	$api.html($api.byId("monthlySaleTarList"), '');
	$api.addCls($api.byId('noDataInfo'), 'aui-hide');
	$api.addCls($api.byId('footInfo'), 'aui-hide');
	page_no = 0;
	isListEnd = false;
	loadData();
	loadDetailData();

	return;
	var listData = dateDataList;
	var title = "";
	var buttons = [];
	for (var i = 0; i < listData.length; i++) {
		buttons.push(listData[i].id);
	}
	title = 'Selected: ' + $api.html($api.byId('time'));
	COMMON_actionSheet(title, buttons, function(ret) {
		$api.html($api.byId('time'), listData[ret].name);

	});
	return;
	COMMON_ActionSelector(listData, function(ret) {
		$api.html($api.byId('time'), ret.level1);
		$api.html($api.byId("monthlySaleTarList"), '');
		$api.addCls($api.byId('noDataInfo'), 'aui-hide');
		$api.addCls($api.byId('footInfo'), 'aui-hide');
		page_no = 0;
		isListEnd = false;
		loadData();
		loadDetailData();
	});

}


function loadData() {
	var param = {orgInnerCode : BUSINESS_GetOrgInnerCode()};
	var post = BUSINESS_JudgeOrgType();
	if(post == 'SBU'){
		param['userId'] = userInfo.id;
	}else if(post == 'BRANCH'){
		param['branchCode'] = BUSINESS_GetOrgCode();
	}else if(post == 'REGION'){
		param['regionCode'] = BUSINESS_GetOrgCode();
	}
	
	var customerId = $api.val($api.byId("customerId"));
	var date = $api.val($api.byId("time"));
	var dates = date.split("-");
	var year = dates[0];
	var month = dates[1];
	var division = $api.val($api.byId("productDivisionVal"));
	if(division != ''){
		param['productGroup'] = division;
	}
	
	if(customerId != ''){
		param['customer.id'] = customerId;
	}
	
	param['year'] = year;
	param['month'] = month;
	
	//var url = ajaxReqHost + 'appGetTargetTotal.ajax';
	var url = ajaxReqHost + 'appTotalSaleTargetReport.ajax';
	
	
	COMMON_Ajax_Post(url, {
		values : param
	}, function(ret) {
		if (ret) {
			var sumPerByQty = '';
			if(ret.TARQTY!='' && ret.TARQTY !=null && ret.ORDERACTQTY !='' && ret.ORDERACTQTY !=null){
				sumPerByQty = (ret.ORDERACTQTY / ret.TARQTY * 100).toFixed(2)  + '%';
			}
			
			var sumPerByVal = '';
			if(ret.TARVAL!='' && ret.TARVAL !=null && ret.ORDERACTVAL !='' && ret.ORDERACTVAL !=null){
				sumPerByVal = (ret.ORDERACTVAL / ret.TARVAL * 100).toFixed(2)  + '%';
			}
			
			$api.html($api.byId('sumPlanQty'), COMMON_COMMON_FormatCurrency(ret.TARQTY) || '');
			$api.html($api.byId('sumPlanVal'), COMMON_COMMON_FormatCurrency(ret.TARVAL) || '');
			$api.html($api.byId('sumActQty'), COMMON_COMMON_FormatCurrency(ret.ORDERACTQTY) || '');
			$api.html($api.byId('sumActVal'), COMMON_COMMON_FormatCurrency(ret.ORDERACTVAL) || '');
			$api.html($api.byId('sumPerByQty'), sumPerByQty);
			$api.html($api.byId('sumPerByVal'), sumPerByVal);
		}
	});
}

function loadDetailData() {
	if (isListEnd) {
		return;
	}
	
	//var url = ajaxReqHost + 'appGetTargetDetil.ajax';
	var url = ajaxReqHost + 'appListSaleTargetReport.ajax';

	var param = {};
	var post = BUSINESS_JudgeOrgType();
	if(post == 'SBU'){
		param['userId'] = userInfo.id;
	}else if(post == 'BRANCH'){
		param['branchCode'] = BUSINESS_GetOrgCode();
	}else if(post == 'REGION'){
		param['regionCode'] = BUSINESS_GetOrgCode();
	}
	
	var customerCode = $api.val($api.byId("customerCode"));
	var date = $api.val($api.byId("time"));
	var dates = date.split("-");
	var year = dates[0];
	var month = dates[1];
	var division = $api.val($api.byId("productDivisionVal"));
	
	if(division != ''){
		param['productGroup'] = division;
	}
	
	param['customer.customerCode'] = customerCode;
	param['year'] = year;
	param['month'] = month;
	
	param['pageSize'] = 10;
	param['pageNo'] = page_no;
	param['from'] = "app";
	
	COMMON_Ajax_Post(url, {
		values : param
	}, function(ret) {
		var data = ret.list;
		if (ret && data) {
			for (var i = 0; i < data.length; i++) {
				var obj = data[i];
				var template = $api.byId('template');
				var cloneObj = template.cloneNode(true);
				if (obj.userName) {
					var shortName = obj.userName;
					shortName = shortName.substring(0, 2);
					$api.html($api.dom(cloneObj, '.shortName'), shortName);
				}
				$api.html($api.dom(cloneObj, '.dealerName'), obj.userName);
				$api.html($api.dom(cloneObj, '.time'), obj.time || '');
				$api.html($api.dom(cloneObj, '.productDivision'), obj.productGroupLabel||'');
				$api.html($api.dom(cloneObj, '.plan_qty'), COMMON_COMMON_FormatCurrency(obj.targetQty)||'');
				$api.html($api.dom(cloneObj, '.plan_val'), COMMON_COMMON_FormatCurrency(obj.targetValue)||'');
				$api.html($api.dom(cloneObj, '.act_qty'), COMMON_COMMON_FormatCurrency(obj.orderActualQty)||'');
				$api.html($api.dom(cloneObj, '.act_val'), COMMON_COMMON_FormatCurrency(obj.orderActualValue)||'');
				$api.html($api.dom(cloneObj, '.channel'), obj.channel||'');
				$api.html($api.dom(cloneObj, '.model'), obj.model||'');
				
				var perByQty = (obj.orderActualQty / obj.targetQty  * 100 ).toFixed(2);
				var perByVal = (obj.orderActualValue / obj.targetValue * 100).toFixed(2);
				$api.html($api.dom(cloneObj, '.per_byqty'), (perByQty||'0') + "%");
				$api.html($api.dom(cloneObj, '.per_byval'), (perByVal||'0') + "%");

				$api.append($api.byId('monthlySaleTarList'), $api.html(cloneObj));
			}
			if (page_no == 0) {
				api.toast({
					msg : 'Total Quantity: ' + ret.totalCount,
					duration : CONSTANT_TOAST_DURATION
				});
			}

			if (data.length == 0 && page_no == 0) {
				$api.removeCls($api.byId('noDataInfo'), 'aui-hide');
				isListEnd = true;
				return;
			}

			if (data.length < 4) {
				$api.removeCls($api.byId('footInfo'), 'aui-hide');
				isListEnd = true;
				return;
			}

			page_no = page_no + 1;
		}
	});
}

function openOrgtree() {
	api.openSlidPane({
		type : 'left'
	});
}

//选择赋值
function showDealerActionSelector(type) {
	var listData = [];
	if (type == '1') {//dealer
		COMMON_OpenWin({
			name : 'dealer_select',
			url : 'dealer_select.html',
			pageParam : {
				winName : "monthly_sale_target",
				selected: $api.html($api.byId('dealerName'))
			}
		});
	} else if (type == '2') {//product division
		var productGroup = $api.val($api.byId('productDivisionVal'));
		
		COMMON_OpenWin({
			name: 'product_group',
			url: 'product_group.html',
			pageParam : {
				winName : "monthly_sale_target",
				selectedId: productGroup
			}
		});
		
		return;
		listData = productDivisionListData;
		
		var buttons = [];
		for(var i=0; i<listData.length; i++){
			buttons.push(listData[i].name);
		}
		COMMON_actionSheet('Selected: '+$api.html($api.byId('productDivisionText')), buttons, function(ret){
			$api.html($api.byId('productDivisionText'), listData[ret].name);
			$api.val($api.byId('productDivisionVal'), listData[ret].id);
			$api.html($api.byId("monthlySaleTarList"), '');
			$api.addCls($api.byId('noDataInfo'), 'aui-hide');
			$api.addCls($api.byId('footInfo'), 'aui-hide');
			page_no = 0;
			isListEnd = false;
			loadData();
			loadDetailData();
		});
		
	return;
		COMMON_ActionSelector(listData, function(ret) {
			$api.html($api.byId('productDivisionText'), ret.level1);
			$api.val($api.byId('productDivisionVal'), ret.selectedInfo[0].id);
			$api.html($api.byId("monthlySaleTarList"), '');
			$api.addCls($api.byId('noDataInfo'), 'aui-hide');
			$api.addCls($api.byId('footInfo'), 'aui-hide');
			page_no = 0;
			isListEnd = false;
			loadData();
			loadDetailData();
		});
	}
}

function UPDATE_DEALER(param){
	var customerCode = param.customerCode;
	var customerId = param.customerId;
	var title = param.title;

	$api.html($api.byId('dealerName'), title);
	$api.val($api.byId('customerCode'), customerCode);
	$api.val($api.byId('customerId'), customerId);
	$api.html($api.byId("monthlySaleTarList"), '');
	$api.addCls($api.byId('noDataInfo'), 'aui-hide');
	$api.addCls($api.byId('footInfo'), 'aui-hide');
	page_no = 0;
	isListEnd = false;
	loadData();
	loadDetailData();
}

function UPDATE_PRODUCTGROUP(pg){
	$api.html($api.byId('productDivisionText'), pg.name);
	$api.val($api.byId('productDivisionVal'), pg.id);
	$api.html($api.byId("monthlySaleTarList"), '');
	$api.addCls($api.byId('noDataInfo'), 'aui-hide');
	$api.addCls($api.byId('footInfo'), 'aui-hide');
	page_no = 0;
	isListEnd = false;
	loadData();
	loadDetailData();
}

function loadMonthData() {
	var param = {};
	var post = BUSINESS_JudgeOrgType();
	if(post == 'SBU'){
		param['userId'] = userInfo.id;
	}else if(post == 'BRANCH'){
		param['branchCode'] = BUSINESS_GetOrgCode();
	}else if(post == 'REGION'){
		param['regionCode'] = BUSINESS_GetOrgCode();
	}
	
	var url = ajaxReqHost + 'appGetTargetMonth.ajax';
	COMMON_Ajax_Post(url, {
		values : param
	}, function(ret) {
		getProductDivisionList();
		if (ret) {
			for (var i = 0; i < ret.length; i++) {
				var month = ret[i].MONTH;
//				dateDataList.push({
//					'name' : ret[i].YEAR + "-" + month,
//					'id' : ret[i].YEAR + "-" + month
//				});
				$api.append($api.byId('time'), '<option value="'+ret[i].YEAR + "-" + month+'">'+ret[i].YEAR + "-" + month+'</option>');
			}
			
		}
	});
}

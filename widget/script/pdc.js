var dealerList = [];
var page_no = 0;
var page_count = 0;
var isListEnd = false;
var statusData = [];
var currency = BUSINESS_GetCurrency();
apiready = function() {

	initDom();

	bindEvent();

	api.addEventListener({
		name : 'refreshPDCList'
	}, function(ret, err) {
		page_no = 0;
		page_count = 0;
		isListEnd = false;
		$api.html($api.byId('list'), '');
		$api.addCls($api.byId('footInfo'), 'aui-hide');
		$api.addCls($api.byId('noDataInfo'), 'aui-hide');
		loadData();

	});

	api.addEventListener({
		name : "scrolltobottom",
		extra : {
			threshold : 100
		}
	}, function(ret, err) {
		loadData();
	})


	api.addEventListener({
		name : 'getCurCustomer'
	}, function(ret, err) {
	var customerCode=$api.val($api.byId('customerCode'));
	var customerTitle=$api.html($api.byId('dealerText'));
	var customerId=$api.val($api.byId('customerId'));
		COMMON_OpenWin({
			name : 'pdc_new',
			url : 'pdc_new.html',
			pageParam : {
				'customerId' : customerId,
				'customerCode' : customerCode,
				'customerTitle' : customerTitle
			}
		});
	});
	
	api.addEventListener({
	    name:'refreshPdcList'
    },function(ret,err){
    	refresh();
    });
};

function initDom() {
	var $header = $api.dom('header');
	$api.fixIos7Bar($header);
	$api.fixStatusBar($header);
	var headerHeight = $api.offset($header).h;
	COMMON_openFrame({
		name : 'pdc_head',
		url : 'pdc_head.html',
		rect : {
			x : 0,
			y : 0,
			w : api.winWidth,
			h : headerHeight
		}
	});
	var pageParam = api.pageParam;
	$api.val($api.byId('customerCode'), pageParam.customerCode);
	$api.val($api.byId('customerId'), pageParam.customerId);
	$api.html($api.byId('dealerText'), pageParam.customerTitle);	
	loadStatusTypeList();
	initDealerList();
	//加载基础数据
	loadData();
}

function bindEvent() {
}

function initDealerList() {
	//客户列表
	var relations = BUSINESS_GetRelations();
	for (var i = 0; i < relations.length; i++) {
		dealerList.push({
			customerId : relations[i]['customer.id'],
			name : relations[i].customerTitle,
			orgCode : relations[i].orgCode,
			id : relations[i].customerCode
		});
	}
}

function loadData() {
	if (isListEnd) {
		return;
	}
	var customerCode = $api.val($api.byId("customerCode"));
	var status = $api.val($api.byId("statusValue"));
	var url = ajaxReqHost + 'appListPdcCheck.ajax';
	var param = {
		"from" : "app",
		'pageNo' : page_no,
		'pageSize' : pageSize,
		'customer.customerCode' : customerCode,
		status : status
	}
	COMMON_Ajax_Post(url, {
		values : param
	}, function(ret) {
		if (ret && ret.list) {
			var datas = ret.list;
			for (var i = 0; i < datas.length; i++) {
				var template = $api.byId('template');
				var cloneObj = template.cloneNode(true);
				if (datas[i]['customer.customerTitle']) {
					$api.html($api.dom(cloneObj, '.shortName'), datas[i]['customer.customerTitle'].substring(0, 2));
					$api.html($api.dom(cloneObj, '.dealer'), datas[i]['customer.customerTitle']);
				}

				$api.html($api.dom(cloneObj, '.invoiceNo'), datas[i].checkNo);
				$api.html($api.dom(cloneObj, '.value'), currency+COMMON_COMMON_FormatCurrency(datas[i].checkValue));
				$api.html($api.dom(cloneObj, '.date'), COMMON_FormatTimeToTime(datas[i].createDate));
				$api.html($api.dom(cloneObj, '.status'), datas[i].statusLabel);
				$api.append($api.byId('list'), '<li class="aui-list-item" onclick="turnToDetailPage(\'' + datas[i].id + '\')">' +$api.html(cloneObj))+'</li>';

			}
			if (page_no == 0) {
				api.toast({
					msg : 'Total Quantity: ' + ret.totalCount,
					duration : CONSTANT_TOAST_DURATION
				});
			}

			if (ret.totalCount == 0) {
				$api.removeCls($api.byId('noDataInfo'), 'aui-hide');
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

function showDealerActionSelector() {
	COMMON_OpenWin({
		name : 'dealer_select',
		url : 'dealer_select.html',
		pageParam : {
			winName : "pdc",
			selected: $api.html($api.byId('dealerText'))
		}
	});
}

function UPDATE_DEALER(param){
	var customerCode = param.customerCode;
		var customerId = param.customerId;
		var title = param.title;
		var saleOffice = param.saleOffice;
		var orgCode = param.orgCode;

		$api.html($api.byId("dealerText"), title);
		$api.val($api.byId("customerCode"), customerCode);
		$api.val($api.byId("customerId"), customerId);
		page_no = 0;
		isListEnd = 0;
		$api.html($api.byId('list'), "");
		$api.addCls($api.byId('noDataInfo'), 'aui-hide');
		$api.addCls($api.byId('footInfo'), 'aui-hide');
		loadData();
}

function statusSelect() {
	var buttons = [];
	for(var i=0; i<statusData.length; i++){
		buttons.push(statusData[i].name);
	}
	COMMON_actionSheet('Selected: '+$api.html($api.byId('statusText')), buttons, function(ret){
		var name = statusData[ret].name;
		if(name == 'All'){
			name = 'Status';
		}
		$api.html($api.byId('statusText'), name);
		$api.val($api.byId('statusValue'), statusData[ret].id);
		page_no = 0;
		isListEnd = false;
		$api.html($api.byId('list'), "");
		$api.addCls($api.byId('noDataInfo'), 'aui-hide');
		$api.addCls($api.byId('footInfo'), 'aui-hide');
		loadData();
	});
	
return;
	
	COMMON_ActionSelector(statusData, function(ret) {
		$api.html($api.byId('statusText'), ret.level1);
		$api.val($api.byId('statusValue'), ret.selectedInfo[0].id);
		page_no = 0;
		isListEnd = false;
		$api.html($api.byId('list'), "");
		$api.addCls($api.byId('noDataInfo'), 'aui-hide');
		$api.addCls($api.byId('footInfo'), 'aui-hide');
		loadData();
	});
}

function loadStatusTypeList() {
	var url = ajaxReqHost + 'appGetDictionary.ajax';
	COMMON_Ajax_Post(url, {
		values : {
			dicType : 'PDC_STATUS'
		}
	}, function(ret) {
		statusData = [];
		statusData.push({
			'name' : 'All',
			'id' : ''
		});
		if (ret && ret.length > 0) {
			for (var i = 0; i < ret.length; i++) {
				statusData.push({
					'name' : ret[i].title,
					'id' : ret[i].value
				});
			}
		}
		$api.html($api.byId("statusText"), "Status");
		$api.val($api.byId("statusValue"), "");
	});
}

function turnToDetailPage(id){
	COMMON_OpenWin({
			name : 'pdc_detail',
			url : 'pdc_detail.html',
			pageParam : {
				'id' : id,
			}
		});
}

function refresh(){
	page_no = 0;
	page_count = 0;
	isListEnd = false;
	$api.addCls($api.byId('noDataInfo'), 'aui-hide');
	$api.addCls($api.byId('footInfo'), 'aui-hide');
	$api.html($api.byId('list'), '');
	
	loadData();
}

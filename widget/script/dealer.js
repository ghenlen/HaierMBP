var currency = BUSINESS_GetCurrency();
var page_no = 0;
var isListEnd = false;
var searchTitle = '';
var userInfo = $api.getStorage("userInfo");

apiready = function() {
	var $header = $api.dom('header');
	$api.fixIos7Bar($header);
	$api.fixStatusBar($header);
	var headerHeight = $api.offset($header).h;
	COMMON_openFrame({
		name : 'dealer_head',
		url : 'dealer_head.html',
		rect : {
			x : 0,
			y : 0,
			w : api.winWidth,
			h : headerHeight
		}
	});

	loadList();

	//统计页面访问次数
	BUSINESS_PageAccessStatics();

	api.addEventListener({
		name : "scrolltobottom",
		extra : {
			threshold : 50
		}
	}, function(ret, err) {
		loadList();
	})
	
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

function loadList() {
	if (isListEnd) {
		return;
	}
	
	var param = {
		from : 'app',
		pageSize : 6,
		pageNo : page_no,
		userId : userInfo.id,
		customerTitle : $api.trim(searchTitle),
		orgType: BUSINESS_JudgeOrgType()
	}
	
	//客户列表
	var url = ajaxReqHost + 'appListCustomerRelation.ajax';
	COMMON_Ajax_Post(url, {
		values : param
	}, function(ret) {
		if (ret && ret.list) {
			for (var i = 0; i < ret.list.length; i++) {

				var dealer = ret.list[i];
				var template = $api.byId('template');
				var cloneObj = template.cloneNode(true);
				if(dealer.customerTitle){
					$api.html($api.dom(cloneObj, '.shortName'), dealer.customerTitle.substring(0, 2));
				}
				
				$api.html($api.dom(cloneObj, '.dealer'), dealer.customerTitle);
				$api.html($api.dom(cloneObj, '.code'), dealer.customerCode);
				
				$api.attr($api.dom(cloneObj, 'li'), 'customerId', dealer['customer.id']);
				$api.attr($api.dom(cloneObj, 'li'), 'customerCode', dealer.customerCode);
				$api.attr($api.dom(cloneObj, 'li'), 'id', dealer.customerCode);
				$api.attr($api.dom(cloneObj, 'li'), 'saleOffice', dealer.SALES_OFFICE);
				$api.attr($api.dom(cloneObj, 'li'), 'orgCode', dealer.orgCode);
				$api.attr($api.dom(cloneObj, 'li'), 'id', dealer.customerCode);
				$api.append($api.byId('list'), $api.html(cloneObj));
				getCredit(dealer.customerCode);
			}
			if (page_no == 0) {
				api.toast({
					msg : 'Total Quantity: ' + ret.totalCount,
					duration : CONSTANT_TOAST_DURATION
				});
			}

			if (ret.list.length == 0 && page_no == 0) {
				$api.removeCls($api.byId('noDataInfo'), 'aui-hide');
				isListEnd = true;
				return;
			}

			if (ret.list.length < 6) {
				$api.removeCls($api.byId('footInfo'), 'aui-hide');
				isListEnd = true;
				return;
			}
			page_no = page_no + 1;
		}
	});
}

function getCredit(customerCode) {
	var url1 = ajaxReqHost + 'appGetCreditOverview.ajax';
	COMMON_Ajax_Post(url1, {
		values : {
			payerCode : customerCode
		}
	}, function(ret) {
		if (ret && ret.outcredit && ret.outcredit.length > 0) {
			var $customerLine = $api.byId(customerCode);
			var outcredit = ret.outcredit[0];
			$api.html($api.dom($customerLine, '.yearly'), '');
			$api.html($api.dom($customerLine, '.credit'), currency+ COMMON_COMMON_FormatCurrency(outcredit.klimk));
			$api.html($api.dom($customerLine, '.used'), currency+ COMMON_COMMON_FormatCurrency(outcredit.klimp));
			$api.html($api.dom($customerLine, '.overdue'), '');
		}
	});
}

function turnToDetailPage(me) {
	var customerId = $api.attr(me, 'customerId');
	var customerCode = $api.attr(me, 'customerCode');
	var saleOffice = $api.attr(me, 'saleOffice');
	var orgCode = $api.attr(me, 'orgCode');

	COMMON_OpenWin({
		name : 'dealer_detail',
		url : 'dealer_detail.html',
		pageParam : {
			'customerId' : customerId,
			'customerCode' : customerCode,
			'saleOffice' : saleOffice,
			'orgCode' : orgCode,
			'customerTitle' : $api.html($api.dom(me, '.dealer'))
		}
	});
}

function search() {
	$api.addCls($api.byId('noDataInfo'), 'aui-hide');
	$api.addCls($api.byId('footInfo'), 'aui-hide');
	COMMON_UISearchBar(function(ret) {
		var searchTitleBar=$api.trim(ret.text);
		$api.html($api.byId('list'), "");
		$api.val($api.byId("search-input"), searchTitleBar);
		$api.css($api.byId('resetResolvedSearchBtn'), 'display:inline-block');
		searchTitle = $api.val($api.byId("search-input"));
		page_no = 0;
		isListEnd = false;
		$api.css($api.byId('searchFlag'), 'left:5px');
		$api.css($api.byId('searchForm'), 'left:26px');
		loadList();
	});
}

function resetResolvedSearch() {
	$api.html($api.byId('list'), "");
	$api.val($api.byId("search-input"), "");
	$api.css($api.byId('resetResolvedSearchBtn'), 'display:none');
	$api.css($api.byId('searchFlag'), 'left:initial');
	$api.css($api.byId('searchFlag'), 'right:60%;');
	$api.css($api.byId('searchForm'), 'left:40%');
	searchTitle = "";
	page_no = 0;
	isListEnd = false;
	$api.addCls($api.byId('noDataInfo'), 'aui-hide');
	$api.addCls($api.byId('footInfo'), 'aui-hide');
	loadList();
}


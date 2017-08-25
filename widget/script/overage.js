var productDivisionListData = [];
var locationListData = [];
var saleOfficeListData = [];
var productTitle = "";
var page_no = 0;
var isListEnd = false;
var productDivisionValue = "";
var saleOffice = "";
var locationValue = "";
var userInfo = $api.getStorage("userInfo");
apiready = function() {
	var $header = $api.dom('header');
	$api.fixIos7Bar($header);
	$api.fixStatusBar($header);
	var $header = $api.dom('header');
	var headerHeight = $api.offset($header).h;
	COMMON_openFrame({
		name : 'overage_head',
		url : 'overage_head.html',
		rect : {
			x : 0,
			y : 0,
			w : api.winWidth,
			h : headerHeight
		}
	});
	
		
	loadSaleOfficeList();
	
	loadSummaryData();
	
	loadData();

	api.addEventListener({
		name : "scrolltobottom",
		extra : {
			threshold : 100
		}
	}, function(ret, err) {
		loadData();

	})
	//统计页面访问次数
	BUSINESS_PageAccessStatics();

	//getProductDivisionList();
	
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



function loadSummaryData(){
	

	productDivisionValue = $api.val($api.byId("productDivisionValue"));
	if(productDivisionValue){
		productDivisionValue=$api.html($api.byId("productDivisionText"));
	}
	
	saleOffice = $api.val($api.byId("saleOfficeValue"));
	locationValue = $api.val($api.byId("locationValue"));
	var currency = BUSINESS_GetCurrency();
	var url = ajaxReqHost + 'appGetProductOverageTotal.ajax';
	var param = {
		saleOffice : saleOffice,
		location : locationValue,
		division : productDivisionValue,
		orgInnerCode : BUSINESS_GetOrgInnerCode(),
		model : productTitle
	};
	COMMON_Ajax_Post(url, {
		values : param
	}, function(ret) {
		if (ret) {
			var qtyAnim = new CountUp("sumQty", 0, ret.T_Q_321 || 0, 0, 1);
			qtyAnim.start();
			var amtAnim = new CountUp("sumAmt", 0, ret.T_A_321 || 0, 2, 1);
			amtAnim.start();
		}
	});
}

function getProductDivisionList() {
	var url = ajaxReqHost + 'appGetDictionary.ajax';
	COMMON_Ajax_Post(url, {
		values : {
			dicType : 'PRODUCT_GROUP_TYPE'
		}
	}, function(ret) {
		productDivisionListData = [];
		productDivisionListData.push({
			'name' : 'Product Division',
			'id' : ''
		});
		if (ret && ret.length > 0) {
			for (var i = 0; i < ret.length; i++) {
				productDivisionListData.push({
					'name' : ret[i].title,
					'id' : ret[i].value
				});
			}
			$api.val($api.byId('productDivisionValue'), '');
			$api.html($api.byId('productDivisionText'), 'Product Division');
		}
	});
}

function UPDATE_PRODUCTGROUP(pg){
	$api.html($api.byId('productDivisionText'), pg.name);
	$api.val($api.byId('productDivisionValue'), pg.id);
	$api.html($api.byId('overageList'), '');
	page_no = 0;
	isListEnd = false;
	$api.addCls($api.byId("footInfo"), "aui-hide");
	$api.addCls($api.byId("noDataInfo"), "aui-hide");
	loadData();
	loadSummaryData()
}

function UPDATE_LOCATION(location){
	$api.html($api.byId('locationText'), location.name);
	$api.val($api.byId('locationValue'), location.id);
	$api.val($api.byId('plant'),  location.PLANT);
	
	$api.html($api.byId('overageList'), '');
	page_no = 0;
	isListEnd = false;
	$api.addCls($api.byId("footInfo"), "aui-hide");
	$api.addCls($api.byId("noDataInfo"), "aui-hide");
	loadData();
	loadSummaryData();
}

function showActionSelector(type) {
	if (type == '1') {
		var productGroup = $api.val($api.byId('productDivisionValue'));
		COMMON_OpenWin({
			name: 'product_group',
			url: 'product_group.html',
			pageParam : {
				winName : "overage",
				selectedId: productGroup
			}
		});
		return;
	}
	
	if (type == '2') {
		if(locationListData.length == 0){
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
				winName : "overage",
				selectedId: locationValue,
				datas: locationListData
			}
		});
		return;
	}
	var listData = [];
	var title = '';
	if (type == '1') {
		listData = productDivisionListData;
		title = 'Selected: '+$api.html($api.byId('productDivisionText'));
	} else if (type == '2') {
		listData = locationListData;
		title = 'Selected: '+$api.html($api.byId('locationText'));
	} else if (type == '3') {
		listData = saleOfficeListData;
		title = 'Selected: '+$api.html($api.byId('saleOfficeText'));
	}
	
	var buttons = [];
	for(var i=0; i<listData.length; i++){
		buttons.push(listData[i].name);
	}
	
	COMMON_actionSheet(title, buttons, function(ret){
		if (type == '1') {//product division
			$api.html($api.byId('productDivisionText'), listData[ret].name);
			$api.val($api.byId('productDivisionValue'), listData[ret].id);
		} else if (type == '2') {
			$api.html($api.byId('locationText'), listData[ret].name);
			$api.val($api.byId('locationValue'), listData[ret].id);
			$api.val($api.byId('plant'),  listData[ret].PLANT);
		} else if (type == '3') {
			$api.html($api.byId('saleOfficeText'), listData[ret].name);
			$api.val($api.byId('saleOfficeValue'), listData[ret].id);
			loadLocationList(listData[ret].id);
		}

		$api.html($api.byId('overageList'), '');
		page_no = 0;
		isListEnd = false;
		$api.addCls($api.byId("footInfo"), "aui-hide");
		$api.addCls($api.byId("noDataInfo"), "aui-hide");
		loadData();
		loadSummaryData();
	});
	
return;

	COMMON_ActionSelector(listData, function(ret) {
		if (type == '1') {//product division
			$api.html($api.byId('productDivisionText'), ret.level1);
			$api.val($api.byId('productDivisionValue'), ret.selectedInfo[0].id);
		} else if (type == '2') {
			$api.html($api.byId('locationText'), ret.level1);
			$api.val($api.byId('locationValue'), ret.selectedInfo[0].id);
			$api.val($api.byId('plant'), ret.selectedInfo[0].PLANT);
		} else if (type == '3') {
			$api.html($api.byId('saleOfficeText'), ret.level1);
			$api.val($api.byId('saleOfficeValue'), ret.selectedInfo[0].id);
			loadLocationList(ret.selectedInfo[0].id);
		}

		$api.html($api.byId('overageList'), '');
		page_no = 0;
		isListEnd = false;
		$api.addCls($api.byId("footInfo"), "aui-hide");
		$api.addCls($api.byId("noDataInfo"), "aui-hide");
		loadData();
	});
}

function loadData() {
	if (isListEnd) {
		return;
	}
	productDivisionValue = $api.val($api.byId("productDivisionValue"));
	if(productDivisionValue){
		productDivisionValue=$api.html($api.byId("productDivisionText"));
	}
	saleOffice = $api.val($api.byId("saleOfficeValue"));
	locationValue = $api.val($api.byId("locationValue"));
	var currency = BUSINESS_GetCurrency();
	var colors = ['#0099FF', '#00897B', '#673AB7', '#BF0A10', '#FF9900'];
	var url = ajaxReqHost + 'appGetProductOverage.ajax';
	var param = {
		from : 'app',
		pageNo : page_no,
		pageSize : pageSize,
		saleOffice : saleOffice,
		location : locationValue,
		division : productDivisionValue,
		orgInnerCode : BUSINESS_GetOrgInnerCode(),
		model : productTitle
	};
	COMMON_Ajax_Post(url, {
		values : param
	}, function(ret) {
		if (ret && ret.list) {
			var data = ret.list;
			for (var i = 0; i < data.length; i++) {
				var template = $api.byId('overageTempalte');
				var cloneObj = template.cloneNode(true);
				$api.html($api.dom(cloneObj, '.SLocDescription'), data[i].slocDescription);
				$api.html($api.dom(cloneObj, '.productDivision'), data[i].productDivsion);
				$api.html($api.dom(cloneObj, '.haierModel'), data[i].haierModel);
				$api.html($api.dom(cloneObj, '.matirialNo'), data[i].materialNo);
				$api.html($api.dom(cloneObj, '.qty'), data[i].over321MthQty);
				$api.html($api.dom(cloneObj, '.amt'), data[i].over321MthAmt);
				$api.html($api.dom(cloneObj, '.plant'), data[i].plant);
				$api.html($api.dom(cloneObj, '.storageLocation'), data[i].storageLocation);
				$api.append($api.byId('overageList'), $api.html(cloneObj));
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

			if (data.length < pageSize) {
				$api.removeCls($api.byId('footInfo'), 'aui-hide');
				isListEnd = true;
				return;
			}

			page_no = page_no + 1;
		}
	});

}

function search() {
	COMMON_UISearchBar(function(ret) {
		var searchTitle=$api.trim(ret.text);
		$api.html($api.byId("searchInputEle"), searchTitle);
		$api.css($api.byId('resetSearchBtn'), 'display:inline-block');
		productTitle = searchTitle;
		$api.html($api.byId('overageList'), '');
		$api.addCls($api.byId('noDataInfo'), 'aui-hide');
		$api.addCls($api.byId('footInfo'), 'aui-hide');
		page_no = 0;
		isListEnd = false;
		loadData();
		loadSummaryData();
	});
}

function resetSearch() {
	$api.css($api.byId('resetSearchBtn'), 'display:none');
	$api.html($api.byId('searchInputEle'), 'Product Model');
	page_no = 0;
	isListEnd = false;
	productTitle = '';
	$api.html($api.byId('overageList'), '');
	$api.addCls($api.byId('noDataInfo'), 'aui-hide');
	$api.addCls($api.byId('footInfo'), 'aui-hide');
	loadData();
	loadSummaryData();
}

//加载库位
function loadLocationList(officeCode) {
	var url = ajaxReqHost + 'appGetAllOverageLocation.ajax';
	var saleOffice=$api.val($api.byId("saleOfficeValue"));
	var param = {
		orgInnerCode : BUSINESS_GetOrgInnerCode()
	}
	
	COMMON_Ajax_Post(url, {
		values : param
	}, function(ret) {
		locationList = [];
		if (ret && ret.length > 0) {
			for (var i = 0; i < ret.length; i++) {
				locationListData.push({
					id : ret[i].LOCATION,
					name : ret[i].LOCATION,
					PLANT : ret[i].PLANT
				});
			}
			
			$api.val($api.byId('locationValue'), '');
			$api.html($api.byId('locationText'), 'Location');
			$api.html($api.byId('plant'), '');
		}
	});
}

function loadSaleOfficeList() {
	
	var orgList = userInfo.orgList;
	if (orgList && orgList.length == 1) {
		if (orgList[0].orgType == 'BRANCH') {
			$api.val($api.byId('saleOfficeValue'), orgList[0].orgCode);
			$api.html($api.byId('saleOfficeText'), orgList[0].orgTitle);
			loadLocationList(orgList[0].orgCode);
			$api.css($api.byId('saleOffice_arraw'), 'display:none');
			$api.removeAttr($api.byId('saleOffice_row'), 'onclick');
		}
	} else if (orgList && orgList.length > 1) {
		var url = ajaxReqHost + 'appGetOffice.ajax';
		COMMON_Ajax_Post(url, {
			values : {}
		}, function(ret) {
			saleOfficeListData = [];
			if (ret && ret.length > 0) {
				for (var i = 0; i < ret.length; i++) {
					saleOfficeListData.push({
						id : ret[i],
						name : ret[i]
					});
				}
				$api.val($api.byId('saleOfficeValue'), ret[0]);
				$api.html($api.byId('saleOfficeText'), ret[0]);
				loadLocationList(ret[0]);
			}
		});
	}
}


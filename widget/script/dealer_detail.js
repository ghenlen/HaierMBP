var currency = BUSINESS_GetCurrency();
var shiptoPayerListLoadFlag = 0;
var moudle = 1;
var customerCode;
var saleOffice = "";
var orgCode = "";
var userInfo = $api.getStorage("userInfo");
var payerCodeList = [];
apiready = function() {
	initDom();
	var tab = new auiTab({
		element : document.getElementById("tab"),
		index : 1,
		repeatClick : false
	}, function(ret) {
		moudle = ret.index;
		if (ret.index == 1) {
			$api.css($api.byId('basicContainer'), 'display: block');
			$api.css($api.byId('payerContainer'), 'display: none');
			$api.css($api.byId('shipToContainer'), 'display: none');
		} else if (ret.index == 2) {
			$api.css($api.byId('payerContainer'), 'display:block');
			$api.css($api.byId('basicContainer'), 'display:none');
			$api.css($api.byId('shipToContainer'), 'display:none');
			loadShipToPayerList();
		} else if (ret.index == 3) {
			$api.css($api.byId('basicContainer'), 'display: none');
			$api.css($api.byId('payerContainer'), 'display: none');
			$api.css($api.byId('shipToContainer'), 'display: block');
			loadShipToPayerList();
		}
	});

	api.addEventListener({
		name : 'swipeleft'
	}, function(ret, err) {
		if (moudle >= 3) {
			return;
		} else {
			moudle = moudle + 1;
			tab.setActive(moudle);
			if (moudle == 1) {
				$api.css($api.byId('basicContainer'), 'display: block');
				$api.css($api.byId('payerContainer'), 'display: none');
				$api.css($api.byId('shipToContainer'), 'display: none');
			} else if (moudle == 2) {
				$api.css($api.byId('payerContainer'), 'display:block');
				$api.css($api.byId('basicContainer'), 'display:none');
				$api.css($api.byId('shipToContainer'), 'display:none');
				loadShipToPayerList();
			} else if (moudle == 3) {
				$api.css($api.byId('basicContainer'), 'display: none');
				$api.css($api.byId('payerContainer'), 'display: none');
				$api.css($api.byId('shipToContainer'), 'display: block');
				loadShipToPayerList();
			}
		}
	});
	api.addEventListener({
		name : 'swiperight'
	}, function(ret, err) {
		if (moudle <= 1) {
			return;
		} else {
			moudle = moudle - 1;
			tab.setActive(moudle);
			if (moudle == 1) {
				$api.css($api.byId('basicContainer'), 'display: block');
				$api.css($api.byId('payerContainer'), 'display: none');
				$api.css($api.byId('shipToContainer'), 'display: none');
			} else if (moudle == 2) {
				$api.css($api.byId('payerContainer'), 'display:block');
				$api.css($api.byId('basicContainer'), 'display:none');
				$api.css($api.byId('shipToContainer'), 'display:none');
				loadShipToPayerList();
			} else if (moudle == 3) {
				$api.css($api.byId('basicContainer'), 'display: none');
				$api.css($api.byId('payerContainer'), 'display: none');
				$api.css($api.byId('shipToContainer'), 'display: block');
				loadShipToPayerList();
			}
		}
	});

};

function initDom() {
	var $header = $api.dom('header');
	$api.fixIos7Bar($header);
	$api.fixStatusBar($header);
	var headerHeight = $api.offset($header).h;
	COMMON_openFrame({
		name : 'dealer_detail_head',
		url : 'dealer_detail_head.html',
		rect : {
			x : 0,
			y : 0,
			w : api.winWidth,
			h : headerHeight
		}
	});

	var pageParam = api.pageParam;
	saleOffice = pageParam.saleOffice;
	orgCode = pageParam.orgCode;
	$api.val($api.byId('customerId'), pageParam.customerId);
	$api.val($api.byId('customerCode'), pageParam.customerCode);
	$api.html($api.byId('dealerName'), pageParam.customerTitle);

	loadPDC();
	loadCredit();
	//getPayerCodeList();

}



//客户信用
function loadCredit() {
	var url = ajaxReqHost + 'appGetCreditOverview.ajax';
	COMMON_Ajax_Post(url, {
		values : {
			payerCode : $api.val($api.byId("customerCode"))
		}
	}, function(ret) {
		if (ret && ret.outcredit && ret.outcredit.length > 0) {
			var outcredit = ret.outcredit[0];
			var spare = outcredit.klimk - outcredit.klimp;
			$api.html($api.byId("creditLimit"), currency+ COMMON_COMMON_FormatCurrency(outcredit.klimk));
			$api.html($api.byId("used"), currency+ COMMON_COMMON_FormatCurrency(outcredit.klimp));
			$api.html($api.byId("spare"), currency+ COMMON_COMMON_FormatCurrency(spare));
		}
	});
}

//pdc
function loadPDC() {
	var url = ajaxReqHost + 'appGetCustomerRank.ajax';
	COMMON_Ajax_Post(url, {
		values : {
			saleOrg : CONSTANT_SALE_COMPANY_CODE,
			saleOffice : saleOffice,
			customerCode : $api.val($api.byId('customerCode'))
		}
	}, function(ret) {
		if (ret) {
			var ar = 0;
			if(ret.data){
				var data = ret.data;
				$api.html($api.dom(".isPass"), '');
				ar = data.recei;
				var oneYearSalesRate = data.rate+'';
				if(oneYearSalesRate == ''){
					oneYearSalesRate = 'No Data';
				}
				
				var oneYearSales = data.netwr+'';
				if(oneYearSales == ''){
					oneYearSales = 'No Data';
				}else{
					oneYearSales=currency + COMMON_COMMON_FormatCurrency(data.netwr)||'0.00';
				}
				
				
				$api.html($api.dom(".ar"), currency + COMMON_COMMON_FormatCurrency(data.recei)||'0.00');
				$api.html($api.dom(".shortPDC"), '');
				$api.html($api.dom(".cumuRank"), data.rankz || '');
				$api.html($api.dom(".oneYearSales"), oneYearSales);
				$api.html($api.dom(".oneYearSalesRate"), oneYearSalesRate);
				$api.html($api.byId('standardDaysCode'), data.zterm || '');
				$api.html($api.byId('standardDaysDesc'), data.vtext || '');
				$api.html($api.byId('actUsedDays'), data.dso || '');
			}
			
			if(ret.freeCheck){
				$api.css($api.byId('pdcValCon'), 'display: none');
				$api.css($api.byId('shortValCon'), 'display: none');
			}else{
				$api.html($api.dom(".shortPDC"), ret.shortValue || '');
				$api.html($api.dom(".pdcValue"), currency +COMMON_COMMON_FormatCurrency(ret.pdcValue));
			}
			$api.html($api.dom(".pdcRadio"), ret.pdcRatio || '');
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
			for (var i = 0; i < payToList.length; i++) {
				payerCodeList.push(payToList[i].code);
			}
			loadReconciliationData();
		}
	});
}

function loadShipToPayerList() {
	var soldCustomerCode = $api.val($api.byId('customerCode'));
	if (shiptoPayerListLoadFlag == 0) {
		var url = ajaxReqHost + 'appCustomer.ajax';
		COMMON_Ajax_Post(url, {
			values : {
				customerId : $api.val($api.byId('customerId'))
			}
		}, function(ret) {
			if (ret) {
				var contactPhone = ret.contactPhone || '';
				var shipToList = ret.sendTo;
				if (shipToList && shipToList.length > 0) {
					for (var i = 0; i < shipToList.length; i++) {
						var obj = shipToList[i];
						if(soldCustomerCode == obj.code){
							continue;
						}
						var shiptoTemplate = $api.byId('shiptoTemplate');
						var cloneObj = shiptoTemplate.cloneNode(true);
						$api.html($api.dom(cloneObj, '.dealer'), obj.title);
						$api.html($api.dom(cloneObj, '.tel'), contactPhone);
//						var address = (obj.address || "") + '' + (obj.city || "") + '' + (obj.province || "") + '' + (obj.county || "");
//						if (address == '') {
//							address = 'No address info.';
//						}
						$api.html($api.dom(cloneObj, '.customerCode'), obj.code);
						$api.append($api.byId('shiptoList'), $api.html(cloneObj));
					}
				}

				var payToList = ret.payTo;
				if (payToList && payToList.length > 0) {
					for (var i = 0; i < payToList.length; i++) {
						var obj = payToList[i];
						if(soldCustomerCode == obj.code){
							continue;
						}
						
						var paytoTemplate = $api.byId('paytoTemplate');
						var cloneObj = paytoTemplate.cloneNode(true);
						$api.html($api.dom(cloneObj, '.dealerName'), obj.title);
						$api.html($api.dom(cloneObj, '.dealerCode'), obj.code);
						$api.append($api.byId('paytoList'), $api.html(cloneObj));
					}
				}
				if(payToList.length>0){
					loadReconciliationData(payToList[0].code);
				}
				
			}
		});
		shiptoPayerListLoadFlag = 1;
	}
}

function turnToPdc() {
	COMMON_OpenWin({
		name : 'pdc',
		url : 'pdc.html',
		pageParam : {
			'customerId' : $api.val($api.byId("customerId")),
			'customerCode' : $api.val($api.byId("customerCode")),
			'saleOffice' : saleOffice,
			'orgCode' : orgCode,
			'customerTitle' : $api.html($api.byId('dealerName'))
		}
	});
}

function turnToAccountStatementPage() {
	COMMON_OpenWin({
		name : 'reconcilication',
		url : 'reconcilication.html'
	});
}

function loadReconciliationData(code) {
	date = new Date();
	month = date.getMonth() + 1;
	day = date.getDate();
	year = date.getFullYear();
	if (month == 1) {
		lastmonth = 12;
		lastyear = year - 1;
	} else {
		lastmonth = month - 1;
		lastyear = year;
	}

	if (month < 10) {
		month = "0" + month;
	}

	if (lastmonth < 10) {
		lastmonth = "0" + lastmonth;
	}
	var firstDate = year + '-' + month;
	var lastDate = lastyear + '-' + lastmonth;

	var url = ajaxReqHost + 'appCustomerAccount.ajax';
	var param = {
		beginDate : firstDate,
		endDate : firstDate,
		payerCode : code
	};
	COMMON_Ajax_Post(url, {
		values : param
	}, function(ret) {
		if (ret) {
			$api.html($api.dom('.date1'), firstDate);
			$api.html($api.byId('beginBalance1'), currency + (COMMON_COMMON_FormatCurrency(ret.beginBalance) || '0.00'));
			$api.html($api.byId('endBalance1'), currency + (COMMON_COMMON_FormatCurrency(ret.endBalance) || '0.00'));
		}
	});
	param = {
		beginDate : lastDate,
		endDate : lastDate,
		payerCode : code
	};
	COMMON_Ajax_Post(url, {
		values : param
	}, function(ret) {
		if (ret) {
			$api.html($api.dom('.date2'),lastDate);
			$api.html($api.byId('beginBalance2'), currency + (COMMON_COMMON_FormatCurrency(ret.beginBalance) || '0.00'));
			$api.html($api.byId('endBalance2'), currency + (COMMON_COMMON_FormatCurrency(ret.endBalance) || '0.00'));
		}
	});

}


function showDealerActionSelector() {
	COMMON_OpenWin({
		name : 'dealer_select',
		url : 'dealer_select.html',
		pageParam : {
			winName : "dealer_detail",
			selected: $api.html($api.byId('dealerName'))
		}
	});
}

function UPDATE_DEALER(param){
	customerCode = param.customerCode;
	var customerId = param.customerId;
	var title = param.title;
	saleOffice = param.saleOffice;
	orgCode = param.orgCode;
	
	$api.val($api.byId('customerId'), customerId);
	$api.val($api.byId('customerCode'), customerCode);
	$api.html($api.byId('dealerName'), title);

	var dealer = {
		'customerCode' : customerCode,
		'customerTitle' : title,
		'customerId' : customerId,
		saleOffice:saleOffice,
		orgCode: orgCode
	};
	BUSINESS_UpdateCurrentDealer(userInfo.id, dealer);

	loadPDC();
	loadCredit();
	//getPayerCodeList();
	shiptoPayerListLoadFlag=0;
	$api.html($api.byId('paytoList'), '');
	$api.html($api.byId('shiptoList'), '');
	loadShipToPayerList();
}
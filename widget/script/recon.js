var images = [];
var moudle = 1;
var currency = BUSINESS_GetCurrency();
var dialog = new auiDialog({});
var payerCodeList = [];
var year = "";
var month = "";
var day = "";
var userInfo = $api.getStorage("userInfo");
var photoBrowser;
apiready = function() {
	var $header = $api.dom('header');
	$api.fixIos7Bar($header);
	$api.fixStatusBar($header);
	var $header = $api.dom('header');
	var headerHeight = $api.offset($header).h;
	COMMON_openFrame({
		name : 'reconciliation_head',
		url : 'reconciliation_head.html',
		rect : {
			x : 0,
			y : 0,
			w : api.winWidth,
			h : headerHeight
		}
	});

	var calendar = new lCalendar();
	calendar.init({
		'trigger' : '#date',
		'type' : 'date1'
	});

	var calendar = new lCalendar();
	calendar.init({
		'trigger' : '#periodBegin',
		'type' : 'date'
	});

	var calendar = new lCalendar();
	calendar.init({
		'trigger' : '#periodEnd',
		'type' : 'date'
	});

	$api.html($api.byId('monthlyHistoryList'), '');
	date = new Date();
	month = date.getMonth() + 1;
	day = date.getDate();
	year = date.getFullYear();
	if (month < 10) {
		month = "0" + month;
	}
	if (day < 10) {
		day = "0" + day;
	}
	var date_fmt = date.getFullYear() + '-' + month;
	$api.val($api.byId('date'), date_fmt);
	var date_fmt0 = date.getFullYear() + '-' + month + '-01';
	var date_fmt1 = date.getFullYear() + '-' + month + '-' + day;
	$api.val($api.byId('periodBegin'), date_fmt0);
	$api.val($api.byId('periodEnd'), date_fmt1);
	initDealer();

	var moudleTab = new auiTab({
		element : document.getElementById("moudleTab"),
		index : 1,
		repeatClick : false
	}, function(ret) {
		$api.html($api.byId('monthlyHistoryList'), '');
		$api.addCls($api.dom('.historyAccount'), 'aui-hide');
		$api.html($api.byId('beginBalance'), currency + '0.00');
		$api.html($api.byId('endBalance'), currency + '0.00');

		if (ret.index == 1) {
			$api.css($api.byId('periodTimeSelect'), 'display: none');
			$api.css($api.byId('dateSelect'), 'display: block');
			moudle = 1;
		} else if (ret.index == 2) {
			$api.css($api.byId('dateSelect'), 'display:none');
			$api.css($api.byId('periodTimeSelect'), 'display:block');
			moudle = 2;
		}
	});

	api.addEventListener({
		name : 'swipeleft'
	}, function(ret, err) {
		if (moudle >= 2) {
			return;
		} else {
			$api.html($api.byId('monthlyHistoryList'), '');
			$api.addCls($api.dom('.historyAccount'), 'aui-hide');
			$api.html($api.byId('beginBalance'), currency + '0.00');
			$api.html($api.byId('endBalance'), currency + '0.00');
			$api.html($api.byId("updImg"), "");
			moudle = moudle + 1;
			moudleTab.setActive(moudle);
			if (moudle == 1) {
				$api.css($api.byId('periodTimeSelect'), 'display: none');
				$api.css($api.byId('dateSelect'), 'display: block');
				moudle = 1;
			} else if (moudle == 2) {
				$api.css($api.byId('dateSelect'), 'display:none');
				$api.css($api.byId('periodTimeSelect'), 'display:block');
				moudle = 2;
			}
		}
	});
	api.addEventListener({
		name : 'swiperight'
	}, function(ret, err) {
		if (moudle <= 1) {
			return;
		} else {
			$api.html($api.byId("updImg"), "");
			moudle = moudle - 1;
			moudleTab.setActive(moudle);
			$api.html($api.byId('monthlyHistoryList'), '');
			$api.addCls($api.dom('.historyAccount'), 'aui-hide');
			$api.html($api.byId('beginBalance'), currency + '0.00');
			$api.html($api.byId('endBalance'), currency + '0.00');
			if (moudle == 1) {
				$api.css($api.byId('periodTimeSelect'), 'display: none');
				$api.css($api.byId('dateSelect'), 'display: block');
				moudle = 1;
			} else if (moudle == 2) {
				$api.css($api.byId('dateSelect'), 'display:none');
				$api.css($api.byId('periodTimeSelect'), 'display:block');
				moudle = 2;
			}
		}
	});

	//统计页面访问次数
	BUSINESS_PageAccessStatics();
	
	api.addEventListener({
		name : 'keyback'
	}, function(ret, err) {
		if(photoBrowser){
			photoBrowser.close();
			photoBrowser = null;
		}else{
			api.closeWin({
            });
		}
	});

}
function initDealer() {
	//客户列表
	var relations = BUSINESS_GetRelations();
	var cacheDealer = BUSINESS_GetCurrentDealer(userInfo.id);
	if (cacheDealer) {
		$api.html($api.byId('dealerName'), (cacheDealer.customerTitle));
		$api.val($api.byId('customerCode'), cacheDealer.customerCode);
		$api.val($api.byId('customerId'), cacheDealer.customerId);
	} else if (relations && relations.length > 0) {
		$api.html($api.byId('dealerName'), (relations[0].customerTitle));
		$api.val($api.byId('customerCode'), relations[0].customerCode);
		$api.val($api.byId('customerId'), relations[0]['customer.id']);
	}

	$api.css($api.byId('periodTimeSelect'), 'display: none');
	$api.css($api.byId('dateSelect'), 'display: block');
	moudle = 1;
	getPayerCodeList();
}

function showDateSelect(ele) {
	COMMON_DatePicker('date', function(ret) {
		year = ret.year;
		month = ret.month;
		day = ret.day;
		if (month < 10) {
			month = "0" + month;
		}
		if (day < 10) {
			day = "0" + day;
		}
		$api.html($api.byId(ele), year + '-' + month + '-' + day);
		$api.html($api.byId("updImg"), "");
	});
}

function openCamera() {
	api.getPicture({
		sourceType : 'camera',
		encodingType : 'jpg',
		mediaValue : 'pic',
		destinationType : 'url',
		allowEdit : true,
		quality : 100,
		/*targetWidth : 100,
		 targetHeight : 100,*/
		saveToPhotoAlbum : true
	}, function(ret, err) {
		if (ret) {
			if (ret.data) {
				//images = [];
				var cloneObj = $api.byId('updImgTemplate').cloneNode(true);
				$api.attr($api.dom(cloneObj, 'img'), 'src', ret.data);
				$api.attr($api.dom(cloneObj, '.delete_flag'), 'onclick', 'removeImg(this, \'' + ret.data + '\')');
				//$api.attr($api.dom(cloneObj, '.warn_flag'), 'onclick', 'reUploadImg(this, \'' + ret.data + '\')');
				//$api.attr($api.dom(cloneObj, '.warn_flag'), 'id', ret.data);
				images.push(ret.data);
				$api.append($api.byId('updImg'), $api.html(cloneObj));
				//confirmPhoto();

			}
		} else {

		}
	});
}

function removeImg(me, imgPath, e) {
	var e = e || window.event;
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
			$api.remove($api.closest(me, '.upload_imgs'));
			for (var i = 0; i < images.length; i++) {
				if (images[i] == imgPath) {
					images.splice(i, 1);
					break;
				}
			}
		}
	});
	e.stopPropagation();
}

function reUploadImg(me, imgPath, e) {
	images = [];
	images.push(imgPath);
	confirmPhoto();
}

function browserImg() {
	photoBrowser = api.require('photoBrowser');
	photoBrowser.open({
		images : images,
		bgColor : '#000'
	}, function(ret, err) {
		if (ret) {
			if (ret.eventType == 'click') {
				photoBrowser.close();
				photoBrowser = null;
			}
		}
	});
}

function loadMonthlyData() {
	var customerCode = $api.val($api.byId('customerCode'));
	var payerCodeValue = $api.val($api.byId('payCodeValue'));
	var payCodeCode = $api.val($api.byId('payCodeCode'));
	var beginDate = "";
	var endDate = "";
	if (moudle == '1') {
		beginDate = $api.val($api.byId('date'));
		endDate = beginDate;
	} else {
		beginDate = $api.val($api.byId('periodBegin'));
		endDate = $api.val($api.byId('periodEnd'));
	}

	var url = ajaxReqHost + 'appCustomerAccount.ajax';
	var param = {
		beginDate : beginDate,
		endDate : endDate,
		payerCode : payCodeCode
	};
	COMMON_Ajax_Post(url, {
		values : param
	}, function(ret) {
		if (ret) {
			$api.html($api.byId('beginBalance'), currency + (ret.beginBalance || '0.00'));
			$api.html($api.byId('endBalance'), currency + (ret.endBalance || '0.00'));
			if (ret.dataList.length == 0) {
				api.toast({
					msg : 'No Data.'
				});

			} else {
				$api.removeCls($api.dom('.historyAccount'), 'aui-hide');
				$api.attr($api.dom(".confirm_con"), "padding-bottom", "0rem");
				$api.attr($api.dom(".historyAccount"), "padding-bottom", "3.5rem");
			}
			for (var i = 0; i < ret.dataList.length; i++) {
				var hisReconTemplate = $api.byId('hisReconTemplate');
				var cloneObj = hisReconTemplate.cloneNode(true);
				if (ret.dataList[i].documentNum != '') {
					$api.html($api.dom(cloneObj, '.doc_num'), ret.dataList[i].documentNum);
					$api.html($api.dom(cloneObj, '.dt'), ret.dataList[i].docmentType);
					$api.html($api.dom(cloneObj, '.credit'), currency + ret.dataList[i].balance);
					$api.html($api.dom(cloneObj, '.time'), ret.dataList[i].documentDate);
					$api.append($api.byId('monthlyHistoryList'), $api.html(cloneObj));
				}
			}
		}
	});

}

function showDealerActionSelector() {
	COMMON_OpenWin({
		name : 'dealer_select',
		url : 'dealer_select.html',
		pageParam : {
			winName : "reconcilication",
			selected : $api.html($api.byId('dealerName')) + ' ' + $api.val($api.byId('customerCode'))
		}
	});
}

function UPDATE_DEALER(param) {
	var customerCode = param.customerCode;
	var customerId = param.customerId;
	var title = param.title;
	var saleOffice = param.saleOffice;
	var orgCode = param.orgCode;
	$api.html($api.byId('dealerName'), title);
	$api.val($api.byId('customerCode'), customerCode);
	$api.val($api.byId('customerId'), customerId);

	var dealer = {
		'customerCode' : customerCode,
		'customerTitle' : title,
		'customerId' : customerId,
		'saleOffice' : saleOffice,
		'orgCode' : orgCode
	};
	BUSINESS_UpdateCurrentDealer(userInfo.id, dealer);

	payerCodeList = [];
	getPayerCodeList();
	$api.html($api.byId("updImg"), "");
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
			var soldCustomerCode = $api.val($api.byId('customerCode'));
			for (var i = 0; i < payToList.length; i++) {
				if (soldCustomerCode == payToList[i].code) {
					continue;
				}
				payerCodeList.push({
					id : payToList[i].id,
					name : payToList[i].title,
					code : payToList[i].code
				});
			}
			if (payerCodeList.length > 0) {
				$api.val($api.byId("payCodeValue"), payerCodeList[0].id);
				$api.val($api.byId("payCodeCode"), payerCodeList[0].code);
				$api.html($api.byId("payCodeText"), payerCodeList[0].name);
			}

		}
	});

}

function confirmPhoto() {
	var customerCode = $api.val($api.byId("customerCode"));
	var yearMonth = $api.val($api.byId("date"));
	var dates = yearMonth.split("-");
	var year = dates[0];
	var month = dates[1];

	var now = new Date();
	var nowYear = now.getFullYear();
	var nowMonth = now.getMonth() + 1;
	if (year <= nowYear) {
		if ((year == nowYear && nowMonth > month) || year < nowYear) {
			//TODO 判断是否已经确认过
			var isConfirmedUrl = ajaxReqHost + 'appStatementConfirmStatus.ajax';
			COMMON_Ajax_Post(isConfirmedUrl, {
				values : {
					year : year,
					month : month,
					customerCode : customerCode
				}
			}, function(ret) {
				if (ret) {
					if (ret.result) {
						if (images.length > 0) {
							COMMON_ShowConfirm('Are you sure to submit?', function() {
								var uploadShopImgsUrl = ajaxReqHost + 'appupload.ajax';
								COMMON_Ajax_Post(uploadShopImgsUrl, {
									values : {
										id : '-1',
										label : 'reconciliation',
										type : 'reconciliation'
									},
									files : {
										Filedata : images
									}
								}, function(ret) {
									if (ret && ret.length > 0) {
										//$api.remove($api.byId(images[0]));
										var param = {
											'org.id' : BUSINESS_GetOrgId(),
											userId : userInfo.id,
											year : year,
											month : month,
											customerCode : customerCode
										}
										for (var i = 0; i < ret.length; i++) {
											var key = 'files[' + i + '].id';
											param[key] = ret[i].domain.id;
										}
										var url = ajaxReqHost + 'appSaveStatementConfirm.ajax';
										COMMON_Ajax_Post(url, {
											values : param
										}, function(saveRet) {
											if (saveRet && saveRet.result) {
												images = [];
												$api.html($api.byId('updImg'), '');
												COMMON_toastSuccess();
											} else {
												COMMON_ShowFailure(saveRet.msg);
											}
										});
									} else {
										COMMON_ShowFailure('Please upload again');
									}
								});
							});
						} else {
							api.toast({
								msg : 'Please select pictures.'
							});
						}
					} else {
						COMMON_ShowFailure(ret.msg);
					}
				}
			});
		} else {
			api.toast({
				msg : "You can't confirm reconciliation of this month.",
				duration : CONSTANT_TOAST_DURATION
			});
		}
	} else {
		api.toast({
			msg : "You can't confirm reconciliation of this month.",
			duration : CONSTANT_TOAST_DURATION
		});
	}
}

function search() {
	$api.addCls($api.dom('.historyAccount'), 'aui-hide');
	$api.html($api.byId('monthlyHistoryList'), '');
	loadMonthlyData();
}

function showActionSelector() {
	var buttons = [];
	for (var i = 0; i < payerCodeList.length; i++) {
		buttons.push(payerCodeList[i].name);
	}
	COMMON_actionSheet('Selected: ' + $api.html($api.byId('payCodeText')), buttons, function(ret) {
		$api.html($api.byId('payCodeText'), payerCodeList[ret].name);
		$api.val($api.byId('payCodeValue'), payerCodeList[ret].id);
		$api.val($api.byId('payCodeCode'), payerCodeList[ret].code);
		$api.html($api.byId("updImg"), "");
	});

	return;

	COMMON_ActionSelector(payerCodeList, function(ret) {
		$api.html($api.byId('payCodeText'), ret.level1);
		$api.val($api.byId('payCodeValue'), ret.selectedInfo[0].id);
		$api.val($api.byId('payCodeCode'), ret.selectedInfo[0].code);
		$api.html($api.byId("updImg"), "");
	});
}

function cutString(title) {
	var subTitle = '';
	if (title.length > 30) {
		subTitle = title.substring(0, 30) + "..";
	} else {
		subTitle = title;
	}
	return subTitle;
}

function showPayToSelectWin() {
	COMMON_OpenWin({
		name : 'payto_select',
		url : 'payto_select.html',
		pageParam : {
			winName : 'reconcilication',
			datas : payerCodeList,
			selected : $api.html($api.byId('payCodeText')) + ' ' + $api.val($api.byId('payCodeCode'))
		}
	});
}

function UPDATE_PAYER(param) {
	$api.html($api.byId('payCodeText'), param.name);
	$api.val($api.byId('payCodeValue'), param.id);
	$api.val($api.byId('payCodeCode'), param.code);
	BUSINESS_GetCustomerBalance(param.code, function(ret) {
		if (ret) {
			if (ret.result != null && (ret.result == false)) {
				$api.html($api.byId('balanceVal'), '0.0');
			} else {
				$api.html($api.byId('balanceVal'), COMMON_COMMON_FormatCurrency(math.chain(ret.balance).multiply(1)));
				$api.val($api.byId('balance_val'), math.chain(ret.balance).multiply(1));
			}
		}
	});
}

function question(){
	var customerCode = $api.val($api.byId("customerCode"));
	var yearMonth = $api.val($api.byId("date"));
	var dates = yearMonth.split("-");
	var year = dates[0];
	var month = dates[1];
	
	var now = new Date();
	var nowYear = now.getFullYear();
	var nowMonth = now.getMonth() + 1;
	if (year <= nowYear) {
		if ((year == nowYear && nowMonth > month) || year < nowYear) {
			
		}else{
			api.toast({
				msg : "You can't submit question for this month.",
				duration : CONSTANT_TOAST_DURATION
			});
			return;
		}
	}else{
		api.toast({
			msg : "You can't submit question for this month.",
			duration : CONSTANT_TOAST_DURATION
		});
		return;
	}
	
	var param = {
		'org.id' : BUSINESS_GetOrgId(),
		userId : userInfo.id,
		year : year,
		month : month,
		customerCode : customerCode
	};
	COMMON_OpenWin({
		name : 'recon_question',
		url : 'recon_question.html',
		pageParam : param
	});
}
var userInfo = $api.getStorage("userInfo");
var dialog = new auiDialog({});
var productId;
var customerId;
apiready = function() {
	var $header = $api.dom('header');
	$api.fixIos7Bar($header);
	$api.fixStatusBar($header);
	var headerHeight = $api.offset($header).h;
	//$api.val($api.byId('announceId'), id);
	COMMON_openFrame({
		name : 'oos_add_head',
		url : 'oos_add_head.html',
		rect : {
			x : 0,
			y : 0,
			w : api.winWidth,
			h : headerHeight
		},
		animation: CONSTANT_FRAME_ANIMATION
	});
	
	var calendar = new lCalendar();
	calendar.init({
		'trigger': '#overtimeText',
		'type': 'date'
	});
	productId = api.pageParam.productId;
	customerId = api.pageParam.customerId;
	
	var date = new Date();
	date.setDate(date.getDate()+1);
	var month = date.getMonth() + 1;
	month = month < 10 ? '0' + month : month;
	var day = date.getDate();
	day = day < 10 ? '0' + day : day;
	var date_fmt1 = date.getFullYear() + '-' + month + '-' + day;
	$api.val($api.byId('overtimeText'), date_fmt1);

};

function showDateSelect() {
	COMMON_DatePicker('date', function(ret){
		$api.val($api.byId('overtimeText'), ret.year + '-' + ret.month + '-' + ret.day);
	});
}

function send() {
	var qty = $api.val($api.byId('quantity'));
	if ($api.trimAll(qty) == '') {
		api.alert({
			title : 'Warning',
			msg : $.i18n.prop('emptyValid').replace('[FIELD_NAME]', $.i18n.prop('quantity'))
		}, function(ret, err) {
		});
		return;
	}
	if (COMMON_ValidPositiveInt(qty) == false) {
		api.alert({
			title : 'Warning',
			msg : $.i18n.prop('WARNING_POSITIVE_INT')
		}, function(ret, err) {
		});
		return;
	}

	var timeOutDateTemp = $api.val($api.byId('overtimeText'));
	if ($api.trimAll(timeOutDateTemp) == '') {
		api.alert({
			title : 'Warning',
			msg : $.i18n.prop('emptyValid').replace('[FIELD_NAME]', $.i18n.prop('overtime'))
		}, function(ret, err) {
		});
		return;
	}

	if (COMMON_checkDate(timeOutDateTemp) == false) {
		api.alert({
			title : 'Warning',
			msg : $.i18n.prop('WARNING_DATE_FMT_ERROR').replace("[FIELD_NAME]", "yyyy-MM-dd or yyyy/MM/dd")
		}, function(ret, err) {
		});
		return;
	}

	var date1 = new Date();
	var date2 = new Date(timeOutDateTemp);
	if (Date.parse(date1) > Date.parse(date2) == true) {
		api.alert({
			title : 'Warning',
			msg : $.i18n.prop('WARNING_DATE_GT_TODAY')
		}, function(ret, err) {
		});
		return;
	}

	var remark = $api.val($api.byId('remark'));
	var url = ajaxReqHost + 'appSaveOssRemind.ajax';
	COMMON_Ajax_Post(url, {
		values : {
			productId : productId,
			qty : qty,
			'customer.id' : customerId,
			userId : userInfo.id,
			'org.id' : BUSINESS_GetOrgId(),
			remark :remark,
			timeOutDateTemp : timeOutDateTemp
		}
	}, function(ret) {
		if (ret && ret.result == true) {
			COMMON_toastSuccess();
			setTimeout(function(){
				api.closeWin({
            	});
			}, 1500);
		} else {
			COMMON_ShowFailure();
		}
	});
}
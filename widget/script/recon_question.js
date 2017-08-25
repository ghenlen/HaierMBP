var userInfo = $api.getStorage("userInfo");
var param;
apiready = function() {
	var $header = $api.dom('header');
	$api.fixIos7Bar($header);
	$api.fixStatusBar($header);
	var headerHeight = $api.offset($header).h;
	COMMON_openFrame({
		name : 'recon_question_head',
		url : 'recon_question_head.html',
		rect : {
			x : 0,
			y : 0,
			w : api.winWidth,
			h : headerHeight
		},
		animation : CONSTANT_FRAME_ANIMATION
	});
	
	param = api.pageParam;

	$api.addEvt($api.byId('sendBtn'), 'click', send);
};

function send() {
	var value = $api.val($api.byId('valueInput'));
	if ($api.trimAll(value) == '') {
		var emptyMsg = $.i18n.prop('emptyValid');
		emptyMsg = emptyMsg.replace('[FIELD_NAME]', $.i18n.prop('value'));
		api.toast({
			msg : emptyMsg
		});
		return;
	} else {
		var result = COMMON_MoneyValid(value);
		if (result == false) {
			var patternMsg = $.i18n.prop('patternValid');
			patternMsg = patternMsg.replace('[FIELD_NAME]', $.i18n.prop('value'));
			api.toast({
				msg : patternMsg
			});
			return;
		}
	}
	
	var content = $api.val($api.byId('content'));

	if ($api.trimAll(content) == '') {
		api.toast({
			msg : 'Please enter the remark!'
		});
		return;
	}

	var url = ajaxReqHost + 'appSaveMessage.ajax';
	COMMON_Ajax_Post(url, {
		values : param
	}, function(saveRet) {
		if (saveRet && saveRet.result == true) {
			COMMON_toastSuccess();
			setTimeout(function() {
				api.closeWin();
			}, 1000);
		} else {
			COMMON_ShowFailure();
		}
	});
}


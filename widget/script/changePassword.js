var dialog = new auiDialog({});
var dealerList = [];
var userInfo = $api.getStorage("userInfo");
var pageNo = 0;
var isProductListEnd = false;
apiready = function() {

	initDom();

	//统计页面访问次数
	BUSINESS_PageAccessStatics();

};

function initDom() {
	var $header = $api.dom('header');
	var $footer = $api.dom('footer');
	$api.fixIos7Bar($header);
	$api.fixStatusBar($header);
	var $main = $api.byId('main');
	var headerHeight = $api.offset($header).h;

	COMMON_openFrame({
		name : 'changPassword_head',
		url : 'changPassword_head.html',
		rect : {
			x : 0,
			y : 0,
			w : api.winWidth,
			h : headerHeight
		},
		animation : CONSTANT_FRAME_ANIMATION
	});

}



function changePassword() {
	var url = ajaxReqHost + 'appUpdateUserPassword.ajax';
	var oldPassword = $api.val($api.byId("oldPasswordInput"));
	var newPassword = $api.val($api.byId("newPasswordInput"));
	var confirmPassword = $api.val($api.byId("confirmPasswordInput"));
	if ($api.trim(oldPassword) == '') {
		api.toast({
			msg : 'Please enter the old password!'
		});
		return;
	}
	
	if ($api.trim(newPassword) == '') {
		api.toast({
			msg : 'Please enter the new password!'
		});
		return;
	}
	
	if ($api.trim(confirmPassword) == '') {
		api.toast({
			msg : 'Please enter the confirm password!'
		});
		return;
	}
	if (newPassword != confirmPassword) {
		api.toast({
			msg : 'The password is not same as the above one!'
		});
		return;
	}
	COMMON_Ajax_Post(url, {
		values : {
			id : userInfo.id,
			oldPassword : $api.trim(oldPassword),
			newPassword : $api.trim(newPassword)
		}
	}, function(ret) {
		if (ret && ret.result == true) {
			COMMON_toastSuccess();
			setTimeout(function(){
				api.closeWin();
			},2000);
		} else {
			api.toast({
				msg : 'The old password is not correct!'
			});
		}
	});
}
function cancelChange(){
	api.closeWin();
}


var dealerList = [];
var userInfo = $api.getStorage("userInfo");
var userId;
var images = [];
var dialog = new auiDialog({});
var photoBrowser;
apiready = function() {
	userId = userInfo.id;
	getUserList();
	var $header = $api.dom('header');
	$api.fixIos7Bar($header);
	$api.fixStatusBar($header);
	var headerHeight = $api.offset($header).h;
	$api.toggleCls($api.byId('ackContainer'), 'aui-show');
	COMMON_openFrame({
		name : 'notice_add_head',
		url : 'notice_add_head.html',
		rect : {
			x : 0,
			y : 0,
			w : api.winWidth,
			h : headerHeight
		},
		animation : CONSTANT_FRAME_ANIMATION
	});
	//initDealerList();

	$api.addEvt($api.byId('sendBtn'), 'click', send);
	
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
	
};

function initDealerList() {
	//客户列表
	var relations = BUSINESS_GetRelations();
	for (var i = 0; i < relations.length; i++) {
		dealerList.push({
			customerId : relations[i]['customer.id'],
			customerCode : relations[i].customerCode,
			name : relations[i].customerTitle,
			orgCode : relations[i].orgCode,
			id : relations[i].id
		});
		if (i == 0) {
			$api.html($api.byId('dealerText'), relations[i].customerTitle);
			$api.val($api.byId('customerCode'), relations[i].customerCode);
			$api.val($api.byId('id'), relations[i].id);
		}
	}
}


function getUserList() {
	var url = ajaxReqHost + 'appListUser.ajax';
	COMMON_Ajax_Post(url, {
		values : {
		}
	}, function(ret) {
		var relations = ret;
		for (var i = 0; i < relations.length; i++) {
			dealerList.push({
				//customerId : relations[i]['customer.id'],
				customerCode : relations[i].employeeNo,
				name : relations[i].name,
				//orgCode : relations[i].orgCode,
				id : relations[i].id
			});
			/*
			if (i == 0) {
				$api.html($api.byId('dealerText'), relations[i].name);
				$api.val($api.byId('customerCode'), relations[i].employeeNo);
				$api.val($api.byId('ids'), relations[i].id);
			}
			*/
		}

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

				images.push(ret.data);
				var cloneObj = $api.byId('updImgTemplate').cloneNode(true);
				$api.attr($api.dom(cloneObj, 'img'), 'src', ret.data);
				$api.attr($api.dom(cloneObj, '.delete_flag'), 'onclick', 'removeImg(this, \'' + ret.data + '\')');
				$api.append($api.byId('upload_container'), $api.html(cloneObj));
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
		} else {
		}
	});
}

function send() {
	var title = $api.val($api.byId('titleInput'));
	var content = $api.val($api.byId('content'));
	var ids = $api.val($api.byId('ids'));

	if ($api.trimAll(ids) == '') {
		var emptyMsg = $.i18n.prop('emptyValid');
		emptyMsg = emptyMsg.replace('[FIELD_NAME]', 'receivers');
		api.toast({
			msg : emptyMsg
		});
		return;
	}
	if ($api.trimAll(title) == '') {
		var emptyMsg = $.i18n.prop('emptyValid');
		emptyMsg = emptyMsg.replace('[FIELD_NAME]', $.i18n.prop('title'));
		api.toast({
			msg : emptyMsg
		});
		return;
	}
	if ($api.trimAll(content) == '') {
		var emptyMsg = $.i18n.prop('emptyValid');
		emptyMsg = emptyMsg.replace('[FIELD_NAME]', $.i18n.prop('messageBody'));
		api.toast({
			msg : emptyMsg
		});
		return;
	}

	var param = {
		'fromUser.id' : userInfo.id,
		'toUserIds' : ids,
		'messageTitle' : title,
		'details' : content
	}

	if (images.length > 0) {
		var uploadShopImgsUrl = ajaxReqHost + 'appupload.ajax';
		COMMON_Ajax_Post(uploadShopImgsUrl, {
				values : {
					id : '-1',
					label : 'notice',
					type : 'notice'
				},
				files : {
					Filedata : images
				}
			}, function(ret, err) {
			if (ret && ret.length > 0) {
				if (ret[0].result) {
					for (var i = 0; i < ret.length; i++) {
						var key = 'files[' + i + '].id';
						param[key] = ret[i].domain.id;
					}
					sendData(param);
				}else{
					COMMON_ShowFailure();
				}
			} else {
				COMMON_ShowFailure();
			}
		});
	} else {
		sendData(param);
	}
}

function sendData(param) {
	var url = ajaxReqHost + 'appSaveMessage.ajax';
	COMMON_Ajax_Post(url, {
		values : param
	}, function(saveRet) {
		if (saveRet && saveRet.result == true) {
			COMMON_toastSuccess();
			setTimeout(function() {
				api.closeWin();
				api.sendEvent({
					name : 'refreshOutbox'
				});
			}, 1000);
		} else {
			COMMON_ShowFailure();
		}
	});
}
function showDealerActionSelector() {
	COMMON_OpenWin({
		name : 'user_selector',
		url : 'user_selector1.html',
		pageParam : {
			winName: "notice_add",
			datas: dealerList,
			ids: $api.val($api.byId("ids"))
		}
	});
}

function UPDATE_DEALER(param){
	var count = param.count;
	var ids = param.ids;
	
	var selectText = '';
	if(count > 1){
		selectText = 'Selected '+count +' items';
	}else{
		selectText = 'Selected '+count +' item';
	}
	
	$api.html($api.byId("dealerText"), selectText);
	//$api.val($api.byId("customerCode"), customerCode);
	$api.val($api.byId("ids"), ids);
}

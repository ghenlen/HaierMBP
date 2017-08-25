var dialog = new auiDialog({});
var dealerList = [];
var images = [];
var ackHistoryLoadedFlag = 0;
var photoBrowser;
//上传的图片
apiready = function() {
	var $header = $api.dom('header');
	$api.fixIos7Bar($header);
	$api.fixStatusBar($header);
	var param = api.pageParam;
	var id = param.id;
	var moudle = param.moudle;
	if (moudle == '1') {
		loadNoticeInboxDetailData(id);
		//$api.toggleCls($api.byId('ackContainer'), 'aui-show');
		//$api.val($api.byId('announceId'), id);
	} else if (moudle == '2') {
		loadNoticeOutboxDetailInfo(id);
	}

	var $header = $api.dom('header');
	var headerHeight = $api.offset($header).h;
	COMMON_openFrame({
		name : 'notice_detail_head',
		url : 'notice_detail_head.html',
		rect : {
			x : 0,
			y : 0,
			w : api.winWidth,
			h : headerHeight
		},
		pageParam : {
			moudle : moudle
		},
		animation : CONSTANT_FRAME_ANIMATION
	});

	initDealerList();
	
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
			name : relations[i].customerTitle,
			id : relations[i]['customer.id']
		});
		if (i == 0) {
			$api.html($api.byId('dealerText'), relations[i].customerTitle);
			$api.val($api.byId('customerId'), relations[i]['customer.id']);
		}
	}
}

function boostImage(imgPath){
	photoBrowser = api.require('photoBrowser');
	photoBrowser.open({
		images : [imgPath],
		activeIndex: 0,
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


function loadNoticeInboxDetailData(id) {
	var url = ajaxReqHost + 'appGetMessage.ajax';
	COMMON_Ajax_Post(url, {
		values : {
			id : id
		}
	}, function(ret) {
		if (ret) {
			$api.val($api.byId('fromUserName'), ret.fromUserName);
			$api.html($api.byId('toUserName'), ret.toUserNames);
			$api.val($api.byId('createDate'), COMMON_FormatTimeToTime(ret.createDate));
			$api.val($api.byId('messageTitle'), ret.messageTitle);
			$api.html($api.byId('details'), ret.details);
			if (ret.attach) {
				BUSINESS_GetAttachment(ret.id, function(ret) {
					if (ret && ret.length > 0) {
						for (var i = 0; i < ret.length; i++) {
							var fileType = COMMON_GetFileType(ret[i].visitPath);
							if (fileType == CONSTANT_FILE_TYPE.IMAGE) {
								var spanStr = "<image style='width:100%;' src='" + ret[i].visitPath + "' onClick='javascript:boostImage(\"" + ret[i].visitPath + "\")'/>";
								$api.append($api.dom(".attachment_container_image"), spanStr);
							} else {
								$api.removeCls($api.dom(".attachment"), "aui-hide");
								var spanStr = "<span><a href='javascript:BUSINESS_ShowAttachment(\"" + ret[i].visitPath + "\")'>" + ret[i].name + "</a></span>&nbsp;&nbsp;"
								$api.append($api.dom(".attachment_container"), spanStr);
							}
						}
					}
				});
			}
			if(!ret.isRead){
				isNotRead(id);
			}
		}
	});
}

function loadNoticeOutboxDetailInfo(id) {
	var url = ajaxReqHost + 'appGetMessage.ajax';
	COMMON_Ajax_Post(url, {
		values : {
			id : id
		}
	}, function(ret) {
		if (ret) {
			$api.val($api.byId('fromUserName'), ret.fromUserName);
			$api.html($api.byId('toUserName'), ret.toUserNames);
			$api.val($api.byId('createDate'), COMMON_FormatTimeToTime(ret.createDate));
			$api.val($api.byId('messageTitle'), ret.messageTitle);
			$api.html($api.byId('details'), ret.details);
			if (ret.attach) {
				BUSINESS_GetAttachment(ret.id, function(ret) {
					if (ret && ret.length > 0) {
						for (var i = 0; i < ret.length; i++) {
							var fileType = COMMON_GetFileType(ret[i].visitPath);
							if (fileType == CONSTANT_FILE_TYPE.IMAGE) {
								var spanStr = "<image style='width:100%;' src='" + ret[i].visitPath + "' onClick='javascript:boostImage(\"" + ret[i].visitPath + "\")'/>";
								$api.append($api.dom(".attachment_container_image"), spanStr);
							} else {
								$api.removeCls($api.dom(".attachment"), "aui-hide");
								var spanStr = "<span><a href='javascript:BUSINESS_ShowAttachment(\"" + ret[i].visitPath + "\")'>" + ret[i].name + "</a></span>&nbsp;&nbsp;"
								$api.append($api.dom(".attachment_container"), spanStr);
							}
						}
					}
				});
			}
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
	var photoBrowser = api.require('photoBrowser');
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

function isNotRead(id){
var appReadMessageUrl=ajaxReqHost +"appReadMessage.ajax";
	COMMON_Ajax_Post(appReadMessageUrl, {
		values : {
			id : id
		}
	}, function(ret) {
		if (ret) {
			if(ret.result){
				api.sendEvent({
		            name:'updateNewMessageCount'
	            });
	            api.sendEvent({
	                name:'refreshInboxData'
                });
			}
		}
	});

}


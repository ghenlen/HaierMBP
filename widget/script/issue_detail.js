var dialog = new auiDialog({});
var images = [];

var id;
var moudle;
var unconfirmedCustomerList = [];
var userInfo = $api.getStorage("userInfo");

var replyList = [];

var photoBrowser;

//上传的图片
apiready = function() {
	var $header = $api.dom('header');
	$api.fixIos7Bar($header);
	$api.fixStatusBar($header);
	var param = api.pageParam;
	id = param.id;
	moudle = param.moudle;
	if (moudle == '1') {
		loadAnnounceDetailData(id);
		$api.val($api.byId('announceId'), id);
		initDealerList();
	} else if (moudle == '2') {
		loadNewsDetailInfo(id);
	} else if (moudle == '3') {
		loadPolicyDetailInfo(id);
	}
	var $header = $api.dom('header');
	var headerHeight = $api.offset($header).h;
	COMMON_openFrame({
		name : 'issue_detail_head',
		url : 'issue_detail_head.html',
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

	api.addEventListener({
		name : 'updateDealer_issue_detail'
	}, function(ret, err) {
		var customerCode = ret.value.customerCode;
		var customerId = ret.value.customerId;
		var title = ret.value.title;
		$api.html($api.byId('dealerText'), title);
		$api.val($api.byId('customerId'), customerId);
	});
	
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

function initDealerList(customerId) {
	if (customerId) {
		for (var i = 0; i < unconfirmedCustomerList.length; i++) {
			if (unconfirmedCustomerList[i].id == customerId) {
				unconfirmedCustomerList.splice(i, 1);
				break;
			}
		}
		
		if(unconfirmedCustomerList.length>0){
			$api.html($api.byId('dealerText'), unconfirmedCustomerList[0].name);
			$api.val($api.byId('customerId'), unconfirmedCustomerList[0].id);
			$api.val($api.byId('customerCode'), unconfirmedCustomerList[0].customerCode);
		}else{
			$api.addCls($api.byId("upload_container"), "aui-hide");
			$api.addCls($api.byId("dealerListLi"), "aui-hide");
			$api.addCls($api.byId("submitReply"), "aui-hide");
		}
	} else {
		var url = ajaxReqHost + 'appUnconfirmedCustomerList.ajax';
		COMMON_Ajax_Post(url, {
			values : {
				announcementId : id,
				userId: userInfo.id,
				orgInnerCode : BUSINESS_GetOrgInnerCode()
			}
		}, function(ret) {
			unconfirmedCustomerList = [];
			if (ret) {
				if (ret.length > 0) {
					for (var i = 0; i < ret.length; i++) {
						unconfirmedCustomerList.push({
							id : ret[i].id,
							name : ret[i].customerTitle,
							customerCode : ret[i].customerCode
						});
						if (i == 0) {
							$api.html($api.byId('dealerText'), ret[i].customerTitle);
							$api.val($api.byId('customerId'), ret[i].id);
							$api.val($api.byId('customerCode'), ret[i].customerCode);
						}
					}
				} else {
					$api.addCls($api.byId("upload_container"), "aui-hide");
					$api.addCls($api.byId("dealerListLi"), "aui-hide");
					$api.addCls($api.byId("submitReply"), "aui-hide");
				}
			}
		});
	}
}

function showDealerActionSelector() {
	var buttons = [];
	for(var i=0; i<unconfirmedCustomerList.length; i++){
		buttons.push(unconfirmedCustomerList[i].name);
	}
	COMMON_actionSheet('Selected: '+$api.html($api.byId('dealerText')), buttons, function(ret){
		$api.html($api.byId('dealerText'), unconfirmedCustomerList[ret].name);
		$api.val($api.byId('customerId'), unconfirmedCustomerList[ret].id);
		$api.val($api.byId('customerCode'), unconfirmedCustomerList[ret].customerCode);
	});
	
return;
	
	COMMON_ActionSelector(unconfirmedCustomerList, function(ret) {
		if (ret.selectedInfo.length > 0) {
			$api.html($api.byId('dealerText'), ret.level1);
			$api.val($api.byId('customerId'), ret.selectedInfo[0].id);
			$api.val($api.byId('customerCode'), ret.selectedInfo[0].customerCode);
		} else {
			$api.html($api.byId('dealerText'), '');
			$api.val($api.byId('customerId'), '');
		}
	});
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

function loadAnnounceDetailData(id) {
	var url = ajaxReqHost + 'appGetAnnouncement.ajax';
	var param = {
			id : id,
			userId: userInfo.id,
			orgInnerCode : BUSINESS_GetOrgInnerCode()
		};
	COMMON_Ajax_Post(url, {
		values : {
			id : id,
			userId: userInfo.id,
			orgInnerCode : BUSINESS_GetOrgInnerCode()
		}
	}, function(ret) {
		if (ret) {
			$api.html($api.byId('content'), ret.content);
			$api.html($api.byId('titleText'), ret.title);
			$api.html($api.byId('timeText'), COMMON_FormatTimeToTime(ret.createDate));
			$api.val($api.byId('publisherText'), ret.orgTitle);
			
			replyList = ret.announcementReply || [];
			
			if (ret.category == 'OUTTER') {
				$api.removeCls($api.byId("ackContainer"), "aui-hide");
			}
			if (ret.attach) {
				BUSINESS_GetAttachment(ret.id, function(ret1) {
					if (ret1 && ret1.length > 0) {
						for (var i = 0; i < ret1.length; i++) {
							var fileType = COMMON_GetFileType(ret1[i].visitPath);
							var spanStr = '';
							if (fileType == CONSTANT_FILE_TYPE.IMAGE) {
								spanStr = "<image style='width:100%;' src='" + ret1[i].visitPath + "' onClick='javascript:boostImage(\"" + ret1[i].visitPath + "\")'/>";
								$api.append($api.dom(".attachment_container_image"), spanStr);
							} else {
								spanStr = "<span class='attach_file gray_light' style='margin-bottom:1rem'><img src='../image/common/attachment.png' width='20' height='20' style='vertical-align: middle;'/><a href='javascript:BUSINESS_ShowAttachment(\"" + ret1[i].visitPath + "\")'>" + ret1[i].name + "</a></span>&nbsp;&nbsp;";
								$api.append($api.dom(".attachment_container"), spanStr);
							}
						}
					}
				});
			}
		}
	});
}

function loadNewsDetailInfo(id) {
	var url = ajaxReqHost + 'appGetNews.ajax';
	COMMON_Ajax_Post(url, {
		values : {
			id : id
		}
	}, function(ret) {
		if (ret) {
			$api.html($api.byId('content'), ret.content);
			$api.html($api.byId('titleText'), ret.title);
			$api.html($api.byId('timeText'), COMMON_FormatTimeToTime(ret.createDate));
			$api.val($api.byId('publisherText'), ret.orgTitle);
			if (ret.attach) {
				BUSINESS_GetAttachment(ret.id, function(ret1) {
					if (ret1 && ret1.length > 0) {
						for (var i = 0; i < ret1.length; i++) {
							var fileType = COMMON_GetFileType(ret1[i].visitPath);
							var spanStr = '';
							if (fileType == CONSTANT_FILE_TYPE.IMAGE) {
								spanStr = "<image style='width:100%;' src='" + ret1[i].visitPath + "' onClick='javascript:boostImage(\"" + ret1[i].visitPath + "\")'/>";
								$api.append($api.dom(".attachment_container_image"), spanStr);
							} else {
								spanStr = "<span class='attach_file gray_light' style='margin-bottom:1rem'><img src='../image/common/attachment.png' width='20' height='20' style='vertical-align: middle;'/><a href='javascript:BUSINESS_ShowAttachment(\"" + ret1[i].visitPath + "\")'>" + ret1[i].name + "</a></span>&nbsp;&nbsp;";
								$api.append($api.dom(".attachment_container"), spanStr);
							}
						}
					}
				});
			}
		}
	});
}

function loadPolicyDetailInfo(id) {
	var url = ajaxReqHost + 'appGetPolicy.ajax';
	COMMON_Ajax_Post(url, {
		values : {
			id : id
		}
	}, function(ret) {
		if (ret) {
			$api.html($api.byId('content'), ret.content);
			$api.html($api.byId('titleText'), ret.title);
			$api.html($api.byId('timeText'), COMMON_FormatTimeToTime(ret.createDate));
			$api.val($api.byId('publisherText'), ret.orgTitle);
			if (ret.attach) {
				BUSINESS_GetAttachment(ret.id, function(ret1) {
					if (ret1 && ret1.length > 0) {
						for (var i = 0; i < ret1.length; i++) {
							var fileType = COMMON_GetFileType(ret1[i].visitPath);
							var spanStr = '';
							if (fileType == CONSTANT_FILE_TYPE.IMAGE) {
								spanStr = "<image style='width:100%;' src='" + ret1[i].visitPath + "' onClick='javascript:boostImage(\"" + ret1[i].visitPath + "\")'/>";
								$api.append($api.dom(".attachment_container_image"), spanStr);
							} else {
								spanStr = "<span class='attach_file gray_light' style='margin-bottom:1rem'><img src='../image/common/attachment.png' width='20' height='20' style='vertical-align: middle;'/><a href='javascript:BUSINESS_ShowAttachment(\"" + ret1[i].visitPath + "\")'>" + ret1[i].name + "</a></span>&nbsp;&nbsp;";
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
		quality : 60
	}, function(ret, err) {
		if (ret) {
			if (ret.data) {
				images.push(ret.data);
				var cloneObj = $api.byId('updImgTemplate').cloneNode(true);
				$api.attr($api.dom(cloneObj, 'img'), 'src', ret.data);
				$api.attr($api.dom(cloneObj, '.delete_flag'), 'onclick', 'removeImg(this, \'' + ret.data + '\')');
				$api.append($api.byId('upload_container'), $api.html(cloneObj));
			}
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
		}
	});
}

function showHistoryList(isAcknowledgeButton) {
	var url = ajaxReqHost + 'appGetAnnouncement.ajax';
	COMMON_Ajax_Post(url, {
		values : {
			id : id,
			orgInnerCode : BUSINESS_GetOrgInnerCode()
		}
	}, function(ret) {
		if (ret) {
			var replyList = ret.announcementReply || [];
			COMMON_OpenWin({
				name : 'announce_ack_history',
				url : 'announce_ack_history.html',
				pageParam : {
					histroyList : replyList
				}
			});
		}
	});
}

function acknowledge() {
	var customerId = $api.val($api.byId('customerId'));
	var customerCode = $api.val($api.byId('customerCode'));
	var userId = userInfo.id;
	var announceId = $api.val($api.byId('announceId'));
	if (customerId == '') {
		api.toast({
			msg : 'Please select a customer.'
		});
		return;
	}
	if (images.length > 0) {
		var uploadShopImgsUrl = ajaxReqHost + 'appupload.ajax';
		COMMON_Ajax_Post(uploadShopImgsUrl, {
			values : {
				id : '-1',
				label : 'issue',
				type : 'issue'
			},
			files : {
				Filedata : images
			}
		}, function(ret, err) {
			if (ret && ret.length > 0) {

				var picPath = '';
				var param = {
					'customerId' : customerId,
					'userId' : userId,
					'orgId' : BUSINESS_GetOrgId(),
					'announcement.id' : announceId,
					'customerCode' : customerCode
				}

				for (var i = 0; i < ret.length; i++) {
					var key = 'files[' + i + '].id';
					param[key] = ret[i].domain.id;
				}

				var url = ajaxReqHost + 'appSaveAnnouncementRepley.ajax';
				COMMON_Ajax_Post(url, {
					values : param
				}, function(saveRet) {
					if (saveRet && saveRet.result == true) {
						$api.html($api.byId('dealerText'), '');
						$api.val($api.byId('customerId'), '');
						initDealerList(customerId);
						var cloneObj = $api.byId('updImgTemplate').cloneNode(true);
						$api.html($api.dom(cloneObj, '.dealer'), $api.html($api.byId('dealerText')));
						$api.append($api.byId('ackHisUl'), $api.html(cloneObj));
						COMMON_toastSuccess();
						var domall = $api.domAll($api.byId('upload_container'), '.upload_imgs');
						for (var k = 0; k < domall.length; k++) {
							$api.remove(domall[k]);
						}
						image = [];
					} else {
						COMMON_ShowFailure();
					}
				});
			} else {
				COMMON_ShowFailure();
			}
		});
	} else {
		var param = {
			'customerId' : customerId,
			'userId' : userId,
			'orgId' : BUSINESS_GetOrgId(),
			'announcement.id' : announceId,
			'customerCode' : customerCode
		}
		var url = ajaxReqHost + 'appSaveAnnouncementRepley.ajax';
		COMMON_Ajax_Post(url, {
			values : param
		}, function(saveRet) {
			if (saveRet && saveRet.result == true) {
				$api.html($api.byId('dealerText'), '');
				$api.val($api.byId('customerId'), '');
				initDealerList(customerId);
				var cloneObj = $api.byId('updImgTemplate').cloneNode(true);
				$api.html($api.dom(cloneObj, '.dealer'), $api.html($api.byId('dealerText')));
				$api.append($api.byId('ackHisUl'), $api.html(cloneObj));
				COMMON_toastSuccess();
			} else {
				COMMON_ShowFailure();
			}
		});
	}
}
var userInfo = $api.getStorage("userInfo");
var images=[];
apiready = function() {
if(api.systemType == 'ios'){
    	api.addEventListener({
	        name: 'swiperight'
	    }, function (ret, err) {
	    });
    }
    
	initDom();
	bindEvent();
	noReadMessageCount();
	getuserPic();
	//页面访问次数统计
	BUSINESS_PageAccessStatics();

	BUSINESS_GetMyPermissions();

	api.getCacheSize(function(ret) {
		var size = ret.size;
		$api.html($api.byId('cacheSize'), (size / 1024 / 1024).toFixed(3) + 'M');
	});

	api.addEventListener({
		name : 'updateAlertMessage'
	}, function(ret, err) {
		noReadMessageCount();
	});
	
	 
};

function initDom() {
	var $header = $api.dom('header');
	$api.fixIos7Bar($header);
	$api.fixStatusBar($header);

	var headerHeight = $api.offset($header).h;
	
	$api.css($api.byId('portrait_con'),'margin-top:'+headerHeight+'px');
	
	$api.html($api.byId('nameText'), userInfo.name);
	
	$api.html($api.byId('version'), api.appVersion);
	
	//var getUpdateTimeSql = "select update_time from product limit 1";
	var getUpdateTimeSql = "select * from product";

	var db = api.require('db');
	db.selectSql({
		name : 'data',
		sql : getUpdateTimeSql
	}, function(ret, err) {
		if (ret.status) {
			var data = ret.data;
			if (data.length > 0) {
				var time=(data[0].update_time).substr(0,10);
				$api.html($api.byId('updateTime'), 'Last Update: ' + time);
			}
		}
	});

	
}

function bindEvent() {
	api.addEventListener({
		name : 'MyEventListener'
	}, function(ret, err) {
		var param = ret.value;
		var time=param.time;
		time=time.substr(0,10);
		var eventType = param.eventType;
		if (eventType == 'UPDATE_OFFLINE_TIME') {
			$api.html($api.byId('updateTime'), 'Last Update: ' + time);
		}
	});
}

function openOrderCenter() {
	COMMON_OpenWin({
		name : 'order_center',
		url : 'order_center.html'
	});
}

function openCommonProduct() {
	COMMON_OpenWin({
		name : 'common_product',
		url : 'common_product.html'
	});
}

function openTaskList(){
	COMMON_OpenWin({
		name : 'task_list',
		url : 'task_list.html'
	});
}

function logOut() {
	$api.setStorage('autoLogin', 0);
	api.rebootApp();
}

//更新离线数据
function updateOfflineData() {
	COMMON_OpenWin({
		name : 'update_offline_data',
		url : 'update_offline_data.html'
	});
}

function clearCache() {
	api.clearCache({
	}, function(ret, err) {
		api.toast({
			msg : 'success'
		});
	});
}

function openChangePassword() {
	COMMON_OpenWin({
		name : 'changePassword',
		url : 'changePassword.html'
	});
}

function openAlertMsg() {
	COMMON_OpenWin({
		name : 'alert_msg',
		url : 'alert_msg.html'
	});
}

//应用更新
function appUpdate() {
	var mam = api.require('mam');
	mam.checkUpdate(function(ret, err){
	    if (ret) {
	        if(ret.status && ret.result.update){
	        	var source = ret.result.source;
	        	var osType = COMMON_IsAnroidOrIOS();
				if (osType == CONSTANT_OS.ANDROID) {
					api.showProgress({
						title : 'Installing...',
						text : 'Please wait'
					});
					var path = "cache://haierMbp.apk";
					api.download({
						url : source,
						savePath : path,
						report : false,
						cache : true
					}, function(ret, err) {
						api.hideProgress();
						if (ret) {
							if (ret.fileSize > 0) {
								filePath = ret.savePath;
								api.installApp({
									appUri : filePath
								});
							}
						}
					});
				} else {
					api.installApp({
						appUri : source //安装包对应plist地址
					});
				}
	        }else{
	        	api.toast({
                    msg:'This is the lastest version!'
                });
	        }
	    }
	});
	
return;
	
	var version = api.appVersion;
	var osType = COMMON_IsAnroidOrIOS();
	if (osType == CONSTANT_OS.ANDROID) {
		var appVersionUrl = ajaxReqHost + 'appGetVersion.ajax';
		COMMON_Ajax_Post(appVersionUrl, {values:{code:version}}, function(ret) {
			if (ret) {
				if(ret.result == false){
					var path = "cache://haierMbp.apk";
					if(ret.values &&　ret.values.path){
						var downloadUrl = ret.values.path;
						api.showProgress({
							title : 'Downloading...',
							text : 'Please wait'
						});
						api.download({
							url : downloadUrl,
							savePath : path,
							report : false,
							cache : true
						}, function(ret, err) {
							api.hideProgress();
							if (ret) {
								if (ret.fileSize > 0) {
									filePath = ret.savePath;
									api.installApp({
										appUri : filePath
									});
								}
							}
						});
					}
				}else{
					api.toast({
	                    msg:'This is the lastest version!'
                    });
				}
			}
		});
	} else {
		
		
		api.installApp({
			appUri : 'https://list.kuaiapp.cn/list/KuaiAppZv7.1.plist' //安装包对应plist地址
		});
	}
}

//清除缓存
function clearCache() {
	COMMON_ShowConfirm($.i18n.prop('OPERATE_CONFIRM'), function(){
		api.clearCache(function() {
			api.toast({
				msg : 'Clear Finish!'
			});
			$api.html($api.byId('cacheSize'), '0M');
		});
	});
}

//更换头像
function changePortrait() {
	api.actionSheet({
		style: {
			fontNormalColor: '#1B7BEA',
			titleFontColor: '#555'
		},
		title: 'Exchange The Profile',
		cancelTitle : 'Cancel',
		buttons : ['Take Photo', 'Gallery Selection']
    },function(ret,err){
    	if (ret) {
			images=[];
			if (ret.buttonIndex == '1') {
				takePhoto();
			} else if (ret.buttonIndex == '2') {
				selectByGallery();
			}
		}
    });
}

function takePhoto() {
	api.getPicture({
		sourceType : 'camera',
		encodingType : 'jpg',
		mediaValue : 'pic',
		destinationType : 'url',
		allowEdit : true,
		quality : 80,
		saveToPhotoAlbum : true
	}, function(ret, err) {
		if (ret) {
			if (ret.data) {
				images.push(ret.data);
				uploadPortraitImg(ret.data);
			}
		}
	});
}

function selectByGallery() {
	var UIMediaScanner = api.require('UIMediaScanner');
	UIMediaScanner.open({
		type : 'picture',
		column : 4,
		classify : true,
		max : 1,
		sort : {
			key : 'time',
			order : 'desc'
		},
		texts : {
			stateText : 'Select * Item',
			cancelText : 'Cancel',
			finishText : 'Finish'
		},
		styles : {
			bg : '#fff',
			mark : {
				icon : '',
				position : 'bottom_left',
				size : 20
			},
			nav : {
				bg : '#f5f5f5',
				stateColor : '#ddd',
				stateSize : 14,
				cancelBg : 'rgba(0,0,0,0)',
				cancelColor : '#f10215',
				cancelSize : 16,
				finishBg : 'rgba(0,0,0,0)',
				finishColor : '#f10215',
				finishSize : 16
			}
		},
		scrollToBottom : {
			intervalTime : 3,
			anim : true
		},
		exchange : true,
		rotation : true
	}, function(ret1) {
		if (ret1 && ret1.list && ret1.list.length > 0) {
			var path = ret1.list[0].path;
			UIMediaScanner.transPath({
				path : path
			}, function(ret, err) {
				if (ret) {
					images.push(ret.path);
					uploadPortraitImg(ret.path);
				}
			});
		}
	});
}

function uploadPortraitImg(data) {
	var url = ajaxReqHost + 'appupUserPic.ajax';
	//上传头像地址
	COMMON_Ajax_Post(url, {
		values : {
			id : userInfo.id,
			label : 'userPic',
			type : 'userPic'
		},
		files : {
			Filedata : images
		}
	}, function(ret) {
		if (ret.result) {
			$api.attr($api.byId('portrait'), 'src', data);
			$api.setStorage(userInfo.id + '_portrait', ret.values.path+ret.domain.modelType+'/'+ret.domain.uuidFileName);
		}
	});

}



function noReadMessageCount(){
	var noReadMessageCountUrl = ajaxReqHost + 'appAlertMessageCount.ajax';
	COMMON_Ajax_Post(noReadMessageCountUrl, {
		values : {
			'user.id' : userInfo.id,
			'customerCode':'',
			'messageTitle':'',
			'redTag':'FALSE'	
		}
	}, function(ret) {
		if (ret>=1) {
			$api.removeCls($api.byId("noReadMessage"), "aui-hide");
			$api.html($api.byId("noReadMessage"), ret);
		}else{
			$api.addCls($api.byId("noReadMessage"), "aui-hide");
		}
	},'text');
}


function getuserPic() {
	var url = $api.getStorage(userInfo.id + '_portrait');
	var $img = $api.byId("portrait");
	COMMON_CacheImg(url, $img);
}

function showCode(){
	var dialogBox = api.require('dialogBox');
	dialogBox.share({
	    rect: {
	        w: 260,
	        h: 460
	    },
	    items: [{
	        text: 'Android',
	        icon: 'widget://image/my/android_code.png'
	    }, {
	        text: 'IOS',
	        icon: 'widget://image/my/ios_code.png'
	    }],
	    tapClose: true,
	    styles: {
	        bg: '#FFF',
	        column: 1,
	        horizontalSpace: 10,
	        verticalSpace: 30,
	        itemText: {
	            color: '#555',
	            size: 14,
	            marginT: 0
	        },
	        itemIcon: {
	            size: 180
	        }
	    }
	}, function(ret) {
	});
	
	return;
	var dialogBox = api.require('dialogBox');
	dialogBox.discount({
	    rect: {
	        w: 200,
	        h: 260
	    },
	    tapClose: true,
	    styles: {
	        bg: '#FFF',
	        image: {
	            path: 'widget://image/my/android_code.png',
	            marginB: 130
	        },
	        cancel: {
	            icon: 'widget://image/my/cancel.png',
	            w: 50,
	            h: 50
	        }
	    }
	}, function(ret) {
	    if (ret.eventType == 'cancel') {
	        dialogBox.close({
	            dialogName: 'discount'
	        });
	    }
	});
}
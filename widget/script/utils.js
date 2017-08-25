//打开窗口
function COMMON_OpenWin(param) {
	var innerParam = {
		vScrollBarEnabled : false,
		delay : 400,
		reload : false
	}
	innerParam = COMMON_extendObj(param, innerParam);
	api.openWin(innerParam);

}

function COMMON_openFrame(param) {
	var innerParam = {
		bounces : false
	}
	innerParam = COMMON_extendObj(param, innerParam);
	api.openFrame(innerParam);
}

//合并两个js对象的属性
function COMMON_extendObj(obj1, obj2) {
	for (var key in obj2) {
		if (obj1.hasOwnProperty(key))
			continue;
		//有相同的属性则略过
		obj1[key] = obj2[key];
	}
	return obj1;
}

function COMMON_IsAnroidOrIOS() {
	var systemType = api.systemType;
	if (systemType == 'ios') {
		return CONSTANT_OS.IOS;
	} else if (systemType == 'android') {
		return CONSTANT_OS.ANDROID;
	}
}

function COMMON_CacheImg(url, imgEle) {	
	var filePath = "";
	var filename = COMMON_GetFileNameByUrl(url);
	var path = "cache://" + filename;
	var fs = api.require('fs');
	fs.exist({
		path : path
	}, function(ret, err) {
		if (ret.exist) {
			if (ret.directory) {//是文件夹

			} else {
				/*
				var deviceType = COMMON_IsAnroidOrIOS();
				if (deviceType == CONSTANT_OS.ANDROID) {
					filePath = api.cacheDir + '/' + filename;
				} else {
					filePath = api.cacheDir + '/' + filename;
				}
				*/
				filePath = api.cacheDir + '/' + filename;
				$api.attr(imgEle, 'src', filePath);
			}
		} else {
			api.download({
				url : url,
				savePath : path,
				report : false,
				cache : true
			}, function(ret, err) {
				if (ret) {
					var value = ('文件大小：' + ret.fileSize + '；下载进度：' + ret.percent + '；下载状态' + ret.state + '存储路径: ' + ret.savePath);
					if (ret.fileSize == 0) {
						fs.remove({
							path : path
						}, function(ret, err) {
							//coding...
						});
					} else {
						filePath = ret.savePath;
						///storage/sdcard/UZMap/A6927147294696/cache/AA9V2GM04_1.jpg
						///storage/sdcard/UZMap/A6927147294696/AA9V2GM04_1.jpg
						$api.attr(imgEle, 'src', filePath);
					}
				}
			});
		}
	});
}

function COMMON_GetFileNameByUrl(url) {
	if (url) {
		var urlStr = url;
		if (urlStr.indexOf('/') > 0) {
			urlStr = urlStr.substring(urlStr.lastIndexOf('/') + 1);
		}
		if (urlStr.indexOf('&') > 0) {
			urlStr = urlStr.substring(0, urlStr.indexOf('&'));
		}
		return urlStr;
	} else {
		return url;
	}
}

function COMMON_UISearchBar(fnSucCallback) {
	var UISearchBar = api.require('UISearchBar');
	UISearchBar.open({
		placeholder : 'search',
		historyCount : 10,
		showRecordBtn : false,
		texts : {
			cancelText : 'Cancel',
			clearText : 'clear search history'
		},
		styles : {
			navBar : {
				bgColor : '#F1F1F1',
				borderColor : '#DDD'
			},
			searchBox : {
				bgImg : 'widget://image/common/search_bg.png',
				color : '#555',
				height : 40
			},
			cancel : {
				bg : '#F1F1F1',
				color : '#1B7BEA',
				size : 14
			},
			list : {
				color : '#555',
				bgColor : '#FFFFFF',
				borderColor : '#eee',
				size : 14
			},
			clear : {
				color : '#1B7BEA',
				borderColor : '#DDD',
				size : 14
			}
		}
	}, function(ret, err) {
		if (ret) {
			fnSucCallback(ret);
		} else {
			COMMON_toastError();
		}

		if (err) {
			COMMON_toastError();
		}
	});
}

/*点击返回发按钮返回上一页*/
function back() {
	api.closeWin({});
}

//判断网络是否可用
function COMMON_IsNetWorkAvalible() {
	var connectionType = api.connectionType;
	if (connectionType == 'none') {
		api.toast({
			msg : 'The network unavailable. Check your network settings.',
			duration : CONSTANT_TOAST_DURATION
		});
		return false;
	} else {
		return true;
	}
}

function COMMON_GetCurrentDate() {
	var date = new Date();
	var month = date.getMonth() + 1;
	month = month < 10 ? '0' + month : month;
	var day = date.getDate();
	day = day < 10 ? '0' + day : day;
	return date.getFullYear() + '-' + month + '-' + day;
}

/**
 *计算两个日期相差的天数，日期的格式为yyyy-MM-dd
 */
function COMMON_DateDiff(sDate1, sDate2) {
	var aDate, oDate1, oDate2, iDays
	aDate = sDate1.split("-")
	oDate1 = new Date(aDate[1] + '-' + aDate[2] + '-' + aDate[0])//转换为12-18-2006格式
	aDate = sDate2.split("-")
	oDate2 = new Date(aDate[1] + '-' + aDate[2] + '-' + aDate[0])
	iDays = parseInt(Math.abs(oDate1 - oDate2) / 1000 / 60 / 60 / 24)//把相差的毫秒数转换为天数
	return iDays
}
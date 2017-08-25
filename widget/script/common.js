//国际化
$(function() {
	var $language = $api.getStorage("language");
	jQuery.i18n.properties({
		name : 'language_' + $language, //资源文件名称
		path : '../res/i18n/', //资源文件路径
		mode : 'map', //用Map的方式使用资源文件中的值
		language : $language,
		callback : function() {
			//加载成功后设置显示内容
			$('.i18n_label').each(function(ele, index) {
				$(this).html($.i18n.prop($(this).attr('id')));
			});
		}
	});
});

/*点击返回发按钮返回上一页*/
function back() {
	api.closeWin({});
}

//返回到首页
function COMMON_BackToRoot() {
	api.closeToWin({
		name : 'main_page'
	});
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

//判断是android还是IOS
function COMMON_IsAnroidOrIOS() {
	var systemType = api.systemType;
	if (systemType == 'ios') {
		return CONSTANT_OS.IOS;
	} else if (systemType == 'android') {
		return CONSTANT_OS.ANDROID;
	}
}

/************************************** 网络请求 START **************************************/
//请求计数器，每发起一个请求就加1，完成就减1，当变成0时，说明所有的请求都请求完毕，让loading消失
var _ajaxReqNum = 0;


/**
 * 封装的post请求：加了网络提示和加载提示
 * @param {Object} url
 * @param {Object} data
 * @param {Object} fnSuc
 * @param {Object} dataType
 */
function COMMON_Ajax_Post(url, data, fnSuc, dataType) {
	var connectionType = api.connectionType;
	if (connectionType == 'none') {
		api.toast({
			msg : 'The network unavailable! Check your network settings.',
			duration : CONSTANT_TOAST_DURATION
		});
		return;
	}
	
	if(_ajaxReqNum == 0){
		api.showProgress({
			title : 'Loading...',
			text : 'Please wait'
		});
	}
	
	_ajaxReqNum++;

	/*
	 $api.post(url, 'timeout:10' ,data, function(ret) {
	 fnSuc(ret);
	 api.hideProgress();
	 }, dataType);
	 */
	if (!dataType) {
		dataType = 'json';
	}
	
	//TODO 添加参数token
	if(!data.values){
		data.values = {};
	}
	data.values['phoneCode'] = api.deviceId;
	
	api.ajax({
		url : url,
		method : 'post',
		timeout : 90,
		data : data,
		dataType : dataType
	}, function(ret, err) {
		if (ret) {	
			//TODO 判断token是否过期
			if(ret.result != null && !ret.result && (ret.msg=='Your account is logged in on other phone.')){
				var _isTokenValid = $api.getStorage('_isTokenValid');
				if(_isTokenValid == 'false'){
					return;
				}
				$api.setStorage('_isTokenValid', 'false');
				
				var width = api.winWidth - 80;
				var dialogBox = api.require('dialogBox');
				dialogBox.alert({
					texts : {
						title : ' Offline Notice',
						content : 'Your acoount is logged in on another device.',
						leftBtnTitle : 'Exit',
						rightBtnTitle : 'Relogin'
					},
					styles : {
						bg : '#fff',
						w : width,
						title : {
							marginT : 20,
							icon : 'widget://image/common/tip.png',
							iconSize : 20,
							titleSize : 16,
							titleColor : '#555555'
						},
						tapClose: true,
						corner: 2,  
						content : {
							color : '#757575',
							size : 14
						},
						left : {
				marginB : -10,
				marginL : 0,
				w : width / 2,
				h : 40,
				corner : 0,
				bg : '#f1f1f1',
				size : 14,
				color : '#555'
			},
			right : {
				marginB : 0,
				marginL : 0,
				w : width / 2,
				h : 40,
				corner : 0,
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
						
						$api.setStorage('autoLogin', 0);
						api.rebootApp();
					} else {
						var dialogBox = api.require('dialogBox');
						dialogBox.close({
							dialogName : 'alert'
						});
						api.rebootApp();
					}
				});
				return;
			}
			
			fnSuc(ret);
		}
		if (err) {
			fnSuc(null, err);
			var code = err.code;
			if (code == '0') {//Connection Error.
				api.toast({
					msg : 'The server is not responding.',
					duration : CONSTANT_TOAST_DURATION
				});
			} else if (code == '1') {
				api.toast({
					msg : 'Connection Timeouts',
					duration : CONSTANT_TOAST_DURATION
				});
			} else if (code == '2') {
				api.toast({
					msg : 'Authorization Error',
					duration : CONSTANT_TOAST_DURATION
				});
			} else if (code == '3') {
				api.toast({
					msg : 'Data Type Error',
					duration : CONSTANT_TOAST_DURATION
				});
			} else {
				api.toast({
					msg : 'The server is not responding.',
					duration : CONSTANT_TOAST_DURATION
				});
			}
		}

		_ajaxReqNum--;
		if (_ajaxReqNum == 0) {
			api.hideProgress();
		}
	});

}

function COMMON_Ajax_Post_NoLoading(url, data, fnSuc, dataType) {
	var connectionType = api.connectionType;
	if (connectionType == 'none') {
		api.toast({
			msg : 'The network unavailable! Check your network settings.',
			duration : CONSTANT_TOAST_DURATION
		});
		return;
	}

	/*
	 $api.post(url, 'timeout:10' ,data, function(ret) {
	 fnSuc(ret);
	 api.hideProgress();
	 }, dataType);
	 */
	if (!dataType) {
		dataType = 'json';
	}
	
	//TODO 添加参数token
	if(!data.values){
		data.values = {};
	}
	data.values['phoneCode'] = api.deviceId;
	
	api.ajax({
		url : url,
		method : 'post',
		timeout : 90,
		data : data,
		dataType : dataType
	}, function(ret, err) {
		if (ret) {
			
			//判断token是否有效
			if(ret.result != null && !ret.result && (ret.msg=='Your account is logged in on other phone.')){
				var _isTokenValid = $api.getStorage('_isTokenValid');
				if(_isTokenValid == 'false'){
					return;
				}
				$api.setStorage('_isTokenValid', 'false');
				
				
				var width = api.winWidth - 80;
				var dialogBox = api.require('dialogBox');
				dialogBox.alert({
					texts : {
						title : ' Offline Notice',
						content : 'Your acoount is logged in on another device.',
						leftBtnTitle : 'Exit',
						rightBtnTitle : 'Relogin'
					},
					styles : {
						bg : '#fff',
						w : width,
						title : {
							marginT : 20,
							icon : 'widget://image/common/tip.png',
							iconSize : 20,
							titleSize : 16,
							titleColor : '#555555'
						},
						tapClose: true,
						corner: 2,  
						content : {
							color : '#757575',
							size : 14
						},
						left : {
				marginB : -10,
				marginL : 0,
				w : width / 2,
				h : 40,
				corner : 0,
				bg : '#f1f1f1',
				size : 14,
				color : '#555'
			},
			right : {
				marginB : 0,
				marginL : 0,
				w : width / 2,
				h : 40,
				corner : 0,
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
						
						$api.setStorage('autoLogin', 0);
						api.rebootApp();
					} else {
						var dialogBox = api.require('dialogBox');
						dialogBox.close({
							dialogName : 'alert'
						});
						api.rebootApp();
					}
				});
				return;
			}
			
		    fnSuc(ret);
		}
		
		if (err) {
			var code = err.code;
			if (code == '0') {//Connection Error.
				api.toast({
					msg : 'The server is not responding.',
					duration : CONSTANT_TOAST_DURATION
				});
			} else if (code == '1') {
				api.toast({
					msg : 'Connection Timeouts',
					duration : CONSTANT_TOAST_DURATION
				});
			} else if (code == '2') {
				api.toast({
					msg : 'Authorization Error',
					duration : CONSTANT_TOAST_DURATION
				});
			} else if (code == '3') {
				api.toast({
					msg : 'Data Type Error',
					duration : CONSTANT_TOAST_DURATION
				});
			} else {
				api.toast({
					msg : 'The server is not responding.',
					duration : CONSTANT_TOAST_DURATION
				});
			}
		}
	});
}

/**
 * 封装的get请求：加了网络提示和加载提示
 * @param {Object} url
 * @param {Object} data
 * @param {Object} fnSuc
 * @param {Object} dataType
 */
function COMMON_Ajax_Get(url, fnSuc, dataType) {
	var connectionType = api.connectionType;
	if (connectionType == 'none') {
		api.toast({
			msg : 'The network unavailable! Check your network settings.',
			duration : CONSTANT_TOAST_DURATION
		});
		return;
	}
	
	if (!dataType) {
		dataType = 'json';
	}
	
	//TODO 添加参数token
	url += '&phoneCode='+api.deviceId;
	
	api.ajax({
		url : url,
		method : 'get',
		timeout : 15,
		dataType : dataType
	}, function(ret, err) {
		
		//判断token是否有效
		if (ret) {
			if(ret.result != null && !ret.result && (ret.msg=='Your account is logged in on other phone.')){
				var _isTokenValid = $api.getStorage('_isTokenValid');
				if(_isTokenValid == 'false'){
					return;
				}
				$api.setStorage('_isTokenValid', 'false');
				
				var width = api.winWidth - 80;
				var dialogBox = api.require('dialogBox');
				dialogBox.alert({
					texts : {
						title : ' Offline Notice',
						content : 'Your acoount is logged in on another device.',
						leftBtnTitle : 'Exit',
						rightBtnTitle : 'Relogin'
					},
					styles : {
						bg : '#fff',
						w : width,
						title : {
							marginT : 20,
							icon : 'widget://image/common/tip.png',
							iconSize : 20,
							titleSize : 16,
							titleColor : '#555555'
						},
						tapClose: true,
						corner: 2,  
						content : {
							color : '#757575',
							size : 14
						},
						left : {
				marginB : -10,
				marginL : 0,
				w : width / 2,
				h : 40,
				corner : 0,
				bg : '#f1f1f1',
				size : 14,
				color : '#555'
			},
			right : {
				marginB : 0,
				marginL : 0,
				w : width / 2,
				h : 40,
				corner : 0,
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
						
						$api.setStorage('autoLogin', 0);
						api.rebootApp();
					} else {
						var dialogBox = api.require('dialogBox');
						dialogBox.close({
							dialogName : 'alert'
						});
						api.rebootApp();
					}
				});
				return;
			}
			
			fnSuc(ret);
		}

		if (err) {
			var code = err.code;
			if (code) {
				if (code == '0') {
					api.toast({
						msg : 'Connection Error',
						duration : CONSTANT_TOAST_DURATION
					});
				} else if (code == '1') {
					api.toast({
						msg : 'Connection Timeouts',
						duration : CONSTANT_TOAST_DURATION
					});
				} else if (code == '2') {
					api.toast({
						msg : 'Authorization Error',
						duration : CONSTANT_TOAST_DURATION
					});
				} else if (code == '3') {
					api.toast({
						msg : 'Data Type Error',
						duration : CONSTANT_TOAST_DURATION
					});
				} else {
					api.toast({
						msg : 'The network unavailable! Check your network settings.',
						duration : CONSTANT_TOAST_DURATION
					});
				}
			} else {
				api.toast({
					msg : 'The network unavailable! Check your network settings.',
					duration : CONSTANT_TOAST_DURATION
				});
			}
		}
	});

}

/************************************** 网络请求 END **************************************/

/************************************** 时间处理 START **************************************/
//格式化ms类型的日期
function COMMON_FormatTimeToDate(time) {
	if (time) {
		var date = new Date(time);
		var year = date.getYear();
		if (year < 2000) {
			year = year + 1900;
		}
		var month = date.getMonth() + 1;
		month = month < 10 ? '0' + month : month;
		var day = date.getDate();
		day = day < 10 ? '0' + day : day;
		var hour = date.getHours();
		var minute = date.getMinutes();
		return year + '-' + month + '-' + day;
	} else {
		return "";
	}
}

function COMMON_FormatTimeToTime(time) {
	if (time) {
		var date = new Date(time);
		var year = date.getUTCFullYear();
		if (year < 2000) {
			year = year + 1900;
		}
		var month = date.getUTCMonth() + 1;
		month = month < 10 ? '0' + month : month;
		var day = date.getUTCDate();
		day = day < 10 ? '0' + day : day;
		
		var hour = date.getHours();
		hour = hour < 10 ? '0' + hour : hour;
		var minute = date.getMinutes();
		minute = minute < 10 ? '0' + minute : minute;
		var currentYear = new Date().getUTCFullYear();
		if(currentYear == year){
			return month + '-' + day + ' ' + hour + ':' + minute;
		}else{
			return year + '-' + month + '-' + day + ' ' + hour + ':' + minute;
		}
	} else {
		return "";
	}
}

//校验日期是否正确
function COMMON_checkDate(INDate) {
	if (INDate == "") {
		return false;
	}
	if (INDate.indexOf('-', 0) != -1) {
		separate = "-"
	} else {
		if (INDate.indexOf('/', 0) != -1) {
			separate = "/"
		} else {
			return false;
		}
	}
	area = INDate.indexOf(separate, 0)
	//获取年份
	subYY = INDate.substr(0, area)
	if (isNaN(subYY) || subYY <= 0) {
		return false;
	}
	//转换月份
	subMM = INDate.substr(area + 1, INDate.indexOf(separate, area + 1) - (area + 1))
	if (isNaN(subMM) || subMM <= 0) {
		return false;
	}
	if (subMM.length < 2) {
		subMM = "0" + subMM
	}
	//转换日
	area = INDate.lastIndexOf(separate)
	subDD = INDate.substr(area + 1, INDate.length - area - 1)
	if (isNaN(subDD) || subDD <= 0) {
		return false;
	}
	if (eval(subDD) < 10) {
		subDD = "0" + eval(subDD)
	}
	NewDate = subYY + "-" + subMM + "-" + subDD
	if (NewDate.length != 10) {
		return false;
	}
	if (NewDate.substr(4, 1) != "-") {
		return false;
	}
	if (NewDate.substr(7, 1) != "-") {
		return false;
	}
	var MM = NewDate.substr(5, 2);
	var DD = NewDate.substr(8, 2);
	if ((subYY % 4 == 0 && subYY % 100 != 0) || subYY % 400 == 0) {//判断是否为闰年
		if (parseInt(MM) == 2) {
			if (DD > 29) {
				return false;
			}
		}
	} else {
		if (parseInt(MM) == 2) {
			if (DD > 28) {
				return false;
			}
		}
	}
	var mm = new Array(1, 3, 5, 7, 8, 10, 12);
	//判断每月中的最大天数
	for ( i = 0; i < mm.length; i++) {
		if (parseInt(MM) == mm[i]) {
			if (parseInt(DD) > 31) {
				return false;
			} else {
				return true;
			}
		}
	}
	if (parseInt(DD) > 30) {
		return false;
	}
	if (parseInt(MM) > 12) {
		return false;
	}
	return true;
}

function COMMON_GetCurrentTime() {
	var date = new Date();
	var month = date.getMonth() + 1;
	month = month < 10 ? '0' + month : month;
	var day = date.getDate();
	day = day < 10 ? '0' + day : day;
	var hour = date.getHours();
	hour = hour < 10 ? '0' + hour : hour;
	var miniute = date.getMinutes();
	miniute = miniute < 10 ? '0' + miniute : miniute;
	return date.getFullYear() + '-' + month + '-' + day + ' ' + hour + ':' + miniute;
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

/************************************** 时间处理 END **************************************/

/************************************** 正则表达式 START **************************************/
//验证是否是正整数
function COMMON_ValidPositiveInt(num) {
	var reg = new RegExp("^[0-9]*[1-9][0-9]*$");
	if (!reg.test(num)) {
		return false;
	} else {
		return true;
	}
}

/**
 *验证钱的格式是否有误
 * @param {Object} money
 */
function COMMON_MoneyValid(money) {
	var reg = /(^[1-9]([0-9]+)?(\.[0-9]{1,2})?$)|(^(0){1}$)|(^[0-9]\.[0-9]([0-9])?$)/;
	if (reg.test(money)) {
		return true;
	} else {
		return false;
	};
}

/************************************** 正则表达式 END **************************************/

/************************************** 提示信息 START **************************************/
//操作成功提示
function COMMON_toastSuccess(msg) {
	var toast = new auiToast({})
	if (!msg) {
		msg = "Success";
	}
	toast.success({
		title : msg,
		duration : 2000
	});
}

//操作失败提示
function COMMON_toastFail(msg) {
	var toast = new auiToast({})
	if (!msg) {
		msg = 'Failure';
	}
	toast.fail({
		title : msg,
		duration : 2000
	});
}

//发送错误提示
function COMMON_toastError(msg) {
	if (!msg) {
		msg = 'Error';
	}
	api.toast({
		msg : msg
	});
}

/************************************** 提示信息 END **************************************/

/************************************** 日期、搜索框、选择控件 START **************************************/
/**
 * ios滚轮列表选择控件
 * @param {Object} datas
 * @param {Object} fnSucCallback
 */
function COMMON_ActionSelector(datas, fnSucCallback) {
	if(datas && datas.length>0){
	var UIActionSelector = api.require('UIActionSelector');
	UIActionSelector.open({
		datas : datas,
		layout : {
			row : 3,
			col : 1,
			height : 30,
			size : 12,
			sizeActive : 14,
			rowSpacing : 5,
			colSpacing : 0,
			maskBg : 'rgba(0,0,0,0.2)',
			bg : '#fff',
			color : '#999',
			colorActive : '#555',
			colorSelected : '#555'
		},
		animation : true,
		cancel : {
			text : $.i18n.prop('cancel'),
			size : 12,
			w : 90,
			h : 35,
			bg : '#fff',
			bgActive : '#ccc',
			color : '#888',
			colorActive : '#fff'
		},
		ok : {
			text : $.i18n.prop('ok'),
			size : 12,
			w : 90,
			h : 35,
			bg : '#fff',
			bgActive : '#ccc',
			color : '#888',
			colorActive : '#fff'
		},
		title : {
			text : $.i18n.prop('choose'),
			size : 12,
			h : 44,
			bg : '#eee',
			color : '#888'
		},
		fixedOn : api.frameName
	}, function(ret, err) {
		if (ret) {
			if (ret.eventType == 'ok') {
				fnSucCallback(ret)
			}
		} else {
			COMMON_toastError();
		}

		if (err) {
			COMMON_toastError();
		}
	});
	}else{
		api.toast({
	        msg:'No option.'
        });
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
			clearText : $.i18n.prop('clear_search_log')
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

/*
 * 时间选择控件，可以选择年月日或者时间,返回值：year、month、day、hour、minute
 * @param {Object} type： 'date'-日期  'time'-时间  'date_time'-日期和时间，android不支持
 * @param {Object} date
 */
function COMMON_DatePicker(type, fnSucCallback) {
	api.openPicker({
		type : type,
		title : $.i18n.prop('selectDate')
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

//年月选择控件
function COMMON_YearMonthActionSelector(fnSucCallback) {
	var datas = [];
	var months = [{
		name : 1
	}, {
		name : 2
	}, {
		name : 3
	}, {
		name : 4
	}, {
		name : 5
	}, {
		name : 6
	}, {
		name : 7
	}, {
		name : 8
	}, {
		name : 9
	}, {
		name : 10
	}, {
		name : 11
	}, {
		name : 12
	}];

	var year = new Date().getFullYear();
	var maxYear = year + 100;
	var minYear = year - 100;
	for (var i = minYear; i < maxYear; i++) {
		datas.push({
			name : i,
			sub : months
		});
	}

	var UIActionSelector = api.require('UIActionSelector');
	UIActionSelector.open({
		datas : datas,
		actives : [100, 0],
		layout : {
			row : 6,
			col : 2,
			height : 30,
			size : 14,
			sizeActive : 16,
			rowSpacing : 5,
			colSpacing : 0,
			maskBg : 'rgba(0,0,0,0.2)',
			bg : '#fff',
			color : '#888',
			colorActive : '#555',
			colorSelected : '#555'
		},
		animation : true,
		cancel : {
			text : $.i18n.prop('cancel'),
			size : 12,
			w : 90,
			h : 35,
			bg : '#fff',
			bgActive : '#ccc',
			color : '#888',
			colorActive : '#fff'
		},
		ok : {
			text : $.i18n.prop('ok'),
			size : 12,
			w : 90,
			h : 35,
			bg : '#fff',
			bgActive : '#ccc',
			color : '#888',
			colorActive : '#fff'
		},
		title : {
			text : $.i18n.prop('choose'),
			size : 12,
			h : 44,
			bg : '#eee',
			color : '#888'
		},
		fixedOn : api.frameName
	}, function(ret, err) {
		if (ret) {
			if (ret.eventType == 'ok') {
				fnSucCallback(ret)
			}
			if (ret.eventType == 'cancel') {

			}
		} else {
			COMMON_toastError();
		}

		if (err) {
			COMMON_toastError();
		}
	});
}

/************************************** 日期、搜索框、选择控件 END **************************************/

/**
 * 将数值四舍五入(保留2位小数)后格式化成金额形式
 *
 * @param num 数值(Number或者String)
 * @return 金额格式的字符串,如'1,234,567.45'
 * @type String
 */
function COMMON_COMMON_FormatCurrency(num) {
	try{
		num = num.toString().replace(/\$|\,/g, '');
		if (isNaN(num))
			num = "0";
		sign = (num == ( num = Math.abs(num)));
		num = Math.floor(num * 100 + 0.50000000001);
		cents = num % 100;
		num = Math.floor(num / 100).toString();
		if (cents < 10)
			cents = "0" + cents;
		for (var i = 0; i < Math.floor((num.length - (1 + i)) / 3); i++)
			num = num.substring(0, num.length - (4 * i + 3)) + ',' + num.substring(num.length - (4 * i + 3));
		return (((sign) ? '' : '-') + num + '.' + cents);
	}catch(e){
		return "";
	}
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

/**
 * 根据url获取文件名
 */
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

/**
 * 根据url获取文件类型
 */
function COMMON_GetFileType(url) {
	if (url) {
		var urlStr = url;
		if (urlStr.indexOf('.') > 0) {
			urlStr = urlStr.substring(urlStr.lastIndexOf('.') + 1);
		}
		if (urlStr.indexOf('&') > 0) {
			urlStr = urlStr.substring(0, urlStr.indexOf('&'));
		}
		urlStr = urlStr.toUpperCase();

		if (urlStr == 'JPG' || urlStr == 'JPEG' || urlStr == 'PNG' || urlStr == 'GIF') {
			return CONSTANT_FILE_TYPE.IMAGE;
		} else if (urlStr == 'DOC' || urlStr == 'DOCX') {
			return CONSTANT_FILE_TYPE.WORD;
		} else if (urlStr == 'PDF') {
			return CONSTANT_FILE_TYPE.PDF;
		} else if (urlStr == 'XLS' || urlStr == 'XLSX') {
			return CONSTANT_FILE_TYPE.EXCEL;
		} else if (urlStr == 'TXT') {
			return CONSTANT_FILE_TYPE.TXT;
		} else {
			return "";
		}
	} else {
		return "";
	}
}

/**
 * 缓存图片
 * @param {Object} url
 * /var/mobile/Containers/Data/Application/62A0ACC0-98EA-408A-A70E-915F5ED57DCB/Library/Caches/APICloud/Cache/BH0331E9E_1.jpg
 * /var/mobile/Containers/Data/Application/62A0ACC0-98EA-408A-A70E-915F5ED57DCB/Library/Caches/APICloud/Cache
 * /var/mobile/Applications/6F4D7564-F743-4FFD-A888-F270A8B052BF/Library/Caches/APICloud/Cache
 * /var/mobile/Containers/Data/Application/62A0ACC0-98EA-408A-A70E-915F5ED57DCB/Library/Caches/APICloud/Cache/B30G1VE6K_1.jpg
 * /var/mobile/Containers/Data/Application/62A0ACC0-98EA-408A-A70E-915F5ED57DCB/Library/Caches/APICloud/Cache/B30G1VE6K_1.jpg
 */
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
					filePath = api.cacheDir + '/cache/' + filename;
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
						$api.attr(imgEle, 'src', filePath);
					}
				}
			});
		}
	});
}

//过滤掉富文本编辑器的标签（html标签，图片，换行，回车等）
function COMMON_FilterRichTextTag(content) {
	return content.replace(/(\n)/g, "").replace(/(\t)/g, "").replace(/(\r)/g, "").replace(/<\/?[^>]*>/g, "").replace(/\s*/g, "");
}

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

function COMMON_ShowConfirm(msg, callback) {
	var width = api.winWidth - 80;
	var dialogBox = api.require('dialogBox');
	dialogBox.alert({
		texts : {
			title : ' Tip',
			content : msg,
			leftBtnTitle : 'Cancel',
			rightBtnTitle : 'Ok'
		},
		styles : {
			bg : '#fff',
			w : width,
			title : {
				marginT : 20,
				icon : 'widget://image/common/tip.png',
				iconSize : 20,
				titleSize : 16,
				titleColor : '#555555'
			},
			tapClose: true,
			corner: 0,  
			content : {
				color : '#757575',
				size : 14
			},
			left : {
				marginB : -10,
				marginL : 0,
				w : width / 2,
				h : 40,
				corner : 0,
				bg : '#f1f1f1',
				size : 14,
				color : '#555'
			},
			right : {
				marginB : 0,
				marginL : 0,
				w : width / 2,
				h : 40,
				corner : 0,
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
		} else {
			var dialogBox = api.require('dialogBox');
			dialogBox.close({
				dialogName : 'alert'
			});
			callback();
		}
	});
}

function COMMON_ShowFailure(msg) {
	if(!msg){
		msg = 'Submit Failure'
	}
	var width = api.winWidth - 80;
		var dialogBox = api.require('dialogBox');
		dialogBox.alert({
			texts : {
				title : ' Tip',
				content : msg,
				leftBtnTitle : 'Ok',
			},
			styles : {
				bg : '#fff',
				w : width,
				title : {
					marginT : 20,
					icon : 'widget://image/common/failure.png',
					iconSize : 20,
					titleSize : 16,
					titleColor : '#555555'
				},
				tapClose: true,
				corner: 2,  
				content : {
					color : '#757575',
					size : 14
				},
				left : {
					marginB : 10,
					marginL : (width - (width / 2 - 30)) / 2,
					w : width / 2 - 30,
					h : 30,
					corner : 14,
					bg : '#1B7BEA',
					size : 14,
					color : '#fff'
				}
			}
		}, function(ret) {
			var dialogBox = api.require('dialogBox');
			dialogBox.close({
				dialogName : 'alert'
			});
		});
}

function COMMON_actionSheet(title, buttons, funCallback){
	if(buttons.length == 0){
		api.toast({
	        msg:'No Option.'
        });
        return;
	}
	
	api.actionSheet({
		style: {
			fontNormalColor: '#1B7BEA',
			titleFontColor: '#555'
		},
		title: title,
		cancelTitle: 'Cancel',
		buttons: buttons
    },function(ret,err){
    	if (ret) {
    		if(ret.buttonIndex < buttons.length + 1){
    			funCallback(ret.buttonIndex - 1);
    		}
		}
    });
}

function scrollToTop(){
	var x=document.body.scrollTop||document.documentElement.scrollTop; 
	window.scrollTo(0,0); 
}

/*
 * 单点登录
 * 1.登录时，把设备id传给pc,登录后，pc给返回token
 * 2.Logout后，清除token
 * 3.每次请求都带着token,如果发现token失效，提示账号已在其他设备登录，跳转到登录页面
 */
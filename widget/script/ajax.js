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
	
	if(_ajaxReqNum == 1){
		 setTimeout(function(){
		 
		 }, 1000);
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

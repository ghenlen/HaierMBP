/************************************** 获取登陆者的信息 START **************************************/
function BUSINESS_GetLoginUserInfo() {
	var userInfo = $api.getStorage("userInfo");
	return userInfo;
}

function BUSINESS_GetRelations() {
	var userInfo = $api.getStorage("userInfo");
	var relations = userInfo.relations;
	if (relations.hasOwnProperty('user')) {
		return relations.user;
	} else {
		var orgCode = BUSINESS_GetOrgCode();
		return relations[orgCode];
	}
}

//判断用户的组织类型是SBU、BRANCH、REGION、HO
function BUSINESS_JudgeOrgType(){
	var userInfo = $api.getStorage("userInfo");
	var relations = userInfo.relations;
	if (relations.hasOwnProperty('user')) {
		return "SBU";
	} else {
		var org = $api.getStorage("org");
		return org.orgType;
	}
}

function BUSINESS_GetOrgId() {
	var org = $api.getStorage("org");
	return org.id;
}

function BUSINESS_GetOrgInnerCode() {
	var org = $api.getStorage("org");
	return org.orgInnerCode;
}

function BUSINESS_GetOrgCode() {
	var org = $api.getStorage("org");
	return org.orgCode;
}

function BUSINESS_GetOrgTitle() {
	var org = $api.getStorage("org");
	return org.orgTitle;
}

function BUSINESS_GetCurrentOrg() {
	var org = $api.getStorage("org");
	return org;
}

function BUSINESS_UpdateCurrentDealer(userId, dealer){
	$api.setStorage(userId+'_dealer', dealer);
}

function BUSINESS_GetCurrentDealer(userId){
	return $api.getStorage(userId+'_dealer');
}

/************************************** 获取登陆者的信息 END **************************************/

//获取客户余额
function BUSINESS_GetCustomerBalance(payCode, callback) {
	var url = ajaxReqHost + 'appGetCustomerBalance.ajax?payCode=' + payCode + '&companyCode=6620';
	COMMON_Ajax_Get(url, function(ret) {
		callback(ret);
	});
}

/**
 *打开顶部菜单
 */
function BUSINESS_OpenPopupMenu() {
	COMMON_openFrame({
		name : 'popupMenu',
		url : 'popupMenu.html',
		rect : {
			x : 0,
			y : 0,
			w : api.winWidth,
			h : api.winHeight
		},
		vScrollBarEnabled : false,
		animation : {
			type : 'movein',
			subType : 'from_right',
			duration : 200
		},
	});
}

//页面访问次数统计
function BUSINESS_PageAccessStatics() {
	var title = document.title;
	var customerCode = $api.getStorage("userInfo").customerCode;
	var ip = "";

	if (title != '') {
		var url = ajaxReqHost + 'appGetMessage.ajax';
		COMMON_Ajax_Post_NoLoading(url, {
			values : {
				'customerCode' : customerCode,
				'description' : title,
				'ip' : ''
			}
		}, function(ret) {
		});
	}
}

//获取首页的权限
function BUSINESS_GetHomePermissions() {
	var moudleCodes = ['102', '104', '105', '106', '111', '110', '113'];
	var permissions = $api.getStorage("permissions");
	if (permissions) {
		for (var i = 0; i < permissions.length; i++) {
			var code = permissions[i];
			if (moudleCodes.indexOf(code) >= 0) {
				$api.removeCls($api.byId('code_' + code), 'disable');
				var onclick1 = $api.attr($api.byId('code_' + code), 'onclick1');
				$api.attr($api.byId('code_' + code), 'onclick', onclick1);
			}

			if (code == '114') {
				$api.removeCls($api.byId('code_' + code), 'aui-hide');
				loadSalesTarget();
			}
		}
	}
}

function BUSINESS_GetMyPermissions() {
	var permissions = $api.getStorage("permissions");
	if (permissions) {
		for (var i = 0; i < permissions.length; i++) {
			var code = permissions[i];
			$api.removeCls($api.byId('code_' + code), 'aui-hide');
		}
	}
}

function BUSINESS_GetPopupPermissions() {
	var permissions = $api.getStorage("permissions");
	if (permissions) {
		for (var i = 0; i < permissions.length; i++) {
			var code = permissions[i];
			$api.removeCls($api.byId('code_' + code), 'aui-hide');
		}
	}
}

//批量获取产品价格（实时接口）
function BUSINESS_BachGetProductPrice(param, callback) {
	var productPriceUrl = ajaxReqHost + 'appGetProductsPrice.ajax';
	COMMON_Ajax_Post_NoLoading(productPriceUrl, {
		values : param
	}, function(ret) {
		callback(ret);
	});
}

//批量获取产品库存（实时接口）
function BUSINESS_BachGetProductStock(param, callback) {
	var productStockUrl = ajaxReqHost + 'appGetProductQty.ajax';
	COMMON_Ajax_Post_NoLoading(productStockUrl, {
		values : param
	}, function(ret) {
		callback(ret);
	});
}

//获取附件
function BUSINESS_GetAttachment(modelId, callback) {
	var url = ajaxReqHost + "appListFile.ajax"
	COMMON_Ajax_Post_NoLoading(url, {
		values : {
			modelId : modelId
		}
	}, function(ret) {
		callback(ret);
	});
}

//展示图片
function BUSINESS_ShowAttachment(fileUrl) {
	var fileType = COMMON_GetFileType(fileUrl);
	if (fileType == '') {
		api.toast({
			msg : 'The file format is not supported.'
		});
		return;
	}

	if (fileType == CONSTANT_FILE_TYPE.IMAGE) {
		return;
		var photoBrowser = api.require('photoBrowser');
		photoBrowser.open({
			images : [fileUrl],
			bgColor : '#000'
		}, function(ret, err) {
			if (ret) {
				if (ret.eventType == 'click') {
					photoBrowser.close();
				}
			}
		});
	} else if (fileType == CONSTANT_FILE_TYPE.WORD || fileType == CONSTANT_FILE_TYPE.EXCEL || fileType == CONSTANT_FILE_TYPE.PDF || fileType == CONSTANT_FILE_TYPE.TXT) {
		COMMON_CacheDoc(fileUrl);		
	}
}

function COMMON_CacheDoc(url) {
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
				filePath = api.cacheDir + '/' + filename;
				var docReader = api.require('docReader');
				
				docReader.open({
					path : filePath
				}, function(ret1, err1) {
					if(ret1 && !ret1.status){
						COMMON_toastError();
					}
		
					if(err1){
						if(err1.code == '1'){
							api.toast({
								msg : 'The file does not exist.'
							});
						}else if(err1.code == '2'){
							api.toast({
								msg : 'Please download the office software'
							});
						}else if(err1.code == '-1'){
							COMMON_toastError();
						}
					}
				});
			}
		} else {
			api.download({
				url : url,
				savePath : path,
				report : false,
				cache : true
			}, function(ret, err) {
				if (ret) {
					if (ret.fileSize == 0) {
						if(ret.statusCode=='404'){
							api.toast({
								msg : 'The file does not exist.'
							});
						}
						fs.remove({
							path : path
						}, function(ret, err) {
							//coding...
						});
					} else {
						filePath = ret.savePath;
						var docReader = api.require('docReader');
						docReader.open({
							path : filePath
						}, function(ret1, err1) {
							if(ret1 && !ret1.status){
								COMMON_toastError();
							}
				
							if(err1){
								if(err1.code == '1'){
									api.toast({
									msg : 'The file does not exist.'
								});
								}else if(err1.code == '2'){
									api.toast({
									msg : 'Please download the office software'
								});
								}else if(err1.code == '-1'){
									COMMON_toastError();
								}
							}
						});
					}
				}
			});
		}
	});
}

function log(tag, ret){
	console.info(tag+"===================="+$api.jsonToStr(ret));
}

function BUSINESS_GetCurrency(){
 var currency=$api.getStorage('currency') || 'Rs';
 return currency+'.';
}


var dialog = new auiDialog({});
var images = [];
var images1 = [];
var collecTypeData = [];
var collecTypeData2 = [];
var shopListData = [];
var photoBrowser;
var moudle = 1;
//1: 门店信息   2：竞品信息
apiready = function() {
	var $header = $api.dom('header');
	var $footer = $api.dom('footer');
	var headerHeight = $api.offset($header);
	var footerHeight = $api.offset($footer);
	var $main = $api.byId('main');
	//$api.css($main, 'padding-top:'+(50+headerHeight.h)+'px;margin-bottom:' + footerHeight.h + "px");

	//	api.addEventListener({
	//		name : 'swipeleft'
	//	}, function(ret, err) {
	//
	//		$api.css($api.byId('onSiteContainer'), 'display: none');
	//		$api.css($api.byId('rivalProductContainer'), 'display: block');
	//	});
	//	api.addEventListener({
	//		name : 'swiperight'
	//	}, function(ret, err) {
	//
	//		$api.css($api.byId('onSiteContainer'), 'display: block');
	//		$api.css($api.byId('rivalProductContainer'), 'display: none');
	//	});

	api.addEventListener({
		name : 'selectedShopData'
	}, function(ret, err) {
		$api.val($api.byId('shopVal'), ret.value.id);
		$api.html($api.byId('shopText'), ret.value.title);
	});
	loadCollecTypeList();
	loadCollecTypeList2();
	//loadShopList();

	//统计页面访问次数
	BUSINESS_PageAccessStatics();

	var amapLocation = api.require('aMapLocation');
	var param = {
		accuracy : 100,
		filter : 1,
		autoStop : true
	};
	amapLocation.startLocation(param, function(ret, err) {
		if (ret.status) {
			$api.html($api.byId('shopLocationVal'), cutString(ret.longitude + '') + ',' + cutString(ret.latitude + ''));
			$api.html($api.byId('rivalLocationVal'), cutString(ret.longitude + '') + ',' + cutString(ret.latitude + ''));
		} else {
			api.toast({
				msg : 'Location Failure!'
			});
		}
	});

	/*
	 var winHeight = window.innerHeight;
	 $(window).bind('resize',function(){
	 var winHeight1 = window.innerHeight;
	 if(winHeight1 < winHeight){
	 $('#footer').css('display','none');
	 $(window).scrollTop(80);
	 window.scrollTo(0, 80);
	 }else{
	 $('#footer').css('display','block');
	 }
	 });
	 */
	
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

//加载Collection Type数据
function loadCollecTypeList() {
	var url = ajaxReqHost + 'appGetDictionary.ajax';
	COMMON_Ajax_Post(url, {
		values : {
			dicType : 'SHOPINFO_CATEGORY'
		}
	}, function(ret) {
		if (ret && ret.length > 0) {
			for (var i = 0; i < ret.length; i++) {
				collecTypeData.push({
					'name' : ret[i].title,
					'id' : ret[i].code
				});
			}
			$api.val($api.byId('collecTypeVal'), collecTypeData[0].id);
			$api.html($api.byId('collecTypeText'), collecTypeData[0].name);
		} else {
		}
	});
}

function loadCollecTypeList2() {
	var url = ajaxReqHost + 'appGetDictionary.ajax';
	COMMON_Ajax_Post(url, {
		values : {
			dicType : 'COMPETE_CATEGORY'
		}
	}, function(ret) {
		if (ret && ret.length > 0) {
			for (var i = 0; i < ret.length; i++) {
				collecTypeData2.push({
					'name' : ret[i].title,
					'id' : ret[i].code
				});
			}
			$api.val($api.byId('collecTypeVal1'), collecTypeData2[0].id);
			$api.html($api.byId('collecTypeText1'), collecTypeData2[0].name);
		} else {
		}
	});
}

//加载门店列表
function loadShopList() {
	var url = ajaxReqHost + 'appListShop.ajax';
	COMMON_Ajax_Post(url, {
		title : ''
	}, function(ret) {
		if (ret) {
			var data = [];
			for (var i = 0; i < ret.length; i++) {
				data.push({
					'name' : ret[i].title,
					'id' : ret[i].id
				});

				if (i == 0) {
					$api.val($api.byId('shopVal'), ret[i].id);
					$api.html($api.byId('shopText'), ret[i].title);
				}
			}
			shopListData = data;
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
		quality : 80,
		saveToPhotoAlbum : true
	}, function(ret, err) {
		if (ret) {
			if (ret.data) {
				if (moudle == '1') {
					images.push(ret.data);
					var cloneObj = $api.byId('updImgTemplate').cloneNode(true);
					$api.attr($api.dom(cloneObj, 'img'), 'src', ret.data);
					$api.attr($api.dom(cloneObj, '.delete_flag'), 'onclick', 'removeImg(this, \'' + ret.data + '\')');
					$api.append($api.byId('imgs'), $api.html(cloneObj));

				} else {
					images1.push(ret.data);

					var cloneObj = $api.byId('updImgTemplate').cloneNode(true);
					$api.attr($api.dom(cloneObj, 'img'), 'src', ret.data);
					$api.attr($api.dom(cloneObj, '.delete_flag'), 'onclick', 'removeImg(this, \'' + ret.data + '\')');
					$api.append($api.byId('rivalImgs'), $api.html(cloneObj));
				}
			}
		} else {
		}
	});
}

function browserImg() {
	var imagesTmp;
	if (moudle == '1') {
		imagesTmp = images;
	} else {
		imagesTmp = images1;
	}
	photoBrowser = api.require('photoBrowser');
	photoBrowser.open({
		images : imagesTmp,
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

function showCollectionTypeSelect(type) {
	var listData;
	if (type == 1) {
		listData = collecTypeData;
	} else if (type == 2) {
		listData = collecTypeData2;
	}

	var title = "";

	var buttons = [];
	for (var i = 0; i < listData.length; i++) {
		buttons.push(listData[i].name);
	}
	if (type == 1) {
		title = 'Selected: ' + $api.html($api.byId('collecTypeText'));
	} else if (type == 2) {
		title = 'Selected: ' + $api.html($api.byId('collecTypeText1'));
	}

	COMMON_actionSheet(title, buttons, function(ret) {
		if (type == 1) {
			$api.val($api.byId('collecTypeVal'), listData[ret].id);
			$api.html($api.byId('collecTypeText'), listData[ret].name);
		} else if (type == 2) {
			$api.val($api.byId('collecTypeVal1'), listData[ret].id);
			$api.html($api.byId('collecTypeText1'), listData[ret].name);
		}
	});

	return;

	COMMON_ActionSelector(listData, function(ret) {
		if (type == 1) {
			$api.val($api.byId('collecTypeVal'), ret.selectedInfo[0].id);
			$api.html($api.byId('collecTypeText'), ret.selectedInfo[0].name);
		} else if (type == 2) {
			$api.val($api.byId('collecTypeVal1'), ret.selectedInfo[0].id);
			$api.html($api.byId('collecTypeText1'), ret.selectedInfo[0].name);
		}
	});
}

function showShopSelect() {

	//COMMON_OpenWin({
	//	    name: 'info_shop_search',
	//	    url: 'info_shop_search.html'
	//  });
	//	COMMON_ActionSelector(shopListData, function(ret) {
	//		$api.val($api.byId('shopVal'), ret.selectedInfo[0].id);
	//		$api.html($api.byId('shopText'), ret.selectedInfo[0].name);
	//	});

	COMMON_OpenWin({
		name : 'info_shop_search',
		url : 'info_shop_search.html',
		pageParam : {
			winName : 'information',
			selected : $api.html($api.byId('shopText'))
		}
	});
}

function UPDATE_SHOP(param) {
	$api.html($api.byId('shopText'), param.title);
	$api.val($api.byId('shopVal'), param.id);
	$api.removeCls($api.byId('shopText'), 'gray_light');
	$api.addCls($api.byId('shopText'), 'aui-text-info');

}

function cutString(title) {
	var subTitle = '';
	if (title.length > 7) {
		subTitle = title.substring(0, 6);
	} else {
		subTitle = title;
	}
	return subTitle;
}

function showType(index) {
	if (index == 1) {
		$api.css($api.byId('onSiteContainer'), 'display: block');
		$api.css($api.byId('rivalProductContainer'), 'display: none');
		$api.css($api.byId('shopTab'), 'background-color: #ffffff');
		$api.css($api.byId('shopTab'), 'color: #615555');
		$api.attr($api.dom(".shop_img"), "src", "../image/info_collect/shop_selected3.png");
		$api.css($api.byId('productTab'), 'background-color: #dddddd');
		$api.css($api.byId('productTab'), 'color: #bfbfbf');
		$api.attr($api.dom(".product_img"), "src", "../image/info_collect/rival3.png");
		moudle = 1;
	} else if (index == 2) {
		$api.css($api.byId('onSiteContainer'), 'display: none');
		$api.css($api.byId('rivalProductContainer'), 'display: block');
		$api.css($api.byId('shopTab'), 'background-color: #dddddd');
		$api.css($api.byId('shopTab'), 'color: #bfbfbf');
		$api.attr($api.dom(".shop_img"), "src", "../image/info_collect/shop3.png");
		$api.css($api.byId('productTab'), 'background-color: #ffffff');
		$api.css($api.byId('productTab'), 'color: #615555');
		$api.attr($api.dom(".product_img"), "src", "../image/info_collect/rival_selected3.png");
		moudle = 2;

	}
}

function submit() {
	if (moudle == '1') {//上报门店信息
		if (images.length == 0) {
			api.toast({
				msg : 'Please upload pictures.'
			});
			return;
		}

		var content = $api.val($api.byId('content'));

		var onSiteTitle = $api.val($api.byId("onSiteTitle"));
		if ($api.trim(onSiteTitle) == '') {
			api.toast({
				msg : 'Please enter the Title!'
			});
			return;
		}
		if ($api.trim(content) == '') {
			api.toast({
				msg : 'Please enter the content!'
			});
			return;
		}

		var shopId = $api.val($api.byId('shopVal'));
		if (shopId == '') {
			api.toast({
				msg : 'Please enter the shop!'
			});
			return;
		}
		
		
		
		var uploadShopImgsUrl = ajaxReqHost + 'appupload.ajax';
		COMMON_Ajax_Post(uploadShopImgsUrl, {
			values : {
				id : '-1',
				label : 'information',
				type : 'information'
			},
			files : {
				Filedata : images
			}
		}, function(ret, err) {
			if (ret && ret.length > 0) {
				var collecType = $api.val($api.byId('collecTypeVal'));
				var date = new Date();
				var date_fmt = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate() + ' ' + date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds();
				var userInfo = $api.getStorage("userInfo");
				var userId = userInfo.id;
				var orgId = BUSINESS_GetOrgId();
				var userName = userInfo.name;
				var location = $api.html($api.byId('shopLocationVal'));
				var param = {
					'content' : content,
					'shop.id' : shopId,
					'submitDatetmp' : date_fmt,
					'org.id' : orgId,
					'userId' : userId,
					'userName' : userName,
					'location' : location,
					'title' : onSiteTitle,
					'category' : collecType,
					'categoryLabel' : $api.html($api.byId('collecTypeText'))
				}

				for (var i = 0; i < ret.length; i++) {
					var key = 'files[' + i + '].id';
					param[key] = ret[i].domain.id;
				}

				var saveShopInfoUrl = ajaxReqHost + 'appSaveShopInfo.ajax';
				COMMON_Ajax_Post(saveShopInfoUrl, {
					values : param
				}, function(saveRet) {
					api.hideProgress();
					if (saveRet && saveRet.result == true) {
						COMMON_toastSuccess();
						var updImgs = $api.domAll($api.byId('imgs'), '.upload_imgs');
						for (var k = 0; k < updImgs.length; k++) {
							$api.remove(updImgs[k]);
						}
						images = [];
						$api.val($api.byId('content'), '');
						$api.val($api.byId("onSiteTitle"), '');
					} else {
						COMMON_ShowFailure();
					}
				});
			} else {
				api.hideProgress();
				
				var collecType = $api.val($api.byId('collecTypeVal'));
				var date = new Date();
				var date_fmt = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate() + ' ' + date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds();
				var userInfo = $api.getStorage("userInfo");
				var userId = userInfo.id;
				var orgId = BUSINESS_GetOrgId();
				var userName = userInfo.name;
				var location = $api.html($api.byId('shopLocationVal'));
				var param = {
					'content' : content,
					'shop.id' : shopId,
					'shopTitle': $api.html($api.byId('shopText')),
					'submitDatetmp' : date_fmt,
					'org.id' : orgId,
					'userId' : userId,
					'userName' : userName,
					'location' : location,
					'title' : onSiteTitle,
					'category' : collecType,
					'categoryLabel' : $api.html($api.byId('collecTypeText'))
				}
				
				var obj = {
					type:'Information Collection',
					title:onSiteTitle,
					datas: $api.jsonToStr(param),
					url:'appSaveShopInfo.ajax',
					time: COMMON_GetCurrentTime(),
					images: images.toString()
				}
				
				var updImgs = $api.domAll($api.byId('imgs'), '.upload_imgs');
				for (var k = 0; k < updImgs.length; k++) {
					$api.remove(updImgs[k]);
				}
				images = [];
				$api.val($api.byId('content'), '');
				$api.val($api.byId("onSiteTitle"), '');
				
				operateFailureTip(obj);
			}
		});
	} else {//上报竞品信息
		var content = $api.val($api.byId('content1'));
		var rivalTitle = $api.val($api.byId("rivalTitle"));
		if ($api.trim(rivalTitle) == '') {
			api.toast({
				msg : 'Please enter the Title!'
			});
			return;
		}

		if ($api.trim(content) == '') {
			api.toast({
				msg : 'Please enter the content!'
			});
			return;
		}

		if (images1.length == 0) {
			api.toast({
				msg : 'Please upload pictures.'
			});
			return;
		}

		var uploadShopImgsUrl = ajaxReqHost + 'appupload.ajax';
		COMMON_Ajax_Post(uploadShopImgsUrl, {
			values : {
				id : '-1',
				label : 'information',
				type : 'information'
			},
			files : {
				Filedata : images1
			}
		}, function(ret, err) {
			if (ret && ret.length > 0) {
				var collecType = $api.val($api.byId('collecTypeVal1'));
				var date = new Date();
				var date_fmt = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate() + ' ' + date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds();
				var userInfo = $api.getStorage("userInfo");
				var userId = userInfo.id;
				var orgId = BUSINESS_GetOrgId();
				var userName = userInfo.name;
				var location = $api.html($api.byId('rivalLocationVal'));
				var param = {
					'content' : content,
					'submitDatetmp' : date_fmt,
					'org.id' : orgId,
					'userId' : userId,
					'userName' : userName,
					'location' : location,
					'title' : rivalTitle,
					'category' : collecType,
					'categoryLabel' : $api.html($api.byId('collecTypeText1'))
				}

				for (var i = 0; i < ret.length; i++) {
					var key = 'files[' + i + '].id';
					param[key] = ret[i].domain.id;
				}
				var saveShopInfoUrl = ajaxReqHost + 'appSaveCompeteInfo.ajax';
				COMMON_Ajax_Post(saveShopInfoUrl, {
					values : param
				}, function(saveRet) {
					if (saveRet && saveRet.result == true) {
						COMMON_toastSuccess();
						var updImgs = $api.domAll($api.byId('rivalImgs'), '.upload_imgs');
						for (var k = 0; k < updImgs.length; k++) {
							$api.remove(updImgs[k]);
						}
						images1 = [];
						$api.val($api.byId('content1'), '');
						$api.val($api.byId("rivalTitle"), '');
					} else {
						COMMON_ShowFailure();
					}
				});
			} else {
				api.hideProgress();
				
				var collecType = $api.val($api.byId('collecTypeVal1'));
				var date = new Date();
				var date_fmt = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate() + ' ' + date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds();
				var userInfo = $api.getStorage("userInfo");
				var userId = userInfo.id;
				var orgId = BUSINESS_GetOrgId();
				var userName = userInfo.name;
				var location = $api.html($api.byId('rivalLocationVal'));
				var param = {
					'content' : content,
					'submitDatetmp' : date_fmt,
					'org.id' : orgId,
					'userId' : userId,
					'userName' : userName,
					'location' : location,
					'title' : rivalTitle,
					'category' : collecType,
					'categoryLabel' : $api.html($api.byId('collecTypeText1'))
				}
				
				var obj = {
					type:'Information Collection',
					title:rivalTitle,
					datas: $api.jsonToStr(param),
					url:'appSaveCompeteInfo.ajax',
					time: COMMON_GetCurrentTime(),
					images: images1.toString()
				}
				
				var updImgs = $api.domAll($api.byId('rivalImgs'), '.upload_imgs');
				for (var k = 0; k < updImgs.length; k++) {
					$api.remove(updImgs[k]);
				}
				images1 = [];
				$api.val($api.byId('content1'), '');
				$api.val($api.byId("rivalTitle"), '');
				operateFailureTip(obj);
			}
		});

	}
}

function operateFailureTip(obj) {
	var width = api.winWidth - 80;
	var dialogBox = api.require('dialogBox');
	dialogBox.alert({
		texts : {
			title : ' Operate Failure Tip',
			content : 'The network is not good, resubmit or add to task list?',
			leftBtnTitle : 'Resubmit',
			rightBtnTitle : 'Add To Task'
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
			tapClose : true,
			corner : 0,
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
			submit();
		} else {
			var dialogBox = api.require('dialogBox');
			dialogBox.close({
				dialogName : 'alert'
			});
			var sql = "insert into task_list(type, title, datas, images, time, url) values('"+obj.type+"','"+obj.title+"','"+obj.datas+"','"+obj.images+"','"+obj.time+"','"+obj.url+"')";
			var db = api.require('db');
			db.executeSql({
				name : 'data',
				sql : sql
			}, function(ret, err) {
				if (ret && ret.status) {
					COMMON_toastSuccess();
				}
			});
		}
	});
}
var headerHeight;
var productId = '';
var customerId = "";
var customerCode = "";
var saleOffice = "";
var orgCode = "";
var slidePicHeight;
var UIScrollPicture;
var userInfo = $api.getStorage("userInfo");
var currency = BUSINESS_GetCurrency();
var scrollPicIndex = 0;
var scrollPicTotal = 0;
var isWishList = false;
var photoBrowser;
var slideImgList = [];
apiready = function() {
	var $header = $api.dom('header');
	$api.fixIos7Bar($header);
	$api.fixStatusBar($header);
	headerHeight = $api.offset($header);
	var width = api.winWidth;
	slidePicHeight = api.winWidth - 160;

	$api.css($api.byId('leftArraw'), 'height:' + slidePicHeight + 'px');
	$api.css($api.byId('leftArraw'), 'line-height:' + slidePicHeight + 'px');
	$api.css($api.byId('rightArraw'), 'height:' + slidePicHeight + 'px');
	$api.css($api.byId('rightArraw'), 'line-height:' + slidePicHeight + 'px');
	$api.css($api.byId('prouuctdate_img'), 'width:' + width + 'px');
	$api.css($api.byId('basicInfo'), 'margin-top:' + (slidePicHeight) + 'px');

	COMMON_openFrame({
		name : 'product_detail_head',
		url : 'product_detail_head.html',
		rect : {
			x : 0,
			y : 0,
			w : api.winWidth,
			h : headerHeight.h
		},
		animation : CONSTANT_FRAME_ANIMATION
	});

	productId = api.pageParam.productId;
	customerId = api.pageParam.customerId;
	customerCode=api.pageParam.customerCode;
	orgCode = api.pageParam.orgCode;
	saleOffice = api.pageParam.saleOffice;

	var tab = new auiTab({
		element : document.getElementById("detailTab"),
		index : 1,
		repeatClick : false
	}, function(ret) {
		if (ret.index == 1) {
			$api.css($api.byId('content_etails'), 'display:block');
			$api.css($api.byId('product_parameters'), 'display:none');
		} else if (ret.index == 2) {
			$api.css($api.byId('content_etails'), 'display:none');
			$api.css($api.byId('product_parameters'), 'display: block');
		}
	});

	COMMON_Ajax_Post(ajaxReqHost + 'appGetProduct.ajax?id=' + productId, {
	}, function(ret) {
		if (ret) {
			var productBasicInfo = ret.product;
			if (productBasicInfo) {
				$api.html($api.byId("productTitle"), productBasicInfo.title);
				$api.html($api.byId("product_saleTitle"), productBasicInfo.saleTitle);
				$api.html($api.byId("product_code"), productBasicInfo.code);
				
				
				//拉页图
				var foldOverImg = productBasicInfo.contents || '';
				foldOverImg = foldOverImg.replace(new RegExp(/(img)/g), 'img onclick="boostImage(this)" style="margin-bottom: -7px;;padding:0;" width="100%" ');
				$api.html($api.byId('content_etails'), foldOverImg);

				var priceParam = {
					orgCode : CONSTANT_SALE_COMPANY_CODE, 
					saleOffice: saleOffice,
					plant: '',
					customerCode : customerCode,
					productCodes : productBasicInfo.code
				};
				var permissions = $api.getStorage("permissions");
				if (permissions.indexOf(CONSTANT_AUTH_PRICE_STOCK_CODE) >= 0) {
					//获取产品价格
					BUSINESS_BachGetProductPrice(priceParam, fillProductPrice);
				}
			}

			//轮播图
			var slideImgs = ret.productImage;
			if (slideImgs && slideImgs.length > 0) {
				for (var i = 0; i < slideImgs.length; i++) {
					var imgSrc = CONSTANT_IMG_CROP_URL + slideImgs[i].path + '&width=' + Math.floor(api.screenWidth) + '&height=' + Math.floor(api.screenWidth);
					
					if(COMMON_IsAnroidOrIOS() == CONSTANT_OS.IOS){
						slideImgList.push(imgSrc);
					}else{
						slideImgList.push(encodeURI(imgSrc));
					}
				}
				if (slideImgList.length > 0) {
					scrollPicTotal = slideImgList.length;
				}

				//显示顶部轮播图
				playScrollPicture(slideImgList);
			}

			var technicalParam = ret.productField;
			if (technicalParam) {
				if (technicalParam['01']) {
					var basicUlData = technicalParam['01'];
					for (var i = 0; i < basicUlData.length; i++) {
						var template = $api.byId('template');
						var cloneObj = template.cloneNode(true);
						$api.html($api.dom(cloneObj, '.fieldtitle'), basicUlData[i].fieldTitle);
						$api.html($api.dom(cloneObj, '.fieldvalue'), basicUlData[i].fieldValue);
						$api.append($api.byId('basicUl'), $api.html(cloneObj));
					}
				}
				if (technicalParam['02']) {
					var functionUlData = technicalParam['02'];
					for (var i = 0; i < functionUlData.length; i++) {
						var template = $api.byId('template');
						var cloneObj = template.cloneNode(true);
						$api.html($api.dom(cloneObj, '.fieldtitle'), functionUlData[i].fieldTitle);
						$api.html($api.dom(cloneObj, '.fieldvalue'), functionUlData[i].fieldValue);
						$api.append($api.byId('functionUl'), $api.html(cloneObj));
					}
				}
				if (technicalParam['03']) {
					var speciUlData = technicalParam['03'];
					for (var i = 0; i < speciUlData.length; i++) {
						var template = $api.byId('template');
						var cloneObj = template.cloneNode(true);
						$api.html($api.dom(cloneObj, '.fieldtitle'), speciUlData[i].fieldTitle);
						$api.html($api.dom(cloneObj, '.fieldvalue'), speciUlData[i].fieldValue);
						$api.append($api.byId('speciUl'), $api.html(cloneObj));
					}
				}

			}
		}

	});
	//是否已加购物车
	var isExistsCartUrl = ajaxReqHost + 'appExistsCart.ajax';
	var paramExistsCart = {
		from : 'app',
		pageSize : 10,
		pageNo : 1,
		userId : userInfo.id,
		productId : productId,
		customerId : customerId
	}

	COMMON_Ajax_Post(isExistsCartUrl, {
		values : paramExistsCart
	}, function(ret) {
		if (ret.result) {
			$api.addCls($api.byId("isCart"), "isCart");
			$api.removeCls($api.byId("isCart"), "aui-icon-cart");
		}

	});
	//是否已收藏
	var isExistsWishUrl = ajaxReqHost + 'appExistsListWish.ajax';
	var paramExistsWish = {
		from : 'app',
		pageSize : 10,
		pageNo : 1,
		userId : userInfo.id,
		productId : productId,
		customerId : customerId
	}
	COMMON_Ajax_Post(isExistsWishUrl, {
		values : paramExistsWish
	}, function(ret) {
		if (ret.result) {
			isWishList = true;
			$api.addCls($api.byId("isWish"), "isWish");
			$api.removeCls($api.byId("isWish"), "aui-icon-star");
		}

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
	
	$(window).scroll(function(event){  
	    var wScrollY = window.scrollY; // 当前滚动条位置    
	    var wInnerH = window.innerHeight; // 设备窗口的高度（不会变）    
	    var bScrollH = document.body.scrollHeight; // 滚动条总高度   
	   	if(wScrollY > 0){
	   		$api.removeCls($api.byId('scrollTop'), 'aui-hide');
	   	}else{
	   		$api.addCls($api.byId('scrollTop'), 'aui-hide');
	   	}
	});
};

function fillProductPrice(productPriceRet) {
	if (productPriceRet && productPriceRet.length > 0) {
		for (var m = 0; m < productPriceRet.length; m++) {
			$api.html($api.byId("invoicePrice"), currency +COMMON_COMMON_FormatCurrency(productPriceRet[m].price2));
			$api.html($api.byId("discountPrice"), currency +COMMON_COMMON_FormatCurrency(productPriceRet[m].price1));
			$api.html($api.byId("salePrice"), '<del>' + currency + COMMON_COMMON_FormatCurrency(productPriceRet[m].price1 + productPriceRet[m].price2) + '</del>');
		}
	}
}

//轮播图
function playScrollPicture(slideImgList) {
	UIScrollPicture = api.require('UIScrollPicture');
	UIScrollPicture.open({
		rect : {
			x : 80,
			y : headerHeight.h,
			w : slidePicHeight,
			h : slidePicHeight
		},
		data : {
			paths : slideImgList
		},
		styles : {
			caption : {
				height : 35,
				color : '#E0FFFF',
				size : 13,
				bgColor : '#696969',
				position : 'bottom'
			},
			indicator : {
				align : 'center',
				color : '#FFFFFF',
				activeColor : '#DA70D6'
			}
		},
		placeholderImg : 'widget://res/slide1.jpg',
		contentMode : 'scaleToFill',
		interval : 6,
		fixedOn : api.frameName,
		loop : false,
		fixed : false
	}, function(ret, err) {
		if(ret.eventType == 'click'){
			browserImg(slideImgList, ret.index);
		}
	});

	UIScrollPicture.addEventListener({
		name : 'scroll'
	}, function(ret, err) {
		if (ret) {
			scrollPicIndex = ret.index;
		}
	});
}

//收藏
function Collection() {
	if (isWishList) {
		api.toast({
			msg : 'The product have been collected'
		});
		return;
	}
	//用户id
	var userId = userInfo.id;
	var orgId = BUSINESS_GetOrgId();

	var url = ajaxReqHost + 'appSaveWishList.ajax';

	COMMON_Ajax_Post(url, {
		values : {
			userId : userId,
			orgId : orgId,
			customerId : customerId,
			productId : productId
		}
	}, function(ret) {
		if (ret && ret.result == true) {
			isWishList = true;
			$api.addCls($api.byId("isWish"), "isWish");
			$api.removeCls($api.byId("isWish"), "aui-icon-star");
			COMMON_toastSuccess();
		} else {
			COMMON_ShowFailure();
		}
	});
}

//加入购物车
function addCart() {
	var userInfo = $api.getStorage("userInfo");
	var userid = userInfo.id;
	var productret = $api.html($api.byId('qty'));
	COMMON_Ajax_Post(ajaxReqHost + 'appSaveCart.ajax', {
		values : {
			'userId' : userid,
			'customerId' : customerId,
			'productId' : productId,
			'qty' : productret,
			'type' : '+'
		}
	}, function(ret) {
		if (ret.result == true) {
			$api.addCls($api.byId("isCart"), "isCart");
			$api.removeCls($api.byId("isCart"), "aui-icon-cart");
			COMMON_toastSuccess();
			api.sendEvent({
		        name:'updShoppingNum'
	        });
		} else {
			COMMON_ShowFailure();
		}
	});

}

function gotocart() {
	COMMON_BackToRoot();
	api.sendEvent({
		name : 'setPage',
		extra : {
			index : 1
		}
	});
}

function boostImage(me){
	var src=$api.attr(me, 'src');
	photoBrowser = api.require('photoBrowser');
	photoBrowser.open({
		images : [src],
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

function browserImg(images, activeIndex) {
	photoBrowser = api.require('photoBrowser');
	photoBrowser.open({
		images : images,
		activeIndex: activeIndex,
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

//编辑产品数量
function editProductNum(me) {
	var num = $api.html(me);
	num = parseInt(num);
	var dialogBox = api.require('dialogBox');
	dialogBox.amount({
		texts : {
			title : $.i18n.prop('modifyPurchaseQty'),
			default : num,
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
				size : 16,
				color : '#555'
			},
			input : {
				w : 200,
				h : 35,
				marginT : 25,
				size : 14,
				color : '#555'
			},
			dividingLine : {
				marginT : 10,
				width : 0.5,
				color : '#eee'
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
		if (ret.eventType == 'right') {
			var inputNum = ret.amount;
			if ($api.trim(inputNum) == '' || $api.trim(inputNum) == '0') {
				api.alert({
					title : 'Warning',
					msg : $.i18n.prop('numValidGtZero')
				}, function(ret, err) {
				});
				return;
			}

			if (COMMON_ValidPositiveInt(inputNum) == false) {
				api.alert({
					title : 'Warning',
					msg : $.i18n.prop('WARNING_POSITIVE_INT')
				}, function(ret, err) {
				});
				return;
			}

			inputNum = parseInt(inputNum);

			$api.html(me, inputNum);
		}
		var dialogBox = api.require('dialogBox');
		dialogBox.close({
			dialogName : 'amount'
		});
	});
}

function subProductNum(me) {
	var parent = $api.closest(me, '.qty_operate_container');
	var product_num_div = $api.dom(parent, '.qty');
	var val = $api.html(product_num_div);
	if (val != 1) {
		var newVal = parseInt(val) - 1;
		$api.html($api.byId('qty'), newVal);
	}
}

function addProductNum(me) {
	var parent = $api.closest(me, '.qty_operate_container');
	var product_num_div = $api.dom(parent, '.qty');
	var val = $api.html(product_num_div);
	var newVal = parseInt(val) + 1;
	$api.html($api.byId('qty'), newVal);
}

function leftSlide() {
	if (scrollPicIndex > 0) {
		scrollPicIndex = scrollPicIndex - 1;
	}
	if (scrollPicIndex == 0) {
		scrollPicIndex = 0;
	}
	UIScrollPicture.setCurrentIndex({
		index : scrollPicIndex
	});
}

function rightSlide() {
	if (scrollPicIndex == scrollPicTotal - 1) {
		UIScrollPicture.setCurrentIndex({
			index : scrollPicTotal - 1
		});
	} else {
		scrollPicIndex = scrollPicIndex + 1;
		UIScrollPicture.setCurrentIndex({
			index : scrollPicIndex
		});
	}

}

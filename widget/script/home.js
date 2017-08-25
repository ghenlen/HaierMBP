var headerHeight;
var carouselHeight;
var moudleHeight;
var annoucementHeight;
var new_product_load_flag = 0;
var recomd_product_load_flag = 0;
var upcom_product_load_flag = 0;
var isDrag = false;
var position_begin_x;
var position_x;
var lineChart;
var UIScrollPicture;
var userInfo = $api.getStorage("userInfo");
var mySwiper;
var mySwiper2;
var mySwiper3;
var imgWidth, imgHeight;
var relations = BUSINESS_GetRelations();
var customerCode;
var saleOffice;
var orgCode;
var customerId;
var tab;

apiready = function() {
	var cacheDealer = BUSINESS_GetCurrentDealer(userInfo.id);
	if (cacheDealer) {
		customerCode = cacheDealer.customerCode;
		customerId = cacheDealer.customerId;
		saleOffice = cacheDealer.saleOffice;
		orgCode = cacheDealer.orgCode;
	} else {
		if (relations && relations.length > 0) {
			customerCode = relations[0].customerCode;
			customerId = relations[0]['customer.id'];
			saleOffice = relations[0]['SALES_OFFICE'];
			orgCode = relations[0]['orgCode']
		}
	}
	if (api.systemType == 'ios') {
		api.addEventListener({
			name : 'swiperight'
		}, function(ret, err) {
		});
	}

	imgWidth = Math.floor(api.screenWidth / 4);
	imgHeight = imgWidth;

	carouselHeight = api.winWidth / 2;

	moudleHeight = $api.offset($api.byId('attendanceMoudle')).h * 2 + 20;
	$api.css($api.byId('moudleCon'), 'height:' + moudleHeight + 'px');
	var $annoucement = $api.dom('.annoucement');
	annoucementHeight = $api.offset($annoucement);
	var $header = $api.dom('header');
	headerHeight = $api.offset($header);
	//$api.css($annoucement, 'margin-top:' + (carouselHeight) + 'px');
	$api.css($api.byId('chart'), 'width:' + (api.winWidth - 20) + 'px;height:250px;');
	$api.css($api.byId('div_new'), 'height:' + (api.winWidth / 2 + 10) + 'px');
	$api.css($api.byId('announceMarque'), 'width:'+(api.winWidth - 120)+'px');
	$api.css($api.byId('newsMarque'), 'width:'+(api.winWidth - 120)+'px');
	$api.css($api.byId('policyMarque'), 'width:'+(api.winWidth - 120)+'px');
	
	//轮播图
	playScrollPicture();

	//加载公告信息
	loadAnnouncement();

	tab = new auiTab({
		element : document.getElementById("home_tabe_footre"),
		index : 1,
		repeatClick : false
	}, function(ret) {
		if (ret.index == 1) {
			$api.css($api.byId('div_new'), 'display: block');
			$api.css($api.byId('div_recommend'), 'display: none');
			$api.css($api.byId('div_forcast'), 'display: none');
			getProductNewsList(1);
			if (mySwiper) {
				mySwiper.stopAutoplay();
				mySwiper.startAutoplay();
			}

		} else if (ret.index == 2) {
			$api.css($api.byId('div_recommend'), 'display:block');
			$api.css($api.byId('div_new'), 'display:none');
			$api.css($api.byId('div_forcast'), 'display:none');
			getProductNewsList(2);
			if (mySwiper2) {
				mySwiper2.stopAutoplay();
				mySwiper2.startAutoplay();
			}
		} else if (ret.index == 3) {
			$api.css($api.byId('div_new'), 'display: none');
			$api.css($api.byId('div_recommend'), 'display: none');
			$api.css($api.byId('div_forcast'), 'display: block');
			getProductNewsList(3);
			if (mySwiper3) {
				mySwiper3.stopAutoplay();
				mySwiper3.startAutoplay();
			}
		}
	});
	showNotReadMsgCount();
	BUSINESS_GetHomePermissions();

	//加载新品
	getProductNewsList(1);

	setTimeout(function() {
		getNoCloseCount();
		getNewMessageCount();
		//统计页面访问次数
		BUSINESS_PageAccessStatics();
		getNotReadOfflineNum();
	}, 1000);

	document.getElementById('moudleCon').addEventListener('scroll', function(e) {
		var leftPos = this.scrollLeft;
		if (leftPos < 30) {
			$api.attr($api.byId('page1Flag'), 'src', '../image/home/dot1.png');
			$api.attr($api.byId('page2Flag'), 'src', '../image/home/dot.png');
		} else {
			$api.attr($api.byId('page1Flag'), 'src', '../image/home/dot.png');
			$api.attr($api.byId('page2Flag'), 'src', '../image/home/dot1.png');
		}
	}, false);

	api.addEventListener({
		name : 'updateNoCloseCount'
	}, function(ret, err) {
		getNoCloseCount();
	});

	api.addEventListener({
		name : 'updateNewMessageCount'
	}, function(ret, err) {
		getNewMessageCount();
	});

	api.addEventListener({
		name : 'noticeclicked'
	}, function(ret, err) {
		api.openWin({
			name : 'alert_msg',
			url : 'alert_msg.html'
		});
	});
	
	api.setRefreshHeaderInfo({
	    bgColor: '#FFF',
	    textColor: '#1B7BEA',
	    textDown: 'Pull-refresh...',
	    textUp: 'Loosen refresh...',
	    showTime: false
	}, function(ret, err) {
		api.refreshHeaderLoadDone();
	    api.setFrameGroupIndex({
			name : 'group',
			index : 0,
			reload : true
		});
	});
	
	setTimeout(function(){
		$api.remove($api.byId('loadingPage'));
	}, 4000);
	
};

//轮播图
function playScrollPicture() {
	var $slide_con = $api.byId('slide_con');
	$api.css($slide_con, 'margin-top:' + (headerHeight.h) + 'px');
	$api.css($slide_con, 'height:' + (carouselHeight) + 'px');

	var url = ajaxReqHost + 'appListHomeImage.ajax';

	var param = {
		values : {
			customerCode : customerCode
		}
	}
	COMMON_Ajax_Post_NoLoading(url, param, function(ret) {
		if (ret && ret.length > 0) {
			var slideImgs = '';
			var slidePagination = '';
			var imgObj = {};
			if (COMMON_IsAnroidOrIOS() == CONSTANT_OS.IOS) {
				for (var i = (ret.length - 1); i >= 0; i--) {
					imgObj['key' + ret[i].id + 'key'] = ret[i].path;
					if (i == ret.length - 1) {
						slideImgs += '<div class="swiper-slide swiper-slide-active" onclick="turnToPrductDetail(\'' + ret[i].productId + '\')"><img class="key' + ret[i].id + 'key" width="100%" height="100%" src=""/></div>';
						slidePagination += '<span class="swiper-pagination-bullet swiper-pagination-bullet-active"></span>';
					} else {
						slideImgs += '<div class="swiper-slide" onclick="turnToPrductDetail(\'' + ret[i].productId + '\')"><img  class="key' + ret[i].id + 'key"  width="100%" height="100%" src=""/></div>';
						slidePagination += '<span class="swiper-pagination-bullet"></span>';
					}
				}
			} else {
				for (var i = (ret.length - 1); i >= 0; i--) {
					imgObj['key' + ret[i].id + 'key'] = encodeURI(ret[i].path);
					if (i == ret.length - 1) {
						slideImgs += '<div class="swiper-slide swiper-slide-active" onclick="turnToPrductDetail(\'' + ret[i].productId + '\')"><img  class="key' + ret[i].id + 'key"  width="100%" height="100%"  src=""/></div>';
						slidePagination += '<span class="swiper-pagination-bullet swiper-pagination-bullet-active"></span>';
					} else {
						slideImgs += '<div class="swiper-slide" onclick="turnToPrductDetail(\'' + ret[i].productId + '\')"><img  class="key' + ret[i].id + 'key"  width="100%" height="100%"  src=""/></div>';
						slidePagination += '<span class="swiper-pagination-bullet"></span>';
					}
				}
			}

			$api.html($api.byId('slide_imgs'), slideImgs);
			$api.html($api.byId('slide_pagination'), slidePagination);

			for (var key in imgObj) {
				var $img = $api.domAll('.' + key);
				var url = imgObj[key];
				for (var i = 0; i < $img.length; i++) {
					COMMON_CacheImg(url, $img[i]);
				}
			}

			var swiper1 = new Swiper('.swiper-container', {
				pagination : '.swiper-pagination',
				paginationClickable : true,
				autoplayDisableOnInteraction : false,
				speed : 600,
				effect : 'fade',
				autoplay : 2000
			});
		} else {
			$api.html($api.byId("slide_con"), '<div id="noDataInfo" class="" align="center" style="margin-top: 2.5rem;"><img src="../image/home/kongicon.png" width="100"/></div></div>');
		}
	});
}

//加载公告信息
function loadAnnouncement() {
	var currentOrg = BUSINESS_GetCurrentOrg();
	var url = ajaxReqHost + 'appHomeNews.ajax';
	var param = {
			userId : userInfo.id,
			orgType : currentOrg.orgType,
			orgInnerCode : currentOrg.orgInnerCode
		}
	COMMON_Ajax_Post_NoLoading(url, {
		values:{
			userId : userInfo.id,
			orgType : currentOrg.orgType,
			orgInnerCode : currentOrg.orgInnerCode
		}
	}, function(ret) {
		log('Announce', ret);
		if (ret) {
			$api.html($api.byId("home_announcement"), ret.ANNOUCEMENT || '');
			$api.html($api.byId("home_news"), ret.NEWS || '');
			$api.html($api.byId("home_policy"), ret.POLICY || '');
		}
	});
}

//销售目标
function loadSalesTarget() {
	var userInfo = $api.getStorage("userInfo");
	var url = ajaxReqHost + 'appLatelySaleTargetReport.ajax';
	var param = {};

	var post = BUSINESS_JudgeOrgType();
	if (post == 'SBU') {
		param['userId'] = userInfo.id;
	} else if (post == 'BRANCH') {
		param['branchCode'] = BUSINESS_GetOrgCode();
	} else if (post == 'REGION') {
		param['regionCode'] = BUSINESS_GetOrgCode();
	}

	COMMON_Ajax_Post_NoLoading(url, {
		values : param
	}, function(ret) {
		if (ret) {
			var xAxisIndexs = [];
			var qtyTargetDatas = [];
			var qtyActualDatas = [];
			var target = [];
			var orderActualValue = [];
			var invoiceActualValue = [];

			var gridX = 40;

			for (var key in ret) {
				xAxisIndexs.push(CONSTANT_MONTH_SHORTNAME[parseInt(key.substring(4)) - 1]);
				target.push(ret[key].TARGETVALUE);
				orderActualValue.push(ret[key].ORDERACTUALVALUE);
				invoiceActualValue.push(ret[key].INVOICEACTUALVALUE);

				if (ret[key].TARGETVALUE > 1000000) {
					gridX = 60;
				}
				if (ret[key].ORDERACTUALVALUE > 1000000) {
					gridX = 60;
				}
				if (ret[key].INVOICEACTUALVALUE > 1000000) {
					gridX = 60;
				}

			}

			if (xAxisIndexs.length == 0) {
				xAxisIndexs = ['', '', '', '', '', '']
			}

			if (target.length == 0) {
				target = [0, 0, 0, 0, 0, 0];
			}

			if (orderActualValue.length == 0) {
				orderActualValue = [0, 0, 0, 0, 0, 0];
			}

			if (invoiceActualValue.length == 0) {
				invoiceActualValue = [0, 0, 0, 0, 0, 0];
			}

			var option = {
				legend : {
					selectedMode : false,
					data : ['Target', 'Order Actual', 'Invoice Actual']
				},
				grid : {
					show : true,
					x : gridX,
					x2 : 0,
					y : 35,
					y2 : 30
				},
				calculable : true,
				xAxis : [{
					type : 'category',
					data : xAxisIndexs
				}],
				yAxis : [{
					type : 'value',
					splitArea : {
						show : true
					},
					axisLabel : {
						rotate : 45, //刻度旋转45度角
						textStyle : {
							color : "black",
							fontSize : 6
						}
					}
				}],
				series : [{
					name : 'Target',
					type : 'line',
					data : target,
					label : {
						normal : {
							show : true,
							position : 'top'
						}
					}
				}, {
					name : 'Order Actual',
					type : 'line',
					data : orderActualValue,
					label : {
						normal : {
							show : true,
							position : 'top'
						}
					}
				}, {
					name : 'Invoice Actual',
					type : 'line',
					data : invoiceActualValue,
					label : {
						normal : {
							show : true,
							position : 'top'
						}
					}
				}]
			};

			var myChart = echarts.init(document.getElementById('chart'), 'macarons');
			myChart.setOption(option);
		}
	});
}

//获取离线订单未读的数量
function getNotReadOfflineNum() {
	var db = api.require('db');
	var sql = "select * from offline_order where is_read = '0'";
	db.selectSql({
		name : 'data',
		sql : sql
	}, function(ret, err) {
		if (ret && ret.status) {
			var data = ret.data;
			if (data.length > 0) {
				$api.html($api.byId('offlineCornerMark'), data.length);
				$api.css($api.byId('offlineCornerMark'), 'display:block');
			}
		}
	});
}

function turnToPage(page) {
	var winName = '';
	var winUrl = '';
	var isReload = false;
	switch(page) {
		case 'offlineOrder':
			winName = 'fast_order';
			winUrl = 'fast_order.html';
			isReload = true;
			break;
		case 'dealer':
			winName = 'dealer';
			winUrl = 'dealer.html';
			break;
		case 'attendance':
			winName = 'attendance';
			winUrl = 'attendance.html';
			break;
		case 'information':
			winName = 'information';
			winUrl = 'information.html';
			break;
		case 'question':
			winName = 'problem_list';
			winUrl = 'question_list.html';
			break;
		case 'notice':
			winName = 'notice';
			winUrl = 'notice.html';
			break;
		case 'overage':
			winName = 'overage';
			winUrl = 'overage.html';
			break;
		case 'overdue':
			winName = 'overdue';
			winUrl = 'overdue.html';
			break;
		case 'recon':
			winName = 'reconcilication';
			winUrl = 'reconcilication.html';
			break;
		default :
			break;
	}

	COMMON_OpenWin({
		name : winName,
		url : winUrl
	});

	if (winName == 'fast_order') {
		var netChk = COMMON_IsNetWorkAvalible();
		if (netChk == true) {
			$api.css($api.byId('offlineCornerMark'), 'display:none');
		}
	}
}

function turnToIssueList(index) {
	COMMON_OpenWin({
		name : 'issue_list',
		url : 'issue_list.html',
		pageParam : {
			index : index
		}
	});
}

function turnToProductList() {
	api.openSlidLayout({
		type : 'left',
		leftEdge : 50,
		vScrollBarEnabled : false,
		fixedPane : {
			name : 'fixed',
			url : 'category.html'
		},
		slidPane : {
			name : 'product',
			url : 'product.html'
		}
	}, function(ret) {
	});
}

function turnToMonthlyReach() {
	COMMON_OpenWin({
		name : 'monthly_sale_target',
		url : 'monthly_sale_target.html'
	});
	return;

	api.openSlidLayout({
		type : 'left',
		leftEdge : 50,
		vScrollBarEnabled : false,
		fixedPane : {
			name : 'fixed',
			url : 'org.html'
		},
		slidPane : {
			name : 'monthly_sale_target',
			url : 'monthly_sale_target.html'
		}
	}, function(ret) {
	});
}

//新品、推荐和预告
function getProductNewsList(type) {
	var currency = BUSINESS_GetCurrency();
	if (type == 1) {//新品介绍
		if (new_product_load_flag == 0) {
			var url = ajaxReqHost + 'appListProductSaleRecommend.ajax';
			COMMON_Ajax_Post_NoLoading(url, {
				values : {
					'recommendType' : 'NEW_INTRODUCE',
					customerCode : customerCode
				}
			}, function(ret) {
				if (ret && ret.list) {
					if (ret.list.length > 0) {
						var imgObj = {};
						var productRow = '<div class="swiper-slide"><div class="aui-row aui-row-padded">';
						var data = ret.list;
						for (var i = 0; i < data.length; i++) {
							$api.jsonToStr($api.jsonToStr(data));
							var productMoudle = $api.byId('productMoudle');
							var productObj = productMoudle.cloneNode(true);
							if (data[i].imagePath) {
								var imgSrc = CONSTANT_IMG_CROP_URL + data[i].imagePath + '&width=' + imgWidth + '&height=' + imgWidth;
								imgObj[data[i].productCode] = imgSrc;
							}
							
							$api.addCls($api.dom(productObj, '.pricing-title'), 'blue-bg');
							$api.addCls($api.dom(productObj, '.product_img'), data[i].productCode);
							$api.html($api.dom(productObj, '.product_title'), data[i].productTitle);
							$api.html($api.dom(productObj, '.remark'), data[i].saleInfo || 'No description information');
							$api.attr($api.dom(productObj, 'div'), 'onclick', "turnToPrductDetail('" + data[i].productId + "')");
							//$api.html($api.dom(productObj, '.invoice_price'), currency + data[i].invoicePrice);
							//$api.html($api.dom(productObj, '.sale_price'), currency + data[i].salePrice);

							productRow += $api.html(productObj);
							if (i % 2 != 0 || (i == data.length - 1)) {
								productRow += '</div></div>';
								$api.append($api.byId('newProductContainer'), productRow);
								productRow = '<div class="swiper-slide" ><div class="aui-row aui-row-padded">';
							}
						}

						/*
						 var sliderNew = Swipe(document.getElementById('sliderNew'), {
						 auto : 4000,
						 continuous : true,
						 callback : function(pos) {
						 }
						 });
						 */
						
						if(data.length > 2){
							mySwiper = new Swiper('.newcon', {
								loop : true,
								autoplayDisableOnInteraction : false,
								autoplay : 3000//可选选项，自动滑动
							})
						}

						for (var key in imgObj) {
							var $img = $api.domAll('.' + key);
							var url = imgObj[key];
							for (var i = 0; i < $img.length; i++) {
								COMMON_CacheImg(url, $img[i]);
							}
						}
						new_product_load_flag = 1;
					} else {
						$api.html($api.byId('div_new'),'');
						$api.append($api.byId('div_new'), '<div id="noDataInfo" class="" align="center" style="margin-top: 2.5rem;"><img src="../image/home/kongicon.png" width="100"/></div></div>');
					}

				}
			});
		}
	} else if (type == 2) {//产品推荐
		if (recomd_product_load_flag == 0) {
			var url = ajaxReqHost + 'appListProductSaleRecommend.ajax';
			COMMON_Ajax_Post_NoLoading(url, {
				values : {
					'recommendType' : 'RECOMMEND',
					customerCode : customerCode
				}
			}, function(ret) {
				if (ret && ret.list) {
					if(ret.list.length>0){
						var imgObj = {};
						var productRow = '<div class="swiper-slide" ><div class="aui-row aui-row-padded">';
						var data = ret.list;
						for (var i = 0; i < data.length; i++) {
							var productMoudle = $api.byId('productMoudle');
							var productObj = productMoudle.cloneNode(true);
	
							if (data[i].imagePath) {
								var imgSrc = CONSTANT_IMG_CROP_URL + data[i].imagePath + '&width=' + imgWidth + '&height=' + imgWidth;
								imgObj[data[i].productCode] = imgSrc;
							}
							$api.addCls($api.dom(productObj, '.pricing-title'), 'yellow-bg');
							$api.addCls($api.dom(productObj, '.product_img'), data[i].productCode);
							$api.html($api.dom(productObj, '.product_title'), data[i].productTitle);
							$api.html($api.dom(productObj, '.remark'), data[i].saleInfo || 'No description information');
							$api.attr($api.dom(productObj, 'div'), 'onclick', "turnToPrductDetail('" + data[i].productId + "')");
							//$api.html($api.dom(productObj, '.invoice_price'), currency + data[i].invoicePrice);
							//$api.html($api.dom(productObj, '.sale_price'), currency + data[i].salePrice);
	
							productRow += $api.html(productObj);
							if (i % 2 != 0 || (i == data.length - 1)) {
								productRow += '</div></div>';
								$api.append($api.byId('recommendProductContainer'), productRow);
								productRow = '<div class="swiper-slide" ><div class="aui-row aui-row-padded">';
							}
						}
						
						if(data.length > 2){
							mySwiper2 = new Swiper('.recommendcon', {
								loop : true,
								autoplayDisableOnInteraction : false,
								autoplay : 3000//可选选项，自动滑动
							})
						}
						
						for (var key in imgObj) {
							var $img = $api.domAll('.' + key);
							var url = imgObj[key];
							for (var i = 0; i < $img.length; i++) {
								COMMON_CacheImg(url, $img[i]);
							}
	
						}
	
						recomd_product_load_flag = 1;
					}else{
						$api.html($api.byId('div_recommend'),'');
						$api.append($api.byId('div_recommend'), '<div id="noDataInfo" class="" align="center" style="margin-top: 2.5rem;"><img src="../image/home/kongicon.png" width="100"/></div></div>');
					}
				}
			});
		}
	} else if (type == 3) {//新品预告
		if (upcom_product_load_flag == 0) {
			var url = ajaxReqHost + 'appListProductSaleRecommend.ajax';
			COMMON_Ajax_Post_NoLoading(url, {
				values : {
					'recommendType' : 'NEW_FORESHOW'
				}
			}, function(ret) {
				if (ret && ret.list) {
				if(ret.list.length>0){
				var imgObj = {};
					var productRow = '<div class="swiper-slide" ><div class="aui-row aui-row-padded">';
					var data = ret.list;
					for (var i = 0; i < data.length; i++) {
						var productMoudle = $api.byId('productMoudle');
						var productObj = productMoudle.cloneNode(true);
						if (data[i].imagePath) {
							var imgSrc = CONSTANT_IMG_CROP_URL + data[i].imagePath + '&width=' + imgWidth + '&height=' + imgWidth;
							imgObj["p" + data[i].id] = imgSrc;
						}
						$api.addCls($api.dom(productObj, '.pricing-title'), 'pink-bg');
						$api.addCls($api.dom(productObj, '.product_img'), "p" + data[i].id);
						$api.attr($api.dom(productObj, '.product_img'), 'onclick', 'boostImage(this)');
						$api.html($api.dom(productObj, '.remark'), data[i].saleInfo || 'No description information');
						$api.html($api.dom(productObj, '.product_title'), data[i].productTitle);
						//$api.attr($api.dom(productObj, 'div'), 'onclick', "lookDetail('" + data[i].id + "')");
						//$api.html($api.dom(productObj, '.invoice_price'), currency + data[i].invoicePrice);
						//$api.html($api.dom(productObj, '.sale_price'), currency + data[i].salePrice);

						productRow += $api.html(productObj);
						if (i % 2 != 0 || (i == data.length - 1)) {
							productRow += '</div></div>';
							$api.append($api.byId('forcastProductContainer'), productRow);
							productRow = '<div class="swiper-slide" ><div class="aui-row aui-row-padded">';
						}
					}
					
					if(data.length > 2){
						mySwiper3 = new Swiper('.forcastcon', {
							loop : true,
							autoplayDisableOnInteraction : false,
							autoplay : 3000//可选选项，自动滑动
						});
					}
					
					
					for (var key in imgObj) {
						var $img = $api.domAll('.' + key);
						var url = imgObj[key];
						for (var i = 0; i < $img.length; i++) {
							COMMON_CacheImg(url, $img[i]);
						}

					}

					upcom_product_load_flag = 1;
				}else{
					$api.html($api.byId('div_forcast'),''); 
					$api.append($api.byId('div_forcast'), '<div id="noDataInfo" class="" align="center" style="margin-top: 2.5rem;"><img src="../image/home/kongicon.png" width="100"/></div></div>');
				}
					
				}
			});
		}
	}
}

function boostImage(me){
	var src=$api.attr(me, 'src');
	var photoBrowser = api.require('photoBrowser');
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

//跳转页面
function turnToProductListFromNew(productTitle) {
	var params = productTitle.split(":");
	api.closeFrame({
		name : 'popupMenu'
	});

	api.openSlidLayout({
		type : 'left',
		leftEdge : 20,
		vScrollBarEnabled : false,
		fixedPane : {
			name : 'fixed',
			url : 'category.html'
		},
		slidPane : {
			name : 'product',
			url : 'product.html',
			pageParam : {
				term : params[0]
			},
		}
	}, function(ret) {
	});
}

function getNoCloseCount() {
	var noCloseCount = ajaxReqHost + "appNotCloseCount.ajax";
	COMMON_Ajax_Post_NoLoading(noCloseCount, {
		values : {
			'user.id' : userInfo.id
		}
	}, function(ret) {
		if (ret >= 1) {
			$api.removeCls($api.byId("noCloseCount"), 'aui-hide');
			$api.html($api.byId("noCloseCount"), ret);
		}
	}, 'text');
}

function getNewMessageCount() {
	var newMessageCount = ajaxReqHost + "appNewMessageCount.ajax";
	
	COMMON_Ajax_Post_NoLoading(newMessageCount, {
		values : {
			'userIds' : userInfo.id
		}
	}, function(ret) {
		if (ret >= 1) {
			$api.removeCls($api.byId("newMessageCount"), 'aui-hide');
			$api.html($api.byId("newMessageCount"), ret);
		} else {
			$api.addCls($api.byId("newMessageCount"), 'aui-hide');
		}
	}, 'text');
}

function showNotReadMsgCount() {
	var noReadMessageCountUrl = ajaxReqHost + 'appAlertMessageCount.ajax';
	COMMON_Ajax_Post_NoLoading(noReadMessageCountUrl, {
		values : {
			'user.id' : userInfo.id,
			'customerCode' : '',
			'messageTitle' : '',
			'redTag' : 'FALSE'
		}
	}, function(ret) {
		if (ret >= 1) {
			api.notification({
				notify : {
					title : "New message arrives!",
					content : 'You have ' + ret + ' messages to be read.',
					extra : {
						goto : 'winAa'
					}
				}
			}, function(ret, err) {
			});
		}
	}, 'text');

}

function openProductSearch() {
	COMMON_UISearchBar(function(ret) {
		var searchTitleBar = ret.text;
		api.openSlidLayout({
			type : 'left',
			leftEdge : 50,
			vScrollBarEnabled : false,
			fixedPane : {
				name : 'fixed',
				url : 'category.html'
			},
			slidPane : {
				name : 'product',
				url : 'product.html',
				pageParam : {
					'term' : searchTitleBar
				}
			}
		}, function(ret) {
		});
	});
}

function turnToPrductDetail(productId) {
	COMMON_OpenWin({
		name : 'product_detail',
		url : 'product_detail.html',
		pageParam : {
			productId : productId,
			customerId : customerId,
			orgCode : orgCode,
			saleOffice : saleOffice,
			customerCode : customerCode
		}
	});
}
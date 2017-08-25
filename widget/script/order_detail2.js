apiready = function() {
	var $header = $api.dom('header');
	$api.fixIos7Bar($header);
	$api.fixStatusBar($header);
	var headerHeight = $api.offset($header);
	var orderId = api.pageParam.orderId;
	var orderErpId = api.pageParam.orderErpId;
	var orderStatus =  api.pageParam.orderStatus;
	loadDetail(orderId, orderErpId, orderStatus);
	COMMON_openFrame({
		name : 'order_detail_head',
		url : 'order_detail_head.html',
		rect : {
			x : 0,
			y : 0,
			w : api.winWidth,
			h : headerHeight.h
		},
		animation: CONSTANT_FRAME_ANIMATION
	});
};
function loadDetail(orderId, orderErpId, orderStatus) {
	COMMON_Ajax_Post(ajaxReqHost + 'appOrderDetial.ajax?id=' + orderId, {}, function(ret) {
		if (ret) {
			var orderErpList = ret.orderErp;
			for (var i = 0; i < orderErpList.length; i++) {
				if (ret.orderErp[i].id != orderErpId) {
					continue;
				}
				//var sumPrice=Number(ret.orderLine[i].qty)*Number(ret.orderLine[i].price);
				$api.html($api.byId("orderNo"), orderErpList[i].b2bOrderNumber);
				$api.html($api.byId("time"), COMMON_FormatTimeToTime(orderErpList[i].createDate));
				
				$api.html($api.byId("statue"), status);
				//数据待定
				$api.html($api.byId("address"), ret.sendToTitle);
				//数据待定
				$api.html($api.byId("remark"), ret.remark);
				//数据待定
				$api.html($api.byId("countS"), orderErpList[i].orderQuantity);
				$api.html($api.byId("state1"), orderStatus);
				$api.html($api.byId("ZSONo"), orderErpList[i].erpOrderNumber);
				$api.html($api.byId("delearTitle"), orderErpList[i].customerName)
				var goods = orderErpList[i].lineList;
				var currentcy = $api.getStorage('currency');
				for (var t = 0; t < goods.length; t++) {
					loadGoods(goods[t], ret.orderLine);
				}
				$api.html($api.byId("price"), currentcy+"." + orderErpList[i].orderAmount);
				
				var statusList = orderErpList[i].orderStatus;
				loadLogisticsInfo(statusList, orderStatus);
			}
		}
	});
}

function loadModel(data) {
	var sumPrice = 0;
	for (var i = 0; i < (data.orderLine).length; i++) {
		sumPrice += Number(data.orderLine[i].qty) * Number(data.orderLine[i].price);
	}
	$api.html($api.byId("orderNo"), data.orderNumber);
	$api.html($api.byId("price"), sumPrice);
	$api.html($api.byId("time"), COMMON_FormatTimeToTime(data.time));
	$api.html($api.byId("statue"), data.statue);
	$api.html($api.byId("address"), data.address);
	$api.html($api.byId("content"), data.content);
}

//返回按钮
function back() {
	api.closeWin({});
}

//加载订单中的商品信息
function loadGoods(data, list) {
	var currentcy = $api.getStorage('currency') + ".";
	var productId = data.productId;
	var img = "";
	for (var r = 0; r < list.length; r++) {
		if (list[r].productId == productId) {
			img = list[r].imgPath;
			img = CONSTANT_IMG_CROP_URL + img + '&width='+CONSTANT_LIST_IMG_WIDTH+'&height='+CONSTANT_LIST_IMG_HEIGHT;
			img = encodeURI(img);
		}
	}
	var goodsInfoContent = '';
	var title = data.title;
	if (title == null || title == 'null') {
		title = "";
	}
	
	goodsInfoContent += '<div class="goods aui-font-size-14">' + '<img width="80" height="80" src="' + img + '" onerror="this.src=\'../image/common/pic.png\'"/>' + '<span class="name">' + title + '</span>' + '<div class="shop_info" style="width: 70%" onclick="productDetail(\'' + data.code + '\')">' + '	<div class="left_info aui-font-size-12" style="width: 100%">' + '		<span class="dodge_blue price">' + currentcy + data.billPrice + '</span>' + '		<span class="dodge_blue aui-font-size-14 shop_num">X' + data.qty + '</span>' + '	</div>' + '</div>' + '</div>';
	if (i % 2 == 0 && i != data.length - 1) {
		goodsInfoContent += '<hr/>';
	}
	$api.html($api.dom('.goods_info'), goodsInfoContent);
}

//加载物流信息
function loadLogisticsInfo(statusList, curStatus) {
	var logisticsContent = '';
		for(var i=0; i<statusList.length; i++){
				var logisticsTemplate = $api.dom('.logisticsTemplate');
				var logisticsCloneObj = logisticsTemplate.cloneNode(true);
				$api.html($api.dom(logisticsCloneObj, '.type'), statusList[i].type);
				$api.html($api.dom(logisticsCloneObj, '.documentNumber'), statusList[i].documentNumber);
				$api.html($api.dom(logisticsCloneObj, '.documentDate'), statusList[i].documentDate);
				$api.html($api.dom(logisticsCloneObj, '.status'),statusList[i].status);
				$api.append($api.dom('.logistics_list'), $api.html(logisticsCloneObj));
		}
		//logisticsContent = '<div class="logistics_item ' + curStepCls + '">' + '<div class="dot ' + curStepDotCls + '"></div>' + '<div style="width:100%" class="aui-font-size-14 address_info ' + curStepTextCls + '">' + '	<span style="width:4rem;">' + statusText + '</span>' + '<span style="font-size:12px;">' + statusTime + '</span>' + '</div></div>';
}

function productDetail(th) {
	COMMON_OpenWin({
		name : 'product_detail',
		url : 'product_detail.html',
		//传输页面参数    pageparam :'',
		pageParam : {
			id : th
		}
	});
}
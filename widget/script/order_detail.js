var imgWidth,imgHeight;
var currentcy = BUSINESS_GetCurrency();
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
	
	imgWidth = Math.floor(api.screenWidth/4);
	imgHeight = imgWidth;
	
	$api.html($api.byId("customerId"), api.pageParam.customerId);
	
	
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
				
				$api.html($api.byId("productgroup"), orderErpList[i].productGroup);
				
				$api.html($api.byId("state1"), orderStatus);
				$api.html($api.byId("ZSONo"), orderErpList[i].erpOrderNumber);
				$api.html($api.byId("delearTitle"), orderErpList[i].customerName);
				
				var goods = orderErpList[i].lineList;
				
				for (var t = 0; t < goods.length; t++) {
					loadGoods(goods[t], ret.orderLine);
				}
				$api.html($api.byId("price"), currentcy+ COMMON_COMMON_FormatCurrency(orderErpList[i].orderAmount));
				
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
	var productId = data.productId;
	var img = "";
	for (var r = 0; r < list.length; r++) {
		if (list[r].productId == productId) {
			img = list[r].imgPath;
			img = CONSTANT_IMG_CROP_URL + img + '&width='+imgWidth+'&height='+imgWidth;
			img = encodeURI(img);
		}
	}
	var goodsInfoContent = '';
	var title = data.title;
	if (title == null || title == 'null') {
		title = "";
	}
	
	goodsInfoContent += '<div class="goods aui-font-size-14" onclick="productDetail(\'' + data.productId + '\')">' + '<img width="80" height="80" src="' + img + '" onerror="this.src=\'../image/common/pic.png\'"/>' + '<span class="name">' + title + '</span>' + '<div class="shop_info" style="width: 70%">' + '	<div class="left_info aui-font-size-12" style="width: 100%">' + '		<span class="dodge_blue price">' + currentcy + data.billPrice + '</span>' + '		<span class="dodge_blue aui-font-size-14 shop_num">x' + data.qty + '</span>' + '	</div>' + '</div>' + '</div>';
	if (i % 2 == 0 && i != data.length - 1) {
		goodsInfoContent += '<hr/>';
	}
	$api.html($api.dom('.goods_info'), goodsInfoContent);
}

function loadLogisticsInfo(statusList, curStatus) {
	var map = {};
	for(var i=0; i<statusList.length; i++){
		var foldKey = statusList[i].type+'+'+statusList[i].documentNumber+'+'+statusList[i].documentDate;
		if(map.hasOwnProperty(foldKey)){
			var statusArr = map[foldKey];
			statusArr.push({
				'status': statusList[i].status
			});
			map[foldKey] = statusArr;
		}else{
			map[foldKey] = [{
				'status': statusList[i].status
			}];
		}
	}
	
	var logisticsContent = '';
	for(var key in map){
		var keyArr = key.split('+');
		logisticsContent += '<div class="logistics_item current_step">' 
								+ '<div class="dot current_step_dot"></div>' 
								+ '<div class="aui-font-size-14 address_info current_step_text">' 
									+ '	<span style="width:2rem;font-weight:bold;">' +keyArr[1]+'</span>' 
									+ '<span style="font-weight:bold;">'+(keyArr[0]=='null'?'':keyArr[0])+'</span>&nbsp;&nbsp;' 
								+ '</div>'
								+'<div class="status-fold-btn"><span style="color:#666;font-size:12px;">'+keyArr[2]+'</span></div>'
							+'</div>';
		var statusList = map[key];
		for(var j=0; j<statusList.length; j++){
			logisticsContent += '<div class="logistics_item current_step" style="height: 25px;">' 
								+ '<div class="dot-little current_step_dot"></div>' 
								+ '<div class="aui-font-size-12 address_info current_step_text">' 
									+ '	<span style="width:2rem;font-size:12;">' +statusList[j]['status']+'</span>' 
								+ '</div>'
							+'</div>';
		}
	}
	$api.html($api.dom('.logistics_list'), logisticsContent);
	
}

//加载物流信息
function loadLogisticsInfo1(statusList, curStatus) {
	var logisticsContent = '';
	for(var key in CONSTANT_ORDER_STATUS){
		if(key == 'INIT'){
			continue;
		}
		var curStepCls = 'back_step';
		var curStepDotCls = 'back_step_dot';
		var curStepTextCls = 'back_step_text';
		var statusTime = "";
		var statusText = CONSTANT_ORDER_STATUS[key];
		for(var i=0; i<statusList.length; i++){
			if(statusText == statusList[i].status){
				curStepCls = ' current_step ';
				curStepDotCls = ' current_step_dot ';
				curStepTextCls = ' current_step_text ';
				statusTime = COMMON_FormatTimeToTime(statusList[i].createDate);
				
				if(statusText == curStatus){
					$api.html($api.byId('stateTime'), statusTime);
				}
				
				break;
			}
		}
		logisticsContent = '<div class="logistics_item ' + curStepCls + '">' + '<div class="dot ' + curStepDotCls + '"></div>' + '<div class="aui-font-size-14 address_info ' + curStepTextCls + '">' + '	<span style="width:4rem;font-weight:bold;">' + statusText + '</span>' + '<span style="">' + statusTime + '</span>' + '</div></div>';
		$api.append($api.dom('.logistics_list'), logisticsContent);
	}
}

function productDetail(productId) {
	var customerId = $api.html($api.byId('customerId'));
	COMMON_OpenWin({
		name : 'product_detail',
		url : 'product_detail.html',
		//传输页面参数    pageparam :'',
		pageParam : {
			productId : productId,
			customerId: customerId
		}
	});
}
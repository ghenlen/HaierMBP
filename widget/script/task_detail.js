apiready = function() {
	var $header = $api.dom('header');
	$api.fixIos7Bar($header);
	$api.fixStatusBar($header);
	var param = api.pageParam;
	loadData(param);
	
	var $header = $api.dom('header');
	var headerHeight = $api.offset($header).h;
	COMMON_openFrame({
		name : 'task_detail_head',
		url : 'task_detail_head.html',
		rect : {
			x : 0,
			y : 0,
			w : api.winWidth,
			h : headerHeight
		}
	});
};

function loadData(param) {
	var data = $api.strToJson(param.datas);
	
	$api.val($api.byId('title'), data.title);
	$api.html($api.byId('content'), data.content || '');
	$api.val($api.byId('collectionType'), data.categoryLabel || '');
	
	var images = param.images;
	var imgArray = images.split(',');
	for(var i=0; i<imgArray.length; i++){
		var cloneObj = $api.byId('updImgTemplate').cloneNode(true);
		$api.attr($api.dom(cloneObj, 'img'), 'src', imgArray[i]);
		$api.append($api.byId('imgs'), $api.html(cloneObj));
	}
	
	var url = param.url;
	if(url == 'appSaveShopInfo.ajax'){
		$api.removeCls($api.byId('shopContainer'), 'aui-hide');
		$api.val($api.byId('shop'), data.shopTitle || '');
	}
}

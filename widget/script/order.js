var UIListView = null;
var UILoading = null;
var tabIndex = 1;
//初始化
apiready = function() {
	var $header = $api.byId('header');
	var $main = $api.byId('main');
	var $tabbar = $api.dom('.tabbar');
	$api.fixIos7Bar($header);
	var mainHeight = api.frameHeight - $api.offset($header).h - $api.offset($tabbar).h;
	//$api.css($main, 'height:' + mainHeight + 'px');
	tabswitch(1);

	api.addEventListener({
		name : 'scrolltobottom',
		extra : {
			threshold : 140//设置距离底部多少距离时触发，默认值为0，数字类型
		}
	}, function(ret, err) {
	});
};

//返回按钮
function back() {
	COMMON_OpenWin({
		name : 'index',
		url : 'index.html'
	});

	api.sendEvent({
		name : 'setPage',
		extra : {
			index : 0
		}
	});
}

/**
 * tab选项卡
 * @param {Object} type
 */
function tabswitch(type) {
	tabIndex = type;
	var UILoading_Id;
	var $col = $api.domAll($api.dom('.tabbar'), '.col');
	var $indicator = $api.domAll($api.dom('.tabbar'), '.indicator');
	for (var i = 0; i < $col.length; i++) {
		if ((i + 1) == type) {
			$col[i].style.color = "#1B7BEA";
		} else {
			$col[i].style.color = "#000";
		}
	}

	for (var i = 0; i < $indicator.length; i++) {
		if ((i + 1) == type) {
			$indicator[i].style.display = "block";
		} else {
			$indicator[i].style.display = "none";
		}
	}

	var data = [{
		id : '1001',
		name : 'HR-136WL:HAIER/112L/DC/WL',
		price : '1999.00',
		stock : '234'
	}, {
		id : '1001',
		name : 'HR-136WL:HAIER/112L/DC/WL',
		price : '1999.00',
		stock : '234'
	}, {
		id : '1001',
		name : 'HR-136WL:HAIER/112L/DC/WL',
		price : '1999.00',
		stock : '234'
	}, {
		id : '1001',
		name : 'HR-136WL:HAIER/112L/DC/WL',
		price : '1999.00',
		stock : '234'
	}, {
		id : '1001',
		name : 'HR-136WL:HAIER/112L/DC/WL',
		price : '1999.00',
		stock : '234'
	}, {
		id : '1001',
		name : 'HR-136WL:HAIER/112L/DC/WL',
		price : '1999.00',
		stock : '234'
	}, {
		id : '1001',
		name : 'HR-136WL:HAIER/112L/DC/WL',
		price : '1999.00',
		stock : '234'
	}, {
		id : '1001',
		name : 'HR-136WL:HAIER/112L/DC/WL',
		price : '1999.00',
		stock : '234'
	}, {
		id : '1001',
		name : 'HR-136WL:HAIER/112L/DC/WL',
		price : '1999.00',
		stock : '234'
	}, {
		id : '1001',
		name : 'HR-136WL:HAIER/112L/DC/WL',
		price : '1999.00',
		stock : '234'
	}];

	/*UILoading = api.require('UILoading');
	 UILoading.flower({
	 center : {
	 x : api.frameWidth / 2,
	 y : api.frameHeight / 2
	 },
	 size : 30,
	 fixedOn : api.frameName,
	 fixed : true
	 }, function(ret) {
	 UILoading_Id = ret.id;
	 });*/
	
	
	for (var i = 0; i < data.length; i++) {
		var sample = $api.byId('sample');
		var cloneObj = sample.cloneNode(true);
		$api.html($api.dom(cloneObj, '.product_name'), i+'-'+data[i].name);
		$api.html($api.dom(cloneObj, '.product_price'), data[i].price);
		$api.html($api.dom(cloneObj, '.product_stock'), data[i].stock);
		$api.append($api.byId('tobeDeliveringUL'), '<li class="aui-list-item">' + $api.html(cloneObj) + '</li>');
	}

	/*var obj = {
	 id : UILoading_Id
	 };
	 UILoading.closeFlower(obj);*/
}	
var isPlaceOrder = false;
//是否有下单的权限
var historyPage = "";
apiready = function() {
	var param = api.pageParam;
	var index = 0;
	var isNew = false;
	if (param) {
		if (param.index) {
			index = param.index;
		}
		if (param.isNew) {
			isNew = param.isNew;
		}
	}

	if (!isNew) {
		api.addEventListener({
			name : 'keyback'
		}, function(ret, err) {
			api.toLauncher();
		});
	}

	funIniGroup(index);

	getShoppingNum();

	api.addEventListener({
		name : 'setPage'
	}, function(ret, err) {
		if (ret && ret.value) {
			var value = ret.value;
			var index = value.index;
			randomSwitchBtn(index);
			if (value.historyPage) {
				historyPage = value.historyPage;
			}
		}
	});

	api.addEventListener({
		name : 'updShoppingNum'
	}, function(ret, err) {
		getShoppingNum();
	});
	
	api.addEventListener({
		name : 'updIndexCartNum'
	}, function(ret, err) {
		var num = ret.value.num;
		if (num>0) {
			var $shoppingNum = $api.byId('shoppingNum');
			$api.html($shoppingNum, num);
			$api.css($shoppingNum, 'display:block');
		} else {
			var $shoppingNum = $api.byId('shoppingNum');
			$api.html($shoppingNum, '');
			$api.css($shoppingNum, 'display:none');
		}
	});

	var permissions = $api.getStorage("permissions");
	if (permissions.indexOf(CONSTANT_AUTH_PLACE_ORDER_CODE) >= 0) {
		isPlaceOrder = true;
	}

};

function funIniGroup(index) {
	var frames = [];
	frames.push({
		name : 'frame0',
		url : '../html/home.html',
		vScrollBarEnabled : false,
		bounces : true
	}, {
		name : 'frame1',
		url : '../html/shopping_list.html',
		vScrollBarEnabled : false,
		bounces : false
	}, {
		name : 'frame2',
		url : '../html/my.html',
		vScrollBarEnabled : false,
		bounces : false
	});
	api.openFrameGroup({
		name : 'group',
		scrollEnabled : false,
		vScrollBarEnabled : false,
		rect : {
			x : 0,
			y : 0,
			w : api.winWidth,
			h : $api.dom('#main').offsetHeight
		},
		index : index,
		frames : frames,
		preload : 0 //禁止预加载，不去加载index外的其它frame
	}, function(ret, err) {

	});

	var currentTab = $api.dom('#footer li.active');
	if (index == $api.attr(currentTab, 'index'))
		return;
	var eFootLis = $api.domAll('#footer li');
	for (var i = 0, len = eFootLis.length; i < len; i++) {
		$api.removeCls(eFootLis[i], 'active');
	}

	$api.addCls(eFootLis[index], 'active');

}

// 随意切换按钮
function randomSwitchBtn1(tag) {
	if (tag == $api.dom('#footer li.active'))
		return;
	var eFootLis = $api.domAll('#footer li'), index = 0;
	for (var i = 0, len = eFootLis.length; i < len; i++) {
		if (tag == eFootLis[i]) {
			index = i;
		} else {
			$api.removeCls(eFootLis[i], 'active');
		}
	}

	if (tag.getElementsByTagName("label")[0].getAttribute("id") == "cart") {
		api.setFrameAttr({
			name : "shopping_list_head",
			hidden : false
		})
	} else {
		api.setFrameAttr({
			name : "shopping_list_head",
			hidden : true
		})
	}

	//隐藏
	if (tag.getElementsByTagName("label")[0].getAttribute("id") == "home") {
		api.setFrameAttr({
			name : "head",
			hidden : false
		})

	} else {
		api.setFrameAttr({
			name : "head",
			hidden : true
		})
	}

	$api.addCls(eFootLis[index], 'active');

	api.setFrameGroupIndex({
		name : 'group',
		index : index
	});
}

function randomSwitchBtn(index) {
	if (!isPlaceOrder) {
		if (index == '1') {
			api.toast({
				msg : 'No Authentication!'
			});
			return;
		}
	}

	var currentTab = $api.dom('#footer li.active');
	if (index == $api.attr(currentTab, 'index'))
		return;
	var eFootLis = $api.domAll('#footer li');
	for (var i = 0, len = eFootLis.length; i < len; i++) {
		$api.removeCls(eFootLis[i], 'active');
	}

	$api.addCls(eFootLis[index], 'active');

	var isreRoad = false;
	if (index == 1) {
		isreRoad = true;
	}

	if (index == 1) {
		api.setFrameAttr({
			name : "shopping_list_head",
			hidden : false
		})
	} else {
		api.setFrameAttr({
			name : "shopping_list_head",
			hidden : true
		})
	}

	if (index == 0) {
		api.setFrameAttr({
			name : "home_head",
			hidden : false
		});
	} else {
		api.setFrameAttr({
			name : "home_head",
			hidden : true
		})
	}

	if (index == 2) {
		api.setFrameAttr({
			name : "my_head",
			hidden : false
		})
	} else {
		api.setFrameAttr({
			name : "my_head",
			hidden : true
		})
	}

	api.setFrameGroupIndex({
		name : 'group',
		index : index,
		reload : isreRoad
	});
}

//获取购物车的数量
function getShoppingNum() {
	var userInfo = $api.getStorage("userInfo");
	var userId = userInfo.id;
	var customerId = "";

	var relations = BUSINESS_GetRelations();
	var cacheDealer = BUSINESS_GetCurrentDealer(userInfo.id);
	if (cacheDealer) {
		customerId = cacheDealer.customerId;
	} else {
		if (relations && relations.length > 0) {
			customerId = relations[0]['customer.id'];
		}
	}
	var url = ajaxReqHost + 'appListCart.ajax';
	COMMON_Ajax_Post_NoLoading(url, {
		values : {
			from : 'app',
			pageSize : '1',
			pageNo : '0',
			userId : userId,
			customerId : customerId
		}
	}, function(ret) {
		if (ret && ret.list) {
			if (ret.totalCount > 0) {
				var $shoppingNum = $api.byId('shoppingNum');
				$api.html($shoppingNum, ret.totalCount);
				$api.css($shoppingNum, 'display:block');
			} else {
				var $shoppingNum = $api.byId('shoppingNum');
				$api.html($shoppingNum, '');
				$api.css($shoppingNum, 'display:none');
			}
		}
	});

}


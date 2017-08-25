var firstLevelNode = '-1';
//ALL
var secondLevelNode = '-1';
//ALL
var catalogObj = {};
apiready = function() {
	var $header = $api.dom('header');
	$api.fixIos7Bar($header);
	$api.fixStatusBar($header);
	var headerHeight = $api.offset($header).h;
	var $leftMenu = $api.byId('leftMenu');
	var leftMenuWidth = $api.offset($leftMenu).w;
	var $rightMenu = $api.byId('rightMenu');
	$api.css($header, 'width:' + (api.winWidth - 50) + 'px');
	$api.css($leftMenu, 'height:' + (api.winHeight - headerHeight) + 'px');
	$api.css($rightMenu, 'height:' + (api.winHeight - headerHeight) + 'px');
	$api.css($rightMenu, 'width:' + (api.winWidth - leftMenuWidth - 50) + 'px');

	COMMON_openFrame({
		name : 'category_head',
		url : 'category_head.html',
		rect : {
			x : 0,
			y : 0,
			w : api.winWidth,
			h : headerHeight
		}
	});

	$api.post(ajaxReqHost + 'appGetProductCategory.ajax', function(ret) {
		if (ret && ret.length > 0) {
			var datas = ret;
			var $firstLevel = $api.byId('firstLevel');
			for (var i = 0; i < datas.length; i++) {
				if (i == 0) {
					var firstLevelTemplate = $api.byId('firstLevelTemplate');
					var firstLevelCloneObj = firstLevelTemplate.cloneNode(true);
					$api.html($api.dom(firstLevelCloneObj, '.firstLevelName'), 'ALL');
					$api.attr($api.dom(firstLevelCloneObj, 'li'), 'code', '-1');
					$api.attr($api.dom(firstLevelCloneObj, '.first_level_img'), 'src', '../image/common/all.png');
					$api.append($firstLevel, $api.html(firstLevelCloneObj));
				}

				catalogObj[datas[i].code] = datas[i].son;

				var firstLevelTemplate = $api.byId('firstLevelTemplate');
				var firstLevelCloneObj = firstLevelTemplate.cloneNode(true);
				$api.html($api.dom(firstLevelCloneObj, '.firstLevelName'), datas[i].title);
				if (datas[i].picPath != null) {
					$api.attr($api.dom(firstLevelCloneObj, '.first_level_img'), 'src', datas[i].picPath);
				}
				$api.attr($api.dom(firstLevelCloneObj, 'li'), 'code', datas[i].code);
				$api.addCls($api.dom(firstLevelCloneObj, 'li'), 'code' + datas[i].code);
				$api.append($firstLevel, $api.html(firstLevelCloneObj));
			}
		}
	});

	api.addEventListener({
		name : 'CATEGORY_LISTENER'
	}, function(ret, err) {
		var param = ret.value;
		var eventType = param.eventType;
		if (eventType == 'reset') {
			var categorys = $api.domAll('.level1');
			for (var j = 0; j < categorys.length; j++) {
				$api.css(categorys[j], 'background:#fff');
				$api.css(categorys[j], 'color:#555');
			}
			$api.html($api.byId('secondLevel'), '');
			firstLevelNode = '-1';
			secondLevelNode = '-1';
			
		} else if (eventType == 'showFirstLevel') {
			var catalogCode = param.catalogCode;
			if(firstLevelNode == catalogCode){
				return;
			}
			
			firstLevelNode = catalogCode;
			var secondLevelList = catalogObj[catalogCode];
			if (!secondLevelList) {
				return;
			}
			$api.html($api.byId('secondLevel'), '');
			for (var j = 0; j < secondLevelList.length; j++) {
				if (j == 0) {
					var secondLevelTemplate = $api.byId('secondLevelTemplate');
					var secondLevelCloneObj = secondLevelTemplate.cloneNode(true);
					$api.html($api.dom(secondLevelCloneObj, '.secondLevelName'), 'ALL');
					$api.attr($api.dom(secondLevelCloneObj, 'li'), 'code', '-1');
					$api.append($api.byId('secondLevel'), $api.html(secondLevelCloneObj));
				}
				var secondLevelTemplate = $api.byId('secondLevelTemplate');
				var secondLevelCloneObj = secondLevelTemplate.cloneNode(true);
				$api.html($api.dom(secondLevelCloneObj, '.secondLevelName'), secondLevelList[j].title);
				$api.attr($api.dom(secondLevelCloneObj, 'li'), 'code', secondLevelList[j].code);
				$api.append($api.byId('secondLevel'), $api.html(secondLevelCloneObj));
			}
			var categorys = $api.domAll('.level1');
			for (var j = 0; j < categorys.length; j++) {
				$api.css(categorys[j], 'background:#fff');
				$api.css(categorys[j], 'color:#555');
			}

			$api.css($api.dom('.code' + catalogCode), 'background:#1B7BEA');
			$api.css($api.dom('.code' + catalogCode), 'color:#fff');
		}
	});

};

function showSecondLevel(me) {
	var code = $api.attr(me, 'code');
	firstLevelNode = code;

	$api.html($api.byId('secondLevel'), '');
	if (code != '-1') {
		var secondLevelList = catalogObj[code];
		if (secondLevelList) {
			$api.html($api.byId('secondLevel'), '');
			for (var j = 0; j < secondLevelList.length; j++) {
				if (j == 0) {
					var secondLevelTemplate = $api.byId('secondLevelTemplate');
					var secondLevelCloneObj = secondLevelTemplate.cloneNode(true);
					$api.html($api.dom(secondLevelCloneObj, '.secondLevelName'), 'ALL');
					$api.attr($api.dom(secondLevelCloneObj, 'li'), 'code', '-1');
					$api.append($api.byId('secondLevel'), $api.html(secondLevelCloneObj));
				}
				var secondLevelTemplate = $api.byId('secondLevelTemplate');
				var secondLevelCloneObj = secondLevelTemplate.cloneNode(true);
				$api.html($api.dom(secondLevelCloneObj, '.secondLevelName'), secondLevelList[j].title);
				$api.attr($api.dom(secondLevelCloneObj, 'li'), 'code', secondLevelList[j].code);
				$api.append($api.byId('secondLevel'), $api.html(secondLevelCloneObj));
			}
		}
	} else {
		secondLevelNode = '-1';
		api.closeSlidPane();
		api.sendEvent({
			name : 'changeCatalog',
			extra : {
				firstLevelNode : firstLevelNode,
				secondLevelNode : secondLevelNode
			}
		});
	}

	var categorys = $api.domAll('.level1');
	for (var j = 0; j < categorys.length; j++) {
		$api.css(categorys[j], 'background:#fff');
		$api.css(categorys[j], 'color:#555');
	}
	$api.css(me, 'background:#1B7BEA');
	$api.css(me, 'color:#fff');
}

function clickSecondLevel(me) {
	var secondLevels = $api.domAll('.level2');
	for (var j = 0; j < secondLevels.length; j++) {
		$api.css(secondLevels[j], 'color:#555');
		$api.css($api.dom(secondLevels[j], '.selectedFlag'), 'display:none');
	}
	$api.css(me, 'color:#1B7BEA');
	$api.css($api.dom(me, '.selectedFlag'), 'display:block');

	var code = $api.attr(me, 'code');
	secondLevelNode = code;
	api.closeSlidPane();
	api.sendEvent({
		name : 'changeCatalog',
		extra : {
			firstLevelNode : firstLevelNode,
			secondLevelNode : secondLevelNode
		}
	});
}


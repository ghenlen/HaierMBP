var firstLevelNode = '-1';
//全部
var secondLevelNode = '-1';
//全部
var orgObj = {};
apiready = function() {
	var $header = $api.dom('header');
	$api.fixIos7Bar($header);
	$api.fixStatusBar($header);
	var headerHeight = $api.offset($header).h;
	var $container = $api.byId('container');
	$api.css($container, 'height:' + (api.winHeight - headerHeight) + 'px');
	
	COMMON_openFrame({
		name : 'org_switch_head',
		url : 'org_switch_head.html',
		rect : {
			x : 0,
			y : 0,
			w : api.winWidth,
			h : headerHeight
		},
		animation : CONSTANT_FRAME_ANIMATION
	});

	loadOrg();

};

function loadOrg() {
	var currentOrgCode = BUSINESS_GetOrgCode();
	var userInfo = BUSINESS_GetLoginUserInfo();
	var orgList = userInfo.orgList;
	if (orgList && orgList.length > 0) {
		for (var i = 0; i < orgList.length; i++) {
			var org = orgList[i];
			var orgType = org.orgType;
			var template = $api.byId('template');
			var templateCloneObj = template.cloneNode(true);
			$api.html($api.dom(templateCloneObj, '.orgTitle'), org.orgTitle);
			$api.attr($api.dom(templateCloneObj, 'li'), 'orgCode', org.orgCode);
			$api.attr($api.dom(templateCloneObj, 'li'), 'orgTitle', org.orgTitle);
			$api.attr($api.dom(templateCloneObj, 'li'), 'orgType', org.orgType);
			if(currentOrgCode == org.orgCode){
				$api.css($api.dom(templateCloneObj, 'li'), 'color: 1B7BEA');
				$api.css($api.dom(templateCloneObj, '.selectedFlag'), 'display:block');
			}
			$api.append($api.byId('orgList'), $api.html(templateCloneObj));
		}
	}
}

function changeOrg(me){
	var categorys = $api.domAll('.level1');
	for (var j = 0; j < categorys.length; j++) {
		$api.css(categorys[j], 'background:#fff');
		$api.css(categorys[j], 'color:#555');
		$api.css($api.dom(categorys[j], '.selectedFlag'), 'display:none');
	}
	
	$api.css(me, 'color:#1B7BEA');
	$api.css($api.dom(me, '.selectedFlag'), 'display:block');
	
	var orgCode = $api.attr(me, 'orgCode');
	var orgTitle = $api.attr(me, 'orgTitle');
	var orgType = $api.attr(me, 'orgType');
	var org = {
		'orgCode': orgCode,
		'orgTitle': orgTitle,
		'orgType': orgType
	};
	$api.setStorage("org", org);
	
	COMMON_BackToRoot();
	api.sendEvent({
		name : 'setPage',
		extra : {
			index : 0
		}
	});
	
	
	
}

function showSecondLevel(me) {
	var code = $api.attr(me, 'code');
	firstLevelNode = code;

	$api.html($api.byId('secondLevel'), '');
	if (code != '00') {
		var secondLevelList = orgObj[code];
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
	$api.css(me, 'background:#cdcdcd');
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


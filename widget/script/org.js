var regionCode = '';
var regionTitle = '';

var branchCode = '';
var branchTitle = '';
var orgObj = {};
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
		name : 'org_head',
		url : 'org_head.html',
		rect : {
			x : 0,
			y : 0,
			w : api.winWidth,
			h : headerHeight
		},
		animation : CONSTANT_FRAME_ANIMATION
	});

	loadOrg();
	
	api.addEventListener({
	    name:'lockEvent'
    },function(ret,err){
    	if(ret){
    		if(ret.value.lockFlag == 'LOCK'){
    			api.lockSlidPane();
    		}else{
    			api.unlockSlidPane();
    		}
    	}
    });
	
};

function loadOrg() {
	var userInfo = BUSINESS_GetLoginUserInfo();
	var orgAll = userInfo.orgAll;
	var orgList = orgAll[BUSINESS_GetOrgCode()];

	if (orgList && orgList.length > 0) {
		for (var i = 0; i < orgList.length; i++) {
			var org = orgList[i];
			var orgType = org.orgType;
			if (orgType == 'HO') {
				var firstLevelTemplate = $api.byId('firstLevelTemplate');
				var firstLevelCloneObj = firstLevelTemplate.cloneNode(true);
				$api.html($api.dom(firstLevelCloneObj, '.firstLevelName'), org.orgTitle);
				$api.attr($api.dom(firstLevelCloneObj, 'li'), 'code', org.orgCode);
				$api.attr($api.dom(firstLevelCloneObj, 'li'), 'title', org.orgTitle);
				$api.append($api.byId('firstLevel'), $api.html(firstLevelCloneObj));
			} else if (orgType == 'REGION') {
				var firstLevelTemplate = $api.byId('firstLevelTemplate');
				var firstLevelCloneObj = firstLevelTemplate.cloneNode(true);
				$api.html($api.dom(firstLevelCloneObj, '.firstLevelName'), org.orgTitle);
				$api.attr($api.dom(firstLevelCloneObj, 'li'), 'code', org.orgCode);
				$api.attr($api.dom(firstLevelCloneObj, 'li'), 'title', org.orgTitle);
				$api.append($api.byId('firstLevel'), $api.html(firstLevelCloneObj));

				if (!orgObj.hasOwnProperty(org.orgCode)) {
					orgObj[org.orgCode] = [];
				}
			} else if (orgType == 'BRANCH') {
				var parentOrgCode = org.parentOrgCode;
				if (!orgObj.hasOwnProperty(parentOrgCode)) {
					orgObj[parentOrgCode] = [];
				}
				var children = orgObj[parentOrgCode];
				children.push({
					'title' : org.orgTitle,
					code : org.orgCode
				});
				orgObj[parentOrgCode] = children;
			}
		}
	}
}

function showSecondLevel(me) {
	var code = $api.attr(me, 'code');
	var title = $api.attr(me, 'title');

	$api.html($api.byId('secondLevel'), '');
	if (code != '00') {
		regionCode = code;
		regionTitle = title;
		var secondLevelList = orgObj[code];
		if (secondLevelList) {
			$api.html($api.byId('secondLevel'), '');
			for (var j = 0; j < secondLevelList.length; j++) {
				if (j == 0) {
					var secondLevelTemplate = $api.byId('secondLevelTemplate');
					var secondLevelCloneObj = secondLevelTemplate.cloneNode(true);
					$api.html($api.dom(secondLevelCloneObj, '.secondLevelName'), 'ALL');
					$api.attr($api.dom(secondLevelCloneObj, 'li'), 'code', '-1');
					$api.attr($api.dom(secondLevelCloneObj, 'li'), 'title', 'ALL');
					$api.append($api.byId('secondLevel'), $api.html(secondLevelCloneObj));
				}
				var secondLevelTemplate = $api.byId('secondLevelTemplate');
				var secondLevelCloneObj = secondLevelTemplate.cloneNode(true);
				$api.html($api.dom(secondLevelCloneObj, '.secondLevelName'), secondLevelList[j].title);
				$api.attr($api.dom(secondLevelCloneObj, 'li'), 'code', secondLevelList[j].code);
				$api.attr($api.dom(secondLevelCloneObj, 'li'), 'title', secondLevelList[j].title);
				$api.append($api.byId('secondLevel'), $api.html(secondLevelCloneObj));
			}
		}
	} else {
		api.closeSlidPane();
		api.sendEvent({
			name : 'selectOrg',
			extra : {
				regionCode : '-1',
				regionTitle : 'ALL',
				branchCode : '-1',
				branchTitle : 'ALL'
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
	var title = $api.attr(me, 'title');

	api.closeSlidPane();

	if (code == '-1') {
		api.sendEvent({
			name : 'selectOrg',
			extra : {
				regionCode : regionCode,
				regionTitle : regionTitle,
				branchCode : '-1',
				branchTitle : 'ALL'
			}
		});
	} else {
		branchCode = code;
		branchTitle = title;
		api.sendEvent({
			name : 'selectOrg',
			extra : {
				regionCode : regionCode,
				regionTitle : regionTitle,
				branchCode : branchCode,
				branchTitle : branchTitle
			}
		});
	}
}


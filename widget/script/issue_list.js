var announce_pageNo = 0;
var announce_pageCount = 0;
var news_pageNo = 0;
var news_pageCount = 0;
var policy_pageNo = 0;
var policy_pageCount = 0;
var orgid = "";
var moudle = 1;
var isNewsListEnd = false;
var isAnnounceListEnd = false;
var isPolicyListEnd = false;
var newsTitle = "";
var announceTitle = "";
var policyTitle = "";
var currentOrg = '';
var userInfo = $api.getStorage("userInfo");
apiready = function() {
	currentOrg = BUSINESS_GetCurrentOrg();
	var $header = $api.dom('header');
	$api.fixIos7Bar($header);
	$api.fixStatusBar($header);
	var headerHeight = $api.offset($header).h;
	orgid = BUSINESS_GetOrgId();

	//var winWidth = api.winWidth;
	//$api.css($api.dom($api.byId('newsSample'), '.right-container'),'width:'+(winWidth-80)+'px');

	//上拉加载
	api.addEventListener({
		name : "scrolltobottom",
		extra : {
			threshold : 50
		}
	}, function(ret, err) {
		if (moudle == 1) {
			loadAnnounceData();
		} else if (moudle == 2) {
			loadNewsData();
		} else if (moudle == 3) {
			loadPolicyData();
		}
	});

	api.addEventListener({
		name : 'swipeleft'
	}, function(ret, err) {
		if (moudle >= 3) {
			return;
		} else {
			moudle = moudle + 1;
			api.sendEvent({
				name : 'issueHeadFresh',
				extra : {
					moudle : moudle
				}
			});
			loadList(moudle);
		}
	});

	api.addEventListener({
		name : 'swiperight'
	}, function(ret, err) {
		if (moudle <= 1) {
			return;
		} else {
			moudle = moudle - 1;
			api.sendEvent({
				name : 'issueHeadFresh',
				extra : {
					moudle : moudle
				}
			});
			loadList(moudle);
		}
	});

	api.addEventListener({
		name : 'issueHeadClickIndex'
	}, function(ret, err) {
		moudle = ret.value.moudle;
		loadList(moudle);
	});

	var moudleIndex = api.pageParam.index;
	moudle = parseInt(moudleIndex);
	COMMON_openFrame({
		name : 'issue_list_head',
		url : 'issue_list_head.html',
		rect : {
			x : 0,
			y : 0,
			w : api.winWidth,
			h : headerHeight
		},
		pageParam : {
			moudle : moudle
		},
		animation : CONSTANT_FRAME_ANIMATION
	});

	$(window).scroll(function(event) {
		var wScrollY = window.scrollY;
		// 当前滚动条位置
		var wInnerH = window.innerHeight;
		// 设备窗口的高度（不会变）
		var bScrollH = document.body.scrollHeight;
		// 滚动条总高度
		if (wScrollY > 0) {
			$api.removeCls($api.byId('scrollTop'), 'aui-hide');
		} else {
			$api.addCls($api.byId('scrollTop'), 'aui-hide');
		}
	});

	//统计页面访问次数
	BUSINESS_PageAccessStatics();
};

function turnToDetailPage(id, moudle) {
	COMMON_OpenWin({
		name : 'issue_detail',
		url : 'issue_detail.html',
		pageParam : {
			id : id,
			moudle : moudle
		}
	});
}

function loadList(moudleIndex) {
	api.sendEvent({
		name : 'issueHeadFresh',
		extra : {
			moudle : moudleIndex
		}
	});

	if (moudleIndex == '1') {
		if ($api.trim(announceTitle)) {
			$api.val($api.byId("searchInputEle"), announceTitle);
			$api.css($api.byId('resetSearchBtn'), 'display:inline-block');
		} else {
			$api.css($api.byId('resetSearchBtn'), 'display:none');
			$api.val($api.byId('searchInputEle'), '');
		}

		$api.css($api.byId('announceContainer'), 'display: block');
		$api.css($api.byId('newsContainer'), 'display: none');
		$api.css($api.byId('policyContainer'), 'display: none');

		if (announce_pageNo == 0) {
			loadAnnounceData();
		}
	} else if (moudleIndex == '2') {
		if ($api.trim(newsTitle)) {
			$api.val($api.byId("searchInputEle"), newsTitle);
			$api.css($api.byId('resetSearchBtn'), 'display:inline-block');
		} else {
			$api.css($api.byId('resetSearchBtn'), 'display:none');
			$api.val($api.byId('searchInputEle'), '');
		}

		$api.css($api.byId('announceContainer'), 'display: none');
		$api.css($api.byId('newsContainer'), 'display: block');
		$api.css($api.byId('policyContainer'), 'display: none');

		if (news_pageNo == 0) {
			loadNewsData();
		}
	} else if (moudleIndex == '3') {
		if ($api.trim(policyTitle)) {
			$api.val($api.byId("searchInputEle"), policyTitle);
			$api.css($api.byId('resetSearchBtn'), 'display:inline-block');
		} else {
			$api.css($api.byId('resetSearchBtn'), 'display:none');
			$api.val($api.byId('searchInputEle'), '');
		}

		$api.css($api.byId('announceContainer'), 'display: none');
		$api.css($api.byId('newsContainer'), 'display: none');
		$api.css($api.byId('policyContainer'), 'display: block');

		if (policy_pageNo == 0) {
			loadPolicyData();
		}
	}

}

function loadAnnounceData() {
	if (isAnnounceListEnd) {
		return;
	}
	var url = ajaxReqHost + 'appListAnnouncement.ajax';
	var keyword = $api.val($api.byId('searchInputEle'));
	var param = {
		from : 'app',
		pageNo : announce_pageNo,
		pageSize : pageSize,
		userId : userInfo.id,
		orgType : currentOrg.orgType,
		orgInnerCode : currentOrg.orgInnerCode,
		//		sendToOrgIds : 1,
		title : $api.trim(announceTitle)
	}
	COMMON_Ajax_Post(url, {
		values : param
	}, function(ret) {
		if (ret && ret.list) {
			for (var i = 0; i < ret.list.length; i++) {
				var obj = ret.list[i];
				var sample = $api.byId('announceSample');
				var cloneObj = sample.cloneNode(true);

				//				if(obj.customerNames){
				//					$api.html($api.dom(cloneObj, '.shortName'), obj.customerNames.substring(0, 2));
				//					$api.html($api.dom(cloneObj, '.announce_distributor'), obj.customerNames);
				//				}

				if (obj.title) {
					$api.html($api.dom(cloneObj, '.shortName'), obj.title.substring(0, 2));
					$api.html($api.dom(cloneObj, '.announce_distributor'), obj.title);
				}
				if (obj.attach) {
					$api.addCls($api.dom(cloneObj, ".announce_distributor"), "attachment");
				}
				$api.html($api.dom(cloneObj, '.announce_date'), COMMON_FormatTimeToTime(obj.createDate));
				$api.html($api.dom(cloneObj, '.announce_category'), obj.categoryLabel);
				//$api.html($api.dom(cloneObj, '.announce_title'), obj.title);
				$api.html($api.dom(cloneObj, '.announce_content'), COMMON_FilterRichTextTag(obj.content));
				$api.append($api.byId('announceList'), '<li class="aui-list-item" onclick="turnToDetailPage(\'' + obj.id + '\', 1)">' + $api.html(cloneObj) + '</li>');

			}
			if (announce_pageNo == 0) {
				api.toast({
					msg : 'Total Quantity: ' + ret.totalCount,
					duration : CONSTANT_TOAST_DURATION
				});
			}

			if (ret.list.length == 0 && announce_pageNo == 0) {
				$api.removeCls($api.byId('announceNoDataInfo'), 'aui-hide');
				isAnnounceListEnd = true;
				return;
			}

			if (ret.list.length < pageSize) {
				$api.removeCls($api.byId('announceFootInfo'), 'aui-hide');
				isAnnounceListEnd = true;
				return;
			}

			announce_pageNo = announce_pageNo + 1;
		}
	});
}

function loadNewsData() {
	if (isNewsListEnd) {
		return;
	}
	var url = ajaxReqHost + 'appListNews.ajax';
	var keyword = $api.val($api.byId('searchInputEle'));

	COMMON_Ajax_Post(url, {
		values : {
			from : 'app',
			pageNo : news_pageNo,
			pageSize : pageSize,
			title : $api.trim(newsTitle)
		}
	}, function(ret) {
		console.info($api.jsonToStr(ret.list));
		if (ret && ret.list) {
			for (var i = 0; i < ret.list.length; i++) {
				var obj = ret.list[i];
				var sample = $api.byId('newsSample');
				var cloneObj = sample.cloneNode(true);
				
				if(obj.userName){
					$api.html($api.dom(cloneObj, '.news_distributor'), obj.userName);
					$api.html($api.dom(cloneObj, '.shortName'), obj.userName.substring(0, 2));
				}
								
				$api.html($api.dom(cloneObj, '.news_date'), COMMON_FormatTimeToTime(obj.createDate));
				$api.html($api.dom(cloneObj, '.news_category'), obj.title);
				//$api.html($api.dom(cloneObj, '.news_title'), obj.title);
				if (obj.attach) {
					$api.addCls($api.dom(cloneObj, ".news_distributor"), "attachment");
				}
				$api.html($api.dom(cloneObj, '.news_content'), COMMON_FilterRichTextTag(obj.content));
				$api.append($api.byId('newsList'), '<li class="aui-list-item" onclick="turnToDetailPage(\'' + obj.id + '\', 2)">' + $api.html(cloneObj) + '</li>');

			}

			if (news_pageNo == 0) {
				api.toast({
					msg : 'Total Quantity: ' + ret.totalCount,
					duration : CONSTANT_TOAST_DURATION
				});
			}

			if (ret.list.length == 0 && news_pageNo == 0) {
				$api.removeCls($api.byId('newsNoDataInfo'), 'aui-hide');
				isNewsListEnd = true;
				return;
			}

			if (ret.list.length < pageSize) {
				$api.removeCls($api.byId('newsFootInfo'), 'aui-hide');
				isNewsListEnd = true;
				return;
			}

			news_pageNo = news_pageNo + 1;
		}
	});
}

function loadPolicyData() {
	if (isPolicyListEnd) {
		return;
	}
	var url = ajaxReqHost + 'appListPolicy.ajax';
	var keyword = $api.val($api.byId('searchInputEle'));
	COMMON_Ajax_Post(url, {
		values : {
			from : 'app',
			pageNo : policy_pageNo,
			pageSize : pageSize,
			title : $api.trim(policyTitle)
		}
	}, function(ret) {
		if (ret && ret.list) {
			for (var i = 0; i < ret.list.length; i++) {
				var obj = ret.list[i];
				var sample = $api.byId('policySample');
				var cloneObj = sample.cloneNode(true);
				//$api.html($api.dom(cloneObj, '.policy_distributor'), obj.customerNames);
				/*
				if(obj.title){
					$api.html($api.dom(cloneObj, '.shortName'), obj.title.substring(0, 2));
				}
				*/
				$api.html($api.dom(cloneObj, '.policy_date'), COMMON_FormatTimeToTime(obj.createDate));
				$api.html($api.dom(cloneObj, '.policy_title'),obj.title);
				if (obj.attach) {
					$api.addCls($api.dom(cloneObj, ".policy_distributor"), "attachment");
				}
				$api.html($api.dom(cloneObj, '.policy_content'), COMMON_FilterRichTextTag(obj.content));
				$api.append($api.byId('policyList'), '<li class="aui-list-item" onclick="turnToDetailPage(\'' + obj.id + '\', 3)">' + $api.html(cloneObj) + '</li>');
			}

			if (policy_pageNo == 0) {
				api.toast({
					msg : 'Total Quantity: ' + ret.totalCount,
					duration : CONSTANT_TOAST_DURATION
				});
			}
			if (ret.list.length == 0 && policy_pageNo == 0) {
				$api.removeCls($api.byId('policyNoDataInfo'), 'aui-hide');
				isPolicyListEnd = true;
				return;
			}

			if (ret.list.length < pageSize) {
				$api.removeCls($api.byId('policyFootInfo'), 'aui-hide');
				isPolicyListEnd = true;
				return;
			}

			policy_pageNo = policy_pageNo + 1;
		}
	});
}

function search() {
	COMMON_UISearchBar(function(ret) {
		var inputText = $api.trim(ret.text);
		$api.val($api.byId("searchInputEle"), inputText);
		$api.css($api.byId('resetSearchBtn'), 'display:inline-block');
		reloadData(inputText);
		
		$api.css($api.byId('searchFlag'), 'left:5px');
		$api.css($api.byId('searchForm'), 'left:26px');
	});
}

function resetSearch() {
	$api.css($api.byId('resetSearchBtn'), 'display:none');
	$api.val($api.byId('searchInputEle'), '');
	var inputText = "";
	$api.css($api.byId('searchFlag'), 'left:initial');
	$api.css($api.byId('searchFlag'), 'right:50%;');
	$api.css($api.byId('searchForm'), 'left:50%');
	
	reloadData(inputText);
}

function reloadData(inputText) {
	if (moudle == 1) {
		announceTitle = inputText;
		announce_pageNo = 0;
		isAnnounceListEnd = false;
		$api.addCls($api.byId('announceNoDataInfo'), 'aui-hide');
		$api.addCls($api.byId('announceFootInfo'), 'aui-hide');
		$api.html($api.byId('announceList'), '');
		loadAnnounceData();
	} else if (moudle == 2) {
		newsTitle = inputText;
		news_pageNo = 0;
		isNewsListEnd = false;
		$api.addCls($api.byId('newsNoDataInfo'), 'aui-hide');
		$api.addCls($api.byId('newsFootInfo'), 'aui-hide');
		$api.html($api.byId('newsList'), '');
		loadNewsData();
	} else if (moudle == 3) {
		policyTitle = inputText;
		policy_pageNo = 0;
		isPolicyListEnd = false;
		$api.addCls($api.byId('policyNoDataInfo'), 'aui-hide');
		$api.addCls($api.byId('policyFootInfo'), 'aui-hide');
		$api.html($api.byId('policyList'), '');
		loadPolicyData();
	}

}
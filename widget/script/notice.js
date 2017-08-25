var inbox_page_no = 0;
var inbox_page_count = 0;
var outbox_page_no = 0;
var outbox_page_count = 0;
var moudle = 1;
var userId;
var inboxTitle = '';
var outboxTitle = '';
var isInboxListEnd = false;
var isOutboxListEnd = false;
var userInfo = $api.getStorage("userInfo");
apiready = function() {
	var $header = $api.dom('header');
	$api.fixIos7Bar($header);
	$api.fixStatusBar($header);
	var headerHeight = $api.offset($header).h;
	userId = userInfo.id;
	COMMON_openFrame({
		name : 'notice_head',
		url : 'notice_head.html',
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
//	if (moudle == "2") {
//		loadOutboxData();
//	} else {
//		moudle = 1;
//		loadInboxData();
//	}

	api.addEventListener({
		name : "scrolltobottom",
		extra : {
			threshold : 100
		}
	}, function(ret, err) {
		if (moudle == 1) {
			loadInboxData();
		} else if (moudle == 2) {
			loadOutboxData();
		}
	})

	api.addEventListener({
		name : 'swiperight'
	}, function(ret, err) {
		if (moudle <= 1) {
			return;
		} else {
			moudle = moudle - 1;
			api.sendEvent({
				name : 'noticeHeadFresh',
				extra : {
					moudle : moudle
				}
			});
			if ($api.trim(inboxTitle)) {
				$api.val($api.byId("searchInputEle"), inboxTitle);
				$api.css($api.byId('resetResolvedSearchBtn'), 'display:inline-block');
			} else {
				$api.val($api.byId("searchInputEle"), '');
				$api.css($api.byId('resetResolvedSearchBtn'), 'display:none');
			}
			$api.css($api.byId('inbox'), 'display: block');
			$api.css($api.byId('outbox'), 'display: none');
			loadInboxData(moudle);
		}
	});

	api.addEventListener({
		name : 'swipeleft'
	}, function(ret, err) {
		if (moudle >= 2) {
			return;
		} else {
			moudle = moudle + 1;
			api.sendEvent({
				name : 'noticeHeadFresh',
				extra : {
					moudle : moudle
				}
			});
			if ($api.trim(outboxTitle)) {
				$api.val($api.byId("searchInputEle"), outboxTitle);
				$api.css($api.byId('resetResolvedSearchBtn'), 'display:inline-block');
			} else {
				$api.val($api.byId("searchInputEle"), '');
				$api.css($api.byId('resetResolvedSearchBtn'), 'display:none');
			}
			$api.css($api.byId('inbox'), 'display: none');
			$api.css($api.byId('outbox'), 'display: block');
			loadOutboxData(moudle);
		}
	});
	
	api.addEventListener({
		name : 'noticeHeadClickIndex'
	}, function(ret, err) {
		moudle = ret.value.moudle;
		
		if(moudle==1){
			if ($api.trim(inboxTitle)) {
				$api.val($api.byId("searchInputEle"), inboxTitle);
				$api.css($api.byId('resetResolvedSearchBtn'), 'display:inline-block');
			} else {
				$api.val($api.byId("searchInputEle"), '');
				$api.css($api.byId('resetResolvedSearchBtn'), 'display:none');
			}
			$api.css($api.byId('inbox'), 'display: block');
			$api.css($api.byId('outbox'), 'display: none');
			loadInboxData(moudle);
		
		}else if(moudle==2){
			if ($api.trim(outboxTitle)) {
				$api.val($api.byId("searchInputEle"), outboxTitle);
				$api.css($api.byId('resetResolvedSearchBtn'), 'display:inline-block');
			} else {
				$api.val($api.byId("searchInputEle"), '');
				$api.css($api.byId('resetResolvedSearchBtn'), 'display:none');
			}
			$api.css($api.byId('inbox'), 'display: none');
			$api.css($api.byId('outbox'), 'display: block');
			loadOutboxData(moudle);
		}
	});
	
	

	api.addEventListener({
		name : 'refreshOutbox'
	}, function(ret, err) {
		outbox_page_no = 0;
		moudle = 2;
		isOutboxListEnd = false;
		$api.css($api.byId('inbox'), 'display: none');
		$api.css($api.byId('outbox'), 'display: block');
		outboxTitle = '';
		$api.val($api.byId("searchInputEle"), '');
		$api.css($api.byId('resetResolvedSearchBtn'), 'display:none');
		var oldData = $api.domAll('#outboxUl li');
		for (var i = 0; i < oldData.length; i++) {
			$api.remove(oldData[i]);
		}
		api.sendEvent({
			name : 'noticeHeadFresh',
			extra : {
				moudle : moudle
			}
		});
		loadOutboxData();

	});
	
	api.addEventListener({
	        name:'refreshInboxData'
        },function(ret,err){
        	inbox_page_no = 0;
			isInboxListEnd = false;
			inboxTitle = '';
			$api.html($api.byId('inboxUl'), '');
			$api.addCls($api.byId('inboxNoDataInfo'), 'aui-hide');
			$api.addCls($api.byId('inboxFootInfo'), 'aui-hide');
			loadInboxData();
        });
	//统计页面访问次数
	BUSINESS_PageAccessStatics();
	
	$(window).scroll(function(event){  
	    var wScrollY = window.scrollY; // 当前滚动条位置    
	    var wInnerH = window.innerHeight; // 设备窗口的高度（不会变）    
	    var bScrollH = document.body.scrollHeight; // 滚动条总高度   
	   	if(wScrollY > 0){
	   		$api.removeCls($api.byId('scrollTop'), 'aui-hide');
	   	}else{
	   		$api.addCls($api.byId('scrollTop'), 'aui-hide');
	   	}
	});

}

function loadInboxData() {
	if (isInboxListEnd) {
		return;
	}
	var url = ajaxReqHost + 'appListMessage.ajax';
	var param = {
		"from" : "app",
		pageNo : inbox_page_no,
		pageSize : pageSize,
		messageTitle : inboxTitle,
		'userIds' : userId
	}
	
	COMMON_Ajax_Post(url, {
		values : param
	}, function(ret) {
		if (ret && ret.list) {
			var listContent = '';
			for (var i = 0; i < ret.list.length; i++) {
				var obj = ret.list[i];
				var inboxTemplate = $api.byId('inboxTemplate');
				var cloneObj = inboxTemplate.cloneNode(true);
				$api.html($api.dom(cloneObj, '.dealer'), obj.fromUserName);
				$api.html($api.dom(cloneObj, '.title'), obj.messageTitle || '');
				$api.html($api.dom(cloneObj, '.content'), obj.details);
				if (obj.link) {
					$api.removeCls($api.dom(cloneObj, '.inboxImage'), "aui-hide");
				}
				if (!obj.isRead) {
					$api.removeCls($api.dom(cloneObj, '.noReadMessage'), 'aui-hide');
				}
				$api.html($api.dom(cloneObj, '.create_time'), COMMON_FormatTimeToTime(obj.createDate));
				listContent += '<li class="aui-list-item" onclick="turnToDetailPage(\'' + obj.id + '\', 1)">' + $api.html(cloneObj) + '</li>';
			}
			
			$api.append($api.byId('inboxUl'), listContent);
			
			if (inbox_page_no == 0) {
				api.toast({
					msg : 'Total Quantity: ' + ret.totalCount,
					duration : CONSTANT_TOAST_DURATION
				});
			}

			if (ret.list.length == 0 && inbox_page_no == 0) {
				$api.removeCls($api.byId('inboxNoDataInfo'), 'aui-hide');
				isInboxListEnd = true;
				return;
			}

			if (ret.list.length < pageSize) {
				$api.removeCls($api.byId('inboxFootInfo'), 'aui-hide');
				isInboxListEnd = true;
				return;
			}

			inbox_page_no = inbox_page_no + 1;
		}
	});
}

function loadOutboxData() {
	if (isOutboxListEnd) {
		return;
	}
	var url = ajaxReqHost + 'appListMessage.ajax';

	COMMON_Ajax_Post(url, {
		values : {
			"from" : "app",
			pageNo : outbox_page_no,
			pageSize : pageSize,
			messageTitle : outboxTitle,
			'fromUser.id' : userId
		}
	}, function(ret) {
		if (ret && ret.list) {
			for (var i = 0; i < ret.list.length; i++) {
				var obj = ret.list[i];
				var outboxTemplate = $api.byId('outboxTemplate');
				var cloneObj = outboxTemplate.cloneNode(true);
				$api.html($api.dom(cloneObj, '.dealer'), obj.toUserNames);
				$api.html($api.dom(cloneObj, '.title'), obj.messageTitle);
				$api.html($api.dom(cloneObj, '.content'), obj.details);
				if (obj.link) {
					$api.removeCls($api.dom(cloneObj, '.outboxImage'), "aui-hide");
				}
				//$api.html($api.dom(cloneObj, '.category'), obj.category);
				$api.html($api.dom(cloneObj, '.create_time'), COMMON_FormatTimeToTime(obj.createDate));
				$api.append($api.byId('outboxUl'), '<li class="aui-list-item" onclick="turnToDetailPage(\'' + obj.id + '\', 2)">' + $api.html(cloneObj) + '</li>');
			}

			if (outbox_page_no == 0) {
				api.toast({
					msg : 'Total Quantity: ' + ret.totalCount,
					duration : CONSTANT_TOAST_DURATION
				});
			}

			if (ret.list.length == 0 && outbox_page_no == 0) {
				$api.removeCls($api.byId('outboxNoDataInfo'), 'aui-hide');
				isOutboxListEnd = true;
				return;
			}
			if (ret.list.length < pageSize) {
				$api.removeCls($api.byId('outboxFootInfo'), 'aui-hide');
				isOutboxListEnd = true;
				return;
			}

			outbox_page_no = outbox_page_no + 1;

		}
	});
}

function turnToDetailPage(id, moudle) {
	COMMON_OpenWin({
		name : 'notice_detail',
		url : 'notice_detail.html',
		pageParam : {
			id : id,
			moudle : moudle
		}
	});
}

function search() {
	COMMON_UISearchBar(function(ret) {
	var searchTitle=$api.trim(ret.text);
		$api.val($api.byId("searchInputEle"), searchTitle);
		$api.css($api.byId('resetResolvedSearchBtn'), 'display:inline-block');
		$api.css($api.byId('searchFlag'), 'left:5px');
		$api.css($api.byId('searchForm'), 'left:26px');
		if (moudle == "1") {
			inbox_page_no = 0;
			isInboxListEnd = false;
			inboxTitle = searchTitle;
			$api.html($api.byId('inboxUl'), '');
			$api.addCls($api.byId('inboxNoDataInfo'), 'aui-hide');
			$api.addCls($api.byId('inboxFootInfo'), 'aui-hide');
			loadInboxData();
		} else if (moudle == "2") {
			outbox_page_no = 0;
			isOutboxListEnd = false;
			outboxTitle = searchTitle;
			$api.html($api.byId('outboxUl'), '');
			$api.addCls($api.byId('outboxNoDataInfo'), 'aui-hide');
			$api.addCls($api.byId('outboxFootInfo'), 'aui-hide');
			loadOutboxData();
		}
	});
}

function resetResolvedSearch() {
	$api.css($api.byId('resetResolvedSearchBtn'), 'display:none');
	$api.val($api.byId('searchInputEle'), '');
	$api.css($api.byId('searchFlag'), 'left:initial');
	$api.css($api.byId('searchFlag'), 'right:50%;');
	$api.css($api.byId('searchForm'), 'left:50%');
	if (moudle == "1") {
		inbox_page_no = 0;
		isInboxListEnd = false;
		inboxTitle = '';
		$api.html($api.byId('inboxUl'), '');
		$api.addCls($api.byId('inboxNoDataInfo'), 'aui-hide');
		$api.addCls($api.byId('inboxFootInfo'), 'aui-hide');
		loadInboxData();
	} else if (moudle == "2") {
		outbox_page_no = 0;
		isOutboxListEnd = false;
		outboxTitle = '';
		$api.html($api.byId('outboxUl'), '');
		$api.addCls($api.byId('outboxNoDataInfo'), 'aui-hide');
		$api.addCls($api.byId('outboxFootInfo'), 'aui-hide');
		loadOutboxData();
	}
}

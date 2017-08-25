var faq_page_no = 0;
var faq_page_count = 0;
var unsolved_page_no = 0;
var unsolved_page_count = 0;
var resolved_page_no = 0;
var resolved_page_count = 0;
var faqSearchTitle = "";
var unsolvedSearchTitle = "";
var solvedSearchTitle = "";
var moudle = 1;
var userInfo = $api.getStorage("userInfo");
var isFaqListEnd = false;
var isUnsolvedEndListEnd = false;
var isSolvedEndListEnd = false;
var headerHeight;
apiready = function() {
	var $header = $api.dom('header');
	$api.fixStatusBar($header);
	$api.fixIos7Bar($header);
	headerHeight = $api.offset($header).h;

	COMMON_openFrame({
		name : 'question_list_head',
		url : 'question_list_head.html',
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
	
	api.addEventListener({
		name : 'questionHeadClickIndex'
	}, function(ret, err) {
		moudle = ret.value.moudle;
		if (moudle == 1) {
		$api.css($api.byId('faqContainer'), 'display: block');
		$api.css($api.byId('unsolvedContainer'), 'display: none');
		$api.css($api.byId('resolvedContainer'), 'display: none');
			loadFAQData();
		} else if (moudle == 2) {
		$api.css($api.byId('unsolvedContainer'), 'display: block');
		$api.css($api.byId('faqContainer'), 'display: none');
		$api.css($api.byId('resolvedContainer'), 'display: none');
			loadUnsolvedData();
		} else if (moudle == 3) {
		$api.css($api.byId('resolvedContainer'), 'display: block');
		$api.css($api.byId('faqContainer'), 'display: none');
		$api.css($api.byId('unsolvedContainer'), 'display: none');
			loadResolvedData();
		}
	});

	api.addEventListener({
		name : "scrolltobottom",
		extra : {
			threshold : 50
		}
	}, function(ret, err) {
		if (moudle == 1) {
			loadFAQData();
		} else if (moudle == 2) {
			loadUnsolvedData();
		} else if (moudle == 3) {
			loadResolvedData();
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
				name : 'questionHeadFresh',
				extra : {
					moudle : moudle
				}
			});
			if (moudle == 1) {
				$api.css($api.byId('faqContainer'), 'display: block');
				$api.css($api.byId('unsolvedContainer'), 'display: none');
				$api.css($api.byId('resolvedContainer'), 'display: none');
				if (faq_page_no == 0) {
					loadFAQData();
				}
			} else if (moudle == 2) {
				$api.css($api.byId('unsolvedContainer'), 'display: block');
				$api.css($api.byId('faqContainer'), 'display: none');
				$api.css($api.byId('resolvedContainer'), 'display: none');
				if (unsolved_page_no == 0) {
					loadUnsolvedData();
				}
			} else if (moudle == 3) {
				$api.css($api.byId('resolvedContainer'), 'display: block');
				$api.css($api.byId('faqContainer'), 'display: none');
				$api.css($api.byId('unsolvedContainer'), 'display: none');
				if (resolved_page_no == 0) {
					loadResolvedData();
				}
			}
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
				name : 'questionHeadFresh',
				extra : {
					moudle : moudle
				}
			});
			if (moudle == 1) {
				$api.css($api.byId('faqContainer'), 'display: block');
				$api.css($api.byId('unsolvedContainer'), 'display: none');
				$api.css($api.byId('resolvedContainer'), 'display: none');
				if (faq_page_no == 0) {
					loadFAQData();
				}
			} else if (moudle == 2) {
				$api.css($api.byId('unsolvedContainer'), 'display: block');
				$api.css($api.byId('faqContainer'), 'display: none');
				$api.css($api.byId('resolvedContainer'), 'display: none');
				if (unsolved_page_no == 0) {
					loadUnsolvedData();
				}
			} else if (moudle == 3) {
				$api.css($api.byId('resolvedContainer'), 'display: block');
				$api.css($api.byId('faqContainer'), 'display: none');
				$api.css($api.byId('unsolvedContainer'), 'display: none');
				if (resolved_page_no == 0) {
					loadResolvedData();
				}
			}
		}
	});

	api.addEventListener({
		name : 'refreshUnsolved'
	}, function(ret, err) {
	api.sendEvent({
				name : 'questionHeadFresh',
				extra : {
					moudle : 2
				}
			});
		unsolved_page_no = 0;
		moudle = 2;
		isUnsolvedEndListEnd = false;
		$api.css($api.byId('unsolvedContainer'), 'display: block');
		$api.css($api.byId('faqContainer'), 'display: none');
		$api.css($api.byId('resolvedContainer'), 'display: none');
		$api.addCls($api.byId("unsolvedFootInfo"), "aui-hide");
		$api.addCls($api.byId("unsolvedNoDataInfo"), "aui-hide");
		$api.html($api.byId('unsolvedUl'), '');
		loadUnsolvedData();

	});
	
	api.addEventListener({
		name : 'refreshSolved'
	}, function(ret, err) {
		api.sendEvent({
				name : 'questionHeadFresh',
				extra : {
					moudle : 2
				}
			});
		unsolved_page_no = 0;
		moudle = 2;
		isUnsolvedEndListEnd = false;
		$api.css($api.byId('unsolvedContainer'), 'display: block');
		$api.css($api.byId('faqContainer'), 'display: none');
		$api.css($api.byId('resolvedContainer'), 'display: none');
		$api.addCls($api.byId('unsolvedFootInfo'), 'aui-hide');
		$api.addCls($api.byId('unsolvedNoDataInfo'), 'aui-hide');
		$api.html($api.byId('unsolvedUl'), '');
		loadUnsolvedData();
		
		resolved_page_no=0;
		isSolvedEndListEnd = false;
		$api.addCls($api.byId('resolveNoDataInfo'), 'aui-hide');
		$api.addCls($api.byId('resolveFootInfo'), 'aui-hide');
		$api.html($api.byId('resolvedUl'), '');
		loadResolvedData();

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

};
function turnToDetailPage(questionId, type) {
	if (type == 1) {
		COMMON_OpenWin({
			name : 'questionFAQ_detail',
			url : 'questionFAQ_detail.html',
			pageParam : {
				id : questionId,
				type : type
			}
		});
	} else if (type == 2) {
		COMMON_OpenWin({
			name : 'question_detail',
			url : 'question_detail.html',
			pageParam : {
				id : questionId,
				type : type
			}
		});
	} else if (type == 3) {
		COMMON_OpenWin({
			name : 'questionSolved_detail',
			url : 'questionSolved_detail.html',
			pageParam : {
				id : questionId,
				type : type
			}
		});
	}

}


function loadFAQData() {
	if (isFaqListEnd) {
		return;

	}
	var url = ajaxReqHost + 'appListFaqQuestion.ajax';
	COMMON_Ajax_Post(url, {
		values : {
			from : 'app',
			pageNo : faq_page_no,
			pageSize : pageSize,
			title : faqSearchTitle,
		}
	}, function(ret) {
		if (ret && ret.list) {
			for (var i = 0; i < ret.list.length; i++) {
				var obj = ret.list[i];
				var faqTemplate = $api.byId('faqTemplate');
				var cloneObj = faqTemplate.cloneNode(true);
				//$api.html($api.dom(cloneObj, '.title'), obj.title);
				$api.html($api.dom(cloneObj, '.content'), obj.content);
				$api.html($api.dom(cloneObj, '.category'), obj.categoryLabel);
				$api.html($api.dom(cloneObj, '.title'), obj.title);
				if(obj.attach){
				$api.removeCls($api.dom(cloneObj, "faqImage"), "aui-hide");
				}
				$api.html($api.dom(cloneObj, '.create_time'), COMMON_FormatTimeToTime(obj.createDate));
				$api.attr($api.dom(cloneObj, 'li'), 'onclick', 'turnToDetailPage(\'' + obj.id + '\', 1)');
				$api.append($api.byId('faqUl'), $api.html(cloneObj));
			}

			if (faq_page_no == 0) {
				api.toast({
					msg : 'Total Quantity: ' + ret.totalCount,
					duration : CONSTANT_TOAST_DURATION
				});
			}

			if (ret.list.length == 0 && faq_page_no == 0) {
				$api.removeCls($api.byId('faqNoDataInfo'), 'aui-hide');
				isFaqListEnd = true;
				return;
			}

			if (ret.list.length < pageSize) {
				$api.removeCls($api.byId('faqFootInfo'), 'aui-hide');
				isFaqListEnd = true;
				return;
			}
			faq_page_no = faq_page_no + 1;
		}
	});
}

function loadUnsolvedData() {
	if (isUnsolvedEndListEnd) {
		return;
	}
	
	var param={
			from : 'app',
			pageNo : unsolved_page_no,
			pageSize : pageSize,
			status : 'INIT,ANSWER,EXPIRE',
			title : unsolvedSearchTitle,
			'user.id' : userInfo.id
	};
		
	var url = ajaxReqHost + 'appListQuestion.ajax';
	COMMON_Ajax_Post(url, {
		values : param
	}, function(ret) {
		if (ret && ret.list) {
			for (var i = 0; i < ret.list.length; i++) {
				var obj = ret.list[i];
				var unsolvedTemplate = $api.byId('unsolvedTemplate');
				var cloneObj = unsolvedTemplate.cloneNode(true);
				$api.html($api.dom(cloneObj, '.dealer'), obj.questionName);
				$api.html($api.dom(cloneObj, '.title'), obj.title);
				$api.html($api.dom(cloneObj, '.content'), obj.content);
				$api.html($api.dom(cloneObj, '.category'), obj.categoryLabel);
				if(obj.attach){
				$api.removeCls($api.dom(cloneObj, "unsolvedImage"), "aui-hide");
				}
				$api.html($api.dom(cloneObj, '.create_time'), COMMON_FormatTimeToTime(obj.createDate));
				$api.attr($api.dom(cloneObj, 'li'), 'onclick', 'turnToDetailPage(\'' + obj.id + '\', 2)');
				$api.append($api.byId('unsolvedUl'), $api.html(cloneObj));
			}

			if (unsolved_page_no == 0) {
				api.toast({
					msg : 'Total Quantity: ' + ret.totalCount,
					duration : CONSTANT_TOAST_DURATION
				});
			}

			if (ret.list.length == 0 && unsolved_page_no == 0) {
				$api.removeCls($api.byId('unsolvedNoDataInfo'), 'aui-hide');
				isUnsolvedEndListEnd = true;
				return;
			}

			if (ret.list.length < pageSize) {
				$api.removeCls($api.byId('unsolvedFootInfo'), 'aui-hide');
				isUnsolvedEndListEnd = true;
				return;
			}
			unsolved_page_no = unsolved_page_no + 1;
		}
	});
}

function loadResolvedData() {
	if (isSolvedEndListEnd) {
		return;
	}
	var url = ajaxReqHost + 'appListQuestion.ajax';
	COMMON_Ajax_Post(url, {
		values : {
			from : 'app',
			pageNo : resolved_page_no,
			pageSize : pageSize,
			status : 'CLOSE',
			title : solvedSearchTitle,
			'user.id' : userInfo.id
		}
	}, function(ret) {
		if (ret && ret.list) {
			for (var i = 0; i < ret.list.length; i++) {
				var obj = ret.list[i];
				var solvedTemplate = $api.byId('solvedTemplate');
				var cloneObj = solvedTemplate.cloneNode(true);
				$api.html($api.dom(cloneObj, '.dealer'), obj.questionName);
				$api.html($api.dom(cloneObj, '.title'), obj.title);
				$api.html($api.dom(cloneObj, '.content'), obj.content);
				$api.html($api.dom(cloneObj, '.category'), obj.categoryLabel);
				if(obj.attach){
				$api.removeCls($api.dom(cloneObj, "solvedImage"), "aui-hide");
				}
				$api.html($api.dom(cloneObj, '.create_time'), COMMON_FormatTimeToTime(obj.createDate));
				$api.attr($api.dom(cloneObj, 'li'), 'onclick', 'turnToDetailPage(\'' + obj.id + '\', 3)');
				$api.append($api.byId('resolvedUl'), $api.html(cloneObj));
			}

			if (resolved_page_no == 0) {
				api.toast({
					msg : 'Total Quantity: ' + ret.totalCount,
					duration : CONSTANT_TOAST_DURATION
				});
			}

			if (ret.list.length == 0 && resolved_page_no == 0) {
				$api.removeCls($api.byId('resolveNoDataInfo'), 'aui-hide');
				isSolvedEndListEnd = true;
				return;
			}

			if (ret.list.length < pageSize) {
				$api.removeCls($api.byId('resolveFootInfo'), 'aui-hide');
				isSolvedEndListEnd = true;
				return;
			}
			resolved_page_no = resolved_page_no + 1;
		}
	});
}

function searchFAQ() {
	COMMON_UISearchBar(function(ret) {
	var searchTitle=$api.trim(ret.text);
		$api.val($api.byId('faqSearchInput'), searchTitle);
		$api.css($api.byId('searchFlagFAQ'), 'left:5px');
		$api.css($api.byId('searchFormFAQ'), 'left:26px');
		$api.css($api.byId('resetFaqSearchBtn'), 'display:inline-block');
		faqSearchTitle = searchTitle;
		$api.html($api.byId('faqUl'), '');
		isFaqListEnd = false;
		faq_page_no = 0;
		faq_page_count = 0;
		$api.addCls($api.byId('faqFootInfo'), 'aui-hide');
		$api.addCls($api.byId('faqNoDataInfo'), 'aui-hide');
		loadFAQData();
		
	});
}

function resetFaqSearch() {
	$api.css($api.byId('resetFaqSearchBtn'), 'display:none');
	$api.val($api.byId('faqSearchInput'), '');
	$api.css($api.byId('searchFlagFAQ'), 'left:initial');
	$api.css($api.byId('searchFlagFAQ'), 'right:50%;');
	$api.css($api.byId('searchFormFAQ'), 'left:50%');
	faqSearchTitle = "";
	$api.html($api.byId('faqUl'), '');
	isFaqListEnd = false;
	faq_page_no = 0;
	faq_page_count = 0;
	$api.addCls($api.byId('faqFootInfo'), 'aui-hide');
	$api.addCls($api.byId('faqNoDataInfo'), 'aui-hide');
	loadFAQData();
	
}

function searchUnsolved() {
	COMMON_UISearchBar(function(ret) {
		if (ret) {
		var searchTitle=$api.trim(ret.text);
			$api.val($api.byId('unsolvedSearchInput'), searchTitle);
			$api.css($api.byId('resetUnsolvedSearchBtn'), 'display:inline-block');
			$api.css($api.byId('searchFlagUnsolved'), 'left:5px');
			$api.css($api.byId('searchFormUnsolved'), 'left:26px');
			unsolvedSearchTitle = searchTitle;
			$api.html($api.byId('unsolvedUl'), '');
			isUnsolvedEndListEnd = false;
			unsolved_page_no = 0;
			unsolved_page_count = 0;
			$api.addCls($api.byId('unsolvedFootInfo'), 'aui-hide');
			$api.addCls($api.byId('unsolvedNoDataInfo'), 'aui-hide');
			loadUnsolvedData();
			
		} else {

		}
	})
}

function resetUnsolvedSearch() {
	$api.css($api.byId('resetUnsolvedSearchBtn'), 'display:none');
	$api.val($api.byId('unsolvedSearchInput'), '');
	$api.css($api.byId('searchFlagUnsolved'), 'left:initial');
	$api.css($api.byId('searchFlagUnsolved'), 'right:50%;');
	$api.css($api.byId('searchFormUnsolved'), 'left:50%');
	unsolvedSearchTitle = "";
	$api.html($api.byId('unsolvedUl'), '');
	isUnsolvedEndListEnd = false;
	unsolved_page_no = 0;
	unsolved_page_count = 0;
	$api.addCls($api.byId('unsolvedFootInfo'), 'aui-hide');
	$api.addCls($api.byId('unsolvedNoDataInfo'), 'aui-hide');
	loadUnsolvedData();
	
}

function searchResolved() {
	var UISearchBar = api.require('UISearchBar');
	UISearchBar.open({
		placeholder : $.i18n.prop('please_enter_a_keyword'),
		historyCount : 10,
		showRecordBtn : true,
		texts : {
			cancelText : $.i18n.prop('back'),
			clearText : $.i18n.prop('clear_search_log')
		},
		styles : {
			navBar : {
				bgColor : '#FFFFFF',
				borderColor : '#ccc'
			},
			searchBox : {
				bgImg : '',
				color : '#000',
				height : 44
			},
			cancel : {
				bg : 'rgba(0,0,0,0)',
				color : '#D2691E',
				size : 16
			},
			list : {
				color : '#696969',
				bgColor : '#FFFFFF',
				borderColor : '#eee',
				size : 16
			},
			clear : {
				color : '#000000',
				borderColor : '#ccc',
				size : 16
			}
		}
	}, function(ret, err) {
		if (ret) {
		var searchTitle=$api.trim(ret.text);
			$api.val($api.byId('resolvedSearchInput'), searchTitle);
			$api.css($api.byId('resetResolvedSearchBtn'), 'display:inline-block');
			$api.css($api.byId('searchFlagResolved'), 'left:5px');
			$api.css($api.byId('searchFormResolved'), 'left:26px');
			solvedSearchTitle = searchTitle;
			$api.html($api.byId('resolvedUl'), '');
			isSolvedEndListEnd = false;
			resolved_page_no = 0;
			resolved_page_count = 0;
			$api.addCls($api.byId('resolveFootInfo'), 'aui-hide');
			$api.addCls($api.byId('resolveNoDataInfo'), 'aui-hide');
			loadResolvedData();
			
		} else {

		}
	});
}

function resetResolvedSearch() {
	$api.css($api.byId('resetResolvedSearchBtn'), 'display:none');
	$api.val($api.byId('resolvedSearchInput'), '');
	$api.css($api.byId('searchFlagResolved'), 'left:initial');
	$api.css($api.byId('searchFlagResolved'), 'right:50%;');
	$api.css($api.byId('searchFormResolved'), 'left:50%');
	solvedSearchTitle = "";
	$api.html($api.byId('resolvedUl'), '');
	isSolvedEndListEnd = false;
	resolved_page_no = 0;
	resolved_page_count = 0;
	$api.addCls($api.byId('resolveFootInfo'), 'aui-hide');
	$api.addCls($api.byId('resolveNoDataInfo'), 'aui-hide');
	loadResolvedData();
	
}

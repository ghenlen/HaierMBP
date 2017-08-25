var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
var weeks = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
var userId;
var userInfo = $api.getStorage("userInfo");
var myDatePicker;
var historyListData = [];
var attendanceData = [];
var curMonthYear;
var cClickYear = '';
var cClickMonth = '';
var cClickDate = '';

apiready = function() {
	var $header = $api.dom('header');
	$api.fixIos7Bar($header);
	$api.fixStatusBar($header);
	var headerHeight = $api.offset($header).h;
	userId = userInfo.id;
	COMMON_openFrame({
		name : 'attendanceNew_head2',
		url : 'attendanceNew_head2.html',
		rect : {
			x : 0,
			y : 0,
			w : api.winWidth,
			h : headerHeight
		}
		//animation : CONSTANT_FRAME_ANIMATION
	});
	var myCalendar = new SimpleCalendar('#container', {
		width : api.winWidth + "px",
		height : "290px",
		language : 'EN', //语言
		showLunarCalendar : false, //阴历
		showHoliday : false, //休假
		showFestival : false, //节日
		showLunarFestival : false, //农历节日
		showSolarTerm : false, //节气
		showMark : false, //标记
		timeRange : {
			startYear : 1900,
			endYear : 2100
		},
		mark : {
		},
		theme:{
			changeAble : true,
			weeks : {
				backgroundColor : '#ffffff',
				fontColor : '#4A4A4A',
				fontSize : '24px',
			},
			days : {
				backgroundColor : '#ffffff',
				fontColor : '#565555',
				fontSize : '28px'
			},
			todaycolor : 'orange',
			activeSelectColor : 'orange',
		}
	});

	loadData();
	//统计页面访问次数
	BUSINESS_PageAccessStatics();
}
function loadData() {
	var date = new Date();
	var month = date.getMonth() + 1;
	var day = date.getDate();
	var date2 = date.getFullYear() + '-' + month + '-' + date.getDate();
	cClickYear = date.getFullYear();
	cClickMonth = month;
	cClickDate = day;

	cYear = date.getFullYear();
	cMonth = month;
	cDate = day;

	if (month < 10) {
		month = "0" + month;
	}
	if (day < 10) {
		day = "0" + day;
	}
	curMonthYear = date.getFullYear() + "-" + month;
	var date1 = date.getFullYear() + '-' + month;
	var date3 = date.getFullYear() + '-' + month + '-' + day;
	$api.html($api.byId("curDate"), date3);
	$("#curWeek").html(weeks[date.getDay()]);
	getHistoryList(date1, date2);
}

function getHistoryList(param, date3) {
	$api.html($api.byId('historyList'), '');
	var url = ajaxReqHost + 'appListAttendance.ajax';
	COMMON_Ajax_Post(url, {
		values : {
			pageSize : '31',
			pageNo : 0,
			from : 'app',
			'user.id' : userInfo.id,
			day : param
		}
	}, function(ret1) {
		if (ret1) {
			var ret = $api.strToJson(ret1);
			historyListData = ret;
			for (var key in ret) {
				var template = $api.byId('template');
				var cloneObj = template.cloneNode(true);
				var date = key.substring(key.indexOf('-') + 1);
				var day = date.substring(date.indexOf('-') + 1);
				var month = date.substring(0, date.indexOf('-'));
				$api.html($api.dom(cloneObj, '.day'), day);
				$api.html($api.dom(cloneObj, '.month'), months[parseInt(month) - 1]);
				var attendanceList = ret[key];
				for (var j = 0; j < attendanceList.length; j++) {
					var attendanceTemplate = $api.byId('attendanceTemplate');
					var attendanceCloneObj = attendanceTemplate.cloneNode(true);
					var time = attendanceList[j].attendanceDate;
					//$api.html($api.dom(attendanceCloneObj, '.time'), moment.utc(time).utcOffset(5).format('HH:mm'));
					//$api.html($api.dom(attendanceCloneObj, '.time'), moment.utc(time).utcOffset(-7).format('HH:mm'));
					$api.html($api.dom(attendanceCloneObj, '.time'), time);
					$api.html($api.dom(attendanceCloneObj, '.location'), (attendanceList[j]['shop.title']) || '');
					$api.append($api.dom(cloneObj, '.attendance_list'), $api.html(attendanceCloneObj));
				}
				$api.append($api.byId('historyList'), $api.html(cloneObj));
			}
			if (date3) {
				getCurDateAttendance(date3);
			}

		}
	}, 'text');
}

function getCurDateAttendance() {
	var clickDate;
	var cmonth = cClickMonth;
	var cDate = cClickDate;
	if (cmonth < 10) {
		cmonth = "0" + cmonth;
	}
	if (cDate < 10) {
		cDate = "0" + cDate;
	}
	
	var dt = new Date(cClickYear, (cmonth-1), cDate);
	clickDate = cClickYear + "-" + cmonth + "-" + cDate;
	$("#curWeek").html(weeks[dt.getDay()]);
	$api.html($api.byId("curDate"), clickDate);
	$api.html($api.byId("attendanceData"), "");
	for (var key in historyListData) {
		if (key == clickDate) {
			attendanceData = historyListData[key];
			//var data = "";
			for (var i = 0; i < attendanceData.length; i++) {
				var attendanceTemplate = $api.byId('attendanceTemplate');
				var attendanceCloneObj = attendanceTemplate.cloneNode(true);
				var time = attendanceData[i].attendanceDate;
				$api.html($api.dom(attendanceCloneObj, '.time'), time);
				$api.html($api.dom(attendanceCloneObj, '.location'), (attendanceData[i]['shop.title']) || '');
				//data = data + time + "&nbsp;&nbsp;" + attendanceData[i]['shop.address'] + "</br>"
				$api.append($api.byId("attendanceData"), $api.html(attendanceCloneObj));
			}

		}
	}
}

function getMonthAttendance(cType) {
	var cClickMonth1 = cClickMonth;
	if (cClickMonth < 10) {
		cClickMonth1 = "0" + cClickMonth1;
	}
	var date1 = cClickYear + "-" + cClickMonth1;
	getHistoryList(date1);
	if (cType == 2) {
		getCurDateAttendance();
	}
}

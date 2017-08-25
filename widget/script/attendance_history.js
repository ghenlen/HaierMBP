var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
var userInfo = $api.getStorage("userInfo");
apiready = function() {
	var $header = $api.dom('header');
	$api.fixIos7Bar($header);
	$api.fixStatusBar($header);
	var $header = $api.dom('header');
	var headerHeight = $api.offset($header).h;
	COMMON_openFrame({
		name : 'attendance_history_head',
		url : 'attendance_history_head.html',
		rect : {
			x : 0,
			y : 0,
			w : api.winWidth,
			h : headerHeight
		}
	});
	
	var date = new Date();
	var month = date.getMonth()　+ 1;
	if(month<10){
			month = '0' + month;
	}
	var year = date.getFullYear();
	$api.html($api.byId('monthText'), month+ ' / ' +year);
	
	var date = year +'-'+ month;
	getHistoryList(date);
}

function selectMonth(){
	COMMON_YearMonthActionSelector(function(ret) {
		var year = ret.level1;
		var month = ret.level2;
		if(month<10){
			month = '0' + month;
		}
		$api.html($api.byId('monthText'), month+ ' / ' +year);
		var date = year +'-'+ month;
		getHistoryList(date);
	});
}

function loadData() {
	list = [{
		'day' : '2016-12',
		'attendanceList' : [{
			'attendanceDate' : '03:12'
		}, {
			'attendanceDate' : '03:12'
		}]
	}];
	for (var i = 0; i < data.length; i++) {
		var template = $api.byId('template');
		var cloneObj = template.cloneNode(true);
		var date = data[i].date;
		var day = date.substring(date.indexOf('-') + 1);
		var month = date.substring(0, date.indexOf('-'));
		var attendanceList = data[i].list;
		$api.html($api.dom(cloneObj, '.day'), day);
		$api.html($api.dom(cloneObj, '.month'), months[parseInt(month) - 1]);

		for (var j = 0; j < attendanceList.length; j++) {
			var attendanceTemplate = $api.byId('attendanceTemplate');
			var attendanceCloneObj = attendanceTemplate.cloneNode(true);
			$api.html($api.dom(attendanceCloneObj, '.time'), attendanceList[j].time);
			$api.html($api.dom(attendanceCloneObj, '.location'), attendanceList[j].location);
			$api.append($api.dom(cloneObj, '.attendance_list'), $api.html(attendanceCloneObj));
		}
		$api.append($api.byId('historyList'), $api.html(cloneObj));
	}
	
	
}

function getHistoryList(param){
	$api.html($api.byId('historyList'), '');
	var url = ajaxReqHost + 'appListAttendance.ajax';
	COMMON_Ajax_Post(url, {
		values: {
			pageSize: '31',
			pageNo: 0,
			from:'app',
			userId: userInfo.id,
			day: param
		}
	}, function(ret) {
		
		if(ret){
			for(var key in ret){
				var template = $api.byId('template');
				var cloneObj = template.cloneNode(true);
				var date = key.substring(key.indexOf('-')+1);
				var day = date.substring(date.indexOf('-') + 1);
				var month = date.substring(0, date.indexOf('-'));
				$api.html($api.dom(cloneObj, '.day'), day);
				$api.html($api.dom(cloneObj, '.month'), months[parseInt(month) - 1]);
				var attendanceList = ret[key];
				for (var j = 0; j < attendanceList.length; j++) {
					var attendanceTemplate = $api.byId('attendanceTemplate');
					var attendanceCloneObj = attendanceTemplate.cloneNode(true);
					var time = attendanceList[j].attendanceDate;
					time = time.substring(time.indexOf(' ')+1);
					$api.html($api.dom(attendanceCloneObj, '.time'), time);
					$api.html($api.dom(attendanceCloneObj, '.location'), (attendanceList[j]['shop.address']) || '');
					$api.append($api.dom(cloneObj, '.attendance_list'), $api.html(attendanceCloneObj));
				}
				$api.append($api.byId('historyList'), $api.html(cloneObj));
			}
		}
	});
}
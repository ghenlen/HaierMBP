var userInfo = $api.getStorage("userInfo");
var dialog = new auiDialog();
apiready = function() {
	var date = new Date();
	var $clear = $api.byId('clear');
	var $date = $api.byId('date');
	var $header = $api.dom('header');
	$api.fixIos7Bar($header);
	$api.fixStatusBar($header);
	var $main = $api.byId('main');
	var headerHeight = $api.offset($header);
	var clearHeight = $api.offset($clear);
	var dateHeight = $api.offset($date);
	$api.css($main, 'height:' + (api.winHeight - headerHeight.h - clearHeight.h - dateHeight.h) + "px");

	COMMON_openFrame({
		name : 'attendance_head',
		url : 'attendance_head.html',
		rect : {
			x : 0,
			y : 0,
			w : api.winWidth,
			h : headerHeight.h
		}
	});

	loadTodayDate();
	loadTodayRecordList();

	//统计页面访问次数
	BUSINESS_PageAccessStatics();
};

//显示当前时间
function loadTodayDate() {
	var weeks = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
	var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
	var date = new Date();
	var month = date.getMonth();
	var week = date.getDay();
	var year = date.getFullYear();
	var day = date.getDate();
	$api.html($api.byId('week'), weeks[week]);
	$api.html($api.byId('data'), day + " " + months[month] + ", " + year);
}

//加载今天的打卡记录
function loadTodayRecordList() {
	var url = ajaxReqHost + 'appTodayAttendance.ajax';
	COMMON_Ajax_Post(url, {
		values : {
			userId : userInfo.id
		}
	}, function(ret) {
		console.info($api.jsonToStr(ret));
		if (ret && ret.length > 0) {
			for (var i = 0; i < ret.length; i++) {
				var record = $api.byId("record");
				var copyRecord = record.cloneNode(true);
				$api.html($api.dom(copyRecord, ".time"), moment.utc(ret[i].attendanceDate).utcOffset(-5).format('HH:mm'));
				
				//$api.html($api.dom(copyRecord, ".time"), ret[i].attendanceDate);
				//$api.html($api.dom(copyRecord, ".time"), moment.utc(ret[i].attendanceDate).utcOffset(-7).format('HH:mm'));
				$api.prepend($api.byId('datas'), '<div class="cd-timeline-block">' + $api.html(copyRecord) + '</div>');
			}
		}
	});
}

function clockIn1() {
	var GpsStateCheck = api.require('GpsStateCheck');
	var u = navigator.userAgent;
	var isAndroid = u.indexOf('Android') > -1 || u.indexOf('Adr') > -1;
	if (isAndroid == true) {
		GpsStateCheck.getState({
		}, function(ret, err) {
			if (ret) {
				if (ret.result == false) {
					api.toast({
						//msg : '请开启GPS和WLAN、移动数据，以确保精确定位。'
						msg : 'Please open GPS and WLAN, mobile data to ensure accurate positioning!'
					});
					return;
				} else {
					GpsStateCheck.getLocation({}, function(ret, err) {
						if (ret) {
							if (ret.result == true) {
								var googleLat = GPS.gcj_encrypt(ret.latitude, ret.longitude);
								$api.val($api.byId('coord'), googleLat.lat + ',' + googleLat.lon);
								var date = new Date();
								var hours = date.getHours();
								var minutes = date.getMinutes();
								if (Number(hours) < 10) {
									hours = "0" + hours;
								}
								if (Number(minutes < 10)) {
									minutes = "0" + minutes;
								}
								var copyRecord = record.cloneNode(true);
								$api.html($api.dom(copyRecord, ".time"), hours + ":" + minutes);
								$api.append($api.byId('datas'), '<div class="cd-timeline-block">' + $api.html(copyRecord) + '</div>');
							} else {
								api.toast({
									msg : 'Location fail！'
								});
							}
						} else {
						}
					});
				}
			} else {
			}
		});
	} else {
		api.getLocation(function(ret, err) {
			if (ret && ret.status) {
			} else if (ret && !ret.status) {
			} else {
			}
		});
	}
}

//获取当前位置
function getLocation() {
	var u = navigator.userAgent;
	var isAndroid = u.indexOf('Android') > -1 || u.indexOf('Adr') > -1;
	var isiOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/);
	if (isAndroid == true) {
		GpsStateCheck.getLocation({}, function(ret, err) {
			if (ret) {
				if (ret.result == true) {
				} else {
					api.toast({
						msg : '定位失败！'
					});
					api.toast({
						msg : '请开启GPS和WLAN、移动数据，以确保精确定位。'
					});
				}
			} else {
			}
		});
	}
	if (isiOS == true) {
		api.getLocation(function(ret, err) {
			if (ret && ret.status) {
			} else if (ret && !ret.status) {
			} else {
			}
		});
	}
}

//跳转到打卡记录页面
function turnToAttendHis() {
	COMMON_OpenWin({
		name : 'attendanceNew2',
		url : 'attendanceNew2.html'
	});
}

//进行打卡
function clockIn() {
	$api.val($api.byId('lng'), '');
	$api.val($api.byId('lat'), '');
	$api.val($api.byId('dataId'), '');
	$api.val($api.byId('category'), '');

	/*
	//1.先检查是否开启gps(得需要采用付费模块：gpsState)
	var gpsmodel = api.require('gpsState');
	gpsmodel.gpsstate(function(ret) {
	if (ret.gps == 'false' || ret.gps == false) {
	api.toast({
	msg : '请开启位置服务！'
	});
	//2.如果未开启，打开gps设置界面（ios会提醒是否允许定位）
	var mySettingInfo = api.require('mySettingInfo');
	mySettingInfo.settingInt({
	'index' : 2
	}, function(ret, err) {
	});
	}
	});
	*/
	
	api.showProgress({
		title: 'Locating',
		text:'Please wait...'
    });
	
	//3.进行定位
	var amapLocation = api.require('aMapLocation');
	var param = {
		accuracy : 100,
		filter : 1,
		autoStop : true
	};
	amapLocation.startLocation(param, function(ret1, err) {
		api.hideProgress();
		if (ret1.status) {
			var validUrl = ajaxReqHost + 'appAttendanceShop.ajax';
			COMMON_Ajax_Post(validUrl, {
				values : {
					'lng' : ret1.longitude,
					'lat' : ret1.latitude
				}
			}, function(ret) {
				if (ret && ret.length > 0) {
					var optionDatas = [];
					for (var i = 0; i < ret.length; i++) {
						optionDatas.push({
							icon: 'widget://image/common/location.png',
							text: ret[i].title
						});
					}
					
					var height = ret.length * 40;
					
					if(height>400){
						height = 400;
					}else{
						height = height + 90;
					}
					
					var dialogBox = api.require('dialogBox');
					dialogBox.scene({
					    rect: {
					        w: 280,
					        h: height
					    },
					    sceneImg:{                         //（可选项）JSON 对象；场景图片样式配置，不传则不显示
					        h: 0,                        //（可选项）场景图片高度；默认：150
					        path: ''                       // 字符串类型；场景图片路径（要求本地路径（widget://、fs://    ）
					    },
					    texts: {
					        title: 'Please select location',
					        content: '',
					        okBtnTitle: 'Close'
					    },
					    styles: {
					        bg: '#fff',
					        corner: 4,
					        title: {
					            bg: '#1B7BEA',
					            h: 50,
					            size: 14,
					            color: '#FFF'
					        },
					        content: {
					            color: '#555',
					            size: 12
					        },
					        cell: {
					            bg: '#fff',
					            h: 40,
					            text: {
					                color: '#636363',
					                size: 13
					            },
					            icon: {
					                marginL: 15,
					                marginT: 10,
					                w: 20,
					                h: 20,
					                corner: 2
					            }
					        },
					        ok: {
					        	h: 40,
					            bg: '#f5f5f5',
					            titleColor: '#1B7BEA'
					        }
					    },
					    optionDatas: optionDatas
					}, function(ret1, err1) {
					    if (ret1) {
					    	dialogBox.close({
							    dialogName: 'scene'
							});
					        if(ret1.eventType == 'cell'){
					        	var index = ret1.index;
						        var lng = ret[index].lng;
								var lat = ret[index].lat;
								var dataId = ret[index].id;
								var category = ret[index].type;
								saveAttendance(lng, lat, category, dataId);
					        }
					    }
					});
				} else {
					COMMON_ShowFailure('Out of attendance check range.');
				}
			});
		} else {
			api.toast({
				msg : 'Location Failure! One more try.',
				duration : CONSTANT_TOAST_DURATION
			});
		}
	});
}

function saveAttendance(lng, lat, category, shopId) {
	var url = ajaxReqHost + 'appAddAttendance.ajax';
	var param = {
			'user.id' : userInfo.id,
			'org.id' : BUSINESS_GetOrgId(),
			'lng' : lng,
			'lat' : lat,
			'category': category,
			'shop.id': shopId
	};
	COMMON_Ajax_Post(url, {
		values : {
			'user.id' : userInfo.id,
			'org.id' : BUSINESS_GetOrgId(),
			'lng' : lng,
			'lat' : lat,
			'category': category,
			'shop.id': shopId
		}
	}, function(ret) {
		if (ret && ret.result == true) {
			api.toast({
				msg : 'Attendance Success!',
				duration : CONSTANT_TOAST_DURATION
			});

			var record = $api.byId("record");
			var copyRecord = record.cloneNode(true);
			$api.html($api.dom(copyRecord, ".time"), moment.utc(ret.values.attendanceDate).utcOffset(-7).format('HH:mm'));
			$api.append($api.byId('datas'), '<div class="cd-timeline-block">' + $api.html(copyRecord) + '</div>');
		} else {
			COMMON_ShowFailure('Attendance Failure!');
		}
	});
}

function selectLocation(me) {
	var lng = $api.attr(me, 'lng');
	var lat = $api.attr(me, 'lat');
	var dataId = $api.attr(me, 'dataId');
	var category = $api.attr(me, 'category');

	$api.val($api.byId('lng'), lng);
	$api.val($api.byId('lat'), lat);
	$api.val($api.byId('dataId'), dataId);
	$api.val($api.byId('category'), category);
}
apiready = function() {
	var $header = $api.dom('header');
	$api.fixIos7Bar($header);
	$api.fixStatusBar($header);
	var pieChart = api.require('pieChart');
	pieChart.open({
		x : api.frameWidth - 80,
		y : 210,
		radius : 50,
		center : {
			title : '',
			subTitle : ''
		},
		elements : [{
			value : 20,
			color : '#fff'
		}, {
			value : 80,
			color : '#336699'
		}],
		fixedOn : api.frameName,
		fixed : false
	}, function(ret, err) {
	});
	var data = [{
		id : '1001',
		title : 'Adell elctroincsle',
		content : 'I will treasure these ',
		enclosure : "https://ss1.baidu.com",
		date : '2016-6-6 15:23'
	}, {
		id : '1001',
		title : 'Adell elctroincsle',
		content : 'My dream is to want to ',
		enclosure : "https://ss1.baidu.com",
		date : '2016-6-6 15:23'
	}, {
		id : '1001',
		title : 'Adell elctroincsle',
		content : 'Everyone has their own ',
		enclosure : "https://ss1.baidu.com",
		date : '2016-6-6 15:23'
	}]
	for (var i = 0; i < data.length; i++) {
		var sample = $api.byId('sample');
		var cloneObj = sample.cloneNode(true);
		$api.html($api.dom(cloneObj, '.title'), data[i].date);
		$api.html($api.dom(cloneObj, '.distributor_content'), data[i].content);
		$api.html($api.dom(cloneObj, '.span_date'), data[i].date);
		$api.append($api.byId('tobeDeliveringUL'), '<li class="aui-list-item" onclick="turnToDetailPage()">' + $api.html(cloneObj) + '</li>');
	}
};
function back() {
	api.closeWin({});
}

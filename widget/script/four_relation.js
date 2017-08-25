var soldToListData = [];
var shipToListData = [];
var payerListData = [];
var locationListData = [];

var customerId_text = "customerId";

var soldTo = {
	'text' : 'soldToText',
	'value' : 'soldToValue'
};

var shipTo = {
	'text' : 'shipToText',
	'value' : 'shipToValue'
};

var payer = {
	'text' : 'payerText',
	'value' : 'payerValue'
};

var stockLocation = {
	'text' : 'locationText',
	'value' : 'locationValue'
};

function load4Relation() {
	//客户列表
	var relations = BUSINESS_GetRelations();
	var data = [];
	for (var i = 0; i < relations.length; i++) {
		data.push({
			customerId : relations[i]['customer.id'],
			name : relations[i].customerTitle,
			orgCode : relations[i].orgCode,
			id : relations[i].customerCode
		});
	}
	soldToListData = data;

	if (data.length > 0) {
		$api.val($api.byId(customerId_text), data[0].customerId);
		$api.val($api.byId(soldTo.value), data[0].id);
		$api.html($api.byId(soldTo.text), data[0].name);
		initFourRelation(data[0].customerId);
	}

	loadLocationList();
}

//客户对应的四方关系
function initFourRelation(customerId) {
	//获取四方关系
	var fourRelationUrl = ajaxReqHost + 'appCustomer.ajax?customerId=' + customerId;
	COMMON_Ajax_Post(fourRelationUrl, {}, function(fourRelationRet) {
		if (fourRelationRet && fourRelationRet != null) {
			var sendTo = fourRelationRet.sendTo;
			var payTo = fourRelationRet.billTo;
			var shipToData = [];
			for (var i = 0; i < sendTo.length; i++) {
				shipToData.push({
					id : sendTo[i].id,
					name : sendTo[i].title,
					address : sendTo[i].address,
					customerCode : sendTo[i].customerCode
				});
				if (i == 0) {
					$api.val($api.byId(shipTo.value), sendTo[0].id);
					$api.html($api.byId(shipTo.text), sendTo[0].customerTitle);
				}
			}
			shipToListData = shipToData;

			var payToData = [];
			for (var i = 0; i < payTo.length; i++) {
				payToData.push({
					id : payTo[i].id,
					name : payTo[i].title,
					customerCode : payTo[i].customerCode
				});

				if (i == 0) {
					$api.val($api.byId(payer.value), payTo[0].id);
					$api.html($api.byId(payer.text), payTo[0].customerTitle);
				}
			}
			payerListData = payToData;
		}
	});
}

function loadLocationList() {
	var data = [{
		id : 'BWAA',
		name : 'BWAA'
	}, {
		id : 'FDAA',
		name : 'FDAA'
	}, {
		id : 'FSDA',
		name : 'FSDA'
	}, {
		id : 'FSDA',
		name : 'FSDA'
	}];
	locationListData = data;
	$api.val($api.byId(stockLocation.value), data[0].id);
	$api.html($api.byId(stockLocation.text), data[0].name);
}

/**
 * 选择售达方
 */
function showSoldToActionSelector(callback) {
	showActionSelector(soldToListData, soldTo.text, soldTo.value, callback);
}

/**
 * 选择送达方
 */
function showShipToActionSelector(callback) {
	showActionSelector(shipToListData, shipTo.text, shipTo.value, callback);
}

/**
 * 选择付款方
 */
function showPayerActionSelector(callback) {
	showActionSelector(payerListData, payer.text, payer.value, callback);
}

//选择库位
function showLocationActionSelector(callback) {
	showActionSelector(locationListData, stockLocation.text, stockLocation.value, callback);
}

function showActionSelector(selectListData, text, value, callback) {
	var buttons = [];
	for(var i=0; i<selectListData.length; i++){
		buttons.push(selectListData[i].name);
	}
	COMMON_actionSheet('Selected: '+$api.html($api.byId(text)), buttons, function(ret){
		$api.html($api.byId(text), selectListData[ret].name);
		$api.val($api.byId(value), selectListData[ret].id);
		if (text == soldTo.text) {
			$api.val($api.byId(customerId_text), selectListData[ret][customerId_text]);
			initFourRelation(selectListData[ret][customerId_text]);
		}
		if (callback) {
			callback(ret);
		}
		
	});
	
return;
	COMMON_ActionSelector(selectListData, function(ret) {
		$api.html($api.byId(text), ret.level1);
		$api.val($api.byId(value), ret.selectedInfo[0].id);
		if (text == soldTo.text) {
			$api.val($api.byId(customerId_text), ret.selectedInfo[0][customerId_text]);
			initFourRelation(ret.selectedInfo[0][customerId_text]);
		}
		if (callback) {
			callback(ret);
		}
	});
}

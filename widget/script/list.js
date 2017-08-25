var pageNo = 0;

var param = {
	'urlParams' : {
		'id' : id
	},
	'rowTemplateId' : 'template',
	'listId' : 'productList',
	'fieldMaps' : {
		'productTitle' : '.title',
		'productModel' : '.model'
	},
	'attrMaps' : {
		'productId' : 'li'
	},
	'addClsMaps' : {
		'productId' : 'li'
	}
}

function renderList(url, param) {
	var urlParams = param.urlParams;
	var fieldMaps = param.fieldMaps;
	var attrMaps = param.attrMaps;
	var addClsMaps = param.addClsMaps;
	var listId = param.listId;
	var templateId = param.templateId;
	
	var pageParam = {
		pageSize : pageSize,
		pageNo : pageNo
	}
	urlParams = COMMON_extendObj(pageParam, urlParams);
	COMMON_Ajax_Post(url, {
		values : urlParams
	}, function(ret) {
		if (ret && ret.list.length > 0) {
			for (var i = 0; i < ret.list.length; i++) {
				var item = ret.list[i];
				var template = $api.byId(templateId);
				var cloneObj = template.cloneNode(true);

				for (var key in fieldMaps) {
					$api.html($api.dom(cloneObj, fieldMaps[key]), item[key]);
				}

				for (var key in attrMaps) {
					$api.attr($api.dom(cloneObj, attrMaps[key]), key, item[i][key]);
				}

				for (var key in addClsMaps) {
					$api.addCls($api.dom(cloneObj, addClsMaps[key]), key + item[i][key]);
				}

				$api.append($api.byId(listId), $api.html(cloneObj));
			}

			if (ret.list.length == pageSize) {
				pageNo++;
			} else {
				api.removeEventListener({
					name : "scrolltobottom"
				})
				api.toast({
					msg : $.i18n.prop('INFO_LAST_PAGE')
				});
			}
		}
	});
}
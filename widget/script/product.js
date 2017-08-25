var currency = BUSINESS_GetCurrency();
var headerHeight;
var categoryHieght;
var userInfo = $api.getStorage("userInfo");
apiready = function() {
	initDom();

	loadProductCatalog();

	api.addEventListener({
		name : 'keyback'
	}, function(ret, err) {
		api.closeWin({});
	});

	api.addEventListener({
		name : 'changeCatalog'
	}, function(ret) {
		if (ret && ret.value) {
			var value = ret.value;
			var firstLevelNode = value.firstLevelNode;
			var secondLevelNode = value.secondLevelNode;
			var firstMoudles = $api.domAll('.first_level_moudle');
			for (var i = 0; i < firstMoudles.length; i++) {
				$api.css($api.dom(firstMoudles[i], '.selected_flag'), 'display:none');
			}

			var param = {
				customerCode : $api.val($api.byId('customerCode')),
				customerId: $api.val($api.byId('customerId')),
				saleOffice : $api.val($api.byId('saleOffice')),
				orgCode: $api.val($api.byId('orgCode'))
			};
			if (firstLevelNode != '-1') {
				$api.css($api.dom($api.dom('.code' + firstLevelNode), '.selected_flag'), 'display:block');
				if (secondLevelNode == '-1') {
					param['productGroup'] = firstLevelNode;
				} else {
					param['productCatalog'] = secondLevelNode;
				}
			} else {
				param['productCatalog'] = "";
			}

			COMMON_openFrame({
				name : 'product_list',
				reload : true,
				bounces : false,
				pageParam : param
			});

			$api.css($api.byId('resetSearchBtn'), 'display:none');
			$api.val($api.byId('search-input'), '');
		}
	});

	//统计页面访问次数
	BUSINESS_PageAccessStatics();
};




//初始化
function initDom() {
	var $header = $api.dom('header');
	headerHeight = $api.offset($header);
	var $category = $api.byId('category');
	categoryHieght = 32;

	//客户列表
	var cacheDealer = BUSINESS_GetCurrentDealer(userInfo.id);
	if (cacheDealer) {
		$api.val($api.byId('customerCode'), cacheDealer.customerCode);
		$api.html($api.byId('customerTitle'), cacheDealer.customerTitle);
		$api.val($api.byId('customerId'), cacheDealer.customerId);
		$api.val($api.byId('saleOffice'), cacheDealer.saleOffice);
		$api.val($api.byId('orgCode'), cacheDealer.orgCode);
	} else {
		var relations = BUSINESS_GetRelations();
		if (relations && relations.length > 0) {
			$api.val($api.byId('customerCode'), relations[0].customerCode);
			$api.html($api.byId('customerTitle'), relations[0].customerTitle);
			$api.val($api.byId('customerId'), relations[0]['customer.id']);
			$api.val($api.byId('saleOffice'), relations[0]['SALES_OFFICE']);			
			$api.val($api.byId('orgCode'), relations[0]['orgCode']);			
		}
	}

	var productListParam = {
		customerCode : $api.val($api.byId('customerCode')),
		customerId : $api.val($api.byId('customerId')),
		saleOffice: $api.val($api.byId('saleOffice')),
		orgCode: $api.val($api.byId('orgCode')),
	};
	var pageParam = api.pageParam;
	if (pageParam && pageParam.term) {
		var term = pageParam.term;
		$api.val($api.byId('search-input'), term);
		productListParam.term = term;
		$api.css($api.byId('resetSearchBtn'), 'display:inline-block');
	}
	
	var dealerSelectorHeight = 10;
	var permissions = $api.getStorage("permissions");
	if (permissions.indexOf(CONSTANT_AUTH_CUSTOMER_CODE) >= 0) {
		$api.removeCls($api.byId('dealerSelect'), 'aui-hide');
		dealerSelectorHeight = 60;
	}
	
	COMMON_openFrame({
		name : 'product_list',
		url : 'product_list.html',
		bounces : false,
		reload : true,
		vScrollBarEnabled : false,
		rect : {
			x : 0,
			y : headerHeight.h + dealerSelectorHeight + categoryHieght,
			w : api.winWidth,
			h : api.winHeight - headerHeight.h - dealerSelectorHeight - categoryHieght
		},
		pageParam : productListParam
	});

}

//获取产品目录
function loadProductCatalog() {
	$api.post(ajaxReqHost + 'appGetProductCategory.ajax', function(ret) {
		if (ret && ret.length > 0) {
			var catalogImg = "";
			var width = 100/ret.length;
			for (var i = 0; i < ret.length; i++) {
				var catalog = ret[i];
				catalogImg += '<div style="width:'+width+'%" class="slidecol first_level_moudle code' + catalog.code + '" tapmode="hover" onclick="openSlidePanel(\'' + catalog.code + '\')">' + '<img src="' + catalog.picPath + '" alt="" onerror="this.src=\'../image/common/pic1.png\'">' + '<div class="selected_flag" style="display:none;position: absolute;right: 18%;bottom: 2px;background-color: red;width: 16px;height: 16px;border-radius: 8px;color:#fff;background-color: #FF5000;font-size: 0.4rem;border: 2px solid #fff;line-height: 13px;"><i class="aui-iconfont aui-icon-correct"></i></div>' + '</div>'
			}
			$api.html($api.byId('catalogList'), catalogImg);
		}
	});
}

function openSlidePanel(catalogCode) {
	api.sendEvent({
		name : 'CATEGORY_LISTENER',
		extra : {
			eventType : 'showFirstLevel',
			catalogCode : catalogCode
		}
	});
	api.openSlidPane({
		type : 'left'
	});
}

//选择赋值
function showDealerActionSelector() {
	COMMON_OpenWin({
		name : 'dealer_select',
		url : 'dealer_select.html',
		pageParam : {
			winName: 'product',
			selected: $api.html($api.byId('customerTitle'))
		}
	});
}

function UPDATE_DEALER(param){
	var customerCode = param.customerCode;
	var customerId = param.customerId;
	var title = param.title;
	var saleOffice = param.saleOffice;
	var orgCode = param.orgCode;
	
	$api.html($api.byId('customerTitle'), title);
	$api.val($api.byId('customerCode'), customerCode);
	$api.val($api.byId('customerId'), customerId);
	$api.val($api.byId('saleOffice'), saleOffice);
	$api.val($api.byId('orgCode'), orgCode);
	

	var dealer = {
		'customerCode' : customerCode,
		'customerTitle' : title,
		'customerId' : customerId,
		'saleOffice': saleOffice,
		'orgCode': orgCode
	};
	BUSINESS_UpdateCurrentDealer(userInfo.id, dealer);

	//清空产品目录选择状态
	var firstMoudles = $api.domAll('.first_level_moudle');
	for (var i = 0; i < firstMoudles.length; i++) {
		$api.css($api.dom(firstMoudles[i], '.selected_flag'), 'display:none');
	}

	api.sendEvent({
		name : 'CATEGORY_LISTENER',
		extra : {
			eventType : 'reset'
		}
	});

	$api.css($api.byId('resetSearchBtn'), 'display:none');
	$api.val($api.byId('search-input'), '');

	COMMON_openFrame({
		name : 'product_list',
		reload : true,
		bounces : false,
		pageParam : {
			customerCode : customerCode,
			customerId : customerId,
			saleOffice : saleOffice,
			orgCode: orgCode
		}
	});
}

//产品搜索
function openProductSearch() {
	COMMON_UISearchBar(function(ret) {
		var searchTitleBar=$api.trim(ret.text);
		$api.val($api.byId('search-input'), searchTitleBar);
		$api.css($api.byId('resetSearchBtn'), 'display:inline-block');
		var productgroups = JSON.stringify(searchTitleBar);

		//清空产品目录选择状态
		var firstMoudles = $api.domAll('.first_level_moudle');
		for (var i = 0; i < firstMoudles.length; i++) {
			$api.css($api.dom(firstMoudles[i], '.selected_flag'), 'display:none');
		}

		api.sendEvent({
			name : 'CATEGORY_LISTENER',
			extra : {
				eventType : 'reset'
			}
		});

		COMMON_openFrame({
			name : 'product_list',
			reload : true,
			bounces : false,
			pageParam : {
				term : searchTitleBar,
				customerCode : $api.val($api.byId('customerCode')),
				customerId : $api.val($api.byId('customerId'))
			}
		});
	});
}

function resetSearch() {
	$api.css($api.byId('resetSearchBtn'), 'display:none');
	$api.val($api.byId('search-input'), '');
	COMMON_openFrame({
		name : 'product_list',
		reload : true,
		bounces : false,
		pageParam : {
			term : '',
			customerCode : $api.val($api.byId('customerCode')),
			customerId : $api.val($api.byId('customerId'))
		}
	});
}


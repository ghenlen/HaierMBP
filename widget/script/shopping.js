var $select_all_btn;
var $select_btn_groups;

function chkProduct(me){
	var $select_all_btn = $api.dom('.select_all_product');
	var flag = $api.attr(me, 'flag');
	if (flag == '1') {
		$api.removeCls(me, 'select_btn');
		$api.addCls(me, 'select_btn_selected');
		$api.attr(me, 'flag', '2');
	} else if (flag == '2') {
		$api.removeCls($select_all_btn, 'select_all_btn_selected');
		$api.addCls($select_all_btn, 'select_all_btn');
		$api.attr($select_all_btn, 'flag', '1');
		$api.removeCls(me, 'select_btn_selected');
		$api.addCls(me, 'select_btn');
		$api.attr(me, 'flag', '1');
	}else if (flag == '3') {
		api.toast({
            msg:'Abnormal price, order could not be created.'
        });
	}
	calSumPrice();
}

function bindSelectSingleEvent1(containerId) {
	$select_btn_groups = $api.domAll($api.byId(containerId), '.fast_order_selectbtn');
	$select_all_btn = $api.dom('.select_all_product');

	for (var i = 0; i < $select_btn_groups.length; i++) {
		$api.addEvt($select_btn_groups[i], 'click', function() {
			var flag = $api.attr(this, 'flag');
			if (flag == '1') {
				$api.removeCls(this, 'select_btn');
				$api.addCls(this, 'select_btn_selected');
				$api.attr(this, 'flag', '2');
			} else if (flag == '2') {
				$api.removeCls($select_all_btn, 'select_all_btn_selected');
				$api.addCls($select_all_btn, 'select_all_btn');
				$api.attr($select_all_btn, 'flag', '1');
				$api.removeCls(this, 'select_btn_selected');
				$api.addCls(this, 'select_btn');
				$api.attr(this, 'flag', '1');
			}
			calSumPrice();
		});
	}
}

//绑定选择单个产品事件
function bindSelectSingleEvent(containerId) {
	$select_btn_groups = $api.domAll($api.byId(containerId), '.select_btn');
	$select_all_btn = $api.dom('.select_all_btn');

	for (var i = 0; i < $select_btn_groups.length; i++) {
		$api.addEvt($select_btn_groups[i], 'click', function() {
			var flag = $api.attr(this, 'flag');
			if (flag == '1') {
				$api.removeCls(this, 'select_btn');
				$api.addCls(this, 'select_btn_selected');
				$api.attr(this, 'flag', '2');
			} else if (flag == '2') {
				$api.removeCls($select_all_btn, 'select_all_btn_selected');
				$api.addCls($select_all_btn, 'select_all_btn');
				$api.attr($select_all_btn, 'flag', '1');
				$api.removeCls(this, 'select_btn_selected');
				$api.addCls(this, 'select_btn');
				$api.attr(this, 'flag', '1');
			}
			calSumPrice();
		});
	}
}

function chkAllProduct(){
	var $select_all_btn = $api.dom('.select_all_product');
	var flag = $api.attr($select_all_btn, 'flag');
	if (flag == '1') {
		var $select_btn_groups = $api.domAll('.select_btn');
		$api.removeCls($select_all_btn, 'select_all_btn');
		$api.addCls($select_all_btn, 'select_all_btn_selected');
		$api.attr($select_all_btn, 'flag', '2');
		
		for (var i = 0; i < $select_btn_groups.length; i++) {
			var isAvaSelectFlag = $api.attr($select_btn_groups[i], 'flag');
			if(isAvaSelectFlag != '3'){
				$api.removeCls($select_btn_groups[i], 'select_btn');
				$api.addCls($select_btn_groups[i], 'select_btn_selected');
				$api.attr($select_btn_groups[i], 'flag', '2');
			}
		}
	} else if (flag == '2') {
		var $select_btn_groups = $api.domAll('.select_btn_selected');
		$api.removeCls($select_all_btn, 'select_all_btn_selected');
		$api.addCls($select_all_btn, 'select_all_btn');
		$api.attr($select_all_btn, 'flag', '1');
		
		for (var i = 0; i < $select_btn_groups.length; i++) {
			var isAvaSelectFlag = $api.attr($select_btn_groups[i], 'flag');
			if(isAvaSelectFlag != '3'){
				$api.removeCls($select_btn_groups[i], 'select_btn_selected');
				$api.addCls($select_btn_groups[i], 'select_btn');
				$api.attr($select_btn_groups[i], 'flag', '1');
			}
		}
	}
	calSumPrice();
}

//绑定选择所有产品事件
function bindSelectAllEvent() {
	$api.addEvt($select_all_btn, 'click', function() {
		var flag = $api.attr($select_all_btn, 'flag');
		if (flag == '1') {
			$api.removeCls($select_all_btn, 'select_all_btn');
			$api.addCls($select_all_btn, 'select_all_btn_selected');
			$api.attr($select_all_btn, 'flag', '2');
			
			for (var i = 0; i < $select_btn_groups.length; i++) {
				$api.removeCls($select_btn_groups[i], 'select_btn');
				$api.addCls($select_btn_groups[i], 'select_btn_selected');
				$api.attr($select_btn_groups[i], 'flag', '2');
			}
		} else if (flag == '2') {
			$api.removeCls($select_all_btn, 'select_all_btn_selected');
			$api.addCls($select_all_btn, 'select_all_btn');
			$api.attr($select_all_btn, 'flag', '1');
			for (var i = 0; i < $select_btn_groups.length; i++) {
				$api.removeCls($select_btn_groups[i], 'select_btn_selected');
				$api.addCls($select_btn_groups[i], 'select_btn');
				$api.attr($select_btn_groups[i], 'flag', '1');
			}
		}
		calSumPrice();
	});
}

//计算选择的产品的总价格
function calSumPrice() {
	var $select_btn_groups = $api.domAll('.select_btn_selected');
	var sumPrice = 0.0;
	for (var i = 0; i < $select_btn_groups.length; i++) {
		var flag = $api.attr($select_btn_groups[i], 'flag');
		if (flag == '2') {
			var parent = $api.closest($select_btn_groups[i], '.product');
			var product_price_div = $api.dom(parent, '.invoice_price');
			var productPrice = $api.html(product_price_div);
			if (productPrice != '' && productPrice != undefined) {
				var product_num_div = $api.dom(parent, '.qty');
				var productNum = $api.html(product_num_div);
				sumPrice += math.chain(productPrice).multiply(productNum).done();
			}
		}
	}
	var tax = $api.val($api.byId('tax_val'));
	var taxAdd = math.chain(1).add(tax).done();
	$api.html($api.byId('sumPrice'), COMMON_COMMON_FormatCurrency(math.chain(sumPrice).multiply(taxAdd).done()));
	$api.val($api.byId('total_price_val'), math.chain(sumPrice).multiply(taxAdd).done());
}

//编辑产品数量
function editProductNum(me) {
	var num = $api.html(me);
	num = parseInt(num);
	var dialogBox = api.require('dialogBox');
	dialogBox.amount({
		texts : {
			title : $.i18n.prop('modifyPurchaseQty'),
			default : num,
			leftBtnTitle : $.i18n.prop('cancel'),
			rightBtnTitle : $.i18n.prop('ok')
		},
		styles : {
			bg : '#fff',
			corner : 2,
			w : 300,
			h : 170,
			title : {
				marginT : 20,
				size : 16,
				color : '#555'
			},
			input : {
				w : 200,
				h : 35,
				marginT : 25,
				size : 14,
				color : '#555'
			},
			dividingLine : {
				marginT : 10,
				width : 0.5,
				color : '#eee'
			},
			left : {
				marginL : 10,
				w : 130,
				h : 35,
				corner : 14,
					bg : '#f1f1f1',
					size : 14,
					color : '#555'
			},
			right : {
				marginR : 10,
				w : 130,
				h : 35,
				corner : 14,
					bg : '#1B7BEA',
					size : 14,
					color : '#fff'
			}
		}
	}, function(ret) {
		if (ret.eventType == 'right') {
			var inputNum = ret.amount;
			if ($api.trim(inputNum) == '' || $api.trim(inputNum) == '0') {
				api.toast({
					msg : $.i18n.prop('numValidGtZero')
				});
				return;
			}

			var reg = new RegExp("^[0-9]*$");
			if (!reg.test(inputNum)) {
				api.toast({
					msg : $.i18n.prop('numValidGtZero')
				});
				return;
			}

			inputNum = parseInt(inputNum);

			var parent = $api.closest(me, '.product');
			var productId = $api.attr(parent, 'productId');
			updProductNum(inputNum, productId, me);
		}
		var dialogBox = api.require('dialogBox');
		dialogBox.close({
			dialogName : 'amount'
		});
	});
}

function subProductNum(me) {
	var parent = $api.closest(me, '.product');
	var product_num_div = $api.dom(parent, '.qty');
	var val = $api.html(product_num_div);
	if (val != 1) {
		var newVal = parseInt(val) - 1;
		var productId = $api.attr(parent, 'productId');
		updProductNum(newVal, productId, product_num_div);
	}
}

function addProductNum(me) {
	var parent = $api.closest(me, '.product');
	var product_num_div = $api.dom(parent, '.qty');
	var val = $api.html(product_num_div);
	var newVal = parseInt(val) + 1;
	var productId = $api.attr(parent, 'productId');
	updProductNum(newVal, productId, product_num_div);
}

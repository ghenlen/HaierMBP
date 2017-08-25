//接口请求地址
//var ajaxReqHost = 'http://pk.sea-sky.tech:35750/base/';
//var ajaxReqHost = 'http://202.142.170.94:8888/base/'
var ajaxReqHost = 'http://202.141.242.222:8888/base/'

//var ajaxReqHost = 'http://192.168.1.111:8888/base/'

//图片尺寸裁剪接口
var CONSTANT_IMG_CROP_URL = 'http://202.141.242.222:8889/productImage?path=';

//列表中商品图片大小
var CONSTANT_LIST_IMG_WIDTH = 100;
var CONSTANT_LIST_IMG_HEIGHT = 100;

//首页商品推荐品图片大小
var CONSTANT_HOME_IMG_WIDTH = 300;
var CONSTANT_HOME_IMG_HEIGHT = 300;

//订单状态
var CONSTANT_ORDER_STATUS = {
	'INIT' : 'DN',
	'CREATEDN' : 'DN',
	'STOCK' : 'PGI',
	'SIGN' : 'POD',
	'BILL' : 'BILLING',
	'CLEARED' : 'CLEARED'
}

//分页
var pageSize = 10;

var pages = {
	'Home' : '200',
	'Shopping List' : '201',
	'My' : '202',
	'Issue List' : '203',
	'New Order' : '204',
	'Attendance' : '205',
	'Question' : '206',
	'Information' : '207',
	'Overage' : '208',
	'Overdue' : '209',
	'Dealer' : '210',
	'Reconcilication' : '211',
	'Notice' : '212',
	'Monthly Sale Target' : '213',
	'My Order List' : '214',
	'Out of Stock' : '215',
	'Common Product' : '216'
}

var CONSTANT_STOCK_SHORTAGE_STATUS = {
	'IN_STOCK': '03',
	'OUT_STOCK': '01'
}

var CONSTANT_MONTH_SHORTNAME = ["Jan.", "Feb.", "Mar.", "Apr.", "May.", "Jun.", "Jul.", "Aug.", "Sep.", "Oct.", "Nov.", "Dec."];

//单位M
var CONSTANT_UPLOAD_IMG_SIZE_LIMIT = 3;

//缓存里记录打开的win窗口
var CONSTANT_CACHE_WIN_STACK = 'winStack';

//打开frame时的动画
var CONSTANT_FRAME_ANIMATION = {
};

//打开frame时的动画
var CONSTANT_WIN_ANIMATION = {
	type:"fade",
	//subType : 'from_right',
	duration:0,
	curve:'ease_in'
};

var CONSTANT_OS = {
	'ANDROID' : 'ANDROID',
	'IOS': 'IOS'
}

var CONSTANT_FILE_TYPE = {
	'IMAGE' : 'IMAGE',
	'WORD': 'WORD',
	'EXCEL': 'EXCEL',
	'PDF': 'PDF',
	'TXT': 'TXT'
}

var CONSTANT_SALE_COMPANY_CODE = '6620';

var CONSTANT_TOAST_DURATION=6000;

//是否可以下单权限编码
var CONSTANT_AUTH_PLACE_ORDER_CODE = '201';
//是否可以查看产品价格和库存
var CONSTANT_AUTH_PRICE_STOCK_CODE = '202';
//是否可以查看经销商
var CONSTANT_AUTH_CUSTOMER_CODE = '203';
//是否可以查看常用产品
var CONSTANT_WISHLIST = '117';
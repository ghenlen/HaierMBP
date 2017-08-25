window.onload = function(){
	var $header = $api.dom('header');
	var isAndroid = (/android/gi).test(navigator.appVersion);
    if(isAndroid == false){
        $header.style.paddingTop = '20px';
    }else if(isAndroid == true){
        $header.style.paddingTop = '25px';
    }
}
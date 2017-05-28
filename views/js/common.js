// 设置文件字体
var pixclPatio = 1 / window.devicePixelRatio;
document.write('<meta name="viewport" content="width=device-width,initial-scale='+pixclPatio+',minimum-scale='+pixclPatio+',maximum-scale='+pixclPatio+',user-scalable=no" />');
var html = document.getElementsByTagName('html')[0];
var pageWidth=html.getBoundingClientRect().width;
html.style.fontSize=pageWidth / 16 +'px';
window.addEventListener("orientationchange", function() {
// Announce the new orientation number
 window.location.reload();
}, false);
$(document).ready(function(){
	$(".nav-box-top a").click(function(){
		var thisIndex=$(this).index();
		$(this).siblings().removeClass("acitve");
		$(this).addClass("acitve");
		for(var i=0;i<2;i++){
			$(".nav-info"+i).hide();
			$(".nav-info"+thisIndex).show();

		}
	})
})

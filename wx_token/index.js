var later = require('later');
var https = require('https');
var  fs= require('fs');


var appid='wx1d3765eb45497a18';
var appsecret = 'KRRugxE2vnNch1qIyFA65DG74Vm0GmGnL3LM7RliAJ5mLlONj7FlIWHB8PqZGnZe';
var access_token;

later.date.localTime();
console.log("Now:"+new Date());

//每小时获取一次token
var sched=later.parse.recur().every(1).hour();

//打印之后十次获取的时间
next=later.schedule(sched).next(10);
console.log(next);

var timer =later.setInterval(test,sched);
setTimeout(test,2000);

function test(){
	console.log(new Date());
	//get请求的url地址及传递的参数
	var options = {
		hostname:'qyapi.weixin.qq.com',
		path:'/cgi-bin/gettoken?corpid=' + appid + '&corpsecret=' + appsecret
	};
	
	//用http协议通过get请求来获取数据
	var req=https.get(options,function(res){
	 //console.log("statusCode: ", res.statusCode);
     //console.log("headers: ", res.headers);
	var bodyChunks='';
	res.on('data',function(chunk){
		//将每次获取到的数据存储到bodyChunks中
		bodyChunks+=chunk;
	});
	res.on('end',function(){
		//获取数据结束对数据进行处理，此处将获取的数据转成json格式
		var body=JSON.parse(bodyChunks);
		  //console.dir(body);
		if(body.access_token){
			//将从获取的数据转成json格式后提取其中的token 并将token存储
			access_token=body.access_token;
			saveAccessToken(access_token);
			console.log(access_token);
		}else{
			console.dir(body);
		}
	});
	
	});
	
	req.on('error',function(e){
		console.log('ERROR:'+e.message);
	});
}

//将token传入当前文件夹的父文件夹中，用txt文本保存
function saveAccessToken(access_token_to_file)
{
	fs.writeFile('../access_token.txt', access_token_to_file,function(err){
    if(err) console.log('写文件操作失败');
    else console.log('写文件操作成功');
});
}
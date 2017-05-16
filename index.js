var PORT = 9529;
var http = require('http');
var https = require('https');
var qs=require('qs');
var fs = require('fs');
var bodyParser = require("body-parser");
var querystring = require('querystring');
var url = require('url');
var express = require('express');
var path = require('path');

var TOKEN = 'grzx';
var app=express();
	//定义EJS模板引擎和模板文件位置
app.set('views',path.join(__dirname,'views'));
app.set('view engine','ejs');

//定义静态文件目录
app.use(express.static(path.join(__dirname,'public')));

//定义数据解析器
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));

var reJSON;
var access_token = readAccessToken()
//自己的服务器核实是否通过微信公众号的验证
function checkSignature(params,token)
{
	var key =[token,params.timestamp,params.nonce].sort().join('');
	var sha1 = require('crypto').createHash('sha1');
	sha1.update(key);
	
	return sha1.digest('hex')==params.signature;
}

function readAccessToken(){
	var data = fs.readFileSync('access_token.txt', 'utf8');
	    console.log("qiguai"); 
    console.log(data); 
	return data;	
}

function get_req1(code){
		//var post_str = new Buffer(JSON.stringify(reJSON));
	var userId;
		//设置get请求参数
	var get_options={
		host:'qyapi.weixin.qq.com',
		port:'80',
		path:'/cgi-bin/user/getuserinfo?access_token='+access_token+'&code='+code,
		method:'GET',
		headers:{
			'Content-Type': 'application/x-www-form-urlencoded',
		}
	};
	var get_req = https.request('https://qyapi.weixin.qq.com/cgi-bin/user/getuserinfo?access_token='+access_token+'&code='+code,function(response){
		var responseText=[];
		var size=0;
		response.setEncoding('utf8');
		response.on('data',function(data){
			console.log(data);
			responseText.push(data);
			console.log(data.UserId);
			if(data.UserId!=null)
			 	userId = data.UserId;

			});
		response.on('end',function(){
			console.log(responseText);
			//responseText.UserId
		});
	});

	//对于前面设置请求和json数据进行发送
	//get_req.write(post_str);
	get_req.end();
}



app.get('/',function(req,res){
	var arg = url.parse(req.url).query;
	var code = querystring.parse(arg).code;
	get_req1(code);
});

app.listen(PORT);
console.log("Server runing at port:"+PORT+".");
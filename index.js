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
var userId;
var userInfo;
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

function get_userId(res,code){
		//var post_str = new Buffer(JSON.stringify(reJSON));
	var get_req = https.request('https://qyapi.weixin.qq.com/cgi-bin/user/getuserinfo?access_token='+access_token+'&code='+code,function(response){
		var responseText=[];
		var size=0;
		response.setEncoding('utf8');
		response.on('data',function(data){
		//	console.log(data);
			var j = JSON.parse(data)
			responseText.push(data);
			if(j.UserId!=null)
			 	userId = j.UserId;
				console.log(userId);
			});
		response.on('end',function(){
			if(userId!=null){
			get_userInfo(res,userId,"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa");
		}
			//console.log(responseText);
			//responseText.UserId
		});
	});

	//对于前面设置请求和json数据进行发送
	//get_req.write(post_str);
	get_req.end();
}

//获取学生信息接口数据
function get_userInfo(res,userId,userInfoToken){
		//https://api.mysspku.com/index.php/V2/StudentInfo/getDetail?stuid=STUID&token=TOKEN
		//设置get请求参数
		var get_options={
		host:'api.mysspku.com',
		path:'/index.php/V2/StudentInfo/getDetail?stuid='+userId+'&token='+userInfoToken,
		method:'GET',
		rejectUnauthorized: false,
	};
	//	console.log("https://api.mysspku.com/index.php/V2/StudentInfo/getDetail?stuid="+userId+"&token="+userInfoToken);
	var get_req = https.request(get_options,function(response){
		var responseText=[];
		var size=0;
		response.setEncoding('utf8');
		response.on('data',function(data){
			console.log(data);
			responseText.push(data);
			var j = JSON.parse(data);
			if(j.errcode==40001){
				userInfo=j.data;
			}
		});
		response.on('end',function(){
			renderSdudent(res,"学生信息",userInfo)
			//console.log(responseText);
		});
	});

	//对于前面设置请求和json数据进行发送
	//get_req.write(post_str);
	get_req.end();
}

//渲染学生信息页面
function renderSdudent(res,titlep,userInfo){
		console.log(userInfo);
		res.render('studentInfo',{
		title:titlep,
		username:userInfo.name,
		});
}

app.get('/',function(req,res){
	var arg = url.parse(req.url).query;
	var code = querystring.parse(arg).code;
	get_userId(res,code);
});

app.listen(PORT);
console.log("Server runing at port:"+PORT+".");
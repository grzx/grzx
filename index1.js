	/**
	 * Created by 67345 on 2017/5/2.
	 */
	

	//设置端口号为9529
var PORT = 9529;
var http = require('http');
var https = require('https');
var qs=require('qs');
var fs = require('fs');
var bodyParser = require("body-parser");
var querystring = require('querystring');
var url = require('url');
var express = require('express');

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
//自己的服务器核实是否通过微信公众号的验证
function checkSignature(params,token)
{
	var key =[token,params.timestamp,params.nonce].sort().join('');
	var sha1 = require('crypto').createHash('sha1');
	sha1.update(key);
	
	return sha1.digest('hex')==params.signature;
}

	//创建一个http服务
var server = http.createServer(function(request,response){
		var query = require('url').parse(request.url).query;
		var params = qs.parse(query);
		
		//console.log(params);
		
		//console.log("token-->",TOKEN);
		//进行 token验证，只需进行一次即可
		// if(checkSignature(params,TOKEN)){
			// response.end(params.echostr);
		// }else{
			// response.end('signature fial');
		// }
		//若验证失败则返回失败信息
		 // if(!checkSignature(params,TOKEN)){
			//  response.end('signature fial');
			//  //return;
		 // }
		 //若是get请求，则直接返回数据
		 if(request.method=='GET') {
		 	//获取code
		var arg = url.parse(request.url).query;
		var code = querystring.parse(arg).code;
			console.log("arg:"+arg);
		console.log("code:"+code);
			  get_req1(code);
		 }
		 //若是其他请求，这里默认是post请求
		 else{
			 var postdata="";
			 //监听返回数据，并存储在postdata中
			 request.addListener("data",function(postchunk){
				 postdata+=postchunk;
			 });
			 
			 // request.addListener("end",function()
			 // {
				 // console.log(postdata);
				 // response.end('success');
			 // });
			 
			     //获取到了POST数据，并将其转为json格式进行处理
			request.addListener("end",function(){
			var parseString = require('xml2js').parseString;

			parseString(postdata,{ explicitArray : false, ignoreAttrs : true }, function (err, result) {
	        if(!err){
	          //我们将XML数据通过xml2js模块(npm install xml2js)解析成json格式
	          console.log(result)
			  //获取从微信处发来的用户名
			  m_from_user_name=result.xml.FromUserName;
			  
				//获取从微信处发来的内容
			   m_content=result.xml.Content;
			   
			   //获取从微信处发来的数据格式
			   m_type=result.xml.MsgType;
			   
			   console.log('from_user_name:'+m_from_user_name+'\n');
			   console.log('content:'+m_content+'\n');
			   console.log('type:'+m_type+'\n');
			   
			  //若发来的是文本格式，则进行处理
			   if(m_type=='text')
			   {
			   }
	          response.end('success');
	        }
	      });
	    });
		 } 
});
	//设置监听端口，并进行监听
server.listen(PORT);
console.log("Server runing at port:"+PORT+".");





	//对微信平台进行get请求

function get_req1(code){
		//var post_str = new Buffer(JSON.stringify(reJSON));
	//获取token
	access_token=readAccessToken();

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
			responseText.push(data);
			});
		response.on('end',function(){
			console.log(responseText);
		});
	});

	//对于前面设置请求和json数据进行发送
	//get_req.write(post_str);
	get_req.end();
}
	//从上级文件中获取token数据
function readAccessToken(){
	var data = fs.readFileSync('access_token.txt', 'utf8');
	    console.log("qiguai"); 
    console.log(data); 
	return data;	
}

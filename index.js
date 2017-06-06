var PORT = 9529;
var http = require('http');
var https = require('https');
var qs = require('qs');
var fs = require('fs');
var bodyParser = require("body-parser");
var querystring = require('querystring');
var url = require('url');
var express = require('express');
var path = require('path');
var session = require('express-session');
var cookieParser = require('cookie-parser');

var TOKEN = 'grzx';
var app = express();
var userId;
var userInfo;
var teacherInfo;
var userToken = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
//定义EJS模板引擎和模板文件位置
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

//定义静态文件目录
app.use(express.static(path.join(__dirname, 'public')));

//定义数据解析器
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser('userinfo'));
app.use(session({
    secret: 'userinfo',
    cookie: {maxAge: 60 * 1000 * 30},
    resave: false,
    saveUninitialized: true
}));

var reJSON;
var access_token = readAccessToken()
//自己的服务器核实是否通过微信公众号的验证
function checkSignature(params, token) {
    var key = [token, params.timestamp, params.nonce].sort().join('');
    var sha1 = require('crypto').createHash('sha1');
    sha1.update(key);

    return sha1.digest('hex') == params.signature;
}

function readAccessToken() {
    var data = fs.readFileSync('access_token.txt', 'utf8');
    console.log("qiguai");
    console.log(data);
    return data;
}

function get_userId(code) {
    //var post_str = new Buffer(JSON.stringify(reJSON));
    var get_req = https.request('https://qyapi.weixin.qq.com/cgi-bin/user/getuserinfo?access_token=' + access_token + '&code=' + code, function (response) {
        var responseText = [];
        var size = 0;
        response.setEncoding('utf8');
        response.on('data', function (data) {
            //	console.log(data);
            var j = JSON.parse(data);
            responseText.push(data);
            if (j.UserId != null)
                userId = j.UserId;
            console.log(userId);
        });
        response.on('end', function () {
            //console.log(responseText);
            //responseText.UserId
        });
    });

    //对于前面设置请求和json数据进行发送
    //get_req.write(post_str);
    get_req.end();
}

//获取学生信息接口数据
function get_userInfo(req,userId, userInfoToken,res) {
    //https://api.mysspku.com/index.php/V2/StudentInfo/getDetail?stuid=STUID&token=TOKEN
    //设置get请求参数
    console.log("+++++++");
    var get_options = {
        host: 'api.mysspku.com',
        path: '/index.php/V2/StudentInfo/getDetail?stuid=' + userId + '&token=' + userInfoToken,
        method: 'GET',
        rejectUnauthorized: false
    };
    //	console.log("https://api.mysspku.com/index.php/V2/StudentInfo/getDetail?stuid="+userId+"&token="+userInfoToken);
    var get_req = https.request(get_options, function (response) {
        var responseText = [];
        var size = 0;
        response.setEncoding('utf8');
        response.on('data', function (data) {
            console.log(data);
            responseText.push(data);
            var j = JSON.parse(data);
            console.log(j);
            if(j.errcode==0){
                userInfo=j.data;
            }

        });
        response.on('end', function () {
            //console.log(responseText);
            req.session.userInfo = userInfo;
            req.session.teacher_id = userInfo.teacher_id;
            req.session.studentid = userInfo.studentid;
            renderSdudent(res, "学生信息", userInfo);
        });
    });
    //对于前面设置请求和json数据进行发送
    //get_req.write(post_str);
    get_req.end();
}

function get_teacherInfo(res, teacherId, userInfoToken) {
    //https://api.mysspku.com/index.php/V2/StudentInfo/getDetail?stuid=STUID&token=TOKEN
    //设置get请求参数
    var get_options = {
        host: 'api.mysspku.com',
        path: '/index.php/V2/TeacherInfo/getDetail?teacherid=' + teacherId + '&token=' + userInfoToken,
        method: 'GET',
        rejectUnauthorized: false
    };
    //	console.log("https://api.mysspku.com/index.php/V2/StudentInfo/getDetail?stuid="+userId+"&token="+userInfoToken);
    var get_req = https.request(get_options, function (response) {
        var responseText = [];
        var size = 0;
        response.setEncoding('utf8');
        response.on('data', function (data) {
            console.log(data);
            responseText.push(data);
            var j = JSON.parse(data);
            if (j.errcode == 0) {
                teacherInfo = j.data;
            }
        });
        response.on('end', function () {
            renderTeacher(res, "导师信息", teacherInfo);
            //console.log(responseText);
        });
    });
    //对于前面设置请求和json数据进行发送
    //get_req.write(post_str);
    get_req.end();
}
function get_jobInfo(res,studentid,userInfoToken) {
    //https://api.mysspku.com/index.php/V2/StudentInfo/getDetail?stuid=STUID&token=TOKEN
    //设置get请求参数
    var get_options = {
        host: 'api.mysspku.com',
        path: '/index.php/V2/StudentInfo/getJobInfo?stuid=' + studentid + '&token=' + userInfoToken,
        method: 'GET',
        rejectUnauthorized: false
    };
    //	console.log("https://api.mysspku.com/index.php/V2/StudentInfo/getDetail?stuid="+userId+"&token="+userInfoToken);
    var get_req = https.request(get_options, function (response) {
        var responseText = [];
        var size = 0;
        var jobInfo;
        response.setEncoding('utf8');
        response.on('data', function (data) {
            console.log(data);
            responseText.push(data);
            var j = JSON.parse(data);
            if (j.errcode == 0) {
                jobInfo = j.data;
            }
        });
        response.on('end', function () {
            renderJob(res, "就业信息", jobInfo);
            //console.log(responseText);
        });
    });
    //对于前面设置请求和json数据进行发送
    //get_req.write(post_str);
    get_req.end();
}

function get_paperProcess(res,studentid,userInfoToken) {
    //https://api.mysspku.com/index.php/V2/StudentInfo/getDetail?stuid=STUID&token=TOKEN
    //设置get请求参数
    var get_options = {
        host: 'api.mysspku.com',
        path: '/index.php/V2/StudentInfo/getPaperProcess?stuid=' + studentid + '&token=' + userInfoToken,
        method: 'GET',
        rejectUnauthorized: false
    };
    //	console.log("https://api.mysspku.com/index.php/V2/StudentInfo/getDetail?stuid="+userId+"&token="+userInfoToken);
    var get_req = https.request(get_options, function (response) {
        var responseText = [];
        var size = 0;
        var paperProcess;
        response.setEncoding('utf8');
        response.on('data', function (data) {
            console.log(data);
            responseText.push(data);
            var j = JSON.parse(data);
            if (j.errcode == 0) {
                paperProcess = j.data;
            }
        });
        response.on('end', function () {
            renderPaper(res, "就业信息", paperProcess);
            //console.log(responseText);
        });
    });
    //对于前面设置请求和json数据进行发送
    //get_req.write(post_str);
    get_req.end();
}

//渲染学生信息页面
function renderSdudent(res, titlep, userInfo) {
    console.log(userInfo);
    res.render('mindex', {
        studentid: userInfo.studentid,
        name: userInfo.name,
        gender: userInfo.gender,
        type_name: userInfo.type_name,
        degree_type_name: userInfo.degree_type_name,
        researcharea: userInfo.researcharea,
        major_name: userInfo.major_name,
        mail: userInfo.mail,
        telephone: userInfo.telephone,
        birthday: userInfo.birthday,
        politicsstatus: userInfo.politicsstatus,
        nation: userInfo.nation,
        location: userInfo.location,
        teacher_id: userInfo.teacher_id,
        vice_teacher_id: userInfo.vice_teacher_id,
        startyearmonth: userInfo.startyearmonth,
        grade: userInfo.grade,
        hktwmacn: userInfo.hktwmacn,
        domain: userInfo.domain,
        imgurl: userInfo.imgurl
    });
}
function renderTeacher(res, titlep, userInfo) {
    console.log(userInfo);
    res.render('teacherInfo', {
        teacher_id: userInfo.teacher_id,
        name: userInfo.name,
        gender: userInfo.gender,
        title: userInfo.title,
        telephone: userInfo.telephone,
        mail: userInfo.mail,
        telephone: userInfo.telephone,
        imgurl: userInfo.imgurl
    });
}
function renderJob(res, titlep, jobInfo) {
    console.log(jobInfo);
    res.render('jobInfo', {
        jobInfo: jobInfo
    });
}
function renderPaper(res, titlep, paperProcess) {
    res.render('paperProcess', {
        paperProcess: paperProcess
    });
}

app.get('/studentInfo', function (req, res) {
    if (req.session.userInfo){
        renderSdudent(res, "学生信息", req.session.userInfo);
        res.end;
    }else {
        var arg = url.parse(req.url).query;
        var code = querystring.parse(arg).code;
        get_userId(code);
        if (userId != null) {
            get_userInfo(req, userId, userToken, res);
        }
    }
});

app.get("/teacherInfo", function (req, res) {
    console.log("查看教师信息");
    var teacher_id ;
    if (!req.session.teacher_id ){
        // var arg = url.parse(req.url).query;
        // var code = querystring.parse(arg).code;
        // get_userId(code);
        // if (userId != null) {
        //     get_userInfo(req, userId, userToken, res);
        //     teacher_id = req.session.teacher_id;
        //     get_teacherInfo(res, teacher_id, userToken);
        // }
    }else{
        teacher_id = req.session.teacher_id;
        get_teacherInfo(res, teacher_id, userToken);
    }
});

app.get("/getJobInfo",function (req,res) {
    console.log("查看就业信息");
    var studentId;
    if (req.session.userInfo){
         studentId = req.session.studentid;
        get_jobInfo(res, studentId, userToken);
    }else{
        res.end("未登录");
    }
});

app.get("/getPaperProcess",function (req,res) {
    console.log("查看答辩信息");
    var studentId;
    if (req.session.userInfo){
        studentId = req.session.studentid;
        get_paperProcess(res, studentId, userToken);
    }else{
        res.end("未登录");
    }
});


app.listen(PORT);
console.log("Server runing at port:" + PORT + ".");
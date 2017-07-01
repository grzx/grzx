"use strict";

var later = require('later');
var https = require('https');
var fs = require('fs');

var appid = 'wx1d3765eb45497a18';
var appsecret = 'KRRugxE2vnNch1qIyFA65DG74Vm0GmGnL3LM7RliAJ5mLlONj7FlIWHB8PqZGnZe';

function fetchAccessToken() {
    console.log(new Date());

    //get请求的url地址及传递的参数
    var options = {
        hostname: 'qyapi.weixin.qq.com',
        path: '/cgi-bin/gettoken?corpid=' + appid + '&corpsecret=' + appsecret
    };

    //用https协议通过get请求来获取数据
    var req = https.get(options, function (res) {
        var bodyChunks = '';
        res.on('data', function (chunk) {
            //将每次获取到的数据存储到bodyChunks中
            bodyChunks += chunk;
        });
        res.on('end', function () {
            //获取数据结束对数据进行处理，此处将获取的数据转成JSON格式
            //异常处理是必须的，否则一旦JSON.parse()出错，later.setInterval()定时器会停止，access_token的更新也会停止。
            try {
                var bodyJSON = JSON.parse(bodyChunks);
            } catch (e) {
                console.error(e);
                return;
            }

            if (bodyJSON && bodyJSON.access_token) {
                //将从获取的数据转成JSON格式后提取其中的token 并将token存储
                var accessToken = bodyJSON.access_token;
                saveAccessToken(accessToken);
                console.log(accessToken);
            } else {
                console.log('ERROR: Cannot find access_token in', bodyJSON);
            }
        });

    });

    req.on('error', function (e) {
        console.log('ERROR:', e.message);
    });
}

//将token传入当前文件夹的父文件夹中，用txt文本保存
function saveAccessToken(accessToken) {
    fs.writeFile('../access_token.txt', accessToken, function (err) {
        if (err) {
            console.log('写文件操作失败');
        } else {
            console.log('写文件操作成功');
        }
    });
}

fetchAccessToken();

//设置later使用本地时区
later.date.localTime();

//每小时获取一次token
var sched = later.parse.recur().every(1).hour();
var timer = later.setInterval(fetchAccessToken, sched);

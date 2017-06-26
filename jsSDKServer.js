var http = require("http");
var https = require("https");
var crypto = require("crypto");
var fs = require("fs");

var corpID = "wx1d3765eb45497a18";
var secret = "uJBYD04TA1wGRmp4rA_GMaiLdIhuBUhPIpF3OT9QQvpe9PmixaJSsz3sU-aEq2Dc";
var token = "";
var ticket = "";
var noncestr = "Wm3WZYTPz0wzccnW";
var timestamp = "1414587457";
var url = "http://xchen100.cn/";
var signature = "";

//0.采用主动调用的方式获取token
var tokenUrl = "https://qyapi.weixin.qq.com/cgi-bin/gettoken?corpid="+corpID+"&corpsecret="+secret;
https.get(tokenUrl,function(res){
    var json = '';
    res.on('data',function(d)
    {
	json+=d;
    });
    res.on('end',function()
    {
	json = JSON.parse(json);
    	console.log(json);
	    
    	token = json.access_token;
 	console.log("token:"+token);
	getTicket();
    });
    console.log(json);
    //token = json.access_token;
    //console.log("token:"+token);
}).on('error',function(e){
    console.error(e);
});
//1.获取ticket
var getTicket = function()
{
    //注意这里的type有两种wx_card和jsapi务必填写jsapi
    var ticketUrl = "https://qyapi.weixin.qq.com/cgi-bin/ticket/get?access_token="+token+"&type=jsapi";
    console.log(ticketUrl);
    https.get(ticketUrl,function(res){
        var json = '';
        res.on('data',function(d)
        {
      	    json+=d;
        });
        res.on('end',function()
        {
 	    json = JSON.parse(json);
    	    console.log(json);
	    
    	    ticket = json.ticket;
 	    console.log("ticket:"+ticket);
	    getSignature();
        });
        console.log(json);
        //token = json.access_token;
        //console.log("token:"+token);
    }).on('error',function(e){
        console.error(e);
    });
}

//2.获取签名
var getSignature = function()
{
    var string1 = "jsapi_ticket="+ticket+"&noncestr="+noncestr+"&timestamp="+timestamp+"&url="+url;
    console.log("string1:"+string1);
    var sha1 = crypto.createHash('sha1');
    sha1.update(string1);
    signature = sha1.digest('hex');
    console.log("signature:"+signature);
    if(signature)
    {
	saveKey();
    }
}

//3.将签名数据以json格式存储到文件
var saveKey = function()
{
    var json = {
	    "timestamp":timestamp,
	    "appId":corpID,
	    "nonceStr":noncestr,
	    "token":token,
	    "ticket":ticket,
	    "signature":signature
	    };
    console.log(json);
    var jsonStr = JSON.stringify(json);
    console.log(jsonStr);
    fs.writeFile("data_key.txt",jsonStr,function(err){
        if(err)
        {
	    throw err;
        }
	console.log("key saved into file");
	startServer();
    });
}

//4.ajax请求nodeje发送的json数据
function onRequest(request, response){
    console.log("Request received.");
    response.writeHead(200,{"Content-Type":'text/plain','charset':'utf-8','Access-Control-Allow-Origin':'*','Access-Control-Allow-Methods':'PUT,POST,GET,DELETE,OPTIONS'});//可以解决跨域的请求
  //response.writeHead(200,{"Content-Type":'application/json',            'Access-Control-Allow-Origin':'*','Access-Control-Allow-Methods':'PUT,POST,GET,DELETE,OPTIONS'});
  //  //response.write("Hello World 8888\n");
  //    
    str=fs.readFileSync('data_key.txt');
    response.write(str);
    console.log("nodejs send:"+str)
    response.end();
}
var startServer = function()
{
    http.createServer(onRequest).listen(8899);
    console.log("Server is running on port 8899!"); 
} 

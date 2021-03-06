var url
var fw
var reqHeaders = {"type":0,"request-id":1,"protocol":2,"url":3,"method":4,"user-agent":5,"if-none-match":6,"if-modified-since":7,"timeStamp":8}
var respHeaders= {"type":0,"request-id":1,"from-cache":2,"date":3,"age":4,"url":5,"response-code":6,"content-type":7,"content-length":8,"server":9,"cache-control":10,"pragma":11,"expires":12,"last-modified":13,"etag":14,"content-md5":15,"content-encoding":16, "status":17,"timeStamp":18}
var reqLines = ""
var respLines = ""

function onInitFs(fs) {
	fs.root.getFile('log.txt', {create: true}, function(fileEntry) {
//	Create a FileWriter object for our FileEntry (log.txt).
    	fileEntry.createWriter(function(fileWriter){ 
	fileWriter.seek(fileWriter.length);	
	fileWriter.write(new Blob(["New-Session" + String.fromCharCode(10)]));
      	fw=fileWriter;
     	fileWriter.onwriteend = function(e) {
		console.log("Write completed")
      	};
      	fileWriter.onerror = function(e) {
		console.log('Error',e)
      };
    }, errorHandler);
  }, errorHandler);
}
//var reqintervalID = setInterval(saveDataReq, 2000);
var resintervalID = setInterval(saveData, 10000);
function errorHandler(e) {
  var msg = '';
  switch (e.name) {
    case DOMError.QUOTA_EXCEEDED_ERR:
      msg = 'QUOTA_EXCEEDED_ERR';
      break;
    case DOMError.NOT_FOUND_ERR:
      msg = 'NOT_FOUND_ERR';
      break;
    case DOMError.SECURITY_ERR:
      msg = 'SECURITY_ERR';
      break;
    case DOMError.INVALID_MODIFICATION_ERR:
      msg = 'INVALID_MODIFICATION_ERR';
      break;
    case DOMError.INVALID_STATE_ERR:
      msg = 'INVALID_STATE_ERR';
      break;
    default:
      msg = 'Unknown Error';
      break;
  };
  console.log('Error: ',e );
	window.alert("Error found ...");
}
window.requestFileSystem  = window.requestFileSystem || window.webkitRequestFileSystem;
window.webkitStorageInfo.requestQuota(PERSISTENT, 1024*1024, function(grantedBytes) {
	  window.requestFileSystem(PERSISTENT, grantedBytes, onInitFs, errorHandler);
}, function(e) {
	  console.log('Error', e);
});
/*function saveDataReq(){
	var reqblob= new Blob([reqLines]);
	fw.write(reqblob);	
	reqLines="";
	
}*/
function saveData(){
	var blob= new Blob([reqLines,respLines]);
	fw.write(blob);	
	respLines="";
	reqLines="";
}

function headerInRespDic(name) {
	for (var key in respHeaders) {
		if (name==key)
			return true
	}
	return false
}

function headerInReqDic(name) {
	for (var key in reqHeaders) {
		if (name==key)
			return true
	}
	return false
}

chrome.webRequest.onSendHeaders.addListener(function(details){
	var reqArr = new Array(Object.keys(reqHeaders).length)
	for (var i = reqArr.length-1; i >= 0; -- i) reqArr[i] = ""
	reqArr[reqHeaders["type"]] = "Q" ;
	reqArr[reqHeaders["request-id"]] = details.requestId;
	reqArr[reqHeaders["timeStamp"]] = details.timeStamp;
	var temp = reqArr[reqHeaders["url"]] = details.url;
//	console.log(temp)
	reqArr[reqHeaders["method"]] = details.method;
	if (temp.charAt(4) == 's')
		reqArr[reqHeaders["protocol"]] = temp.substring(0, 5);
	else
		reqArr[reqHeaders["protocol"]] = temp.substring(0, 4);
	headers=details.requestHeaders;
	for (var i = 0, l = headers.length; i < l; ++i ){
//		if(headers[i].name.toLowerCase()=="if-modified-since" || headers[i].name.toLowerCase()=="if-none-match"){
//		console.log(headers[i].name)
//		console.log(headers[i].value)}

		if(headerInReqDic(headers[i].name.toLowerCase())){
			reqArr[reqHeaders[headers[i].name.toLowerCase()]] = headers[i].value;
		}	
	}
	reqLines += reqArr.join(String.fromCharCode(9));
	reqLines += String.fromCharCode(10)
},
{urls: ["<all_urls>"]},["requestHeaders"]);

chrome.webRequest.onCompleted.addListener(onResponse, {urls: ["<all_urls>"]},["responseHeaders"]);
chrome.webRequest.onBeforeRedirect.addListener(onResponse, {urls: ["<all_urls>"]},["responseHeaders"]);

function onResponse(details){
	var respArr = new Array(Object.keys(respHeaders).length);
	for (var i = respArr.length-1; i >= 0; -- i) respArr[i] = "";
	respArr[respHeaders["type"]] = "S";
	respArr[respHeaders["request-id"]] = details.requestId;
	respArr[respHeaders["timeStamp"]] = details.timeStamp;
	respArr[respHeaders["url"]] = details.url;
	respArr[respHeaders["response-code"]] = details.statusCode + details.statusLine;
	respArr[respHeaders["from-cache"]] = details.fromCache;
	headers=details.responseHeaders;
	
	for (var i = 0, l = headers.length; i < l; ++i ){
	//	console.log(headers[i].name)
	//	console.log(headers[i].value)
		if(headerInRespDic(headers[i].name.toLowerCase())){
			respArr[respHeaders[headers[i].name.toLowerCase()]] = headers[i].value;
		}	
	}
	respLines += respArr.join(String.fromCharCode(9));
	respLines += String.fromCharCode(10)
}

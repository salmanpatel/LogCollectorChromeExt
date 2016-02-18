var url
var fw
var towrite = "New-Session" + String.fromCharCode(10)
var reqHeaders = {"type":0,"date":1,"age":2,"protocol":3,"url":4,"method":5,"User-Agent":6,"if-none-match":7,"if-modified-since":8}
var respHeaders= {"type":0,"status":1,"content-type":1,"content-length":2,"server":3,"cache-control":4,"pragma":5,"expires":6,"last-modified":7,"etag":8,"content-md5":9}
var req
var respArr

function onInitFs(fs) {
	fs.root.getFile('log.txt', {create: true}, function(fileEntry) {
//	Create a FileWriter object for our FileEntry (log.txt).
    	fileEntry.createWriter(function(fileWriter){ 
	fileWriter.seek(fileWriter.length);	
	fileWriter.write(new Blob([towrite]));
	towrite=""
      	fw=fileWriter;
     	fileWriter.onwriteend = function(e) {
//		console.log("Write completed")
      	};
      	fileWriter.onerror = function(e) {
		//console.log("In error")
		console.log('Error',e)
      };
    }, errorHandler);
  }, errorHandler);
}
var intervalID = setInterval(saveData, 5000);
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
//	  console.log('Error', e);
});
function saveData(){
	var blob= new Blob([towrite]);
	fw.write(blob);	
	towrite="";
}

function headerRequired(name){
	if(name=="status" || name=="age" || name=="version"|| name=="cache-control" || name=="content-encoding" || name=="content-type" || name=="date" || name=="expires" || name=="pragma" || name=="last-modified" || name=="content-length" || name=="content-md5" || name=="server" || name=="user-agent" || name=="if-none-match" || name=="if-modified-since"|| name=="etag"){
		return true;
	}
	else{
		return false;
	}
}

chrome.webRequest.onBeforeSendHeaders.addListener(function(details){
	towrite+="Q"+String.fromCharCode(9);
	reqID=details.requestId+String.fromCharCode(9);
	towrite+=reqID
	ts=details.timeStamp+String.fromCharCode(9);
	towrite+=ts
	url=details.url+String.fromCharCode(9);
	towrite+=url;
	reqtype=details.type+String.fromCharCode(9);
	towrite+=reqtype
	httpMethod=details.method+String.fromCharCode(9);
	towrite+=httpMethod
	headers=details.requestHeaders;
	for (var i = 0, l = headers.length; i < l; ++i ){
		if(headerRequired(headers[i].name.toLowerCase())){
			towrite+="NAME: "+headers[i].name;
			towrite+=String.fromCharCode(9);	
			towrite+="VALUE: "+(headers[i].value);
			towrite+=String.fromCharCode(9);	
		}
	}
	towrite+=String.fromCharCode(10)
},
{urls: ["<all_urls>"]},["requestHeaders"]);

chrome.webRequest.onResponseStarted.addListener(onResponse, {urls: ["<all_urls>"]},["responseHeaders"]);
chrome.webRequest.onBeforeRedirect.addListener(onResponse, {urls: ["<all_urls>"]},["responseHeaders"]);

function onResponse(details){
	towrite+="S"+String.fromCharCode(9);
	reqID=details.requestId+String.fromCharCode(9);
	towrite+=reqID
	ts=details.timeStamp+String.fromCharCode(9);
	towrite+=ts
	url=details.url+String.fromCharCode(9);
	towrite+=url;
	httpMethod=details.method+String.fromCharCode(9);
	towrite+=httpMethod
	statuscode=details.statusCode+String.fromCharCode(9);
	towrite+=statuscode
	statusline=details.statusLine+String.fromCharCode(9);
	towrite+=statusline
	fc=details.fromCache + String.fromCharCode(9);
	towrite+=fc
	headers=details.responseHeaders;
	for (var i = 0, l = headers.length; i < l; ++i ){
		if(headerRequired(headers[i].name.toLowerCase())){
			towrite+="NAME:"+headers[i].name;
			towrite+=String.fromCharCode(9);	
			towrite+="VALUE:"+(headers[i].value);
			towrite+=String.fromCharCode(9);
		}	
	}
	towrite+=String.fromCharCode(10)
}

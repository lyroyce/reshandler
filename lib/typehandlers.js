
var zlib = require('zlib');
var iconv = require('iconv-lite');

var typehandlers = typehandlers || {};

typehandlers.decompress = function(){
    return function (res, buffer, callback) {
        var encoding = res.headers['content-encoding'];
        if (encoding == 'gzip') {
            zlib.gunzip(buffer, function(err, data) {
                res.headers['content-encoding'] = '';
                callback(err, res, data);
            });
        } else if (encoding == 'deflate') {
            zlib.inflate(buffer, function(err, data) {
                res.headers['content-encoding'] = '';
                callback(err, res, data);
            })
        } else {
            callback(null, res, buffer);
        }
    }
}

typehandlers.transcode = function(){
    return function(res, buffer, callback){
        try{
            var charset = detectCharset(res, buffer, 'utf-8').toLowerCase();
            if(charset!=='utf-8'){
                buffer = new Buffer(iconv.decode(buffer, charset), 'utf-8');
                if(headerCharset()){
                    res.headers['content-type'] = res.headers['content-type'].replace(/charset=([^;,\r\n]*)/i, 'charset=UTF-8');
                }else{
                    res.headers['content-type'] = res.headers['content-type'] + '; charset=UTF-8';
                }
            }
            callback(null, res, buffer);
        }catch(err){
            callback(err, res, buffer);
        }
    }
}

var detectCharset = function(res, buffer, defaultCharset){
    if(charset=headerCharset(res))
        return charset;
    if(charset=contentCharset(buffer.toString())) 
        return charset;
    return defaultCharset;
}

var headerCharset = function(res){
    if(!res || !res.headers['content-type']) return null;
    var matches = res.headers['content-type'].match(/charset=([^;,\r\n]*)/i);
    return matches?matches[1]:null;
}

var contentCharset = function(content){
    if(!content) return null;
    var matches = content.match(/charset=([^;,\"]*)/i);
    return matches?matches[1]:null;
}

module.exports = typehandlers;
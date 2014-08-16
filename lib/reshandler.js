
var chunks = require('./chunks');
var typehandlers = require('./typehandlers');

var reshandler = reshandler || {};

reshandler.new = function(callback){
    return new reshandler.Handler();
}

reshandler.Handler = function(res){
    this.typeHandlers = {};
}

reshandler.Handler.prototype.onType = function(contentTypes, callback){
    if(callback instanceof Function){
        if (!(contentTypes instanceof Array)) {
            contentTypes = [contentTypes];
        }
        for(var i in contentTypes){
            var type = contentTypes[i];
            if(!this.typeHandlers[type]) this.typeHandlers[type] = [];
            this.typeHandlers[type].push(callback);
        }
        return this;
    }else{
        throw new Error('callback '+ callback +' is not a function');
    }
}

reshandler.Handler.prototype.done = function(callback){
    var that = this;
    return function(res){
        chunks.new().handle(res, function(buffer){
            var contentType = res.headers['content-type'];
            var handlers = matchHandlers(that.typeHandlers, contentType);
            chain(res, buffer, handlers, function(err, res, buffer){
                if(callback instanceof Function){
                    callback(err, res, buffer, contentType);
                }
            });
        });
    };
}

var matchHandlers = function(typeHandlers, contentType){
    var handlers = [];
    for(var type in typeHandlers){
        if(contentType?contentType.indexOf(type)>=0:type=="") handlers = handlers.concat(typeHandlers[type]);
    }
    return handlers;
}

var chain = function(res, buffer, handlers, done){
    if(handlers && handlers.length>0){
        var next = handlers.shift();
        next(res, buffer, function(err, res, buffer){
            if(err) done(err, res, buffer);
            else chain(res, buffer, handlers, done);
        });
    }else{
        done(null, res, buffer);
    }
}

for(var name in typehandlers){
    reshandler[name] = typehandlers[name];
}

module.exports = reshandler;
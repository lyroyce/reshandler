
var chunks = chunks || {};

chunks.new = function(callback){
    return new chunks.Chunks();
}

chunks.Chunks = function () {
    this.chunks = [];
}

chunks.Chunks.prototype.handle = function (res, callback) {
    var that = this;
    res.on('data', function(chunk) {
        that.concat(chunk);
    });
    res.on('end', function() {
        callback(that.toRawBuffer());
    });
}

chunks.Chunks.prototype.concat = function (chunk) {
    this.chunks.push(chunk);
}

chunks.Chunks.prototype.toRawBuffer = function () {
    return Buffer.concat(this.chunks);
}

module.exports = chunks;
# reshandler

A response handler that makes HTTP response processing simpler. It's desinged to facilitate the work with modules like `http` and `request` that require a callback function for the `response` event.

By using chaining filters, `reshandler` helps you to handle things like chunks concatenation, gzip decompression and charset conversion in a beautiful way.

# Example with http module

The example below gets and processes the HTTP response according to its content type. It tries to decompress the response data, convert the response data to UTF-8 if necessary, and outputs the processed response data at last.

	var http = require('http');
	var reshandler = require('reshandler');				
	http.get("http://www.example.com/?q=123", 
		reshandler.new()								// create a new response handler
	    .onType('text/html', reshandler.decompress())	// add a pre-defined filter for HTML
	    .onType('text/html', reshandler.transcode())	// add another pre-defined filter for HTML
		.done(function(err, res, buffer){				// add the last callback
			console.log("The processed response: " + buffer.toString());
		})
	).on('error', function(e) {
		console.log("Got error: " + e.message);
	});

# APIs

- **reshandler.new()**

	Create a response handler. Same as `new reshandler.Handler()`

- **reshandler.Handler()**

	The main Handler class.

- **Handler.onType(contentType, function (res, buffer, callback) {...})**

	Register a pre-defined or custom filter function for the specified `contentType`. The filter function will only be called when `contentType` matches(is a substring of) 'Content-Type' header of the response. Multiple filter functions can be registered and will be called in the order they were registered.

	Please note that `callback`(`function(err, res, buffer)`) must be called in the end of each filter function for chaining filters to work. Unless you are sure that filter function is the last one to execute.

		//...
		.onType('image/png', function (res, buffer, callback) {	// the first filter
			try{
				console.log("Let's make some change to the buffer.");
				callback(null, res, buffer);	// the result is passed to the next filter
			}catch(err){
				callback(err, res, buffer);		// the result/error is passed to the last callback
			}
	    })
	    .onType('image/png', function (res, buffer, callback) {	// the next filter
			console.log("This is the end.");	// the last callback won't be called
	    })
	    .done(function(err, res, buffer){		// the last callback
			if(err) console.log("Got error: " + err.message);
			else console.log("Got response: " + buffer.toString());
		})
	    //...

- **Handler.done([function(err, res, buffer, contentType){...}])**

	Build the callback for the `response` event. The only argument is a optional function. If provided, it will be registered as the last callback function to receive the processed response. 

# Pre-defined filters

- **reshandler.decompress()**

	Build the callback function that automatically unzip or inflate response buffer.

- **reshandler.transcode()**

	Build the callback function that automatically convert the charset of response buffer to UTF-8.



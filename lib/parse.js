var createReadStream = require('fs').createReadStream;

function Parser(opts) {
	var obj = {};
	
	obj.parse = function(argv, cb) {
		var stream;
		if (argv._ && argv._.length) {
			stream = createReadStream(argv._[0]);	
		} else {
			stream = process.stdin;
		}
		obj.readStream(stream, cb);	
	};

	obj.readStream = function(stream, cb) {
		var content = '';
		stream.on('data', function(buf) { 
			content += buf.toString('utf8'); 
		});
		stream.on('close', function() {
			cb(null, content);
		});
		stream.on('error', function(error) {
			cb(error);
		});
		stream.resume();
	};

	return obj;
}

module.exports = function(argv, cb) {
	new Parser().parse(argv, cb);	
};

module.exports.Parser = Parser;

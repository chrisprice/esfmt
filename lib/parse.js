var createReadStream = require('fs').createReadStream,
	createWriteStream = require('fs').createWriteStream;

function Parser(opts) {
	var obj = {};

	obj.parse = function(argv, transform, cb) {
		var readStream, writeStream;
		if (argv._ && argv._.length) {
			readStream = createReadStream(argv._[0]);	
		} else {
			readStream = process.stdin;
		}
		obj.readStream(readStream, function(error, content) {
			if (error) {
				return cb(error);
			}
			transform(content, function(error, content) {
				if (error) {
					return cb(error);
				}
				var end;
				if (argv._ && argv._.length) {
					writeStream = createWriteStream(argv._[0]);	
					end = true;
				} else {
					writeStream = process.stdout;
					end = false;
				}
				obj.writeStream(writeStream, content, end, function(error) {
					cb(error);
				});
			});
		});	
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

	obj.writeStream = function(stream, content, end, cb) {
		stream.on('finish', function() {
			cb();
		});
		stream.on('error', function(error) {
			cb(error);
		});
		stream.write(content, 'utf8');
		if (end) {
			stream.end();
		}
	};

	return obj;
}

module.exports = function(argv, transform, cb) {
	new Parser().parse(argv, transform, cb);	
};

module.exports.Parser = Parser;

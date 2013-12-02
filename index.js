var parse = require('esprima').parse,
	replace = require('estraverse').replace,
	WildcardMatcher = require('./lib/wildcardMatcher'),
	generate = require('escodegen').generate,
	input = require('./lib/parse');

var argv = require('optimist')
	.usage('$0 [flags] [path ...]')
	.options('r', 'rule')
	.describe('r', 'Apply the rewrite rule to the source before reformatting.')
	.argv;

if (argv.r) {
	var ruleParts = argv.r.split('->');
	var rule = {
		raw: argv.r,
		pattern: parse(ruleParts[0]).body[0].expression,
		replacement: parse(ruleParts[1]).body[0].expression
	};

	input(argv, function(error, input) {
		if (error) {
			return cb(error);
		}
		var ast = parse(input);
		
		replace(ast, {
			enter: function(node, parent) {
				var wildcardMatcher = WildcardMatcher();
				if (wildcardMatcher.match(rule.pattern, node)) {
					console.log(wildcardMatcher.values);
					return { type: 'Literal', value: 'MATCH' };
				}
			}
		});

		console.log(generate(ast));
	});
}

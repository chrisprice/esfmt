var parse = require('esprima').parse,
	WildcardMatcher = require('./lib/wildcardMatcher'),
	Cloner = require('./lib/cloner'),
	Walker = require('./lib/walker'),
	escodegen = require('escodegen'),
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
		var ast = parse(input, {range: true, tokens: true, comment: true});
		ast = escodegen.attachComments(ast, ast.comments, ast.tokens);

		var cloner = Cloner(), walker = Walker({ 
			recurse: function(node, key, parent) {
				var wildcardMatcher = WildcardMatcher();
				if (wildcardMatcher.match(rule.pattern, node)) {
					var replacement = cloner.clone(rule.replacement);
					var newNode = wildcardMatcher.apply(replacement);
					parent[key] = newNode;
				} else {
					walker.walk(node, key, parent);
				}
			}
		});

		// TODO won't replace root
		walker.walk(ast);

		var output = escodegen.generate(ast, {comment: true});
		console.log(output);
	});
}

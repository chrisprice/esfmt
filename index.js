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
	.options('c', 'clinical')
	.describe('c', 'Attempt a clinical replacement of matched rules rather than reformatting the entire file')
	.boolean('c')
	.argv;

function parseRulePart(part) {
	var node = parse(part).body[0];
	// allow expressions to match regardless of their location
	if (node.type === 'ExpressionStatement') {
		node = node.expression;
	}
	return node;
}

function transform(input, cb) {
	var ast = parse(input, {range: true, tokens: true, comment: true});
	ast = escodegen.attachComments(ast, ast.comments, ast.tokens);

	var substitutions = [];

	if (argv.r) {
		var ruleParts = argv.r.split('->');
		var rule = {
			raw: argv.r,
			pattern: parseRulePart(ruleParts[0]),
			replacement: parseRulePart(ruleParts[1])
		};

		var cloner = Cloner(), walker = Walker({ 
			recurse: function(node, key, parent) {
				var wildcardMatcher = WildcardMatcher();
				if (wildcardMatcher.match(rule.pattern, node)) {
					var replacement = cloner.clone(rule.replacement);
					var newNode = wildcardMatcher.apply(replacement);
					substitutions.push({ replacement: newNode, original: node });
					parent[key] = newNode;
				} else {
					walker.walk(node, key, parent);
				}
			}
		});
		// TODO won't replace root
		walker.walk(ast);
	}

	var output;
	if (argv.c && argv.r) {
		output = substitutions.reduceRight(function(source, sub) {
			console.log(sub.original.range);
			var replacementSource = escodegen.generate(sub.replacement);
			return source.substring(0, sub.original.range[0]) +
				escodegen.generate(sub.replacement) +
				source.substring(sub.original.range[1]);
		}, input);
	} else {
		output = escodegen.generate(ast, {comment: true});
	}

	cb(null, output);
}

input(argv, transform, function(error) {
	console.error(error);
 });

var parse = require('esprima').parse,
	readFileSync = require('fs').readFileSync;
	replaceNode = require('estraverse').replace,
	traverseNode = require('estraverse').traverse,
	generate = require('escodegen').generate;

var argv = require('optimist')
	.usage('$0 [flags] [path ...]')
	.options('r', 'rule')
	.describe('r', 'Apply the rewrite rule to the source before reformatting.')
	.argv;

var ruleParts = argv.r.split('->');
var rule = {
	raw: argv.r,
	pattern: parse(ruleParts[0]).body[0].expression,
	replacement: parse(ruleParts[1]).body[0]
};

var inputPath = argv._[0];
//console.log(inputPath);
var input = parse(readFileSync(inputPath, 'utf8'));

console.log(rule);


function nodesMatch(node, pattern) {
	if (Object.keys(node).length !== Object.keys(pattern).length) {
		return false;
	}
	return Object.keys(node)
		.reduce(function(result, key) {
			if (!result) {
				return false;
			}
			if (typeof(node[key]) === 'object') {
				if (typeof(pattern[key]) !== 'object') {
					return false;
				}
				return nodesMatch(node[key], pattern[key]);
			}
			return node[key] === pattern[key];
		}, true);
}
function isExpression(node) {
	return node.type.match(/Expression$/);
}
function isWildcardExpression(node) {
	return node.type == 'Identifier' && node.name && node.name.match(/^[a-z]$/);
}

var output = replaceNode(rule.replacement, {
	enter: function(node) {
		// look for match
		if (nodesMatch(node, rule.pattern)) {
			console.log(node);
		}
	}
});
console.log(generate(output));

var parse = require('esprima').parse,
	replaceNode = require('estraverse').replace,
	traverseNode = require('estraverse').traverse,
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
		
		var patternStr = JSON.stringify(rule.pattern);
		//console.log('rule', patternStr);
		var backreferenceLookup = {}, backreferenceCounter = 0;
		patternRegex = patternStr.replace(/\{"type":"Identifier","name":"([a-z])"\}/g, 
			function(match, wildcard) {
				// Easy case - we've come across it before, add the back ref
				if (backreferenceLookup[wildcard]) {
					return '\\' + backreferenceLookup[wildcard];	
				}
				// Tough case - a new wildcard, add match and back ref to lookup
				backreferenceLookup[wildcard] = ++backreferenceCounter;
				return '(.*)';
			});
		// TODO: escape all regex stuff
		patternRegex = patternRegex.replace(/\+/g, '\\+');
		patternRegex = patternRegex.replace(/\{/g, '\\{').replace(/\}/g, '\\}');

		var replacementStr = JSON.stringify(rule.replacement);
		replacementStr = replacementStr.replace(/\{"type":"Identifier","name":"([a-z])"\}/g, 
			function(match, wildcard) {
				// Easy case - we've come across it before, add the back ref
				if (backreferenceLookup[wildcard]) {
					return '$' + backreferenceLookup[wildcard];	
				}
				// Tough case - we don't know it, assume it's meant to be a literal  
				return match;
			});


		var astStr = JSON.stringify(ast);
		var newAstStr = astStr.replace(new RegExp(patternRegex, 'g'), replacementStr);
		//console.log(newAstStr);

		console.log(generate(JSON.parse(newAstStr)));
	});
}

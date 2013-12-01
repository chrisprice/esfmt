var WildcardMatcher = require('../lib/wildcardMatcher'),
	parse = require('esprima').parse,
	readFileSync = require('fs').readFileSync;

describe('wildcard matcher', function() {
	
	beforeEach(function() {
		this.addMatchers({
			toAstMatch: function(expected, matcherOpts) {
				var actualAst = parse(this.actual);
				var expectedAst = parse(expected);
				var m = WildcardMatcher(matcherOpts);
				return m.match(actualAst, expectedAst);
			}
		});
	});

	it('can match parsed nodes', function() {
		expect('true').toAstMatch('true');
		expect('true').not.toAstMatch('false');
		expect('a').toAstMatch('a');
		expect('a').toAstMatch('b');
		expect('a + a').toAstMatch('a + a');
		expect('a + a').not.toAstMatch('a + b');
		expect('a ? a : a').toAstMatch('a ? a : a');
		expect('a ? a : a').not.toAstMatch('a ? a : b');
		expect('!(a !== b)').toAstMatch('!(a !== b)');
		expect('!(a !== b)').not.toAstMatch('-(a !== b)');
		expect('a(a)').toAstMatch('a(a)');
		expect('a(a)').not.toAstMatch('b(a)');
		expect('new a(a)').toAstMatch('new a(a)');
		expect('new a(a)').not.toAstMatch('new a(b)');
		expect('a && a').toAstMatch('a && a');
		expect('a && a').not.toAstMatch('a && b');

		expect('if (a) { a; }').toAstMatch('if (a) { a; }');	
	});

	it('can match this file', function() {
		var contentsA = readFileSync(__filename, 'utf8'),
			contentsB = readFileSync(__filename, 'utf8');
		expect(contentsA).toAstMatch(contentsB);
	});

});

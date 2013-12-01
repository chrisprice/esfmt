var Matcher = require('./matcher');

function WilcardMatcher(opts) {
	opts = opts || {};
	var obj = {};

	var equalityMatcher = Matcher(),
		baseMatcher = Matcher({	recurse: match }),
		wildcardValues = {};
	

	function match(nodeA, nodeB) {
		// TODO: this null check is starting to seem odd
		if (nodeA === null || nodeB === null) {
			return nodeA === nodeB;
		}
		if (nodeA.type === 'Identifier' && nodeA.name.match(/^[a-z]$/)) {
			var wildcardName = nodeA.name;
			if (wildcardValues[wildcardName]) {
				return equalityMatcher.match(wildcardValues[wildcardName], nodeB);
			} else {
				wildcardValues[wildcardName] = nodeB;
				return true;
			}
		}
		return baseMatcher.match(nodeA, nodeB);
	}

	obj.match = match;

	return obj;
}

module.exports = WilcardMatcher;

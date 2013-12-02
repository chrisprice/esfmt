var Matcher = require('./matcher');

function WilcardMatcher(opts) {
	opts = opts || {};
	var obj = {};

	var equalityMatcher = Matcher(),
		baseMatcher = Matcher({	recurse: match }),
		values = {};
	
	function match(nodeA, nodeB) {
		// TODO: this null check is starting to seem odd
		if (nodeA === null || nodeB === null) {
			return nodeA === nodeB;
		}
		if (nodeA.type === 'Identifier' && nodeA.name.match(/^[a-z]$/)) {
			var wildcardName = nodeA.name;
			if (values[wildcardName]) {
				return equalityMatcher.match(values[wildcardName], nodeB);
			} else {
				values[wildcardName] = nodeB;
				return true;
			}
		}
		return baseMatcher.match(nodeA, nodeB);
	}

	obj.match = match;
	obj.values = values;

	return obj;
}

module.exports = WilcardMatcher;

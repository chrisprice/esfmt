var Matcher = require('./matcher'),
	Walker = require('./walker'),
	Cloner = require('./cloner');

function WilcardMatcher(opts) {
	opts = opts || {};
	var obj = {};

	var equalityMatcher = Matcher(),
		baseMatcher = Matcher({	recurse: match }),
		applyWalker = Walker({ recurse: apply }),
		cloner = Cloner();
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

	function apply(node, key, parent) {
		if (node.type === 'Identifier' && node.name.match(/^[a-z]$/)) {
			var wildcardName = node.name;
			if (values[wildcardName]) {
				var replacement = cloner.clone(values[wildcardName]);
				if (parent) {
					parent[key] = replacement;
				}
				node = replacement;
			}
			// No else condition because Literals wouldn't recurse anyway
		} else {
			applyWalker.walk(node, key, parent);
		}
		return node;
	}

	obj.match = match;
	obj.apply = apply;

	return obj;
}

module.exports = WilcardMatcher;

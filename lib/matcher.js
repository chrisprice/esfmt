
function Matcher(opts) {
	opts = opts || {};
	opts.recurse = opts.recurse || match;
	var obj = {};

	function every(arrayA, arrayB) {
		if (arrayA.length !== arrayB.length) {
			return false;
		}
		for (var i = 0, l = arrayA.length; i < l; i++) {
			if (!opts.recurse(arrayA[i], arrayB[i])) {
				return false;
			}
		}
		return true;
	}
	
	function match(nodeA, nodeB) {
		if (nodeA === null || nodeB === null) {
			return nodeA === nodeB;
		}
		if (nodeA.type !== nodeB.type) {
			return false;
		}
		switch (nodeA.type) {
			case 'BinaryExpression':
			case 'LogicalExpression':
				return nodeA.operation === nodeB.operation &&
					opts.recurse(nodeA.left, nodeB.left) &&
					opts.recurse(nodeA.right, nodeB.right);
			case 'IfStatement':
			case 'ConditionalExpression':
				return opts.recurse(nodeA.test, nodeB.test) &&
					opts.recurse(nodeA.consequent, nodeB.consequent) &&
					opts.recurse(nodeA.alternate, nodeB.alternate);
			case 'ExpressionStatement':
				return opts.recurse(nodeA.expression, nodeB.expression);
			case 'Literal':
				return nodeA.value === nodeB.value;
			case 'Identifier':
				return nodeA.name === nodeB.name;
			case 'CallExpression':
			case 'NewExpression':
				return opts.recurse(nodeA.callee, nodeB.callee) &&
					every(nodeA.arguments, nodeB.arguments);
			case 'BlockStatement':
			case 'Program':
				return every(nodeA.body, nodeB.body); 
			case 'UnaryExpression':
				return nodeA.operator === nodeB.operator &&
					nodeA.prefix === nodeB.prefix &&
					opts.recurse(nodeA.argument, nodeB.argument);
			case 'VariableDeclaration':
				return nodeA.kind === nodeB.kind &&
					every(nodeA.declarations, nodeB.declarations);
			case 'VariableDeclarator':
				return opts.recurse(nodeA.id, nodeB.id) &&
					opts.recurse(nodeA.init, nodeB.init);
			case 'MemberExpression':
				return nodeA.computed === nodeB.computed && 
					opts.recurse(nodeA.object, nodeB.object) &&
					opts.recurse(nodeA.property, nodeB.property);
			case 'FunctionExpression':
				// TODO: limited subset
				return nodeA.id === nodeB.id &&
					nodeA.expression === nodeB.expression &&
					every(nodeA.params, nodeB.params) &&
					opts.recurse(nodeA.body, nodeB.body);
			case 'ThisExpression':
				return true;			
			case 'ObjectExpression':
				return every(nodeA.properties, nodeB.properties);
			case 'Property':
				return nodeA.kind === nodeB.kind &&
					opts.recurse(nodeA.key, nodeB.key) &&
					opts.recurse(nodeA.value, nodeB.value);
			case 'ReturnStatement':
				return opts.recurse(nodeA.argument, nodeB.argument);
			default:
				console.log(nodeA);
				throw new Error('Unknown node type ' + nodeA.type);		
		}
	}

	obj.match = match;

	return obj;
}

module.exports = Matcher;

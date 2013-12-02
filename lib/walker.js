
function Walker(opts) {
	opts = opts || {};
	opts.recurse = opts.recurse || walk;
	var obj = {};

	function walk(node, key, parent) {
		if (node === null) {
			return;
		}
		switch (node.type) {
			case 'BinaryExpression':
			case 'LogicalExpression':
				opts.recurse(node.left, 'left', node);
				opts.recurse(node.right, 'right', node);
				break;
			case 'IfStatement':
			case 'ConditionalExpression':
				opts.recurse(node.test, 'test', node);
				opts.recurse(node.consequent, 'consequent', node);
				opts.recurse(node.alternate, 'alternate', node);
				break;
			case 'ExpressionStatement':
				opts.recurse(node.expression, 'expression', node);
				break;
			case 'Literal':
			case 'Identifier':
				break;
			case 'CallExpression':
			case 'NewExpression':
				opts.recurse(node.callee, 'callee', node);
				node.arguments.forEach(opts.recurse);
				break;
			case 'BlockStatement':
			case 'Program':
				node.body.forEach(opts.recurse);
				break;
			case 'UnaryExpression':
				opts.recurse(node.argument, 'argument', node);
				break;
			case 'VariableDeclaration':
				node.declarations.forEach(opts.recurse);
				break;
			case 'VariableDeclarator':
				opts.recurse(node.id, 'id', node);
				opts.recurse(node.init, 'init', node);
				break;
			case 'MemberExpression':
				opts.recurse(node.object, 'object', node);
				opts.recurse(node.property, 'property', node);
				break;
			case 'FunctionExpression':
				// TODO: limited subset
				node.params.forEach(opts.recurse);
				opts.recurse(node.body, 'body', node);
				break;
			case 'ThisExpression':
				break;
			case 'ObjectExpression':
				node.properties.forEach(opts.recurse);
				break;
			case 'Property':
				opts.recurse(node.key, 'key', node);
				opts.recurse(node.value, 'value', node);
				break;
			case 'ReturnStatement':
				opts.recurse(node.argument, 'argument', node);
				break;
			case 'SequenceExpression':
				node.expressions.forEach(opts.recurse);
				break;
			default:
				console.log(node);
				throw new Error('Unknown node type ' + node.type);		
		}
	}

	obj.walk = walk;

	return obj;
}

module.exports = Walker;

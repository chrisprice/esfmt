
function Cloner(opts) {
	opts = opts || {};
	var obj = {};

	function clone(node) {
		return JSON.parse(JSON.stringify(node));
	}

	obj.clone = clone;

	return obj;
}

module.exports = Cloner;

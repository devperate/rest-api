const _kth = require("../kth");

async function getTransaction(req, res) {
	const result = await _kth.node.chain.getTransaction(req.params.hash);
	res.json(result);
}

async function getTransactionPosition(req, res) {
	const result = await _kth.node.chain.getTransactionPosition(
		req.params.hash
	);
	res.json(result);
}

module.exports = { getTransaction, getTransactionPosition };

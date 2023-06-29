const {node} = require('../../index');

async function getTransaction(req, res) {
    const result = await node.chain.getTransaction(req.params.hash);
    res.json(result);
}

async function getTransactionPosition(req, res) {
    const result = await node.chain.getTransactionPosition(req.params.hash);
    res.json(result);
}

module.exports = {getTransaction, getTransactionPosition};

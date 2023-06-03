const kth = require("@knuth/bch");

const _kth = require("../kth");

async function getBlock(req, res) {
	const { id } = req.params;
	let result;
	if (isNaN(id) && id.length === 64) {
		// console.log(`Getting block header by hash: ${id}`)
		result = await _kth.node.chain.getBlockByHash(
			kth.enc.Hash.strToBytes(id)
		);
	} else if (!isNaN(id)) {
		result = await _kth.node.chain.getBlockByHeight(parseInt(id));
	} else {
		res.status(400).json({
			error: "Invalid ID. It should be a block height (a number) or a block hash (a 64 character string).",
		});
		return;
	}
	const [e, blockObj, height] = result;
	if (e === kth.errors.success) {
		const hash = kth.enc.Hash.bytesToStr(kth.header.hash(blockObj.header));
		const block = {
			header: {
				version: blockObj.header.version,
				previousBlockHash: kth.enc.Hash.bytesToStr(
					blockObj.header.previousBlockHash
				),
				merkle: kth.enc.Hash.bytesToStr(blockObj.header.merkle),
				timestamp: blockObj.header.timestamp,
				bits: blockObj.header.bits,
				nonce: blockObj.header.nonce,
			},
			transactions: blockObj.transactions,
		};
		res.json({ block, height, hash });
	} else {
		res.status(500).json({ error: "An error occurred", errorCode: e });
	}
}

module.exports = { getBlock };

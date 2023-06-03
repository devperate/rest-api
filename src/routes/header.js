const kth = require("@knuth/bch");

const _kth = require("../kth");

async function getHeader(req, res) {
	const { id } = req.params;
	let result;
	if (isNaN(id) && id.length === 64) {
		// console.log(`Getting block header by hash: ${id}`)
		result = await _kth.node.chain.getBlockHeaderByHash(
			kth.enc.Hash.strToBytes(id)
		);
	} else if (!isNaN(id)) {
		result = await _kth.node.chain.getBlockHeaderByHeight(parseInt(id));
	} else {
		res.status(400).json({
			error: "Invalid ID. It should be a block height (a number) or a block hash (a 64 character string).",
		});
		return;
	}
	const [e, headerObj, height] = result;
	if (e === kth.errors.success) {
		const hash = kth.enc.Hash.bytesToStr(kth.header.hash(headerObj));
		const header = {
			version: headerObj.version,
			previousBlockHash: kth.enc.Hash.bytesToStr(
				headerObj.previousBlockHash
			),
			merkle: kth.enc.Hash.bytesToStr(headerObj.merkle),
			timestamp: headerObj.timestamp,
			bits: headerObj.bits,
			nonce: headerObj.nonce,
		};
		res.json({ header, height, hash });
	} else {
		res.status(500).json({ error: "An error occurred", errorCode: e });
	}
}

module.exports = { getHeader };

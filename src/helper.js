const cache = require("memory-cache");
const kth = require("@knuth/bch");

const network = process.env.NETWORK;

function getNetworkFromEnv() {
	if (network === "chipnet") {
		return kth.network.chipnet;
	} else if (network === "mainnet") {
		return kth.network.mainnet;
	} else if (network === "testnet") {
		return kth.network.testnet;
	} else if (network === "testnet4") {
		return kth.network.testnet4;
	} else if (network === "scalenet") {
		return kth.network.scalenet;
	}

	return kth.network.mainnet;
}

const cacheMiddleware = (seconds) => {
	return (req, res, next) => {
		let key = "__express__" + req.originalUrl || req.url;
		let cacheContent = cache.get(key);
		if (cacheContent) {
			res.send(cacheContent);
			return;
		} else {
			res.sendResponse = res.send;
			res.send = (body) => {
				cache.put(key, body, seconds * 1000);
				res.sendResponse(body);
			};
			next();
		}
	};
};

module.exports = { getNetworkFromEnv, cacheMiddleware };

const kth = require("@knuth/bch");
const helperfn = require("./helper");

const nodeStdOut = process.env.NODE_STDOUT === "true";

let running_ = false;

const config = kth.settings.getDefault(helperfn.getNetworkFromEnv());
// console.log(`Config: ${JSON.stringify(config)}`);
const node = new kth.node.Node(config, nodeStdOut);
let chain = undefined;

async function main(server) {
	process.on("SIGINT", shutdown);
	await node.launch(kth.startModules.all);
	console.log("Knuth node has been launched.");
	running_ = true;

	// const [_, height] = await node.chain.getLastHeight();
	// lastBlockHeight = height;

	while (running_) {
		// console.log("sleeping...")
		await sleep(1000);
	}

	console.log("Shutting down Knuth node...");
	node.close();
	console.log("Shutting down Web server...");

	server.close(() => {
		console.log("Good bye!");
		process.exit();
	});
}

function sleep(ms) {
	return new Promise((r) => setTimeout(r, ms));
}

function shutdown() {
	console.log("");
	console.log("Ctrl+C detected.");
	running_ = false;
}

module.exports = { node, main };

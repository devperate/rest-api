require('dotenv').config();
const express = require('express');
const cache = require('memory-cache');
const kth = require("@knuth/bch");

const app = express();

const cacheSeconds = process.env.CACHE_SECONDS;
const port = process.env.PORT;
const nodeStdOut = process.env.NODE_STDOUT === 'true';

let running_ = false;

function getNetworkFromEnv() {
    if (process.env.NETWORK === 'chipnet') {
        return kth.network.chipnet;
    } else if (process.env.NETWORK === 'mainnet') {
        return kth.network.mainnet;
    } else if (process.env.NETWORK === 'testnet') {
        return kth.network.testnet;
    } else if (process.env.NETWORK === 'testnet4') {
        return kth.network.testnet4;
    } else if (process.env.NETWORK === 'scalenet') {
        return kth.network.scalenet;
    }
    return kth.network.mainnet;
}

function sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
}

const config = kth.settings.getDefault(getNetworkFromEnv());
// console.log(`Config: ${JSON.stringify(config)}`);
const node = new kth.node.Node(config, nodeStdOut);
let chain = undefined;

const cacheMiddleware = (seconds) => {
    return (req, res, next) => {
        let key = '__express__' + req.originalUrl || req.url;
        let cacheContent = cache.get(key);
        if (cacheContent) {
            res.send(cacheContent);
            return;
        } else {
            res.sendResponse = res.send;
            res.send = (body) => {
                cache.put(key, body, seconds * 1000);
                res.sendResponse(body);
            }
            next();
        }
    }
}

//TODO(fernando): add version route (version of this library)
//TODO(fernando): add network route
//TODO(fernando): add health route
//TODO(fernando): add status route
//TODO(fernando): js-api version, js-native version, c-api version, c++ api version
//TODO(fernando): chain state route

app.get('/lastHeight', cacheMiddleware(cacheSeconds), async (req, res) => {
    const [e, h] = await node.chain.getLastHeight();

    if (e === kth.errors.success) {
        res.json({height: h});
    } else {
        //TODO(fernando): replace 500 with a more specific error code
        //TODO(fernando): get the error message from the error code
        res.status(500).json({ error: 'An error occurred', errorCode: e });
    }
});

app.get('/header/:id', cacheMiddleware(cacheSeconds), async (req, res) => {
    const {id} = req.params;
    let result;
    if (isNaN(id) && id.length === 64) {
        // console.log(`Getting block header by hash: ${id}`)
        result = await node.chain.getBlockHeaderByHash(kth.enc.Hash.strToBytes(id));
    } else if (!isNaN(id)) {
        result = await node.chain.getBlockHeaderByHeight(parseInt(id));
    } else {
        res.status(400).json({ error: 'Invalid ID. It should be a block height (a number) or a block hash (a 64 character string).' });
        return;
    }
    const [e, headerObj, height] = result;
    if (e === kth.errors.success) {
        const hash = kth.enc.Hash.bytesToStr(kth.header.hash(headerObj));
        const header = {
            version: headerObj.version,
            previousBlockHash: kth.enc.Hash.bytesToStr(headerObj.previousBlockHash),
            merkle: kth.enc.Hash.bytesToStr(headerObj.merkle),
            timestamp: headerObj.timestamp,
            bits: headerObj.bits,
            nonce: headerObj.nonce,
        }
        res.json({header, height, hash});
    } else {
        res.status(500).json({ error: 'An error occurred', errorCode: e });
    }
});

app.get('/block/:id', cacheMiddleware(cacheSeconds), async (req, res) => {
    const {id} = req.params;
    let result;
    if (isNaN(id) && id.length === 64) {
        // console.log(`Getting block header by hash: ${id}`)
        result = await node.chain.getBlockByHash(kth.enc.Hash.strToBytes(id));
    } else if (!isNaN(id)) {
        result = await node.chain.getBlockByHeight(parseInt(id));
    } else {
        res.status(400).json({ error: 'Invalid ID. It should be a block height (a number) or a block hash (a 64 character string).' });
        return;
    }
    const [e, blockObj, height] = result;
    if (e === kth.errors.success) {
        const hash = kth.enc.Hash.bytesToStr(kth.header.hash(blockObj.header));
        const block = {
            header: {
                version: blockObj.header.version,
                previousBlockHash: kth.enc.Hash.bytesToStr(blockObj.header.previousBlockHash),
                merkle: kth.enc.Hash.bytesToStr(blockObj.header.merkle),
                timestamp: blockObj.header.timestamp,
                bits: blockObj.header.bits,
                nonce: blockObj.header.nonce,
            },
            transactions: blockObj.transactions,
        }
        res.json({block, height, hash});
    } else {
        res.status(500).json({ error: 'An error occurred', errorCode: e });
    }
});

app.get('/transaction/:hash', cacheMiddleware(cacheSeconds), async (req, res) => {
    const result = await node.chain.getTransaction(req.params.hash);
    res.json(result);
});

app.get('/transactionPosition/:hash', cacheMiddleware(cacheSeconds), async (req, res) => {
    const result = await node.chain.getTransactionPosition(req.params.hash);
    res.json(result);
});

//TODO(fernando): organizarBlock        (POST)
//TODO(fernando): organizarTransaction  (POST)

const server = app.listen(port, () => console.log(`Server listening on port ${port}!`));

async function main() {
    process.on('SIGINT', shutdown);
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

function shutdown() {
    console.log('');
    console.log('Ctrl+C detected.');
    running_ = false;
}

(async () => {
    try {
        await main();
    } catch (e) {
        console.log(e);
    }
})();

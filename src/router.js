const express = require("express");

const helperfn = require("./helper");

const transaction = require("./routes/transaction");
const block = require("./routes/block");
const header = require("./routes/header");

const cacheSeconds = process.env.CACHE_SECONDS;

const router = express.Router();

//transactions
router.get(
	"/transaction/:hash",
	helperfn.cacheMiddleware(cacheSeconds),
	transaction.getTransaction
);
router.get(
	"/transactionPosition/:hash",
	helperfn.cacheMiddleware(cacheSeconds),
	transaction.getTransactionPosition
);

//blocks
router.get(
	"/block/:id",
	helperfn.cacheMiddleware(cacheSeconds),
	block.getBlock
);

//header
router.get(
	"/header/:id",
	helperfn.cacheMiddleware(cacheSeconds),
	header.getHeader
);

//router.delete("/orders/:id", _deleteOrder);
//router.post("/orders/add", _addOrder);

module.exports = { router };

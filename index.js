require("dotenv").config();
const express = require("express");

const _kth = require("./src/kth");
const { router } = require("./src/router");

const app = express();
app.use(router);

const port = process.env.PORT;

const server = app.listen(port, () =>
	console.log(`Server listening on port ${port}!`)
);

(async () => {
	try {
		await _kth.main(server);
	} catch (e) {
		console.log(e);
	}
})();

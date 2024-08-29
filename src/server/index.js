import express from "express";
import webpack from "webpack";
import webpackDevMiddleware from "webpack-dev-middleware";

import webpackConfigDev from "../../webpack.dev.js";
import webpackConfigProd from '../../webpack.prod.js';

import Server from './server.js';

const app = express();
// app.use(express.static('public'));

if (process.env.NODE_ENV == "development") {
	const compiler = webpack(webpackConfigDev);
	app.use(webpackDevMiddleware(compiler));
} else if (process.env.NODE_ENV == "production") {
	const compiler = webpack(webpackConfigProd);
	app.use(webpackDevMiddleware(compiler));
} else {
	app.use(express.static('dist'));
}

const port = process.env.PORT || 25564;
app.listen(port);
console.log(`Server listening on port ${port}`);

const server = new Server();

export default server;
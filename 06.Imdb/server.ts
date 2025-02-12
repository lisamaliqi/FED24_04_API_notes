import * as dotenv from "dotenv";

// Initialize dotenv so it reads our `.env`-file
dotenv.config();

import app from "./src/app";
import Debug from "debug";
import http from "http";
import { connect } from "./src/database";

// Read port to start server on from `.env`, otherwise default to port 3000
const PORT = Number(process.env.PORT) || 3000;

// Create a new debug instance
const debug = Debug("lmdb:server");


/**
 * Create HTTP server.
 */

const server = http.createServer(app);


/**
 * Connect to database and then listen on provided port, on all network interfaces.
 */

connect()
	.then(() => {
		// Start listening once we have a connection
		server.listen(PORT);
	})
	.catch((err) => {
		console.error(err);
		process.exit(1);
	});


/**
 * Event listener for HTTP server "error" event.
 */

server.on("error", (err: NodeJS.ErrnoException) => {
	if (err.syscall !== "listen") {
		throw err;
	};

	switch (err.code) {
		case "EACCES":
			console.error(`🦸🏻 Port ${PORT} requires elevated privileges`);
			debug(`🦸🏻 Port ${PORT} requires elevated privileges: %O`, err);
			process.exit(1);
			break;

		case "EADDRINUSE":
			console.error(`🛑 Port ${PORT} is already in use`);
			debug(`🛑 Port ${PORT} is already in use: %O`, err);
			process.exit(1);
			break;

		default:
			debug(`🚨 Unknown error, rethrowing: %O`, err);
			throw err;
	};
});


/**
 * Event listener for HTTP server "listening" event.
 */

server.on("listening", () => {
	console.log(`🚀 Yay, server started on http://localhost:${PORT}`);
});
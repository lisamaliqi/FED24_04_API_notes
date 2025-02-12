import express from "express";
import movieRouter from "./resources/movie/movie.router";
const router = express.Router();


/**
 * GET /
 */

router.get("/", (req, res) => {
	res.send({
		status: "success",
		data: {
			message: "I AM MOVIE-DB-API, GIFES POPCORN PLZ 🍿",
		}
	});
});


/**
 * /movies
 */
router.use("/movies", movieRouter)


/**
 * Catch-all route handler
 */

router.use((req, res) => {
	// Respond with 404 and a message in JSON-format
	res.status(404).send({
		status: "fail",
		data: {
			message: `Route ${req.method} ${req.path} does not exist`,
		}
	});
});


export default router;
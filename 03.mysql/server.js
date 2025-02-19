/**
 *     MySQL
 */

// Hämta ut express, lodash, file-system, morgan, mySQL och port-nr
const express = require("express");
const _ = require("lodash");
const fs = require("node:fs/promises");
const morgan = require("morgan");
const mysql = require("mysql2/promise");
const PORT = 3000;

// Read any .env-files
require("dotenv").config();
// console.log("DATABASE_HOST:", process.env.DATABASE_HOST);

// Create the connection to the database
const connection = mysql.createConnection({
	host: process.env.DATABASE_HOST,
	port: process.env.DATABASE_PORT,
	user: process.env.DATABASE_USER,
	password: process.env.DATABASE_PASSWORD,
	database: process.env.DATABASE_NAME,
});   

// Skapa en ny Express app
const app = express();

// Parse all inkommande JSON
app.use(express.json());

//logga all info ang kommande requests med morgan middleware
app.use(morgan("dev"));

// Listen for incoming GET requests to "/"
app.get("/", (req, res) => {
	res.send({ message: "Oh, hi there 😊" });
});

/**
 * GET /users
 *
 * Get all users
 */
app.get("/users", async (req, res) => {
	// Wait for connection to be established
	const db = await connection;

	// Execute a query
	// const result = await db.query("SELECT * FROM users");
	const [ rows ] = await db.query("SELECT * FROM users");
    //detta hämtar ut alla users från api:n jag skapat i phpmyadmin under api_todos och users

	// Extract rows from result
	// const rows = result[0];

	// Respond with rows
	res.send(rows);
});

/**
 * GET /users/:userId
 *
 * Get a single user
 */

/**
 * WORKSHOP 2025-01-10
 */
app.get("/users/:userId", async (req, res) => {
    //hämta ut det vi skriver in i url på userId och gör om det till ett Number
    const userId = Number(req.params.userId);

    //om man skriver in ett falsey värde, aka inte ett nummer id man kan söka på (typ apa elr 0)
    if(!userId) {
        console.log('error!');
        //skicka res.status som 404 (error) samt skicka meddelande 
        res.status(404).send({ message: 'Thats not a number idiot'});
        return; 
    };

    //hämta ut databas från connection
    const db = await connection;

    //skapa en query som tar ut id som stämmer med det id vi skriver in
	// SELECT * FROM users WHERE id = 2
	const [ rows ] = await db.query("SELECT * FROM users WHERE id = ?", [userId]);
	// guard clause 👮🏻‍♂️
	if (!rows.length) {
		// Respond with 404 and message in JSON-format
		res.status(404).send({
			message: "User Not Found",
		});
		return;
	};
	// skicka response med rows
	res.send(rows[0]);
});


/**
 * POST /users
 *
 * Create a user
 */
app.post("/users", async (req, res) => {
	console.log("Incoming! 🚀", req.body);
    //få ut username, name och email
    const { username, name, email } = req.body;

    /**WORKSHOP */
    // STEP 1: Check that all required data is present, otherwise fail with HTTP 400
    // STEP 2: Check that the incoming data is of the correct datatype
    // STEP 3: Check that the username is at least 2 chars long and email contains a `@`

    if(!username || typeof username !== 'string' || username.trim().length < 2){
        res.status(400).send({
            message: "username is missing, not a string or less than 2 characters",
        });
        return;
    };

    if(!email || typeof email !== 'string' || !email.includes('@')){
        res.status(400).send({
            message: "email is missing, not a string or doesnt include a '@'",
        });
        return;
    };


    //hämta ut databas
	const db = await connection;

    //skapa din query
	const [ result ] = await db.query("INSERT INTO users SET ?", {
		username,
		name,
		email,
    });

	console.log("Result:", result);

	// Send back the received data and append the id of the newly created record
    //skickar 201 tillbaka (created) 
	res.status(201).send({
		...req.body,
		id: result.insertId,
	});
});


/**
 * PATCH /users/:userId
 *
 * Update a single user
 */
/**
 * WORKSHOP 2025-01-14
 */

app.patch("/users/:userId", async (req, res) => {
    //gör om userId till ett nummer
	const userId = Number(req.params.userId);

    //få ut username, name och email
    const { username, name, email } = req.body;

    //om userId inte kan vara ett nummer, alltså falsy (nan) gör detta: 
	if (!userId) {
		res.status(400).send({
			message: "Invalid User ID",
		});
		return;
	};

    //Validering
    //om username är true OCH sedan validering 
    if(username && (!username || typeof username !== 'string' || username.trim().length < 2)){
        res.status(400).send({
            message: "username is missing, not a string or less than 2 characters",
        });
        return;
    };

    if(name && (!name || typeof name !== 'string' || name.trim().length < 2)){
        res.status(400).send({
            message: "name is missing, not a string or less than 2 characters",
        });
        return;
    };

    if(email && (!email || typeof email !== 'string' || !email.includes("@"))){
        res.status(400).send({
            message: "email is missing, not a string or doesnt include snable-a",
        });
        return;
    };

    //skapa en databas
	const db = await connection;

    //try-catch
    try {
        //skapa din query som gör att du kan skriva din patch
		const [ result ] = await db.query("UPDATE users SET ? WHERE id = ?", [req.body, userId]);  // YOLO
		console.log("Result:", result);

        //om affectedRows av resultatet är 0, skicka detta meddelande
        //allstå om man försöker uppdatera en användare som inte finns
		if (!result.affectedRows) {
			res.status(404).send({
				message: "Y U UPDATE USER THAT NOT EXIST",
			});
			return;
		};
	} catch (err) {
		res.status(400).send({
			message: "Y U SEND BAD DATA?!",
		});
		return;
	};

	res.send(req.body);
});

/**
 * DELETE /users/:userId
 *
 * Delete a single user
 */
app.delete("/users/:userId", async (req, res) => {
    const userId = Number(req.params.userId);

    if(!userId) {
        res.status(400).send({
            message: 'invalid userId'
        });
        return;
    };

    const db = await connection;

    try {
        const [ result ] = await db.query('DELETE FROM users WHERE id= ?', [userId]);
        console.log('result: ', result);

        if(!result.affectedRows) {
            res.status(404).send({
                message: 'Why u wanna delete?? This user doesnt exist?',
            });
            return;
        };
    } catch (err) {
        res.status(400).send({
            message: 'u just sent some bad data young person...',
        });
        return;
    };
    res.send({
        message: 'deleted',
    });
});



// Catch-all route
app.use((req, res) => {
	res.status(404).send({ message: `Cannot ${req.method} ${req.path}`});
});

//starta lyssningen för inkommande requests till port 3000
app.listen(PORT, () => {
	// Will be invoked once the server has started listening
	console.log(`🥳 Yay, server started on localhost:${PORT}`);
});
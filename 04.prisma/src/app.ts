import express from "express";
import prisma from "./prisma"; // importing the prisma instance we created
import morgan from "morgan";
import { PrismaClientInitializationError, PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

const app = express();
app.use(express.json());
app.use(morgan("dev"));

//hantera prisma errors
const handlePrismaError = (err: unknown) => {
    if (err instanceof PrismaClientInitializationError) {
		return { status: 500, message: "Error initializing connection to database" };

	} else if (err instanceof PrismaClientKnownRequestError) {
		if (err.code === "P2021") {
			return { status: 500, message: "Database table does not exist" };

		} else if (err.code === "P2025") {
			return { status: 404, message: "Not Found" };
		};
	};
	return { status: 500, message: "Something went wrong when querying the database" };
};

/**
 * GET /
 */
app.get("/", (req, res) => {
	res.send({
		message: "I AM API, BEEP BOOP",
	});
});

/**
 * GET /phones
 *
 * Get all phones
 */
app.get("/phones", async (req, res) => {
    try {
		const phones = await prisma.phones.findMany();
		res.send(phones);
	} catch (err) {
		console.error(err);
		res.status(500).send({ message: "Something went wrong when querying the database" });
	}
});

/**
 * GET /phones/:phoneId
 *
 * Get a single phone
 */
app.get("/phones/:phoneId", async (req, res) => {
    const phoneId = Number(req.params.phoneId);
    
    if(!phoneId) {
        console.log('error!');
        res.status(404).send({
            message: 'Thats not a valid id',
        });
        return;
    };

    try {
        const phone = await prisma.phones.findUniqueOrThrow({
            where: {
                id: phoneId,
            }, 
            include: {
                user: true,
            },
        });

        //behövs ej pga hantera prisma error funktionen i toppen
        // if (!phone) {
		// 	res.status(404).send({ message: "Phone Not Found" });
		// 	return;
		// };

        res.send(phone);

    } catch (err) {
        console.log('error!');

        //detta behövs ej pga hanterar prisma error funktionen i toppen
		// res.status(500).send({ message: "Something went wrong when querying the database" });
        const { status, message } = handlePrismaError(err);
		res.status(status).send({ message });
    };

});

/**
 * GET /users
 *
 * Get all users
 */
app.get("/users", async (req, res) => {
    try {
        const users = await prisma.users.findMany();
        res.send(users);
    } catch (err) {
        console.log(err);
        res.status(500).send({
            message: 'Something went wrong with getting the users',
        });
    };
});

/**
 * GET /users/:userId
 *
 * Get a single user
 */
app.get("/users/:userId", async (req, res) => {
    const userId = Number(req.params.userId);

    if(!userId) {
        console.log('error!');
        res.status(404).send({
            message: 'Thats not a valid id',
        });
        return;
    };

    try {
        const user = await prisma.users.findUniqueOrThrow({
            where: {
                id: userId,
            },
            include: {
                phones: true,
            },
        });

        //behövs ej pga handleprismaerror funktion
        // if(!user) {
        //     res.status(404).send({
        //         message: 'user not found',
        //     });
        //     return;
        // };

        res.send(user);

    } catch (err) {
        console.log(err);

        //behövs ej pga handleprismaerror funktion
        // res.status(500).send({
        //     message: 'Something went wrong',
        // });
        const { status, message } = handlePrismaError(err);
		res.status(status).send({ message });
    };
});

export default app;
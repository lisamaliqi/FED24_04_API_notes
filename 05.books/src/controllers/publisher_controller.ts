/**
 * Publisher Controller
 */
import { Request, Response } from "express";
import { handlePrismaError } from "../exceptions/prisma";
import prisma from "../prisma";
import Debug from "debug";

// Create a new debug instance
const debug = Debug("prisma-books:publisher_controller");

/**
 * Get all publishers
 *
 * GET /publishers
 */
export const index = async (req: Request, res: Response) => {
	try {
		const publishers = await prisma.publisher.findMany();
		res.send({ status: "success", data: publishers });

	} catch (err) {
		debug("Error when trying to query for all Publishers: %O", err);
		const { status_code, body } = handlePrismaError(err);
		res.status(status_code).send(body);
	};
};

/**
 * GET /publishers/:publisherId
 *
 * Get a single publisher
 */
export const show = async (req: Request, res: Response) => {
	const publisherId = Number(req.params.publisherId);

    if (!publisherId) {
		res.status(400).send({ status: "fail", data: { message: "That is not a valid ID" }});
		return;
	}

	try {
		const publisher = await prisma.publisher.findUniqueOrThrow({
			where: {
				id: publisherId,
			},
			include: {
				books: true,
			},
		});
		res.send({ status: "success", data: publisher });

	} catch (err) {
		debug("Error when trying to query for Publisher #%d: %O", publisherId, err);
		const { status_code, body } = handlePrismaError(err);
		res.status(status_code).send(body);
	}
};

/**
 * POST /publishers
 *
 * Create a publisher
 */
export const store = async (req: Request, res: Response) => {
	try {
		const publisher = await prisma.publisher.create({
			data: req.body,
		});
		res.status(201).send({ status: "success", data: publisher });

	} catch (err) {
		debug("Error when trying to create a Publisher: %O", err);
		const { status_code, body } = handlePrismaError(err);
		res.status(status_code).send(body);
	}
};

/**
 * PATCH /publishers/:publisherId
 *
 * Update a publisher
 */
export const update = async (req: Request, res: Response) => {
	const publisherId = Number(req.params.publisherId);
	if (!publisherId) {
		res.status(400).send({ status: "fail", data: { message: "That is not a valid ID" }});
		return;
	}

	try {
		const publisher = await prisma.publisher.update({
			where: {
				id: publisherId,
			},
			data: req.body,
		});
		res.send({ status: "success", data: publisher });

	} catch (err) {
		debug("Error when trying to update Publisher #%d: %O", publisherId, err);
		const { status_code, body } = handlePrismaError(err);
		res.status(status_code).send(body);
	}
};

/**
 * DELETE /publishers/:publisherId
 *
 * Delete a publisher
 */
export const destroy = async (req: Request, res: Response) => {
	const publisherId = Number(req.params.publisherId);
	if (!publisherId) {
		res.status(400).send({ status: "fail", data: { message: "That is not a valid ID" }});
		return;
	}

	try {
		await prisma.publisher.delete({
			where: {
				id: publisherId,
			}
		});
		res.status(204).send();

	} catch (err) {
		debug("Error when trying to delete Publisher #%d: %O", publisherId, err);
		const { status_code, body } = handlePrismaError(err);
		res.status(status_code).send(body);
	}
};

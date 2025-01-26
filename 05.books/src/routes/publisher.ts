import express from "express";
import prisma from "../prisma";
import { handlePrismaError } from "../exceptions/prisma";
import { destroy, index, show, store, update } from "../controllers/publisher_controller";
import { describe } from "node:test";

// Create a new Publisher router
const router = express.Router();

/**
 * GET /publishers
 *
 * Get all publishers
 */
router.get("/", index);

/**
 * GET /publishers/:publisherId
 *
 * Get a single publisher
 */
router.get("/:publisherId", show);

/**
 * POST /publishers
 *
 * Create a publisher
 */
router.post("/", store);

/**
 * PATCH /publishers/:publisherId
 *
 * Update a publisher
 */
router.patch("/:publisherId", update);

/**
 * DELETE /publishers/:publisherId
 *
 * Delete a publisher
 */
router.delete("/:publisherId", destroy);

export default router;
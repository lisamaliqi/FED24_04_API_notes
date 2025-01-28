/**
 * Validation rules for author resourse
 */

import { body } from "express-validator";

export const CreateAuthorRules = [
    body("name")
        .isString().withMessage("has to be a string").bail()
        .trim().isLength({ min: 3, max: 191 }).withMessage("has to be 3-191 chars long"),
    body("birthyear")
        .optional()
        .isInt().withMessage("has to be a integer"),
];

export const updateAuthorRules = [
    body("name")
        .optional()
        .isString().withMessage("has to be a string").bail()
        .isLength({ min: 3, max: 191 }).withMessage("has to be 3-191 chars long"),
    body("birthyear")
        .optional()
        .isInt().withMessage("has to be a integer"),
];
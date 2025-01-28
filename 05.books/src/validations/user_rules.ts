/**
 * Validation rules for author resourse
 */

import { body } from "express-validator";
import prisma from "../prisma";
import { getUserByEmail } from "../services/user_service";

export const createUserRules = [
    //name string, trimmed + between 3-191 chars
    body("name")
        .optional()
        .isString().withMessage('name has to be a string').bail()
        .trim().isLength({ min: 3, max: 191 }).withMessage('name has to be 3-191 chars'),

    //email required, string,  valid email unique
    body('email')
        .trim().isEmail().withMessage('email has to be a valid email').bail()
        .custom(async (value: string) => {
            // på något sätt få tillgång till vad värdet av email är 
            // samt också kolla upp det i databasen
            const user = await getUserByEmail(value);

            // samt berätta express validator ifall värdet klarar validation eller inte
            if(user) {
                // user finns redan? skicka ERROROROROOROR
                // return Promise.reject('Email already exists');
                throw new Error('Email already exists');
            }
        }),

    //password required, string,  at least 6 chars
    body('password')
        .isString().withMessage('password has to be a string')
        .isLength({ min: 6 }).withMessage('password has to be at least 6 chars'),    
];

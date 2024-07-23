import express from "express";
const router = express.Router();
import { User, type IUser } from "../schemas/User";
import passport from "passport";
import { catchError, validate } from "../middlewares/validations";
import { loginUser, registerUser } from "../controller/auth";
import expressAsyncHandler from "express-async-handler";
import Resume from "../schemas/ResumeSchema";
import { createResponse } from "../helper/response";
router.post('/resume', expressAsyncHandler (async (req, res) => {
    console.log("body",req.body)
    try {
        const resume = new Resume({
            ...req.body,
            createdBy: req.body.createdBy, // assuming `createdBy` is included in the request body
        });
        await resume.save();
        res.send(createResponse(resume));
     
    } catch (error:any) {
        res.status(400).json({ error: error.message });
    }
}));

export default router;
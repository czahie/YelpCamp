import express from "express";
import catchAsync from "../utils/catchAsync.js";
import { User } from "../models/user.js";
import passport from "passport";
import user from "../controllers/users.js";

const router = express.Router();

router
    .route("/register")
    .get(user.renderRegister)
    .post(catchAsync(user.register));

router
    .route("/login")
    .get(user.renderLogin)
    .post(
        passport.authenticate("local", {
            failureFlash: true,
            failureRedirect: "/login",
        }),
        user.login
    );

router.get("/logout", user.logout);

export default router;

import express from "express";
import catchAsync from "../utils/catchAsync.js";
import { isLoggedIn, validateCampground, isAuthor } from "../middleware.js";
import campgrounds from "../controllers/campgrounds.js";
import multer from "multer";
import { storage } from "../cloudinary/index.js";

const router = express.Router();
const upload = multer({ storage });

router
    .route("/")
    .get(campgrounds.index)
    .post(upload.single("image"), (req, res) => {
        console.log(req.body, req.files);
        res.send("It worked!");
    });

router.get("/new", isLoggedIn, campgrounds.renderNewForm);

router
    .route("/:id")
    .get(catchAsync(campgrounds.showCampground))
    .put(
        isLoggedIn,
        isAuthor,
        validateCampground,
        catchAsync(campgrounds.updateCampground)
    )
    .delete(isLoggedIn, catchAsync(campgrounds.deleteCampground));

router.get(
    "/:id/edit",
    isLoggedIn,
    isAuthor,
    catchAsync(campgrounds.renderEditForm)
);

export default router;

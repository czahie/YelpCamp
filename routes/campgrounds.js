import express from "express";
import catchAsync from "../utils/catchAsync.js";
import { Campground } from "../models/campground.js";
import { isLoggedIn, validateCampground, isAuthor } from "../middleware.js";

const router = express.Router();

router.get("/", async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render("campgrounds/index", { campgrounds });
});

router.get("/new", isLoggedIn, (req, res) => {
    res.render("campgrounds/new");
});

router.post(
    "/",
    isLoggedIn,
    validateCampground,
    catchAsync(async (req, res, next) => {
        // if (!req.body.campground) {
        //     throw new ExpressError("Invalid Campground Data", 400);
        // }
        const campground = new Campground(req.body.campground);
        campground.author = req.user._id;
        await campground.save();
        req.flash("success", "Successfully made a new campground!");
        res.redirect(`/campgrounds/${campground._id}`);
    })
);

router.get(
    "/:id",
    catchAsync(async (req, res) => {
        const { id } = req.params;
        const campground = await Campground.findById(id)
            .populate({
                path: "reviews",
                populate: {
                    path: "author",
                },
            })
            .populate("author");
        if (!campground) {
            req.flash("error", "Cannot find that campground!");
            return res.redirect("/campgrounds");
        }
        res.render("campgrounds/show", { campground });
    })
);

router.get(
    "/:id/edit",
    isLoggedIn,
    isAuthor,
    catchAsync(async (req, res) => {
        const { id } = req.params;
        const campground = await Campground.findById(id);
        if (!campground) {
            req.flash("error", "Cannot find that campground!");
            return res.redirect("/campgrounds");
        }
        res.render("campgrounds/edit", { campground });
    })
);

router.put(
    "/:id",
    isLoggedIn,
    isAuthor,
    validateCampground,
    catchAsync(async (req, res) => {
        const { id } = req.params;
        const camp = await Campground.findByIdAndUpdate(
            id,
            {
                ...req.body.campground,
            },
            { new: true }
        );

        // res.redirect(`/campgrounds/${campground._id}`);
        req.flash("success", "Successfully update a new campground!");
        res.render("campgrounds/show", { campground: camp });
    })
);

router.delete(
    "/:id",
    isLoggedIn,
    catchAsync(async (req, res) => {
        const { id } = req.params;
        await Campground.findByIdAndDelete(id);
        req.flash("success", "Successfully deleted a campground!");
        res.redirect("/campgrounds");
    })
);

export default router;

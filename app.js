import express from "express";
import { fileURLToPath } from "url";
import path, { dirname } from "path";
import mongoose from "mongoose";
import { Campground } from "./models/campgroud.js";
import methodOverride from "method-override";
import ejsMate from "ejs-mate";
import catchAsync from "./utils/catchAsync.js";
import ExpressError from "./utils/ExpressError.js";
import { campgroundSchema } from "./schemas.js";

mongoose.connect("mongodb://localhost:27017/yelp-camp", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

const validateCampground = (req, res, next) => {
    console.log(req.body);
    const { error } = campgroundSchema.validate(req.body);

    if (error) {
        const msg = error.details.map((e) => e.message).join(",");
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
};

app.get("/", (req, res) => {
    res.send("Hello");
});

app.get("/campgrounds", async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render("campgrounds/index", { campgrounds });
});

app.get("/campgrounds/new", (req, res) => {
    res.render("campgrounds/new");
});

app.post(
    "/campgrounds",
    validateCampground,
    catchAsync(async (req, res, next) => {
        // if (!req.body.campground) {
        //     throw new ExpressError("Invalid Campground Data", 400);
        // }
        const campground = new Campground(req.body.campground);
        await campground.save();
        res.redirect(`/campgrounds/${campground._id}`);
    })
);

app.get(
    "/campgrounds/:id",
    catchAsync(async (req, res) => {
        const { id } = req.params;
        const campground = await Campground.findById(id);
        res.render("campgrounds/show", { campground });
    })
);

app.get(
    "/campgrounds/:id/edit",
    catchAsync(async (req, res) => {
        const { id } = req.params;
        const campground = await Campground.findById(id);
        res.render("campgrounds/edit", { campground });
    })
);

app.put(
    "/campgrounds/:id",
    validateCampground,
    catchAsync(async (req, res) => {
        const { id } = req.params;
        const campground = await Campground.findByIdAndUpdate(
            id,
            {
                ...req.body.campground,
            },
            { new: true }
        );
        // res.redirect(`/campgrounds/${campground._id}`);
        res.render("campgrounds/show", { campground });
    })
);

app.delete(
    "/campgrounds/:id",
    catchAsync(async (req, res) => {
        const { id } = req.params;
        await Campground.findByIdAndDelete(id);
        res.redirect("/campgrounds");
    })
);

app.all("*", (req, res, next) => {
    next(new ExpressError("Page Not Found", 404));
});

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) {
        err.message = "Something went wrong";
    }
    res.status(statusCode).render("error", { err });
});

app.listen(3000, () => {
    console.log("Serving on port 3000");
});

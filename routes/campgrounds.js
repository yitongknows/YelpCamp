const express = require("express");
const Campground = require("../models/campground");
const catchAsync = require("../utils/catchAsync");
const { isLoggedIn, isAuthor, validateCampground } = require("../middleware");

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
    catchAsync(async (req, res) => {
        // if(!req.body.campground) throw new ExpressError("Invalid campground data", 400);

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
        const campground = await Campground.findById(req.params.id)
            .populate({
                path: "reviews",
                populate: {
                    path: "author",
                },
            })
            .populate("author");
        if (!campground) {
            req.flash("error", "Cannot find that campground");
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
        const camp = await Campground.findByIdAndUpdate(id, {
            ...req.body.campground,
        });
        req.flash("success", "Successfully updates campground");
        res.redirect(`/campgrounds/${camp._id}`);
    })
);

router.delete(
    "/:id",
    isLoggedIn,
    isAuthor,
    catchAsync(async (req, res) => {
        const { id } = req.params;
        const campground = await Campground.findById(id);
        if (!campground.author.equals(req.user._id)) {
            req.flash("error", "You do not have permission to do that!");
            res.redirect(`/campgrounds/${id}`);
        }
        await Campground.findByIdAndDelete(id);
        req.flash("success", "Successfully deleted campground!");
        res.redirect("/campgrounds");
    })
);

module.exports = router;

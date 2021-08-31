const express = require("express");
const catchAsync = require("../utils/catchAsync");
const { isLoggedIn, isAuthor, validateCampground } = require("../middleware");
//represents campground controller
const campgrounds = require("../controllers/campgrounds");
const router = express.Router();

router
    .route("/")
    .get(catchAsync(campgrounds.index))
    .post(
        isLoggedIn,
        validateCampground,
        catchAsync(campgrounds.createCampground)
    );
//this needs to go before the /:id otherwise it will think new is an id
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
    .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground));

router.get(
    "/:id/edit",
    isLoggedIn,
    isAuthor,
    catchAsync(campgrounds.renderEditForm)
);

module.exports = router;

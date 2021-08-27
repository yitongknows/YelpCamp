const express = require('express');
const Campground = require("../models/campground");
const catchAsync = require('../utils/catchAsync')
const ExpressError = require('../utils/ExpressError')
const { reviewSchema} = require('../schemas.js')
const Review = require('../models/review');

const router = express.Router({mergeParams: true});

const validateReview = (req, res, next) => {
    console.log(req.body)
    const {error} = reviewSchema.validate(req.body);
    console.log(error)
    if(error){
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    }
    else{
        next();
    }
}

router.post('/', validateReview, catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash('success', 'Created new review!')
    res.redirect(`/campgrounds/${campground._id}`);
}))

router.delete('/:reviewId', catchAsync(async (req, res) => {
    const{id, reviewId} = req.params;
    Campground.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Successfully deleted a review!')
    res.redirect(`/campgrounds/${id}`);
}))

module.exports = router;
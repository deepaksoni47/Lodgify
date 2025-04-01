const express = require("express");
const router = express.Router({mergeParams: true});
const Listing = require("../models/listing");
const wrapAsync = require("../utils/wrapAsync.js");
const Review = require("../models/review");
const {validateReview, isLoggedIn, isReviewAuthor} = require("../middleware.js");
const reviewController = require("../controllers/reviews.js");


//  create Review route
router.post("/",isLoggedIn ,validateReview, wrapAsync(reviewController.createReview));

// delete review route
router.delete("/:reviewId",isLoggedIn,isReviewAuthor, wrapAsync(reviewController.destroyReview));

module.exports = router;
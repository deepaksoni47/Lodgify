const Listing = require("../models/listing");
const Review = require("../models/review");

module.exports.createReview = async (req,res,next) => {
    const {id} = req.params;
    const listing = await Listing.findById(id);
    let newReview = new Review(req.body.review);
    newReview.author = req.user._id;
    listing.reviews.push(newReview);
    await newReview.save();
    await listing.save();
    res.redirect(`/listings/${listing._id}`);
    
};

module.exports.destroyReview = async (req,res,next) => {
    const {id, reviewId} = req.params;
    await Listing.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/listings/${id}`);
};
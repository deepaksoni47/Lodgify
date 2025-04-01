const Listing = require("./models/listing");
const Review = require("./models/review");
const ExpressError = require("./utils/ExpressError.js");
const {listingSchema,reviewSchema} = require("./schema.js");

module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl; // Store the original URL
        req.flash("error", "You must be logged in to create a listing!");
        return res.redirect("/login");
    }
    next();
};


module.exports.saveReturnTo = (req, res, next) => {
    if (req.session.returnTo) {
        res.locals.returnTo = req.session.returnTo; // Make it available in the response locals // Clear it after saving

    }
    next();
};

module.exports.isOwner = async (req,res,next) => {
    let { id } = req.params;
    let listing1 = await Listing.findById(id);
    if(!listing1.owner._id.equals(res.locals.currentUser._id)){
        req.flash("error", "You are not the owner of this listing");
        return res.redirect(`/listings/${listing1._id}`);
    }
    next() ;
}; 

module.exports.validateListing = (req,res,next) => {
    let {error} = listingSchema.validate(req.body);
    if(error){
        let errMsg = error.details.map(el => el.message).join(",");
        throw new ExpressError(400, errMsg);
    }
    next();
};

module.exports.validateReview = (req,res,next) => {
    let {error} = reviewSchema.validate(req.body);
    if(error){
        let errMsg = error.details.map(el => el.message).join(",");
        throw new ExpressError(400, errMsg);
    }
    next();
};

module.exports.isReviewAuthor = async(req,res,next) => {
    let {id, reviewId} = req.params;
    let review = await Review.findById(reviewId);
    if(!review.author.equals(res.locals.currentUser._id)){
        req.flash("error", "You are not the author of this review!");
        return res.redirect(`/listings/${id}`);
    }
    next();
};
const express = require("express");
const router = express.Router();
const Listing = require("../models/listing");
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const {listingSchema} = require("../schema.js");

const validateListing = (req,res,next) => {
    let {error} = listingSchema.validate(req.body);
    if(error){
        let errMsg = error.details.map(el => el.message).join(",");
        throw new ExpressError(400, errMsg);
    }
    next();
};



router.get("/", wrapAsync(async (req,res,next) => {
    const allListings = await Listing.find({});
    res.render("./listings/index.ejs", {allListings});
}));

//New route
router.get("/new",(req,res) => {
    res.render("./listings/new.ejs");
});

//Show route
router.get("/:id", wrapAsync(async (req,res,next) => {
    const {id} = req.params;
    const listing = await Listing.findById(id).populate("reviews");
    res.render("./listings/show.ejs", {listing});
}));

//Create route
router.post("/", validateListing ,wrapAsync( async (req,res,next) => {
    const newListing = new Listing(req.body);
    console.log(newListing);
    await newListing.save();
    req.flash("success", "Successfully made a new listing!");
    res.redirect(`/listings/${newListing._id}`);
}));

//Edit route
router.get("/:id/edit", wrapAsync(async (req,res,next) => {
    const {id} = req.params;
    const listing = await Listing.findById(id);
    res.render("./listings/edit.ejs", {listing});
}));
//update route
router.put("/:id", validateListing, wrapAsync(async (req,res,next) => {
    let result = listingSchema.validate(req.body);
    if(result.error){
        throw new ExpressError(400, result.error);
    }
    const {id} = req.params;
    const listing = await Listing.findByIdAndUpdate(id, req.body, {runValidators: true, new: true});
    res.redirect(`/listings/${listing._id}`);
}
));
//delete route
router.delete("/:id", wrapAsync(async (req,res,next) => {
    const {id} = req.params;
    await Listing.findByIdAndDelete(id);
    res.redirect("/listings");
}));

module.exports = router;
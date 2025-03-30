const express = require("express");
const router = express.Router();
const Listing = require("../models/listing");
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const {listingSchema} = require("../schema.js");
const {isLoggedIn , isOwner, validateListing} = require("../middleware.js");




router.get("/", wrapAsync(async (req,res,next) => {
    const allListings = await Listing.find({});
    res.render("./listings/index.ejs", {allListings});
}));

//New route
router.get("/new",isLoggedIn, (req,res) => {
    res.render("./listings/new.ejs");
});

//Show route
router.get("/:id", wrapAsync(async (req,res,next) => {
    const {id} = req.params;
    const listing = await Listing.findById(id).populate({path:"reviews",populate:{path:"author",},}).populate("owner");
    if(!listing){
        req.flash("error", "Cannot find that listing!");
        return res.redirect("/listings");
    }
    res.render("./listings/show.ejs", {listing});
}));

//Create route
// router.post("/",validateListing, wrapAsync( async (req,res,next) => {
//     const newListing = new Listing(req.body);
//     console.log(newListing);
//     await newListing.save();
//     req.flash("success", "Successfully made a new listing!");
//     res.redirect(`/listings/${newListing._id}`);
// }));

router.post("/", validateListing, isLoggedIn, wrapAsync(async (req, res, next) => {
    const { title, description, price, location, country, image } = req.body;
    // Ensure image object matches schema
    const imageObj = image
        ? { filename: "user_upload", url: image }
        : {
            filename: "default_image",
            url: "https://images.unsplash.com/photo-1625505826533-5c80aca7d157?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60",
        };

    const newListing = new Listing({
        title,
        description,
        price,
        location,
        country,
        image: imageObj
    });
    newListing.owner = req.user._id;

    console.log(newListing); // Debugging output

    await newListing.save();
    req.flash("success", "Successfully made a new listing!");
    res.redirect(`/listings/${newListing._id}`);
}));


//Edit route
router.get("/:id/edit",isLoggedIn,isOwner, wrapAsync(async (req,res,next) => {
    const {id} = req.params;
    const listing = await Listing.findById(id);
    if(!listing){
        req.flash("error", "Cannot find that listing!");
        return res.redirect("/listings");
    }
    res.render("./listings/edit.ejs", {listing});
}));
//update route
// router.put("/:id",validateListing, wrapAsync(async (req,res,next) => {
//     let result = listingSchema.validate(req.body);
//     if(result.error){
//         throw new ExpressError(400, result.error);
//     }
//     const {id} = req.params;
//     const listing = await Listing.findByIdAndUpdate(id, req.body, {runValidators: true, new: true});
//     res.redirect(`/listings/${listing._id}`);
// }
// ));
router.put("/:id", validateListing,isLoggedIn, isOwner, wrapAsync(async (req, res, next) => {
    const { id } = req.params;
    const { title, description, price, location, country, image } = req.body;


    // Handle image: If it's a string (URL), convert to object
    const imageObj = typeof image === "string"
        ? { filename: "user_upload", url: image }
        : image; // Keep existing if already an object

    const updatedData = {
        title,
        description,
        price,
        location,
        country,
        ...(imageObj && { image: imageObj }), // Include image only if provided
    };

    // Validate data against the updated Joi schema
    const { error } = listingSchema.validate(updatedData);
    if (error) throw new ExpressError(400, error.details[0].message);

    const listing = await Listing.findByIdAndUpdate(id, updatedData, {
        runValidators: true,
        new: true,
    });

    req.flash("success", "Successfully updated the listing!");
    res.redirect(`/listings/${listing._id}`);
}));


//delete route
router.delete("/:id",isLoggedIn,isOwner, wrapAsync(async (req,res,next) => {
    const {id} = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("success", "Successfully deleted the listing!");
    res.redirect("/listings");
}));

module.exports = router;
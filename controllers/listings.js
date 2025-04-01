const Listing = require("../models/listing");
const ExpressError = require("../utils/ExpressError.js");
const {listingSchema} = require("../schema.js");
const axios = require("axios")

module.exports.index = async (req,res,next) => {
    const allListings = await Listing.find({});
    res.render("./listings/index.ejs", {allListings});
};

module.exports.renderNewForm = (req,res) => {
    res.render("./listings/new.ejs");
};

module.exports.showListing = async (req,res,next) => {
    const {id} = req.params;
    const listing = await Listing.findById(id).populate({path:"reviews",populate:{path:"author",},}).populate("owner");
    if(!listing){
        req.flash("error", "Cannot find that listing!");
        return res.redirect("/listings");
    }
    try {
        // Fetch latitude & longitude using Nominatim API
        const geoRes = await axios.get(`https://nominatim.openstreetmap.org/search`, {
            params: {
                q: listing.location,  // location name stored in DB
                format: 'json',
                limit: 1
            }
        });

        if (geoRes.data.length > 0) {
            listing.lat = geoRes.data[0].lat;
            listing.lng = geoRes.data[0].lon;
        } else {
            listing.lat = 37.7749; // Default: San Francisco
            listing.lng = -122.4194;
        }

    } catch (error) {
        console.error("Geocoding Error:", error);
        listing.lat = 37.7749; // Default fallback
        listing.lng = -122.4194;
    }

    res.render("./listings/show.ejs", {listing});
};

module.exports.createListing = async (req, res, next) => {
    if (!req.file) {
        req.flash("error", "Image upload failed!");
        return res.redirect("/listings/new");
    }
    const { title, description, price, location, country } = req.body;
    // Ensure image object matches schema
    const imageObj = {
        filename: req.file.filename,
        url: req.file.path,
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
};

module.exports.renderEditForm = async (req,res,next) => {
    const {id} = req.params;
    const listing = await Listing.findById(id);
    if(!listing){
        req.flash("error", "Cannot find that listing!");
        return res.redirect("/listings");
    }
    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload","/upload/h_300,w_250");
    res.render("./listings/edit.ejs", {listing,originalImageUrl});
};

module.exports.updateListing = async (req, res, next) => {
    const { id } = req.params;
    const { title, description, price, location, country} = req.body;

    
    const updatedData = {
        title,
        description,
        price,
        location,
        country,
    };
    if (typeof req.file !== "undefined") {
        // Only update the image if a new file is uploaded
        updatedData.image = {
            filename: req.file.filename,
            url: req.file.path,
        };
    }

    // Validate data against the updated Joi schema
    const { error } = listingSchema.validate(updatedData);
    if (error) throw new ExpressError(400, error.details[0].message);

    const listing = await Listing.findByIdAndUpdate(id, updatedData, {
        runValidators: true,
        new: true,
    });

    req.flash("success", "Successfully updated the listing!");
    res.redirect(`/listings/${listing._id}`);
};

module.exports.destroyListing = async (req,res,next) => {
    const {id} = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("success", "Successfully deleted the listing!");
    res.redirect("/listings");
};


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


// router.post("/",validateListing, wrapAsync( async (req,res,next) => {
//     const newListing = new Listing(req.body);
//     console.log(newListing);
//     await newListing.save();
//     req.flash("success", "Successfully made a new listing!");
//     res.redirect(`/listings/${newListing._id}`);
// }));
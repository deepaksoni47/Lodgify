const express = require("express");
const app = express();
const mongoose = require("mongoose");
const MONGO_URL = "mongodb://127.0.0.1:27017/lodgify";
const Listing = require("./models/listing");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const {listingSchema, reviewSchema} = require("./schema.js");
const Review = require("./models/review");

main()
    .then(() =>{
        console.log("connected to DB")
    })
    .catch(err => console.log(err));

async function main() {
    await mongoose.connect(MONGO_URL);
  
    // use `await mongoose.connect('mongodb://user:password@127.0.0.1:27017/test');` if your database has auth enabled
  }

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.static(path.join(__dirname,"public")));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.engine("ejs",ejsMate);


app.get("/",(req,res) => {
    res.send("root is working");
});

const validateListing = (req,res,next) => {
    let {error} = listingSchema.validate(req.body);
    if(error){
        let errMsg = error.details.map(el => el.message).join(",");
        throw new ExpressError(400, errMsg);
    }
    next();
};
const validateReview = (req,res,next) => {
    let {error} = reviewSchema.validate(req.body);
    if(error){
        let errMsg = error.details.map(el => el.message).join(",");
        throw new ExpressError(400, errMsg);
    }
    next();
};

app.get("/listings", wrapAsync(async (req,res,next) => {
    const allListings = await Listing.find({});
    res.render("./listings/index.ejs", {allListings});
}));

//New route
app.get("/listings/new",(req,res) => {
    res.render("./listings/new.ejs");
});

//Show route
app.get("/listings/:id", wrapAsync(async (req,res,next) => {
    const {id} = req.params;
    const listing = await Listing.findById(id);
    res.render("./listings/show.ejs", {listing});
}));

//Create route
app.post("/listings", validateListing ,wrapAsync( async (req,res,next) => {
    const newListing = new Listing(req.body);
    console.log(newListing);
    await newListing.save();
    res.redirect(`/listings/${newListing._id}`);
}));

//Edit route
app.get("/listings/:id/edit", wrapAsync(async (req,res,next) => {
    const {id} = req.params;
    const listing = await Listing.findById(id);
    res.render("./listings/edit.ejs", {listing});
}));
//update route
app.put("/listings/:id", validateListing, wrapAsync(async (req,res,next) => {
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
app.delete("/listings/:id", wrapAsync(async (req,res,next) => {
    const {id} = req.params;
    await Listing.findByIdAndDelete(id);
    res.redirect("/listings");
}));

// Reviews routes
app.post("/listings/:id/reviews", validateReview, wrapAsync(async (req,res,next) => {
    const {id} = req.params;
    const listing = await Listing.findById(id);
    let newReview = new Review(req.body.review);
    listing.reviews.push(newReview);
    await newReview.save();
    await listing.save();
    res.redirect(`/listings/${listing._id}`);
    
}));

app.all("*", (req,res,next) => {
    next(new ExpressError(404, "Page Not Found!"));
});

app.use((err, req, res, next) => {
    let {statusCode=500, message="Something went wrong!!"} = err;
    res.status(statusCode).render("error.ejs",{err});
});

app.listen(8080, () =>{
    console.log("server is listening on port 8080");
});

// app.get("/testListing",async (req,res) => {
    
//     let sampleListing = new Listing({
//         title: "Sample Listing",
//         description: "This is a sample listing",
//         price: 100,
//         location: "Sample Location",
//         country: "Sample Country",
//     });
//     await sampleListing.save();
//     console.log("sample listing saved");
//     res.send("sample listing saved");
// });
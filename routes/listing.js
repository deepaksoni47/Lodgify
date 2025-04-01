const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const {isLoggedIn , isOwner, validateListing, saveReturnTo} = require("../middleware.js");
const listingController = require("../controllers/listings.js")
const multer = require("multer");
const { storage } = require("../cloudconfig.js");
const upload = multer({ storage });

router.route("/")
.get(wrapAsync(listingController.index))
.post(isLoggedIn,upload.single("image"), validateListing, wrapAsync(listingController.createListing));

//New route
router.get("/new",isLoggedIn, listingController.renderNewForm);

router.route("/:id")
.get(wrapAsync(listingController.showListing))
.put(isLoggedIn, isOwner,upload.single("image"),validateListing, wrapAsync(listingController.updateListing))
.delete(isLoggedIn,isOwner, wrapAsync(listingController.destroyListing));

//Edit route
router.get("/:id/edit",isLoggedIn,isOwner, wrapAsync(listingController.renderEditForm));


module.exports = router;
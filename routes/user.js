const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync.js");
const {saveReturnTo} = require("../middleware.js");
const userController = require("../controllers/users.js");


router.route("/register")
.get(userController.renderSignupForm)
.post(wrapAsync(userController.signup));

router.route("/login")
.get(userController.renderLoginForm)
.post(saveReturnTo, userController.login);

router.get("/logout", userController.logout);

module.exports = router;
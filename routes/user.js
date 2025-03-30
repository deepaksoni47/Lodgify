const express = require("express");
const { route } = require("./listing");
const router = express.Router();
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync.js");
const passport = require("passport");
const {saveReturnTo} = require("../middleware.js");

router.get("/register", (req, res) => {
    res.render("users/signup.ejs");
});

router.post("/register", wrapAsync(async (req, res) => {
    try {
        const { username, email, password } = req.body;
        let newUser = new User({ username, email });
        await User.register(newUser, password);
        // Automatically log in the user after registration
        req.login(newUser, (err) => {
            if (err) {
                req.flash("error", err.message);
                return next(err);
            }
            req.flash("success", "Welcome to Lodgify!");
            res.redirect("/listings");

        });
    } catch (e) {
        req.flash("error", e.message);
        res.redirect("/register");
    }
}));

router.get("/login", (req, res) => {
    res.render("users/login.ejs");
});

router.post("/login",saveReturnTo, (req, res, next) => {
    passport.authenticate("local", {
         failureFlash: true, failureRedirect: "/login" 
        })(req, res, () => {
        req.flash("success", "Welcome back!");
        const redirectUrl = res.locals.ReturnTo || "/listings";
        res.redirect(redirectUrl);
    });
}
);

router.get("/logout", (req, res) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        req.flash("success", "You are logged out!");
        res.redirect("/listings");
    });
});

module.exports = router;
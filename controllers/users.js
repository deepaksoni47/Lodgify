const User = require("../models/user.js");
const passport = require("passport");


module.exports.renderSignupForm =(req, res) => {
    res.render("users/signup.ejs");
};

module.exports.signup = async (req, res) => {
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
};

module.exports.renderLoginForm = (req, res) => {
    res.render("users/login.ejs");
};

module.exports.login = (req, res, next) => {
    passport.authenticate("local", {
         failureFlash: true, failureRedirect: "/login" 
        })(req, res, () => {
        req.flash("success", "Welcome back!");
        const redirectUrl = res.locals.ReturnTo || "/listings";
        delete req.session.returnTo;
        res.redirect(redirectUrl);
    });
};

module.exports.logout = (req, res) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        req.flash("success", "You are logged out!");
        res.redirect("/listings");
    });
};
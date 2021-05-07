const passport = require("../middleware/passport");
const userController = require("./user_controller");

let authController = {
    login: (req, res) => {
        res.render("auth/login", { loggedIn: false });
    },

    register: (req, res) => {

    },

    loginSubmit: (req, res, next) => {
        passport.authenticate("local", {
            successRedirect: "/flashcards",
            failureRedirect: "back",
        })(req, res, next);
    },

    registerSubmit: async (req, res, next) => {

    },

    logout: (req, res) => {
        req.logout();
        res.redirect("/")
    }
};

module.exports = authController;
const passport = require("../middleware/passport");
const userController = require("./user_controller");

let authController = {
    login: (req, res) => {
        res.render("auth/login", { loggedIn: false });
    },

    register: (req, res) => {
        newEmail = req.query.newEmail
        res.render("auth/register", { loggedIn: false, newEmail: newEmail, emailIsTaken: false });
    },

    loginSubmit: (req, res, next) => {
        passport.authenticate("local", {
            successRedirect: "/flashcards",
            failureRedirect: "back",
        })(req, res, next);
    },

    registerSubmit: async (req, res, next) => {
        let { name, email, password } = req.body

        let registerResult = await userController.registerUser(name, email, password)

        if (registerResult) {
            passport.authenticate("local", {
                successRedirect: "/flashcards",
                failureRedirect: "/login",
            })(req, res, next);
        } else {
            res.render("auth/register", { loggedIn: false, emailIsTaken: true })
        }
    },

    logout: (req, res) => {
        req.logout();
        res.redirect("/")
    }
};

module.exports = authController;
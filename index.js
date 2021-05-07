const express = require("express");
const app = express();
const path = require("path");
const ejsLayouts = require("express-ejs-layouts");
const session = require("express-session");

const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient()


app.use(express.static(path.join(__dirname, "public")));

const flashcardsController = require("./controller/flashcards_controller");
const authController = require("./controller/auth_controller");
const userController = require("./controller/user_controller");
const passport = require("./middleware/passport");
const { ensureAuthenticated, forwardAuthenticated } = require("./middleware/checkAuth")
app.use(express.urlencoded({ extended: true }));

// use this to test POSTing stuff to server with insomnia
// app.use(express.json())

app.use(
    session({
        secret: "secret",
        resave: false,
        saveUninitialized: false,
        cookie: {
            httpOnly: true,
            secure: false,
            maxAge: 24 * 60 * 60 * 1000,
        },
    })
);

app.use(passport.initialize());
app.use(passport.session());
app.use(ejsLayouts);
app.set("view engine", "ejs");




app.get("/login", forwardAuthenticated, authController.login);
app.post("/login", forwardAuthenticated, authController.loginSubmit);
app.get("/logout", authController.logout)


// all flashcard sets route
app.get("/flashcards", ensureAuthenticated, flashcardsController.list);

// create new flashcard set route
app.get("/flashcards/new", ensureAuthenticated, flashcardsController.new);

// single flashcard set route
app.get("/flashcards/:id", ensureAuthenticated, flashcardsController.listOne);

// edit single flashcard set route
app.get("/flashcards/:id/edit", ensureAuthenticated, flashcardsController.edit);


// post routes
app.post("/flashcards/", ensureAuthenticated, flashcardsController.create);
app.post("/flashcards/update/:id", ensureAuthenticated, flashcardsController.update);
app.post("/flashcards/delete/:id", ensureAuthenticated, flashcardsController.delete);


// register page
app.get("/register", forwardAuthenticated, authController.register);
app.post("/register", authController.registerSubmit);



app.listen(4200, function() {
    console.log(
        "Server running. Visit: http://localhost:4200/ in your browser"
    );
});
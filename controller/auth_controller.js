const passport = require("../middleware/passport");
const userController = require("./user_controller");

const nodemailer = require('nodemailer');

const { createHash, } = require('crypto');

const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient()

require('dotenv').config();


let authController = {
    login: (req, res) => {
        res.render("auth/login", { loggedIn: false, message: req.flash("info") });
    },

    register: (req, res) => {
        res.render("auth/register", { loggedIn: false, message: req.flash("info") });
    },

    loginSubmit: (req, res, next) => {
        
        passport.authenticate('local', function(err, user, info) {

            if (err) { return next(err); }
            if (!user) { 
                req.flash("info", {failure: info.message})
                return res.redirect('/login'); 
            }
            if (!user.active) {
                req.flash("info", {failure: "Please verify your email to complete the registration."})
                return res.redirect('/login');
            } 
            req.logIn(user, function(err) {
              if (err) { return next(err); }
              return res.redirect('/flashcards');
            });
          })(req, res, next);

    },

    registerSubmit: async (req, res, next) => {
        let { name, email, password } = req.body

        let emailProvider = email.split("@")[1]
        if (emailProvider !== "my.bcit.ca") {
            req.flash("info", {failure: "Testu currently accepts BCIT members only. Please register with a valid BCIT email."})
            return res.render("auth/register", { loggedIn: false, message: req.flash("info") })
        }

        

        let user = await userController.registerUser(name, email, password)

        
        if (user) {
            
            const hash = createHash('sha256');
            const hashString = hash.digest('hex');

            await prisma.verifyHash.create({
                data: {
                    hash: hashString,
                    userId: user.id
                }
            })
    
            // send verification email
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                  user: process.env.EMAIL,
                  pass: process.env.PASSWORD
                }
              });
            
            const mailOptions = {
                from: `"Testu" ${process.env.EMAIL}`,
                to: email,
                subject: 'Verify your Testu account.',
                html: `
                <p>Welcome to Testu, ${name}!</p>
                <p>Please visit this link to verify your email address: http://localhost:4200/verify?hash=${hashString}</p>`
            };
    
            transporter.sendMail(mailOptions, function(error, info){
                if (error) {
                  console.log(error);
                } else {
                  console.log('Email sent: ' + info.response);
                }
            });
            req.flash("info", {success: "Registration successful! You will shortly receive an email with a link to activate your account."})
            return res.redirect('/login');
        } 
        else {
            req.flash("info", {failure: "An account with this email already exists."})
            return res.render("auth/register", { loggedIn: false, message: req.flash("info") })
        }


        

    },

    logout: (req, res) => {
        req.logout();
        res.status(200).clearCookie('connect.sid', {
            path: '/'
          });
          req.session.destroy(function (err) {
            res.redirect('/');
        });
    },


    verify: async (req, res) => {
        let hash = req.query.hash

        if (hash) {
            let hashToFind = await prisma.verifyHash.findUnique({
                where: {
                    hash: hash
                }
            })

            if (hashToFind) {
                await prisma.user.update({
                    where: {
                        id: hashToFind.userId
                    },
                    data: {
                        active: true
                    }
                })

                

                await prisma.verifyHash.delete({
                    where: {
                        hash: hash
                    }
                })

                req.flash("info", {success: "Your account has been verified!"})
                // return res.render("/auth/login", { loggedIn: false, message: req.flash("info") })
            }

        }
        return res.render("auth/login", { loggedIn: false, message: req.flash("info") }) 
    }
};

module.exports = authController;

const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient()

module.exports = {
  ensureAuthenticated: async function (req, res, next) {
    if (req.isAuthenticated()) {
        id = req.session.passport.user
        let user = await prisma.user.findUnique({
            where: {id: id}
        });
        res.locals.name = user.name
        res.locals.userId = id
        
        return next();
    }
    res.redirect("/login");
  },
  forwardAuthenticated: function (req, res, next) {
    if (!req.isAuthenticated()) {
      return next();
    }
    res.redirect("/flashcards");
  },
};

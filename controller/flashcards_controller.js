const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient()

let flashcardsController = {
    list: async(req, res) => {
        let userId = req.session.passport.user
        let allFlashcards = await prisma.flashcardsSet.findMany({
            where: { userId: userId },
            include: {
                _count: { 
                    select: { 
                        flashcards: true
                    }
                }
            }
        })
        res.render("flashcards/index", { flashcardsSets: allFlashcards });
    },


    new: (req, res) => {

    },

    listOne: async (req, res) => {

    },

    create: async (req, res) => {

    },

    edit: async (req, res) => {

    },

    update: async (req, res) => {

    },

    delete: async (req, res) => {

    },

};

module.exports = flashcardsController;

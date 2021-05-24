const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient()

let flashcardsController = {
    list: async(req, res) => {

        // let allFlashcards = req.user.flashcardsSets;

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
        return allFlashcards
    },


    new: (req, res) => {
        res.render("flashcards/create");
    },

    listOne: async (req, res) => {
        let userId = req.session.passport.user
        let flashcardSetToFind = parseInt(req.params.id);
        let flashcardSet = await prisma.flashcardsSet.findUnique({
            where: { setId: flashcardSetToFind },
            include: {
                user: {
                    select: {
                        name: true
                    }
                }
            }
        })



       
        // only users of the set can see it or if the set is not privated
        if (flashcardSet !== null && (flashcardSet.userId === userId || flashcardSet.private === false)) {  

            let searchResult = await prisma.flashcard.findMany({
                where: {flashcardsSetId: flashcardSetToFind}
            })


            if (searchResult.length > 0) {
                res.render("flashcards/flashcard_set", { flashcardSet: flashcardSet, allFlashcards: searchResult });
                return searchResult
            } 
        } else if (flashcardSet !== null && flashcardSet.private === true) {
            //case where flashcard set is privated

            res.render("flashcards/error")
            return searchResult
        } else {
            // case where flashcard set does not exist

            let allFlashcards = await prisma.flashcardsSet.findMany({
                where: { userId: userId },
                include: {
                    _count: { 
                        select: { 
                            flashcards: true
                        }
                    },
                }
            })

            res.render("flashcards/index", { flashcardsSets: allFlashcards });
            return searchResult
        }
    },

    create: async (req, res) => {


        let userId = req.session.passport.user

        flashcards = []
        let keys = req.body.flashcards.term;
        let values = req.body.flashcards.definition;

        if (Array.isArray(keys)) {
            keys.forEach((currentKey, i) => {
                newFlashcard = {term: currentKey, definition: values[i]};
                flashcards.push(newFlashcard)});
        } else {
            flashcards.push({term: keys, definition: values})
        }

        // format tags into a string of tags separated with a comma
        let tags = req.body.tags
        let tagString = ""
        if (tags[0] !== "") {
            tagString += tags[0]
        }
        if (tags[0] !== "" && tags [1] !== "") {
            tagString += ","
        }
        if (tags[1] !== "") {
            tagString += tags[1]
        }



        // creates a new flashcardset and creates related flashcards
        const flashcardset = await prisma.flashcardsSet.create({
            data: {
                title: req.body.title,
                description: req.body.description,
                userId: userId,
                private: JSON.parse(req.body.private),
                flashcards: {
                    create: flashcards
                },
                tags: tagString
            }
        })

        res.redirect("/flashcards");
        return flashcardset
    },

    edit: async (req, res) => {
        let flashcardSetToFind = parseInt(req.params.id);

        let searchResultSet = await prisma.flashcardsSet.findUnique({
            where: {setId: flashcardSetToFind}
        })

        let searchResultFlashcards = await prisma.flashcard.findMany({
            where: {flashcardsSetId: flashcardSetToFind}
        })

        res.render("flashcards/edit", { flashcardSet: searchResultSet, flashcards: searchResultFlashcards });
    },

    update: async (req, res) => {

        let flashcardSetToUpdate = parseInt(req.params.id);

        // verify flashcard owner before updating
        currentUserId = req.session.passport.user
        flashcardSet = await prisma.flashcardsSet.findUnique({
            where: {setId: flashcardSetToUpdate}
        })

        const update_fc = [];
        if (currentUserId === flashcardSet.userId) {
            let { title, description } = req.body;
            
    
            flashcards = []
            let ids = req.body.flashcards.id;
            let keys = req.body.flashcards.term;
            let values = req.body.flashcards.definition;
            // console.log(ids, keys, values)
            if (Array.isArray(keys)) {

                ids.forEach((ids, i) => {
                    if (ids[i] !== "undefined") {
                        newFlashcard = {id: ids, term: keys[i], definition: values[i]};
                        flashcards.push(newFlashcard);
                    } 
                    else {
                        newFlashcard = { term: keys[i], definition: values[i] };
                        flashcards.push(newFlashcard);
                    }
                })
            } else { // case where there is only 1 flashcard
                if (ids !== "undefined") {
                    flashcards.push({id: ids, term: keys, definition: values})
                } else {
                    flashcards.push({id: "undefined", term: keys, definition: values})
                }
            }


            // format tags into a string of tags separated with a comma
            let tags = req.body.tags
            let tagString = ""
            if (tags[0] !== "") {
                tagString += tags[0]
            }
            if (tags[0] !== "" && tags [1] !== "") {
                tagString += ","
            }
            if (tags[1] !== "") {
                tagString += tags[1]
            }
            


            // delete flashcards
            let deleteIds = req.body.flashcards.delete;
            
            if (!Array.isArray(deleteIds)) {
                deleteIds = []
                deleteIds.push(req.body.flashcards.delete)
            }

            if (deleteIds[0] !== undefined) {
                for (let id of deleteIds) {
                    await prisma.flashcard.delete({
                        where: {
                            flashcardId: id
                        }
                    })
                }
            }

            // update title, description, and tags of flashcardSet
            await prisma.flashcardsSet.update({
                where: { 
                    setId: flashcardSetToUpdate
                },
                data: {
                    title: title,
                    description: description,
                    tags: tagString,
                    private: JSON.parse(req.body.private), 
                }
            })

            
            // update flashcards 
            for (flashcard of flashcards) {
                // create flashcard if it doesnt exist
                if (flashcard.id === "undefined"){
                    const update = await prisma.flashcard.create({
                        data: {
                            term: flashcard.term,
                            definition: flashcard.definition,
                            flashcardsSetId: flashcardSetToUpdate
                        }
                    })
                    update_fc.push(update)
                } else { // update terms and definitions if flash card exists
                    
                    const update = await prisma.flashcard.update({
                        where: {
                            flashcardId: flashcard.id
                        },
                        data: {
                            term: flashcard.term,
                            definition: flashcard.definition
                        }
                    })
                    update_fc.push(update)
                }
            }
        }


        res.redirect(`/flashcards/${flashcardSetToUpdate}`);
        return update_fc
    },

    delete: async (req, res) => {

        let flashcardSetToDelete = parseInt(req.params.id)


        // check if user deleting owns the set
        currentUserId = req.session.passport.user
        flashcardSet = await prisma.flashcardsSet.findUnique({
            where: {setId: flashcardSetToDelete}
        })


        if (currentUserId === flashcardSet.userId) {

        // delete entire flashcard set
        
            const deleteFlashcards = prisma.flashcard.deleteMany({
                where: {
                    flashcardsSetId: flashcardSetToDelete
                }
            })

            const deleteFlashcardSet = prisma.flashcardsSet.delete({
                where: {
                    setId: flashcardSetToDelete
                }
            })

            await prisma.$transaction([deleteFlashcards, deleteFlashcardSet])

            res.redirect("/flashcards")
        } else {
            res.redirect(`/flashcards/${flashcardSetToDelete}`);
        }

        

    },

    listSearch: async (req, res) => {

        searchInput = req.query.input
        
        let allFlashcards = await prisma.flashcardsSet.findMany({
            where: { 
                private: false,
                OR: [
                    
                    {
                        title: {
                            contains: searchInput
                        },
                    },
                    {
                        tags: {
                            contains: searchInput
                        }
                    },
                ]
            },
            include: {
                _count: { 
                    select: { 
                        flashcards: true
                    }
                },
                user: {
                    select: {
                        name: true
                    }
                }
            }
        })

        res.render("flashcards/search", { flashcardsSets: allFlashcards });
        return allFlashcards
    },

};

module.exports = flashcardsController;

const app = require("../index").app;
const prisma = require("../index").prisma
const request = require("supertest");
const flashcardsController = require("../controller/flashcards_controller")
const registerUser = require("../controller/user_controller").registerUser
const httpMocks = require('node-mocks-http');

var cindy;
var new_set;
beforeAll(async (done) => {
    //mock user
    cindy =
        await prisma.user.findUnique({
            where: {
                email: "cindy@gmail.com",
            },
            include: {
                flashcardsset: true,
            },
        })
    done();
});

afterAll(async (done) => {
    await prisma.$disconnect();
    done();
});

const res = httpMocks.createResponse();

const cheryl = {
    name: 'Cheryl Kong',
    email: "cheryl@gmail.com",
    password: 'k'
}

//successes
describe("Test main features", () => {
    it('view all flascardsets', async () => {
        //list: return allFlashcards
        const req = httpMocks.createRequest({
            session: {
                passport: { user: cindy.id }
            }
        })
        const response = await flashcardsController.list(req, res)
        const flashcardset = await prisma.flashcardsSet.findMany({
                where: {
                    userId: cindy.id,
                }
            })
        expect(response).toMatchObject(flashcardset)
    });
    it('create flashcardset', async () => {
        //create: return flashcard
        const req = httpMocks.createRequest({
            session: {
                passport: { user: cindy.id }
            },
            body: {
                flashcards: {
                    term: "test",
                    definition: "abc"
                },
                tags: [],
                title: 'unite-test',
                description: 'unit test',
                private: 'true'
            }
        })
        new_set = await flashcardsController.create(req, res)
        const flashcardset = await prisma.flashcardsSet.findMany({
            where: {
                userId: cindy.id,
            },
            include: {
                flashcards: true,
                },
        })
        expect(flashcardset).toHaveLength(5);
    });
    it('view one flascardset', async () => {
        //listOne: return searchResult
        const req = httpMocks.createRequest({
            session: {
                passport: { user: cindy.id }
            },
            params: {
                id: new_set.setId
            }
        })
        const response = await flashcardsController.listOne(req, res)
        const flashcardset = await prisma.flashcardsSet.findUnique({
                where: {
                    setId: new_set.setId,
                },
                include: {
                    flashcards: true,
                    },
            })
            expect(response).toMatchObject(flashcardset.flashcards)
    });
    it('update flashcards', async () => {
        //update
        //create update_fc = [] after flashcardSet, push update to update_fc in if/else statement
        //return update_fc
        const flashcardset = await prisma.flashcardsSet.findUnique({
            where: {
                setId: new_set.setId,
            },
            include: {
                flashcards: true,
              },
        })
        const req = httpMocks.createRequest({
            session: {
                passport: { user: cindy.id }
            },
            body: {
                flashcards: {
                    id: flashcardset.flashcards[0]["flashcardId"],
                    term: "test123",
                    definition: "abc123",
                    delete: [undefined]
                },
                tags: ['test'],
                title: 'unite-test',
                description: 'testing',
                private: 'true'
            },
            params: {
                id: new_set.setId
            }
        })
        const update_fc = await flashcardsController.update(req, res)
        expect(update_fc).toHaveLength(1) //only one flahscard is changed, so the lenght will be one
    });
    it('delete flashcardset', async () => {
        const req = httpMocks.createRequest({
            session: {
                passport: { user: cindy.id }
            },
            params: {
                id: new_set.setId
            }
        })
        await flashcardsController.delete(req, res)
        const flashcardset = await prisma.flashcardsSet.findMany({
            where: {
                userId: cindy.id,
            },
            include: {
                flashcards: true,
                },
        })
        expect(flashcardset).toHaveLength(4);
    })
})

describe('Test tags feature', () => {
    it('Check tags value', async () => {
        const req = httpMocks.createRequest({
            session: {
                passport: { user: cindy.id }
            },
            body: {
                flashcards: {
                    term: "test",
                    definition: "abc"
                },
                tags: ['test', 'test2'],
                title: 'unite-test',
                description: 'unit test',
                private: 'false'
            }
        })
        new_set = await flashcardsController.create(req, res)
        const flashcardset = await prisma.flashcardsSet.findUnique({
            where: {
                setId: new_set.setId,
            },
            include: {
                flashcards: true,
                },
        })
        expect(flashcardset.tags).toBe('test,test2')
        await prisma.flashcard.delete({ // delete flashcard before set
            where: {
                flashcardId: flashcardset["flashcards"][0]["flashcardId"]
            }
            })
        await prisma.flashcardsSet.delete({
        where: {
            setId: new_set.setId,
        }
        })
    });
})

describe('Test if flashcardset is sharable', () => {
    //lishSearch: return allFlashcards
    it('not empty output when private is false(sharable)', async() =>{
        const sharable_req = httpMocks.createRequest({
            session: {
                passport: { user: cindy.id }
            },
            query: {
                input: 'Math Review'
            }
        })
        const res = httpMocks.createResponse();
        const shareble = await flashcardsController.listSearch(sharable_req,res)
        const flashcardset = await prisma.flashcardsSet.findMany({
            where: {
                setId: 1,
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
        expect(shareble[0]['private']).toBe(JSON.parse('false'));
        expect(flashcardset).toMatchObject(shareble);
    });
    it('empty output when private is true(not sharable)', async() =>{
        const not_sharable_req = httpMocks.createRequest({
            session: {
                passport: { user: cindy.id }
            },
            query: {
                input: 'test private'
            }
        })
        const res = httpMocks.createResponse();
        const not_shareble = await flashcardsController.listSearch(not_sharable_req,res)
        const flashcardset = await prisma.flashcardsSet.findUnique({
            where: {
                setId: 36,
            }
        })
        expect(not_shareble).toStrictEqual([]);
        expect(flashcardset['private']).toBe(JSON.parse('true'));
    })
})

describe('Test login' , () => {
    it("redirect to login page if user does not exist in database", async (done) => {
      await request(app)
        .post("/login")
        .send({
          email: cheryl.email,
          password: cheryl.password
        })
        .set('Accept', 'application/json')
        .expect("Location", "/login")
        done()
    });   
    it("redirect to flashcard page if user exist in database", async (done) => {
        await request(app)
          .post("/login")
          .send({
            email: cindy.email,
            password: cindy.password
          })
          .set('Accept', 'application/json')
          .expect("Location", "/flashcards")
          done()
      }); 
});

describe('Test register', () => {
    it('exist in database and no flashcard set after register', async () => {
        const validate = await registerUser(cheryl.name, cheryl.email, cheryl.password)
        const user = await prisma.user.findUnique({
            where: {
                email: cheryl.email
            },
            include:
            {
                flashcardsset: true
            }
        })
        expect(user.flashcardsset).toHaveLength(0);
        expect(validate).toBe(true)
        await prisma.user.delete({
            where: {
                id: user.id
            }
        })
    })
})


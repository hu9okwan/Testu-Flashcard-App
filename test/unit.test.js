const app = require("../index").app;
const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient()
const request = require("supertest");
const flashcardsController = require("../controller/flashcards_controller")
const authController = require('../controller/auth_controller')
const httpMocks = require('node-mocks-http');

var cindy;
var new_set;
beforeAll(async (done) => {
    //mock user
    cindy =
        await prisma.user.findUnique({
            where: {
                email: "cindy@my.bcit.ca",
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
    email: "cheryl@my.bcit.ca",
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
                private: 'false'
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
        expect(flashcardset).toHaveLength(6);
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
        expect(flashcardset).toHaveLength(5);
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
                input: 'Private set'
            }
        })
        const res = httpMocks.createResponse();
        const not_shareble = await flashcardsController.listSearch(not_sharable_req,res)
        const flashcardset = await prisma.flashcardsSet.findUnique({
            where: {
                setId: 46,
            }
        })
        expect(not_shareble).toStrictEqual([]);
        expect(flashcardset['private']).toBe(JSON.parse('true'));
    })
})

describe('Test login' , () => {
    it("redirect to login page if user does not exist in database", async () => {
      await request(app)
        .post("/login")
        .send({
          email: cheryl.email,
          password: cheryl.password
        })
        .set('Accept', 'application/json')
        .expect("Location", "/login")
    });   
    it("redirect to flashcard page if user exist in database", async () => {
        await request(app)
          .post("/login")
          .send({
            email: cindy.email,
            password: cindy.password
          })
          .set('Accept', 'application/json')
          .expect("Location", "/flashcards")
      }); 
      it("redirect to login page if email or password is not matched", async () => {
        await request(app)
            .post("/login")
            .send({
            email: cindy.email,
            password: cheryl.password
            })
            .set('Accept', 'application/json')
            .expect("Location", "/login")
      }); 
});

describe('Test register', () => {
    it('register with correct email', async () => {
        await request(app)
            .post("/register")
            .send({
                name: cheryl.name,
                email: cheryl.email,
                password: cheryl.password
            })
            .expect("Location", "/login")
    });
    it('register with invalid email', async () => {
        const req = httpMocks.createRequest({
            body: {
                name: cheryl.name,
                email: "cheryl@gmail.com",
                password: cheryl.password
                },
                flash: (title, message='') =>{
                    return message
                }
        })
        const valid = await authController.registerSubmit(req,res)
        expect(valid).toBe(false)
    })
})

describe("Test verfiy email", () => {
    it('Cannot login before verify email', async () => {
        await request(app)
          .post("/login")
          .send({
            email: cheryl.email,
            password: cheryl.password
          })
          .set('Accept', 'application/json')
          .expect("Location", "/login")
    });
    it('email verification', async () => {
        const new_user = await prisma.user.findUnique({
            where: {
                email: cheryl.email
            },
            include:
            {
                flashcardsset: true,
                hash: true
            }
        })
        const req = httpMocks.createRequest({
            query:{
                hash: new_user.hash.hash
            },
            flash: (a,b)=>{
                let title = a
                let message = b
            }
        })
        await authController.verify(req,res)
        const verify_user = await prisma.user.findUnique({
            where: {
                email: cheryl.email
            },
            include:
            {
                flashcardsset: true,
                hash: true
            }
        })
        expect(verify_user.active).toBe(true)
    });
    it("Successfully log in after verifying the email", async() => {
        await request(app)
          .post("/login")
          .send({
            email: cheryl.email,
            password: cheryl.password
          })
          .set('Accept', 'application/json')
          .expect("Location", "/flashcards")
    });
    it("Make sure no flashcard is assigned to new user", async() => {
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
        await prisma.user.delete({
            where: {
                id: user.id
            }
        })
    })
})
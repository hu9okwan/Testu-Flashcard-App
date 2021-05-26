const fs = require("fs")
const { resetCards, } = require("../public/function")

beforeAll(async (done) => {
    window.document.body.innerHTML= fs.readFileSync("./test/example/index.html");
    done();
});

describe('Test reset function', () => {
    //createa another html to test the function
    it('Make sure all flahcards remove a specific class', () => {
        resetCards();
        const flashcard = document.getElementsByClassName('flip-card-horizontal');
        expect(window.document.body.innerHTML).toEqual(
            expect.not.stringContaining('flip-card-horizontal'));
        expect(flashcard).toHaveLength(0);
    })
})
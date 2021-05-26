const fs = require("fs")
const { resetCards, filterTags } = require("../public/function")

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

describe('Test filter function', () =>{
    it("Matched tags", () => {
        const filter = '29'
        let input = document.getElementById('userInputFilter');
        input.value = filter
        const result = filterTags();
        for(let tag of result){
            expect(tag).toContain(filter);
        }
        
    }),
    it("Unmatched tags", () => {
        const filter = '3'
        let input = document.getElementById('userInputFilter');
        input.value = filter
        const result = filterTags();
        expect(result).toHaveLength(0)
        
    })
})
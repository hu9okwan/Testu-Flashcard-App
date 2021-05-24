const fs = require("fs")
window.document.body.innerHTML = fs.readFileSync("./test/example/index.html")
const { resetCards, } = require("../public/function")

describe('Test ejs function', () => {
    //createa another html to test the function
    it('test reset function', () => {
        resetCards()
        expect(window.document.body.innerHTML).toEqual(
            expect.not.stringContaining('flip-card-horizontal'))
    })
})
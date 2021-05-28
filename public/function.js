function resetCards() {
    let allFlashcards = document.getElementsByClassName("reset-cards")
    for (let card of allFlashcards) {
        if (card.classList.contains("flip-card-horizontal")) {
            card.classList.remove("flip-card-horizontal")
        }
    }
    return allFlashcards
}

function filterTags() {
    let input = document.getElementById('userInputFilter');
    let filter = input.value.toUpperCase();
    let ul = document.getElementById("flashcards-set-ul");
    let flashcardSetElems = ul.getElementsByTagName('li');
    const result = []
    for (i = 0; i < flashcardSetElems.length; i++) {
        spans = flashcardSetElems[i].getElementsByTagName("span");


        for (let span of spans) {
            textValue = span.textContent || span.innerText;
            if (textValue.toUpperCase().includes(filter)) {
                // console.log(textValue)
                flashcardSetElems[i].style.display = "";
                result.push(textValue)
                // need to break out of the span for loop or it will disable same flashcardSet
                // if it has 2 tags and the second tag doesnt contain the filter text
                break
                
            } else {
                flashcardSetElems[i].style.display = "none";
            }
        }
    }
    return result
}

module.exports = { resetCards, filterTags }
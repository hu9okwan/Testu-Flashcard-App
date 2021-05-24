function resetCards() {
    let allFlashcards = document.getElementsByClassName("reset-cards")
    for (let card of allFlashcards) {
        if (card.classList.contains("flip-card-horizontal")) {
            card.classList.remove("flip-card-horizontal")
        }
    }
    return allFlashcards
}

module.exports = { resetCards }
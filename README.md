<p align="center">
  <img src="https://github.com/hu9okwan/testu/blob/main/public/imgs/flashcardset.png" width="350" title="Logo">
</p>

# Testu - A Minimalist Flashcard Application

Testu is intended to help BCIT students with studying, via allowing them to test and improve their memory using flashcards. Users will only be able to register using a valid @my.bcit.ca email address.
Currently registration is disabled; you can use user cindy@my.bcit.ca with password asd123 to play around on it.

## Features
The current features that Testu offers include the following:
- Registration and local login 
- Create, read, update, and delete flashcards in a set
- 3 different read/view modes
  1. Standard Mode
  2. Flashcard Mode
  3. Shuffle Mode
- Filter through sets using tags 
- Share sets with other users
- Search for sets that other users have made
- Ability to private a set

## Usage
Testu is currently deployed and available on Heroku at https://bcit-testu.herokuapp.com/.

## Technologies
The application was created using:
- HTML, CSS, JavaScript, EJS
- Node JS, Express JS, Passport JS
- Prisma, SQLite
- Jest, Travis CI
- Heroku

## Disclaimer
In utilizing an SQLite database, your account will be publicly available and unsecure. Please use a secondary password when registering your account. Additionally, Heroku uses ephemeral storage and will periodically wipe the data on the database. 

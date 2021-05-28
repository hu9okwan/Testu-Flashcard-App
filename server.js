const app = require("./index").app;
const port = require("./index").port;

app.listen(port, function() {
    console.log(
        "Server running. Visit: http://localhost:4200/ in your browser"
    );
});
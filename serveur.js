var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var fs = require("fs");

var PORT = process.env.PORT || 8888;

app.use(express.static(__dirname));
app.use(bodyParser.json());

app.use('/favicon.ico', express.static('favicon.ico'));


app.get("/getLetters", function(req, res){
    fs.readFile("data/courriels.json", function (err, data) {
        if (err) throw err;
        res.json(JSON.parse(data));
        });
});

app.listen(PORT, function() {
    console.log("Server listening on port " + PORT);
});
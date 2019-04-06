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
    console.log("Server listening for client on port " + PORT);
});

var server    = app.listen(3033);
var io        = require('socket.io').listen(server);

// var connect_socket = io.connect("Adresse IP de connexion");
// connect_socket.emit("envoi", data);

// oi.on("envoi", function(data){
//  faire qq chose ici
// });

io.sockets.on('connection', function (socket) {
    console.log("Made socket connection from ", socket.address());

    socket.on("envoi", function(data){
        io.sockets.emit("envoi", data); // pas la bonne fonction pour l'instant
    });
  });
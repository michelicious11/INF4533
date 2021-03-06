/* Membres de l'équipe :
* Simon-Pierre Fortin
* Alexandre Jolicoeur
* Lindsay Radford
* Michèle Mouafo
*/

var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var json_file_object = require("json-file-object");
var net = require("net");

// --- Partie sur la connexion avec le client ---

var PORT = process.env.PORT || 8888;

app.use(express.static(__dirname));
app.use(bodyParser.json());

app.use('/favicon.ico', express.static('favicon.ico'));

var my_obj = json_file_object({value:{}, file:"data/courriels.json", saveEverySecs:5, forceNew:false})

// Réception des appels de requêtes clients, et réponses

app.get("/getLetters", function(req, res){
    var usedKey = req.query.pem;
    res.send(my_obj[usedKey]);
});

app.post("/addLetters", function(req, res){
    var email = req.body;
    res.send("Courriel reçu!");
    my_obj[email["dest"]]["emails"].unshift(email["msg"]);
});  

app.listen(PORT, function() {
    console.log("Serveur en attente de connexion du client sur le port " + PORT);
});


//  --- Partie sur la connexion entre serveurs --- 

var socket = new net.Socket();

// Test de connexion à un serveur distant
connect_to_distant(3034, "localhost");


// Fonction permettant de créer des connexions à des serveurs distants
// La mise à jour des courriels s'effectuent pas une comparaison entre serveurs à la connexion
function connect_to_distant (port_distant, adresse_distant) {
    console.log("Tentative de connexion distante au " + adresse_distant + " sur le port " + port_distant);
    socket.connect(port_distant, adresse_distant, function () { 
        console.log("Connecté au serveur distant");
        var chunks = [];
        socket.on("data", function(data){
            chunks.push(data);
            var new_data = JSON.parse(chunks);
            // Comparaison des courriels sur JSON reçu avec ceux du JSON du serveur local
            for (var i = 0; i < Object.values(new_data).length; i++) {
                for (var k = 0; k < Object.values(new_data)[i]["emails"].length; k++){
                    if (Object.values(my_obj)[i]["emails"].indexOf(Object.values(new_data)[i]["emails"][k]) < 0){
                        Object.values(my_obj)[i]["emails"].unshift(Object.values(new_data)[i]["emails"][k]); 
                    }
                }
            }

        });
        socket.write(JSON.stringify(my_obj));
    });
};

socket.on("error", function(e){
    if (e.code === "ECONNREFUSED"){
        console.log("Aucun serveur distant disponible");
    }
});

var server = net.createServer(function (conn) {
    console.log("Connexion par serveur client");
    conn.write(JSON.stringify(my_obj));
    conn.on("error", function(){
        console.log('Aucun client connecté');
    });
    var chunks = [];
    conn.on("data", function(data){
        chunks.push(data);
        var new_data = JSON.parse(chunks);
        // Comparaison des courriels sur JSON reçu avec ceux du JSON du serveur local
        for (var i = 0; i < Object.values(new_data).length; i++) {
            for (var k = 0; k < Object.values(new_data)[i]["emails"].length; k++){
                if (Object.values(my_obj)[i]["emails"].indexOf(Object.values(new_data)[i]["emails"][k]) < 0){
                    Object.values(my_obj)[i]["emails"].unshift(Object.values(new_data)[i]["emails"][k]); 
                }
            }
        }
    });    
});

var serverListen = 3033;

server.listen(serverListen, "localhost", function () {
    console.log("Serveur en attente de connexion de serveurs sur le port " + serverListen);
});
/* Membres de l'équipe :
* Simon-Pierre Fortin
* Alexandre Jolicoeur
* Lindsay Radford
* Michèle Mouafo
*/


// -- Nouvelles fonctions pour Projet 2 ---


/*  Génère une paire de clé publique/privée RSA
    Retourne un objet JSON : {myPublicKey: "clé publique", myPrivateKey : "clé privée"}
*/
var generate_keys = function(){
    var key = new NodeRSA({b: 1024});
    var keyPair = key.generateKeyPair(1024);
    var myPrivateKey = keyPair.exportKey("private");
    var myPublicKey = keyPair.exportKey("private");
    return {myPublicKey: myPublicKey, myPrivateKey: myPrivateKey};
};


/*  Fonction de chiffrement RSA
    Arguments: message(objet JSON ou String), key(une clé publique PEM)
    retourne un String en base64
*/
var encrypt_message = function(message, mykey){
    var cryptedMessage;
    var key = new NodeRSA(mykey);
    if (typeof message === "object"){
        cryptedMessage = key.encrypt(JSON.stringify(message)).toString("base64");
        return cryptedMessage;
    }
    else {
        cryptedMessage = key.encrypt(message).toString("base64");
        return cryptedMessage;
    }
};


/*  Fonction de déchiffrement RSA
    Arguments: message(String en base64), key(une clé privée PEM)
    retourne un String en base64 ou un objet JSON selon le type de message initial
*/
var decrypt_message = function(message, mykey) {
    var key = new NodeRSA(mykey);
    var decryptedMessage = key.decrypt(message);
    try {
        decryptedMessage = JSON.parse(decryptedMessage.toString("utf-8"));
        return decryptedMessage;
    }
    catch (err){
        decryptedMessage = decryptedMessage.toString("utf-8");
        return decryptedMessage;
    } 
};


// --- Fin des nouvelles fonctions pour Projet 2 ---


// Fonction utilisée pour surligner le texte obtenu par la recherche dans les courriels

var surligne_texte = function(mots, texte){
    var temp_texte = texte;
    for (var x = 0; x < mots.length; x++){
        var re = new RegExp(mots[x], "ig");
        var texte_avec_surlignage = temp_texte.replace(re, "<mark>" + mots[x] + "</mark>");
        temp_texte = texte_avec_surlignage;
    }
    return temp_texte;
};

$(document).ready(function(){
    

    $(".load").hide();
    $(".load").css({"visibility":"visible"});
    $("#msgBienvenue").show();

    //  ----- Début de la fonction de recherche -----

    // La recherche permet de chercher un ou plusieurs mots dans tous les courriels stockés

    $("#rechercheBtn").click( function(e) {
        $.ajax({
            url: "/getLetters",
            contentType: "application/json",
            // Default methode is GET, no need to specify here
            success: function(response){
                var courriels = response;
                        //Génère la liste des courriels
                $("#result_list").html("");
                $("#result_list").animate({ scrollTop: 0 }, "fast");
                if (mots_recherche[0] !== "") {
                    for (var i = 0; i < courriels.length; i++){
                        var my_array = Object.values(courriels[i]);
                        var array_match = [];
                        for (var k = 0; k < mots_recherche.length; k++) {
                            var temp_match = my_array.join("").match(RegExp(mots_recherche[k], "ig"))
                            array_match.push(temp_match);
                        }
                        if (array_match[0] !== null){
                            match = true;
                            $("#result_list").append(
                                "<ul id='result" + i + "'>" +
                                "<li> Expéditeur :   " + surligne_texte(mots_recherche, courriels[i].from) + "</li>" +
                                "<li> Destinataire : " + surligne_texte(mots_recherche, courriels[i].to) + "</li>" +
                                "<li> Date :         " + surligne_texte(mots_recherche, courriels[i].date) + "</li>" +
                                "<li> Objet :        " + surligne_texte(mots_recherche, courriels[i].subject) + "</li>" +
                                "</ul>" +
                                "<hr>"
                            )
                        }
                    }
                }
                else {
                    $("#title_search").text("Veuillez effectuer une recherche");
                }
            }
        });
        e.preventDefault();
        $(".load").hide();
        var mots_recherche = $("#ma_recherche").val().split(" ");
        $("#ma_recherche").val("");

        $("#title_search").text("Résultat de recherche : « " + mots_recherche.join(" ") + " »");

        var match = false;


        $("#result_details").html("");

        //Détails du premier courriel affiché par défaut
        if (mots_recherche[0] !== "" && match) {
            var premier_resultat = $("#result_list ul").attr("id")[6];
            $("#result" + premier_resultat).css({'background-color': '#b6cbed'});
            $("#courriel").remove();
            $("#result_details").append(
                "<ul id='courriel'>" +
                "<li> Expéditeur :   " + surligne_texte(mots_recherche, courriels[premier_resultat].from) + "</li>" +
                "<li> Destinataire : " + surligne_texte(mots_recherche, courriels[premier_resultat].to) + "</li>" +
                "<li> Date :         " + surligne_texte(mots_recherche, courriels[premier_resultat].date) + "</li>" +
                "<li> Objet :        " + surligne_texte(mots_recherche, courriels[premier_resultat].subject) + "</li>" +
                "</ul>" +
                "<hr>" +
                "<p>" +                  surligne_texte(mots_recherche, courriels[premier_resultat].body.join("")) + "</p>"
            );
        };

        //Affiche la div à l'utilisateur
        $("#searchresult").show();

        //Quand on clique sur un courriel de la liste pour afficher les détails
        $("#result_list").on("click", "ul", function() {
            var element_num = $(this).attr('id')[6];
            $.ajax({
                url: "/getLetters",
                contentType: "application/json",
                // Default methode is GET, no need to specify here
                success: function(response){
                    var courriels = response;
                    $("#result_list ul").css({'background-color': '#8298C2'});
                    $("#result" + element_num).css({'background-color': '#b6cbed'});
                    $("#result_list ul").hover(function() {
                        $("#result_list ul").css({'background-color': '#8298C2'});
                        $("#result" + element_num).css({'background-color': '#b6cbed'});
                        $(this).css('background-color','#b6cbed')
                    });
                    if (mots_recherche[0] !== "") {
                        $("#result_details").html("");
                        $("#result_details").append(
                            "<ul id='courriel'>" +
                            "<li> Expéditeur :   " + surligne_texte(mots_recherche, courriels[element_num].from) + "</li>" +
                            "<li> Destinataire : " + surligne_texte(mots_recherche, courriels[element_num].to) + "</li>" +
                            "<li> Date :         " + surligne_texte(mots_recherche, courriels[element_num].date) + "</li>" +
                            "<li> Objet :        " + surligne_texte(mots_recherche, courriels[element_num].subject) + "</li>" +
                            "</ul>" +
                            "<hr>" +
                            "<p>" +                  surligne_texte(mots_recherche, courriels[element_num].body.join("")) + "</p>"
                        );
                    }
                }
            });        
        });
    });

    //  ----- Fin de la fonction de recherche -----

    //  ----- Début des fonctions des boutons -----

    init();

    $("#nouveau").on("click", function(){
        $(".modal").css("display", "block");
    });

    $("#inboxNouveau").on("click", function(){
        $(".modal").css("display", "block");
    });

    $(".close, #ABANDONNER").on("click", function(){
        $(".modal").css("display", "none");
        $(".modal").find("input[type=text], textarea").val("");
    });

    $("#inboxBtn").click(function() {
        $(".load").hide();
        $("#inbox").show();
    });

    $("#carnetBtn").click(function() {
        $(".load").hide();
        $(".champs").text("");
        liste_carnet();
        $("#carnet").show();
    });

    $("#affiche_ajoutBtn").click(function(){
        var x = document.getElementById("nouveauContact");
        x.style.display = "block";
    });

    $("#ajout_personne").click(function() {
        ajout_contact();
        $(".userEntry").val("");
        compact();
    });

    $("#annulerBtn").click(function() {
        compact();
        $(".userEntry").val("");
    });

    $("#aboutBtn").click(function() {
        $(".load").hide();
        $("#about").show();
    });

    $("#receptionBTN").click(function() {
        loadinbox();
    });

    $("#msgSupprBTN").click(function() {
        loadtrash();
    });

    $("#delBtn").click(function() {
        deletemessage();
    });

    $("#menuBtn").click(function() {
        $(".load").hide();
        $("#msgBienvenue").show();
    });

    //  ----- Fin des fonctions des boutons -----

});

    //  ----- Début de la fonction du carnet -----

var carnet = [{
    prenom: "Bill",
    nomFamille: "Clinton",
    courriel: "billclinton@escargotexpress.com"
},
{
    prenom: "Johanne",
    nomFamille: "Lavertu",
    courriel: "johannelavertu@escargotexpress.com"

}];

var suppWindow = true;

var liste_carnet = function (){
    $("#contacts_Prenom").html("Prénom");
    $("#contacts_Famille").html("Nom de Famille");
    $("#contacts_Courriel").html("Adresse Courriel");
    $("#contacts_Operations").html("Opérations");
    for (var x = 0; x <carnet.length; x++) {
        carnet[x].num =x;
        $("#contacts_Prenom").append("<div id='contact_prenom" + x +"'>" + carnet[x].prenom + "</div>");
        $("#contact_prenom"+ x).css({"color": "#374154", "fontSize": "medium", "textAlign":"center"});
        $("#contacts_Famille").append("<div id='contacts_Famille" + x +"'>" + carnet[x].nomFamille + "</div>");
        $("#contacts_Famille"+ x).css({"color": "#374154", "fontSize": "medium", "textAlign":"center"});
        $("#contacts_Courriel").append("<div id='contacts_Courriel" + x +"'>" + carnet[x].courriel + "</div>");
        $("#contacts_Courriel"+ x).css({"color": "#374154", "fontSize": "medium", "textAlign":"center"});
        $("#contacts_Operations").append("<div id='contacts_Operations" + x +"'>"
        + "<input type='button' class='boutonSmall' onclick='document.getElementById(\"receveur\").value=carnet["+x+"].courriel;sendMSG()' value ='Écrire'>"
        + "<input type='button'class='boutonSmall boutonRed' onclick='carnet.splice("+x+", 1); liste_carnet();' id='testnum" + x +"' value ='Supprimer'>");

    }
};

function sendMSG() {
  $(".modal").css("display", "block");
}

function compact() {
    var x = document.getElementById("nouveauContact");
    if(x.style.display === "block") {
      x.style.display = "none";
    } else {
      x.style.display = "block";
    }
}


function ajout_contact() {
    var newcarnet = {};
    newcarnet.prenom = document.newcontact.prenom.value;
    newcarnet.nomFamille = document.newcontact.nomfamille.value;
    newcarnet.courriel = document.newcontact.courriel.value;
    if (Object.values(newcarnet)[0] === "" || Object.values(newcarnet)[1] === "" || Object.values(newcarnet)[2] === ""){
        alert("Veuillez remplir tous les champs!");
        return;
    }
    carnet.push(newcarnet);
    liste_carnet();
}

    //  ----- Fin de la fonction du carnet -----


    //  ----- Début de la fonction de la fonction de la boîte de réception -----

class email {
    constructor() {
        this.inbox = [];
        this.trash = [];
        this.selectedelement = null;
    }
    createchild(header, mail) {
        let p = document.createElement("button");
        p.setAttribute("type", "button");
        p.setAttribute("class", "messageButton")
        p.setAttribute("onclick", "select(this)");
        p.innerHTML = mail.getsubject();
        header.appendChild(p);
        return p;
    }
    loadinbox() {

        this.clean();

        let header = document.getElementsByClassName("header")[0];
        this.inbox.forEach(mail => {
            let p = this.createchild(header, mail);
            mail.setelement(p);
        });

    }
    loadtrash() {

        this.clean();

        let header = document.getElementsByClassName("header")[0];
        this.trash.forEach(mail => {
            let p = this.createchild(header, mail);
            mail.setelement(p);
        });
        let restore = document.createElement("button");
        let menu = document.getElementsByClassName("menu")[0];
        restore.setAttribute("type", "button");
        restore.setAttribute("class", "btn btn-success btn-md");
        restore.setAttribute("id", "restorebutton");
        restore.setAttribute("onclick", "restore()");
        restore.innerHTML = "Restaurer";
        menu.appendChild(restore);
    }
    deletemessage() {
        if (this.selectedelement === null) {
            return;
        }
        let object = this.getselectedobject();
        if (object == null) {
            return;
        }
        if (!object.getdeleted()) {
            object.getelement().remove();
            object.deleteme();
            let index = this.inbox.findIndex(function (o) {
                return o.getelement() === object.getelement();
            });
            this.inbox.splice(index, 1);
            this.trash.push(object);
        }
        else {
            object.getelement().remove();
            let index = this.trash.findIndex(function (o) {
                return o.getelement() === object.getelement();
            });
            this.trash.splice(index, 1);
        }
        document.getElementsByClassName("content")[0].innerHTML = "";
        this.selectedelement = null;
    }
    restoremessage() {
        if (this.selectedelement === null) {
            return;
        }
        let object = this.getselectedobject();
        if (object === null) {

            return;
        }

        if (!object.getdeleted()) {

            return;
        }

        object.getelement().remove();
        object.restoreme();

        this.inbox.push(object);
        let index = this.trash.findIndex(function (o) {
            return o.getelement() == object.getelement();
        });
        this.trash.splice(index, 1);

        document.getElementsByClassName("content")[0].innerHTML = "";
        this.selectedelement = null;
    }
    select(element) {
        this.selectedelement = element;
        let object = this.getselectedobject(element);
        if (object != null) {
            document.getElementsByClassName("content")[0].innerHTML = object.getmessage();
        }
    }
    getselectedobject() {
        var object = null;
        for (var index = 0; index < this.inbox.length; ++index) {
            let mail = this.inbox[index];
            if (mail.getelement() == this.selectedelement) {
                object = mail;
                break;
            }
        }
        if (object !== null) {
            return object;
        }
        for (var index = 0; index < this.trash.length; ++index) {
            let mail = this.trash[index];
            if (mail.getelement() === this.selectedelement) {
                object = mail;
                break;
            }
        }
        return object;
    }
    clean() {
        document.getElementsByClassName("content")[0].innerHTML = "";
        if (document.getElementById("restorebutton")) {
            document.getElementById("restorebutton").remove();
        }
        this.inbox.forEach(mail => {
            if (mail.getelement() != null) {
                mail.getelement().remove();

            }
        });
        this.trash.forEach(mail => {
            if (mail.getelement() != null) {
                mail.getelement().remove();
            }
        });
    }
    mailListing(subject, body, date) {
        var mail = new envelope();
        mail.setsubject(subject);
        mail.setmessage(body);
        this.inbox.push(mail);
    }
}

class envelope {
    constructor() {

        this.element = null;
        this.deleted = false;
        this.message = null;
        this.date = null;
        this.subject = null;
    }
    setelement(element) {
        this.element = element;
    }
    setsubject(subject) {
        this.subject = subject;
    }
    setmessage(message) {
        this.message = message;
    }
    getmessage() {
        return this.message;
    }
    getdate() {
        return this.date;
    }
    getsubject() {
        return this.subject;
    }
    getelement() {
        return this.element;
    }
    getdeleted() {
        return this.deleted;
    }
    deleteme() {
        this.deleted = true;
    }
    restoreme() {
        this.deleted = false;
    }
}

var e;
function init() {
    e = new email();
    mailListing();
    e.loadinbox();

}
function loadinbox() {
    e.loadinbox();
}
function loadtrash() {
    e.loadtrash();
}
function select(element) {
    e.select(element);
}
function deletemessage() {
    e.deletemessage();
}
function restore() {

    e.restoremessage();
}

// Ici les emails qui vont apparaitre dans l'inbox, ("titre du courriel"."contenue du courriel")
function mailListing() {
    var summary = "";
    var courriel_complet = "";
    for (var i = 0; i < courriels.length; i++){
        summary = "De : " + courriels[i].from +
                      ", À : " + courriels[i].to +
                      ", Date : " + courriels[i].date +
                      ", Objet : " + courriels[i].subject;
        courriel_complet =  "De : " + courriels[i].from +
                            "\nÀ : " + courriels[i].to +
                            "\nDate : " + courriels[i].date +
                            "\nObjet : " + courriels[i].subject +
                            "\n\n" + courriels[i].body;
        e.mailListing(summary, courriel_complet);
    }
}

    //  ----- Fin de la fonction de la fonction de la boîte de réception -----

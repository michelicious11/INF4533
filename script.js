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
    var key = new NodeRSA({b: 512});
    var keyPair = key.generateKeyPair(512);
    var myPrivateKey = keyPair.exportKey("private");
    var myPublicKey = keyPair.exportKey("public");
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

// Variable utilisée pour marquer la date et le temps d'envoi d'un message

var getFormattedDate = function() {
    var date = new Date();
    var str = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " +  date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
    return str;
}

var monUser = "";
var maKeyPriv = "";
var userActuel = "";

$(document).ready(function(){

    $(".load").hide();
    $(".load").css({"visibility":"visible"});

    // Création du menu déroulant des utilisateurs
    for (var j = 0; j < carnet_contacts.length; j++){
        $("#user_list").append("<option value='" + j + "'>" + carnet_contacts[j]["nom"] + "</option>");
        //$("#user_list").append("<option>" + carnet_contacts[j]["nom"] + "</option>");
    }

    $("#msgBienvenue").show();

    //  ----- Début de la fonction de recherche -----

    // La recherche permet de chercher un ou plusieurs mots dans tous les courriels stockés

    var match = false;

    $("#rechercheBtn").click( function(e) {
        $.ajax({
            url: "/getLetters",
            data: {
                pem: monUser
            },
            contentType: "application/json",
            // Default method is GET, no need to specify here
            success: function(response){
                var courriels = response.emails;
                        //Génère la liste des courriels
                $("#result_list").html("");
                $("#result_list").animate({ scrollTop: 0 }, "fast");
                if (mots_recherche[0] !== "") {
                    for (var i = 0; i < courriels.length; i++){
                        var my_array = Object.values(decrypt_message(courriels[i], maKeyPriv));
                        var array_match = [];
                        for (var k = 0; k < mots_recherche.length; k++) {
                            var temp_match = my_array.join("").match(RegExp(mots_recherche[k], "ig"))
                            array_match.push(temp_match);
                        }
                        if (array_match[0] !== null){
                            match = true;
                            var courrielActuel = decrypt_message(courriels[i], maKeyPriv);
                            $("#result_list").append(
                                "<ul id='result" + i + "'>" +
                                "<li> Expéditeur :   " + surligne_texte(mots_recherche, courrielActuel.from) + "</li>" +
                                "<li> Destinataire : " + surligne_texte(mots_recherche, courrielActuel.to) + "</li>" +
                                "<li> Date :         " + surligne_texte(mots_recherche, courrielActuel.date) + "</li>" +
                                "<li> Objet :        " + surligne_texte(mots_recherche, courrielActuel.subject) + "</li>" +
                                "</ul>" +
                                "<hr>"
                            );
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

        $("#result_details").html("");

        //Affiche la div à l'utilisateur
        $("#searchresult").show();

        //Quand on clique sur un courriel de la liste pour afficher les détails
        $("#result_list").on("click", "ul", function() {
            var element_num = $(this).attr('id')[6];
            $.ajax({
                url: "/getLetters",
                data:{
                    pem: monUser
                },
                contentType: "application/json",
                // Default methode is GET, no need to specify here
                success: function(response){
                    var courriels = response.emails;
                    $("#result_list ul").css({'background-color': '#8298C2'});
                    $("#result" + element_num).css({'background-color': '#b6cbed'});
                    $("#result_list ul").hover(function() {
                        $("#result_list ul").css({'background-color': '#8298C2'});
                        $("#result" + element_num).css({'background-color': '#b6cbed'});
                        $(this).css('background-color','#b6cbed')
                    });
                    if (mots_recherche[0] !== "") {
                        $("#result_details").html("");
                        var courrielActuel = decrypt_message(courriels[element_num], maKeyPriv);
                        $("#result_details").append(
                            "<ul id='courriel'>" +
                            "<li> Expéditeur :   " + surligne_texte(mots_recherche, courrielActuel.from) + "</li>" +
                            "<li> Destinataire : " + surligne_texte(mots_recherche, courrielActuel.to) + "</li>" +
                            "<li> Date :         " + surligne_texte(mots_recherche, courrielActuel.date) + "</li>" +
                            "<li> Objet :        " + surligne_texte(mots_recherche, courrielActuel.subject) + "</li>" +
                            "</ul>" +
                            "<hr>" +
                            "<p>" +                  surligne_texte(mots_recherche, courrielActuel.body) + "</p>"
                        );
                    }
                }
            });        
        });
    });

    //  ----- Fin de la fonction de recherche -----

    //  ----- Début des fonctions des boutons -----


    // Fonction d'envoi de message. Le message est converti en objet JSON, envoyé au serveur, puis stocké dans le fichier courriels.JSON

    $("#send").on("click", function(e){
        if (document.getElementById("receveur").value != "" && document.getElementById("recipientsobj").value != "" && document.getElementById("modal_body").value != ""){
            var destinataire = document.getElementById("receveur").value;
            var dateActuelle = getFormattedDate();
            var objetCourriel = document.getElementById("recipientsobj").value;
            var corpsCourriel = document.getElementById("modal_body").value;
            var clef_dest;
            var colis_json = "";
            var nouveau_courriel_crypted;

            var nouveau_courriel = {
                "from": userActuel,
                "to": destinataire,
                "date": dateActuelle,
                "subject": objetCourriel,
                "body": corpsCourriel
            };

            for (var d = 0; d < carnet_contacts.length; d++){
                if (destinataire === carnet_contacts[d]["courriel"]){
                    clef_dest = carnet_contacts[d]["clef_publique"];
                    nouveau_courriel_crypted = encrypt_message(nouveau_courriel, clef_dest);
                    colis_json = {"dest": clef_dest, "msg": nouveau_courriel_crypted};
                    $.ajax({
                        type: 'POST',
                        url: '/addLetters',
                        contentType: "application/json",
                        data: JSON.stringify(colis_json),
                        success: function (response){
                            alert(response);
                        },
                        error: function(){
                            alert("error")
                        }
                        
                    });   
                }
    // Vérification d'entrées dans les champs de texte          
            };
            if (colis_json === ""){
                alert("Adresse inconnue. Veuillez consulter le carnet d'adresses.");
            }
        
            e.preventDefault();
            $(".modal").css("display", "none");
            $(".entree").val("");
            $(".modal-text").val("");
        }
        else{
            alert("Veuillez remplir tous les champs!");
        }
    });

    // Fonction de sélection d'utilisateur à la page principale. 

    $("#getUser").on("click", function(){
        userActuel = $("#user_list option:selected").text();
        $("#userChoisi").text("Utilisateur choisi! Bienvenue " + userActuel + "!");
        $("#msgPre").text("Merci! Vous pouvez changer d'utilisateur quand vous voulez");
        monUser = carnet_contacts[$("#user_list option:selected").val()]["clef_publique"];
        maKeyPriv = carnet_contacts[$("#user_list option:selected").val()]["clef_privee"];
    });
    
    // Gestion d'affichage des fenêtres

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

    $("#carnetBtn").click(function() {
        $(".load").hide();
        $(".champs").text("");
        liste_carnet();
        $("#carnet").show();
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

    //  ----- Début de la fonction de la boîte de réception -----

    $("#inboxBtn").click(function() {
        $(".load").hide();

        $.ajax({
            url: "/getLetters",
            data: {
                pem: monUser
            },
            contentType: "application/json",
            // La méthode par défaut est GET
            success: function(response){
                var courriels = response.emails;
                //Génère la liste des courriels
                $("#result_list_boite").html("");
                $("#result_list_boite").animate({ scrollTop: 0 }, "fast");
                    for (var i = 0; i < courriels.length; i++){
                        var courrielActuel = decrypt_message(courriels[i], maKeyPriv);
                        $("#result_list_boite").append(
                            "<ul id='resultB" + i + "'>" +
                            "<li> Expéditeur :   " + courrielActuel.from + "</li>" +
                            "<li> Destinataire : " + courrielActuel.to + "</li>" +
                            "<li> Date :         " + courrielActuel.date + "</li>" +
                            "<li> Objet :        " + courrielActuel.subject + "</li>" +
                            "</ul>" +
                            "<hr>"
                        );
                    }
            }
        });

        $(".load").hide();

        $("#result_details_boite").html("");

        //Quand on clique sur un courriel de la liste pour afficher les détails
        $("#result_list_boite").on("click", "ul", function() {
            var element_num = $(this).attr('id')[7];
            $.ajax({
                url: "/getLetters",
                data:{
                    pem: monUser
                },
                contentType: "application/json",
                // Default methode is GET, no need to specify here
                success: function(response){
                    var courriels = response.emails;
                    $("#result_list_boite ul").css({'background-color': '#8298C2'});
                    $("#resultB" + element_num).css({'background-color': '#b6cbed'});
                    $("#result_list_boite ul").hover(function() {
                        $("#result_list_boite ul").css({'background-color': '#8298C2'});
                        $("#resultB" + element_num).css({'background-color': '#b6cbed'});
                        $(this).css('background-color','#b6cbed')
                    });
                    $("#result_details_boite").html("");
                    var courrielActuel = decrypt_message(courriels[element_num], maKeyPriv);
                    $("#result_details_boite").append(
                        "<ul id='courriel'>" +
                        "<li> Expéditeur :   " + courrielActuel.from + "</li>" +
                        "<li> Destinataire : " + courrielActuel.to + "</li>" +
                        "<li> Date :         " + courrielActuel.date + "</li>" +
                        "<li> Objet :        " + courrielActuel.subject + "</li>" +
                        "</ul>" +
                        "<hr>" +
                        "<p>" +                  courrielActuel.body + "</p>"
                    );
                }
            });        
        });

        $("#inbox").show();
    });

    //  ----- Fin de la fonction de la boîte de réception -----

});

    //  ----- Début de la fonction du carnet -----

    // Tableau des utilisateurs et de leurs attributs
var carnet_contacts = [
  {
    "nom" : "Carmen Sandiego",
    "courriel" : "stealth_gurl@sailbox.com",
    "clef_privee" : "-----BEGIN RSA PRIVATE KEY-----\nMIIBOgIBAAJBAJSXevGXk8GffUi7uLNggmeIlq0iWT/oDzCCWN+v2O+yhEAUzjwR\nUrm+6GxOd0I1g6oHg3ZAyFXYRNtXW9ZRrOECAwEAAQJAeux1wLbsfRk7w5fITFxi\nhNPyEnh/7OZE6pRqgWIvzNpRqMm8WZX87o7lW2csAHI/WJ8i8wBbqYpOYR1szwEn\noQIhAOmTS+Ti4jpYUp2XVXSi2ZNUlP3H5Zw6QaxFp6GvgnojAiEAott/CZenCY0l\n7+Wl1TgNoe/9x/c+9fesiyiTJDPQQysCIQDkHYPgfSjePIYq/LJr3+PIPLHqDEEV\ny9t5qOlnQiaWqwIgRPkJOJrN17G723o7Xa47t9XYeZQxSiL3JIiuqKp5DbkCIHCJ\nDurqPMnOaTr9WcBP1hD+kZWAEVyc8y/1tfZubPa7\n-----END RSA PRIVATE KEY-----",
    "clef_publique" : "-----BEGIN PUBLIC KEY-----\nMFwwDQYJKoZIhvcNAQEBBQADSwAwSAJBAJSXevGXk8GffUi7uLNggmeIlq0iWT/o\nDzCCWN+v2O+yhEAUzjwRUrm+6GxOd0I1g6oHg3ZAyFXYRNtXW9ZRrOECAwEAAQ==\n-----END PUBLIC KEY-----"
  },

  {
    "nom" : "Celine Dion",
    "courriel" : "bignosebigvoice@sailbox.com",
    "clef_privee" : "-----BEGIN RSA PRIVATE KEY-----\nMIIBPAIBAAJBAKgus2KXPTd0JjW9J32OLZ81sLWjaGIHtMXS0PLpa//RerVIKyiW\nM5os2M33Zj2cdRzH5acuCfb7f/6M6AH0SaUCAwEAAQJAPMiUIL/UaiRaYvW4PhKS\nvoXjFeK3KSbr2Mt2pTRjyhLN+/YSAFi+zC8+bnMkbkrb7mBjG8uxCGqbtoBjuKHP\nQQIhAPE2wA8DwPAk2XJP0pxRIkYzcy7F+GmaTpq2BElucpKJAiEAsn3nexPVrveK\nfkYY/5pM5R9ICADNuvLeQ/i/U9aQpz0CIQDlAHCoEI08sA9MymGODCz47uGcd1DW\nmSulD8bUHCpj2QIhAKD5XaepVsCqbVO+olL69Lh6wrq9Bs3AtWW108+npeO9AiEA\ntVEiWVRRvCeop4srick9u6LuSpIh1jQ5cWIetWOl0Uo=\n-----END RSA PRIVATE KEY-----",
    "clef_publique" : "-----BEGIN PUBLIC KEY-----\nMFwwDQYJKoZIhvcNAQEBBQADSwAwSAJBAKgus2KXPTd0JjW9J32OLZ81sLWjaGIH\ntMXS0PLpa//RerVIKyiWM5os2M33Zj2cdRzH5acuCfb7f/6M6AH0SaUCAwEAAQ==\n-----END PUBLIC KEY-----"
  },

  {
    "nom" : "Hillary Clinton",
    "courriel" : "workemail@sailbox.com",
    "clef_privee" : "-----BEGIN RSA PRIVATE KEY-----\nMIIBOwIBAAJBAKR9cgpdzoPxO02dsPbAaCVdqpwLfSnVGDU2j1XUna8hqCS1Y6ac\nWvrjSMvCBS888KP7FmRMydz4E2+m4VjacK0CAwEAAQJBAI7Zjrdn/hhh4EGop+2y\n7P8+WBNKevlgYbSc3GAK1KIo6LM8QCbgnIS38+kOOCYgGROg2mVsTQwtyGOZ0MgZ\nz3UCIQD+/Lv5i+Wv+i8kldfHsaY3JPlJPNJKLsfOtXxv7deWOwIhAKUksgxpajy+\nTZOiKECXtQkHpCG7bjMD9Ljkxz+Tpt43AiBRBU1VRbZ97Cj+nv4pXbFK5FyxgLnx\nCFxEujYH+rL98QIgakjiurBBqpSEEydDJsc8wXIEhZ0+wGCkaTb8sYNS2yMCIQCH\no0YqmGUtYatMqYarcWEeTwDP/es5f8100ZOYU0WLgw==\n-----END RSA PRIVATE KEY-----",
    "clef_publique" : "-----BEGIN PUBLIC KEY-----\nMFwwDQYJKoZIhvcNAQEBBQADSwAwSAJBAKR9cgpdzoPxO02dsPbAaCVdqpwLfSnV\nGDU2j1XUna8hqCS1Y6acWvrjSMvCBS888KP7FmRMydz4E2+m4VjacK0CAwEAAQ==\n-----END PUBLIC KEY-----"
  },

  {
    "nom" : "Jason Bourne",
    "courriel" : "mattdamon2@sailbox.com",
    "clef_privee" : "-----BEGIN RSA PRIVATE KEY-----\nMIIBPAIBAAJBALpFyjnsyGcYgDQCrO5jUKDv551MKzinYqJGRob7GzbM5lI/z+zL\nxY37GsAI9SoYULM2pssXPPSohWbZXkzMse0CAwEAAQJBALewYwBEVEv2iVbA3LAp\nGDXc3tbraiPwTQAhtSMfNXMPZa4c63wFZhStO8xaqV+AzXdmyg5auNmsqsPAu83f\n4wECIQDf8n6gFMEUDB6g2hXNj3z5ne7pTjhySxJj2iVQhlwvnQIhANTu4j+Cqv/+\nKgyQkdzLGShfZmCynKDIpsw5pfhDiIKRAiBkJTHA7mcFSwIrVjsnyIHPsnOTO1p8\nqduYcYX8Q4lX9QIhAMLBM4JvW0QFDiSr3h2aTYpVp2fuNcABhj3oxFrMOgFhAiEA\n3jVk7hFOYLclK7V9ts5YAZVIVhkWlJq5fxE5GyAMfsw=\n-----END RSA PRIVATE KEY-----",
    "clef_publique" : "-----BEGIN PUBLIC KEY-----\nMFwwDQYJKoZIhvcNAQEBBQADSwAwSAJBALpFyjnsyGcYgDQCrO5jUKDv551MKzin\nYqJGRob7GzbM5lI/z+zLxY37GsAI9SoYULM2pssXPPSohWbZXkzMse0CAwEAAQ==\n-----END PUBLIC KEY-----"
  },

  {
    "nom" : "Johnny Coiffeur",
    "courriel" : "coiffurejohnny@sailbox.com",
    "clef_privee" : "-----BEGIN RSA PRIVATE KEY-----\nMIIBOgIBAAJBAKy33rRZsIpwoqlkb+RLLNDIVLSULKDQGnWjWNqRd2iL/ujTNVEd\nfpprQ1t482fIJE3lBfVsGqTxZZ7nCwjwvF8CAwEAAQJASjClCgUorx7Y0DhjU8Xy\n1y/mKrcnQGCDrRpgVWp8xzv8Ca+KeBoxqJIqtwFw41gbDTwIdXa9Gvo6aUyJ829c\nqQIhAPnTonlQJe00fJEzcEDdxJX1eCm+7TE4VFqTNsu6AOAdAiEAsPx1gm8fnop2\nvvMm6slMPUMJKuEDGCaf2X9tCFrK3asCIHggnJqKwIHr4A4N1udJ+9JDw3EHXpRx\nSpZ2/T0/Bla9AiAnP/W3dXlnqYFoG3h3/ShhNaqkzb3n7zjn/TBq9+ehfQIhAPAd\nTWeEv4ob1hzhHARJav4+SOQ/pYHdhsraWr+54Equ\n-----END RSA PRIVATE KEY-----",
    "clef_publique" : "-----BEGIN PUBLIC KEY-----\nMFwwDQYJKoZIhvcNAQEBBQADSwAwSAJBAKy33rRZsIpwoqlkb+RLLNDIVLSULKDQ\nGnWjWNqRd2iL/ujTNVEdfpprQ1t482fIJE3lBfVsGqTxZZ7nCwjwvF8CAwEAAQ==\n-----END PUBLIC KEY-----"
  }
];

// Création de la liste des contacts et des opérations disponibles dans la section carnet

var suppWindow = true;
var liste_carnet = function (){
    $("#contacts_Prenom").html("Prénom");
    $("#contacts_Famille").html("Nom de Famille");
    $("#contacts_Courriel").html("Adresse Courriel");
    $("#contacts_Operations").html("Opérations");
    for (var x = 0; x <carnet_contacts.length; x++) {
        $("#contacts_Prenom").append("<div id='contact_prenom" + x +"'>" + carnet_contacts[x]["nom"] + "</div>");
        $("#contact_prenom"+ x).css({"color": "#374154", "fontSize": "medium", "textAlign":"center"});
        $("#contacts_Courriel").append("<div id='contacts_Courriel" + x +"'>" + carnet_contacts[x]["courriel"] + "</div>");
        $("#contacts_Courriel"+ x).css({"color": "#374154", "fontSize": "medium", "textAlign":"center"});
        $("#contacts_Operations").append("<div id='contacts_Operations" + x +"'>"
        + "<input type='button' class='boutonSmall' onclick='document.getElementById(\"receveur\").value=carnet_contacts["+x+"][\"courriel\"];sendMSG()' value ='Écrire'>"
        + "<input type='button' class='boutonSmall boutonRed' onclick='carnet_contacts.splice("+x+", 1); liste_carnet();' id='testnum" + x +"' value ='Supprimer'>"
        + "<input type='button' class='boutonSmall' onclick='showPublicKey(" + x + ")'  value ='Clef Publique'>" );
    }
};

// Fonction d'envoi de message à partir du carnet d'adresses

function sendMSG() {
    $(".modal").css("display", "block");
  }

// Fonctions d'affichage des clefs publiques

function showPublicKey(x) {
    $("#keyshare").html("");
    $("#keyshare").show();
    $("#keyshare").html("<pre>" + carnet_contacts[x]["clef_publique"] + "</pre>");
    $("#keyshare").append("<button type=\"button\" class=\"boutonKey\" onclick =\"compact()\">Fermer</button>");
}

function compact() {
    var x = document.getElementById("keyshare");
    if(x.style.display === "block") {
      x.style.display = "none";
    } else {
      x.style.display = "block";
    }
}


    //  ----- Fin de la fonction du carnet -----

"use strict";
var socket = io.connect("http://localhost:3000");
var doc = document.getElementById("amisRajouter");
socket.emit("startSocket");

socket.on("startSocketFriends", user => {
    socket.emit("startFriend", user);
    
});

//********************** Function for adding somme friend  *******************/
var functions = {
    // function when you want to add a friend in your tchat
    rajouter: function (element) {
        var userFriendId = element.getAttribute("data-id");
        var userName = element.getAttribute("data-pseudo");
        element.value = "EN ATTENTE";
        element.setAttribute("onclick", "");
        console.log(userFriendId);
        socket.emit("ajouter", userFriendId, userName);
    },

}
//********************** Fonction Constructeur - creation list of friends  *******************/
var ListeFriendConstructeur = function (x, id, pseudo, image) {
    //LI friends creation
    this.nouveau = document.createElement("LI");
    this.where = document.getElementById("affichageFriendsList").appendChild(this.nouveau).classList.add("listeFriends");
    this.name = document.getElementsByClassName("listeFriends")[x];
    //creation image from friends
    this.newImage = document.createElement("span");
    this.where1 = this.name.appendChild(this.newImage).classList.add("image");
    this.ajout = this.newImage.style.backgroundImage = "url(/images/pic/" + image + ")";
    //creation pseudo 
    this.pseudo = document.createElement("h6");
    this.where2 = this.name.appendChild(this.pseudo).classList.add("pseudo");
    this.ajoutTitle = this.pseudo.innerHTML = pseudo;
    //creation button to remove friend.buttonProfile
    this.button2 = document.createElement("input");
    this.attrNo = this.button2.setAttribute("type", "button");
    this.attr = this.button2.setAttribute("data-id", id);
    this.attr = this.button2.setAttribute("data-pseudo", pseudo);
    this.whereno = this.name.appendChild(this.button2);
    this.Class2 = this.button2.classList.add("bbuttonProfile");
    this.buttonText2 = this.button2.value = "AJOUTER";
    this.click = this.button2.setAttribute("onclick", "functions.rajouter(this)");
}
//********************** list of friends  *******************/
socket.on('friends', function (data) {
    console.log("friends", data);
    var myList2 = document.getElementById("affichageFriendsList");
    myList2.innerHTML = "";
    if (data.length !== 0) {

        for (var i = 0; i < data.length; i++) {

            if (data[i].image === undefined || data[i].image === "" || data[i].image === "unconnue.png") {
                data[i].image = "inconnue.png";
            }
            console.log("onfriends2", data[i], data[i].image);
            console.log("hello", i, data[i].pseudo, data[i].image);
            var li = li + i;
            li = new ListeFriendConstructeur(i, data[i].id, data[i].pseudo, data[i].image);
        }
    }
});

//********************** Fonction Constructeur - creation list des amis que l'on ajoute  *******************/

var ListeADD= function ( y, id, pseudo) {
    //LI friends creation
    this.nouveau10 = document.createElement("LI");
    this.where10 = document.getElementById("amisRajouter").appendChild(this.nouveau10).classList.add("listeF");
    this.name10 = document.getElementsByClassName("listeF")[y];
    this.attr10 = this.name10.setAttribute("data-id", id);
    //creation pseudo 
    this.pseudo10 = document.createElement("h6");
    this.where210 = this.name10.appendChild(this.pseudo10).classList.add("pseudo");
    this.ajoutTitle10 = this.pseudo10.innerHTML = pseudo;

}


var ind = 0;
//********************** ajout des amis pour la messagerie  *******************/
socket.on('ajout', function (id, pseudo) {
    console.log('idddddddddddddd')
    var d = d + ind;
    d = new ListeADD(ind, id, pseudo);
    ind++
});

var te = document.getElementById("te");
var id1 = document.getElementById("ids");
var p1 = document.getElementById("pseud");
var f2 = document.getElementById("formulaireMessageriePrivee");


//********************** gestion duformulaire  *******************/
f2.addEventListener("submit", function(event) {

    console.log("hello");
    event.preventDefault();
    var text = te.value.trim();
    var pseudo = p1.value;
    var myId = id1.value;

    if (text != '' || lis == 0){

        var tableauAjout =[];
        var lis = document.getElementById('amisRajouter').getElementsByClassName("listeF").length;
        var lis2 = document.getElementById('amisRajouter');
        console.log(lis)
        for (var index = 0; index < lis; index++) {
            console.log(lis);

            var listeId = listeId + index;
            var listeId = lis2.getElementsByClassName('listeF')[index].getAttribute("data-id");
            tableauAjout.push(listeId);
            if (tableauAjout.length = lis ) {
                console.log("creation", tableauAjout);
                socket.emit("creation", tableauAjout, text, pseudo, myId);
                ind = 0;
                socket.emit("startSocket");
                var doc = document.getElementById("amisRajouter");
                doc.innerHTML = '';
            }
        }

    } else {

        ind = 0;
        socket.emit("startSocket");

        var doc2 = document.getElementById("amisRajouter");
        doc2.innerHTML = '';
        console.log("onedeconnect");
        document.getElementById("red").innerHTML = "Vous n'avez pas rentrer de texte ou vous n'avez pas selectionner d'amis";

    }
});


//********************** reponse concernat l'ajout dans la base de données *******************/
socket.on("ajoutm", function(data) {
    document.getElementById("amisRajouter").innerHTML = '';
        ind=0;
    document.getElementById("red").innerHTML = data;
    socket.emit("startSocket");
});
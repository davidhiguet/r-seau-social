"use strict";
var socket = io.connect("http://localhost:3000");
// for the waiting part
var changement = false;
///////////////////////////////////////  list of function for the messagerie  /////////////////////////////////////////
var functions = {
    // function when you ask for friends
    askForDiscussion: function(element) {
        var userFriendId = element.getAttribute("data-id");
        console.log(userFriendId);
        socket.emit("askForDiscussion", userFriendId);
    },
    // function when you want to answer YES
    yesToDiscussion: function(element) {
        var userFriendId = element.getAttribute("data-id");
        console.log(userFriendId);
        socket.emit("YesForDiscussion", userFriendId);
    },
    // function when you send a message
    message: function() {
        let form = document.getElementById("formulaire");
        var roomId = form.getAttribute("roomId");
        var obj = {
        user: p.value,
        text: t.value,
        roomId: roomId
        };
        socket.emit("message", { obj });
        t.value = "";
    },
    // function when you removing from the discussion
    remove: function() {
        let form = document.getElementById("formulaire");
        var roomId = form.getAttribute("roomId");
        var obj = {
        user: p.value,
        text: t.value,
        roomId: roomId
        };
        socket.emit("remove", { obj });
        t.value = "";
    }
};
///////////////////////////////////////  On start  /////////////////////////////////////////
socket.emit("startSocket");
socket.on("startSocket", user => {
    console.log(user._id)
    socket.emit("memberSearch", user);
});

///////////////////////////////////////  Friend part  /////////////////////////////////////////
var ListeMessagerieConstructeur = function (x, id, pseudo, image, button) {
    //creation of li for each member
    this.nouveau = document.createElement("LI");
    this.where = document.getElementById("messagerieList").appendChild(this.nouveau).classList.add("listeMessagerie");
    this.name = document.getElementsByClassName("listeMessagerie")[x];
    /*the photo for each member*/
    this.newImage = document.createElement("span"); 
    this.where1 = this.name.appendChild(this.newImage).classList.add("image");
    this.ajout = this.newImage.style.backgroundImage = "url(/images/pic/" + image + ")";
    /*pseudo for each member*/
    this.pseudo = document.createElement("h6"); 
    this.where2 = this.name.appendChild(this.pseudo).classList.add("pseudo");
    this.ajoutTitle = this.pseudo.innerHTML = pseudo;
    
    this.button = document.createElement("input"); 
    this.attr1 = this.button.setAttribute("type", "button");
    this.where3 = this.name.appendChild(this.button);
    if (button === "asked") {/*for people who you ask to discuss with */
        this.buttonText = this.button.value = "En attente";
        this.attr = this.button.setAttribute("data-id", id);
        this.where3 = this.button.classList.add("buttonWait");
        this.attr = this.button.setAttribute("data-id", id);
    }
    if (button === "received") {/*for people who want to discuss with you*/
        this.buttonText = this.button.value = "ACCEPTER";
        this.attr = this.button.setAttribute("data-id", id);
        this.class = this.button.classList.add("buttonAccept");
        this.click = this.button.setAttribute("onclick", "functions.yesToDiscussion(this)");

    }
    if (button === "") {/*for people who you want to discuss with*/
        this.attr = this.button.setAttribute("data-id", id);
        this.whereno = this.name.appendChild(this.button);
        this.Class = this.button.classList.add("discussion");
        this.buttonText = this.button.value = "DISCUSSION";
        this.click = this.button.setAttribute("onclick", "functions.askForDiscussion(this)");
    }
    if (button === "online") {/*for people who is online with you*/
      this.buttonText = this.button.value = "ONLINE";
      this.where3 = this.button.classList.add("buttonOnline");
    }
};


//********************** list of member *******************/
socket.on("memberSearch", function(data) {
    //console.log("friendsReceived", data);
        var myList1 = document.getElementById("messagerieList");
        myList1.innerHTML = "";
        document.getElementById("messageError").innerHTML = "";
    if (data.length !== 0) {
        for (var i = 0; i < data.length; i++) {
        if (
            data[i].image === undefined ||
            data[i].image === "" ||
            data[i].image === "unconnue.png"
        ) {
            data[i].image = "inconnue.png";
        }
        var li = li + i;
            li = new ListeMessagerieConstructeur(i, data[i].id, data[i].pseudo, data[i].image, data[i].kind);
        }
    }
});


/************** list of friends  *******************/
socket.on("discussion", function(idFromFriend) {
    console.log("discussion", idFromFriend)
    socket.emit("discussion", idFromFriend);
});
/************** list of phase between the first coming in the discusion and the other **************/
var phase = {
    //when the first coming
    one: function() {
        /*ANIMATED DOT ON WAITING MESSAGE*/
        var points = [" .", " . .", " . . ."];
        var evo = 0;
        var functionInterval1 = setInterval(interVal1, 1000);

        function interVal1() {
        if (changement) {
            clearInterval(functionInterval1);
        }
        if (evo === 3) {
            evo = 0;
        }
        document.getElementById("message").innerHTML = points[evo];
        evo++;
        }
    },
    //when the second coming
    two: function(roomId) {
        /*ANIMATED 3 2 1 START*/
        changement = false;
        document.getElementById("waitingMessage").style.display = "none";
        document.getElementById("message").style.display = "none";
        let form = document.getElementById("formulaire");
        form.style.display = "block";
        form.setAttribute("roomId", roomId);
        document.getElementById("btnDeconnection").style.display = "block";
    }
};
//when the first joigning the room
socket.on('joinRoom', function (data) {
    document.getElementById("mred").innerHTML = "";
    console.log('Joined room:', data);
    phase.one();

});
//when the other joigning the room
socket.on("openDiscussionPart", function(data) {
  document.getElementById("play").style.display = "block";
  console.log(data);
});

/*two people in the room */
socket.on("roomFull", function(roomId) {
    document.getElementById("mred").innerHTML = "";
    console.log("roomFull");
    phase.two(roomId);
    socket.emit("reStartList");
});

/***************************  about formulaire to send message inside the room ****************************/
var t = document.getElementById('texte');
var p = document.getElementById('pseudo');
var f = document.getElementById('formulaire');

f.addEventListener('submit', function (event) {
    console.log("hello")
    event.preventDefault();
    functions.message()
});
/* constructor creation of message send */
var CreationMesssage= function (  pseudo, message) {
    //creation when you asearch for friends
    this.name = document.getElementById("listeMessage");

    this.pseudo = document.createElement("h6"); //creation image for sprite coins
    this.where2 = this.name.appendChild(this.pseudo).classList.add("pseudo");
    this.ajoutTitle = this.pseudo.innerHTML = pseudo + ": " + message;

}
/* when message is message send */
socket.on('message', function (data) {
    console.log("message", data);
    document.getElementById("messageError").innerHTML = "";
    document.getElementById("red").innerHTML = "";
    let li = new CreationMesssage( data[0].user, data[0].text);
});
/* when one people leave the room */
socket.on("oneDeconnect", function(data) {
    console.log("onedeconnect", data);
    document.getElementById("red").innerHTML = data + " s'est deconnecté.";
    socket.emit("exitMember", data);
});
/* when one people leave the room before you answer */
socket.on("roomDeconnectionBefore", function(err) {
    console.log("roomDeconnected");
    document.getElementById("mred").innerHTML = err;
});
socket.on("roomDeconnected", function (err) {
    console.log("roomDeconnected");
    document.getElementById("play").style.display = "none";
});

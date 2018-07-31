'use strict';
var socket = io.connect("http://localhost:3000");

window.onbeforeunload = function() {
  socket.disconnect();
};

socket.emit("startSocket");

socket.on("startSocket", (user) => {
    socket.emit("connected", user);
    
});

socket.on("startSocketFriends", (user) => {
    socket.emit("startFriend", user);
    socket.emit("startFriendReceived", user);
    socket.emit("memberSearch", user);
});

socket.on("startSocketAnnexe", (user) => {
    socket.emit("startListSharing", user);
});

socket.on("startSocketMessage", user => {
    socket.emit("startMessage", user);
});
///////////////////////////////////////  Friend part  /////////////////////////////////////////

//********************** Function for asking or answering to a friend  *******************/
var functions = {
    // function when you ask for friends
    askForFriend: function(element) {
        var userFriendId = element.getAttribute("data-id");
        console.log(userFriendId);
        socket.emit("askForFriend", userFriendId);
    },
    // function when you want to answer YES
    yesToFriend: function(element) {
        var userFriendId = element.getAttribute("data-id");
        console.log(userFriendId);
        socket.emit("YesToFriend", userFriendId);
    },
    // function when you want to answer NO
    noToFriend: function(element) {
        var userFriendId = element.getAttribute("data-id");
        console.log(userFriendId);
        socket.emit("NoToFriend", userFriendId);
    },
    // function when you want to remove a friend
    removeFriend: function(element) {
        var userFriendId = element.getAttribute("data-id");
        console.log(userFriendId);
        socket.emit("removeFriend", userFriendId);
    },
    removeMember: function(element) {
        var userFriendId = element.getAttribute("data-id");
        var userName = element.getAttribute("pseudo");
        console.log(userFriendId);
        socket.emit("removeMember", userFriendId, userName);
    },
    removeMessage: function(element) {
        var messageId = element.getAttribute("data-id");
        console.log(messageId);
        socket.emit("removeMessage", messageId);
    },
    comment: function(element) {
        var userFriendId = element.getAttribute("data-id");
        var userName = element.getAttribute("pseudo");
        console.log(userFriendId);
        socket.emit("removeComment", userFriendId, userName);
    },
    askForFriendFromSharing: function (element) {
        var userFriendId = element.getAttribute("data-id");
        var userName = element.getAttribute("pseudo");
        element.value = "EN ATTENTE";
        element.setAttribute("onclick", "");
        console.log(userFriendId);
        socket.emit("askForSharing", userFriendId);
    },
};
//********************** Fonction Constructeur - creation list from search friends  *******************/
var ListeSearchFriendConstructeur = function (x, id, pseudo, image, button) {
  //creation when you asearch for friends

  this.nouveau = document.createElement("LI");
  this.where = document.getElementById("affichageResult").appendChild(this.nouveau).classList.add("listeSearch");
  this.name = document.getElementsByClassName("listeSearch")[x];

  this.newImage = document.createElement("span"); //creation image for sprite coins
  this.where1 = this.name.appendChild(this.newImage).classList.add("image");
  this.ajout = this.newImage.style.backgroundImage = "url(/images/pic/" + image + ")";

  this.pseudo = document.createElement("h6"); //creation image for sprite coins
  this.where2 = this.name.appendChild(this.pseudo).classList.add("pseudo");
  this.ajoutTitle = this.pseudo.innerHTML = pseudo;

  this.button = document.createElement("input"); //creation image for sprite coins
  this.attr1 = this.button.setAttribute("type", "button");
  this.where3 = this.name.appendChild(this.button);

    if (button === "asked") {
        this.buttonText = this.button.value = "En attente";
        this.attr = this.button.setAttribute("data-id", id);
        this.attr2 = this.button.setAttribute("friendship", "wait");
        this.where3 = this.button.classList.add("buttonWait");
        this.attr = this.button.setAttribute("data-id", id);
    }
    if (button === "received") {
        this.buttonText = this.button.value = "yes";
        this.attr = this.button.setAttribute("data-id", id);
        this.attr2 = this.button.setAttribute("friendship", "accept");
        this.class = this.button.classList.add("buttonAccept");
        this.click = this.button.setAttribute("onclick", "functions.yesToFriend(this)");

        //creation image for sprite coins
        this.button2 = document.createElement("input"); 
        this.attrNo = this.button2.setAttribute("type", "button");
        this.whereno = this.name.appendChild(this.button2);
        this.Class2 = this.button2.classList.add("buttonRefuse");
        this.buttonText2 = this.button2.value = "no";
        this.click = this.button2.setAttribute("onclick", "functions.noToFriend(this)");
    } 
    if (button === "" ){
        this.buttonText = this.button.value = "Ajouter";
        this.attr = this.button.setAttribute("data-id", id);
        this.attr2 = this.button.setAttribute("friendship", "ask");
        this.where3 = this.button.classList.add("buttonAsk");
        this.click = this.button.setAttribute("onclick", "functions.askForFriend(this)");
    }
    if (button === "friend") {
        this.buttonText = this.button.value = "AMIS";
        this.attr2 = this.button.setAttribute("friendship", "friends");
        this.where3 = this.button.classList.add("buttonFriends");
    }
};
//********************** Fonction Constructeur - creation list of possible friends  *******************/
var ListeFriendReceivedConstructeur = function (x, id, pseudo, image) {

        //LI friends ask creation
        this.nouveau = document.createElement("LI");
        this.where = document.getElementById("affichageListReceived").appendChild(this.nouveau).classList.add("listeReceived");
        this.name = document.getElementsByClassName("listeReceived")[x];
        //creation image inside the LI element
        this.newImage = document.createElement("span"); 
        this.where1 = this.name.appendChild(this.newImage).classList.add("image");
        this.ajout = this.newImage.style.backgroundImage = "url(/images/pic/" + image + ")";
        //creation of pseudo part
        this.pseudo = document.createElement("h6"); 
        this.where2 = this.name.appendChild(this.pseudo).classList.add("pseudo");
        this.ajoutTitle = this.pseudo.innerHTML = pseudo;
        //creation for yes button
        this.button = document.createElement("input"); 
        this.attr1 = this.button.setAttribute("type", "button");
        this.where3 = this.name.appendChild(this.button);
        this.buttonText = this.button.value = "yes";
        this.attr = this.button.setAttribute("data-id", id);
        this.attr2 = this.button.setAttribute("friendship", "accept");
        this.class = this.button.classList.add("buttonAccept");
        this.click = this.button.setAttribute("onclick", "functions.yesToFriend(this)");
        //creation for NO button
        this.button2 = document.createElement("input");
        this.attrNo = this.button2.setAttribute("type", "button");
        this.attr = this.button2.setAttribute("data-id", id);
        this.whereno = this.name.appendChild(this.button2);
        this.Class2 = this.button2.classList.add("buttonRefuse");
        this.buttonText2 = this.button2.value = "no";
        this.click = this.button2.setAttribute("onclick", "functions.noToFriend(this)");
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
        //creation button for watching profile
        this.a = document.createElement("a"); 
        this.where3 = this.name.appendChild(this.a);
        this.aText = this.a.innerHTML = "Profile";
        this.attr = this.a.setAttribute("data-id", id);
        this.Class2 = this.a.classList.add("buttonProfile");
        this.href = this.a.setAttribute("href", "/profile/friend/" + id);
        //creation button to remove friend.buttonProfile
        this.button2 = document.createElement("input");
        this.attrNo = this.button2.setAttribute("type", "button");
        this.attr = this.button2.setAttribute("data-id", id);
        this.whereno = this.name.appendChild(this.button2);
        this.Class2 = this.button2.classList.add("buttonRemove");
        this.buttonText2 = this.button2.value = "Supprimer";
        this.click = this.button2.setAttribute("onclick", "functions.removeFriend(this)");
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
//********************** list of possible friends  *******************/
socket.on('friendsReceived', function (data) {
    console.log("friendsReceived", data);
    var myList1 = document.getElementById("affichageListReceived");
    myList1.innerHTML = "";
    if (data.length !== 0) {

        for (var i = 0; i < data.length; i++) {

            if (data[i].image === undefined || data[i].image === "" || data[i].image === "unconnue.png") {
                data[i].image = "inconnue.png";
            }
            console.log("onfriendsReceived2", data[i], data[i].image);
            console.log("hellofriendsReceived", i, data[i].pseudo, data[i].image);
            var li = li + i;
            li = new ListeFriendReceivedConstructeur(i, data[i].id, data[i].pseudo, data[i].image);
        }
    }
});
//********************** Friends search on submit  *******************/
var verificationFormulaire = document.getElementById("friendFormulaire");
verificationFormulaire.addEventListener('submit', function (event) {
    event.preventDefault();

    var myList = document.getElementById("affichageResult");
    myList.innerHTML = '';
    console.log("click", document.getElementById("friendSearch").value); 
    var myId = document.getElementById("myId").value;
    var pseudoSearch = document.getElementById("friendSearch").value.trim().toUpperCase();
    if (pseudoSearch === '') {
        var messageResult = document.getElementById("messageResult");
        messageResult.innerHTML = "";
        var messageError = document.getElementById("messageError");
        messageError.innerHTML = "Veuillez rentrer un pseudo";
    } else {
        var data={
            myId : myId,
            pseudoSearch : pseudoSearch.toUpperCase()
        }
        socket.emit('friendSearch', data); 
    }
});
//********************** result from Friends search   *******************/
socket.on('friendSearch', function (result) {

    console.log('onfriends', result);
    var resultSearch = result;
    if (resultSearch.length === 0) {
        console.log("onfriends2", resultSearch);
        var messageError = document.getElementById("messageError");
        messageError.innerHTML = "";
        var messageResult = document.getElementById("messageResult");
        messageResult.innerHTML = "Il n'y a pas de resultat pour ce pseudonyme";
    } else {
        var messageError = document.getElementById("messageError");
        messageError.innerHTML = "";
        var messageResult = document.getElementById("messageResult");
        messageResult.innerHTML = "";
        let u;
        
        for (var i = 0; i < resultSearch.length; i++) {
            u = resultSearch[i];

            if (resultSearch[i].image === undefined || resultSearch[i].image === "" || resultSearch[i].image === "unconnue.png") {
              resultSearch[i].image = "inconnue.png";
            }
        console.log("onfriends2", resultSearch[i], resultSearch[i].image);
        console.log("hello", i, resultSearch[i].pseudo, resultSearch[i].image);
        var li = li+ i;
            li = new ListeSearchFriendConstructeur(i, resultSearch[i].id, resultSearch[i].pseudo, resultSearch[i].image, resultSearch[i].relation);
            
        }
    }
});
//********************** when you ask for friendship *******************/
socket.on("askForFriend", function (result) {
    console.log("addfriends", result);
    var myList = document.getElementById("affichageResult");
    myList.innerHTML = "";
    var messageError = document.getElementById("messageError");
    messageError.innerHTML = "";
    var messageResult = document.getElementById("messageResult");
    messageResult.innerHTML = "La demande a été efféctuer";
});    



///////////////////////////////////////  Message Part  /////////////////////////////////////////

//********************** Fonction Constructeur - creation list of message  *******************/
var ListeMessageConstructeur = function (x, id, pseudo, date,  image, text, del) {
    //LI friends creation
    this.nouveau = document.createElement("LI");
    this.where = document.getElementById("affichageMessageList").appendChild(this.nouveau).classList.add("listMessage");
    this.name = document.getElementsByClassName("listMessage")[x];
    //creation image from friends
    this.newImage = document.createElement("span");
    this.where1 = this.name.appendChild(this.newImage).classList.add("image");
    this.ajout = this.newImage.style.backgroundImage = "url(/images/pic/" + image + ")";
    //creation pseudo 
    this.pseudo = document.createElement("h6");
    this.where2 = this.name.appendChild(this.pseudo).classList.add("pseudo");
    this.ajoutTitle = this.pseudo.innerHTML = "Message publié par "+pseudo;
    //creation message 
    this.text = document.createElement("P");
    this.where2 = this.name.appendChild(this.text).classList.add("text");
    this.ajoutTitle = this.text.innerHTML = text;
    //creation ul for comment
    this.ul= document.createElement("ul");
    this.where2 = this.name.appendChild(this.ul).classList.add("comment");
    this.attr = this.ul.setAttribute("data-id", date);
    //creation button for watching profile
    this.button = document.createElement("input");
    this.attr1 = this.button.setAttribute("type", "text");
    this.where3 = this.name.appendChild(this.button);
    this.buttonText = this.button.value = "Votre commentaire";
    this.attr = this.button.setAttribute("data-id", id);
    this.where3 = this.button.classList.add("commentaire");
    
    //creation button to remove friend
    this.button2 = document.createElement("input");
    this.attrNo = this.button2.setAttribute("type", "button");
    this.attr2 = this.button2.setAttribute("data-id", date);
    this.whereno = this.name.appendChild(this.button2);
    this.Class2 = this.button2.classList.add("buttonRemove");
    this.buttonText2 = this.button2.value = "Commenter";
    this.click = this.button2.setAttribute("onclick", "functions.comment(this)");
    if(del === "yes") {
        this.button3 = document.createElement("input");
        this.attrNo = this.button3.setAttribute("type", "button");
        this.attr2 = this.button3.setAttribute("data-id", date);
        this.attr3 = this.button3.setAttribute("pseudo", pseudo);
        this.whereno = this.name.appendChild(this.button3);
        this.Class3 = this.button3.classList.add("delete");
        this.buttonText3 = this.button3.value = "Supprimer le message";
        this.click = this.button3.setAttribute("onclick", "functions.removeMessage(this)");
    }
    
}
//********************** list of message  *******************/
socket.on("messagesDispatch", function(data) {
    console.log("messagesDispatch", data);
    var myListMessage = document.getElementById("affichageMessageList");
    myListMessage.innerHTML = "";
    console.log("messagesDispatch1");
  if (data.length !== 0) {
      console.log("messagesDispatch2");
    for (var i = 0; i < data.length; i++) {
        console.log("messagesDispatch3");
        console.log("hellomess", data[i].deleteMes);
        var li = li + i;
        li = new ListeMessageConstructeur(i, data[i].Id, data[i].creator, data[i].date, data[i].image, data[i].text, data[i].deleteMes);
        /*if (data.commentaire.length != 0){
            for (var i = 0; i < data.length; i++) {
                var reaction = reaction + i;
                reaction = new ListeMessageConstructeur(i, data[i].date, data[i].creator, data[i].date, data[i].image, data[i].text);
            }
        }*/
    }
  }
});
//********************** when you create a message on your wall *******************/
var verificationFormulaire2 = document.getElementById("messageCreation");
verificationFormulaire2.addEventListener('submit', function (event) {
    event.preventDefault();

    console.log("clickmessageCreation", document.getElementById("textCreate").value);
    var messageCreatorId = document.getElementById("messageCreatorId").value;
    var messageCreator = document.getElementById("messageCreator").value;
    var textCreate = document.getElementById("textCreate").value.trim();
    var imageCreator = document.getElementById("imageCreator").value;
    if (textCreate === "") {
      var messageCreationError = document.getElementById("messageError");
      messageCreationError.innerHTML = "Vous n'avez rien écris !!!";
    } else {
      var data = { id: messageCreatorId, pseudo: messageCreator, message: textCreate, image: imageCreator };
      socket.emit("createMessage", data);
    }
});

socket.on("messageCreate", function(creator) {

    socket.emit("startMessage", creator);
    /*
  var newPost = $(data.html);
  $("#postCarousel .carousel-inner .active").removeClass("active");
  $("#postCarousel .carousel-inner").prepend(newPost);
  $("#postCount").text($(".carousel-item").length);
});
$('.commentPost').on('submit', function (e) {
    var postId = '&postId=' + this.action.split('/').pop();
    e.preventDefault();
    var $commentText = $(this).find('.commentText');
    if ($commentText.val().trim() === '') {
        return;
    }
    socket.emit('commentPost', $(this).serialize() + postId);
    $commentText.val('');
    */
});
/*
socket.on('commentPost', function (data) {
    $('#postCarousel .carousel-inner .active').removeClass('active');
    $('#post' + data.postId).replaceWith(data.html);
});
$('a.deletePost').click(function (e) {
    e.preventDefault();
    var postId = this.href.split('/').pop();
    socket.emit('deletePost', postId);
});
socket.on('deletePost', function (postId) {
    $('#post' + postId).remove();
    $('.carousel-item').first().addClass('active');
    $('#postCount').text($('.carousel-item').length);
});
$('.friendA').click(function (e) {
    if ($(e.target).hasClass('btn') || $(e.target).parents().hasClass('btn')) {
        e.preventDefault();
    }
});
*/
//********************** Fonction Constructeur - creation list of member  *******************/
var ListeMemberConstructeur = function (x, id, pseudo, image) {
    //LI friends creation
    this.nouveau = document.createElement("LI");
    this.where = document.getElementById("affichageMemberList").appendChild(this.nouveau).classList.add("listeMember");
    this.name = document.getElementsByClassName("listeMember")[x];
    //creation image from friends
    this.newImage = document.createElement("span");
    this.where1 = this.name.appendChild(this.newImage).classList.add("image");
    this.ajout = this.newImage.style.backgroundImage = "url(/images/pic/" + image + ")";
    //creation pseudo 
    this.pseudo = document.createElement("h6");
    this.where2 = this.name.appendChild(this.pseudo).classList.add("pseudo");
    this.ajoutTitle = this.pseudo.innerHTML = pseudo;
    //creation button for watching profile
    this.a = document.createElement("a");
    this.where3 = this.name.appendChild(this.a);
    this.aText = this.a.innerHTML = "Profile";
    this.attr = this.a.setAttribute("data-id", id);
    this.Class2 = this.a.classList.add("buttonProfile");
    this.href = this.a.setAttribute("href", "/profile/friend/" + id);
    //creation button to remove friend.buttonProfile
    this.button2 = document.createElement("input");
    this.attrNo = this.button2.setAttribute("type", "button");
    this.attr = this.button2.setAttribute("data-id", id);
    this.attr1 = this.button2.setAttribute("pseudo", pseudo);
    this.whereno = this.name.appendChild(this.button2);
    this.Class2 = this.button2.classList.add("delete");
    this.buttonText2 = this.button2.value = "Supprimer";
    this.click = this.button2.setAttribute("onclick", "functions.removeMember(this)");
}
//********************** list of friends  *******************/
socket.on('memberSearch', function (data) {
    console.log("friends", data);
    var myList2 = document.getElementById("affichageMemberList");
    myList2.innerHTML = "";
    if (data.length !== 0) {

        for (var i = 0; i < data.length; i++) {

            if (data[i].image === undefined || data[i].image === "" || data[i].image === "unconnue.png") {
                data[i].image = "inconnue.png";
            }
       
            var li = li + i;
            li = new ListeMemberConstructeur(i, data[i].id, data[i].pseudo, data[i].image);
        }
    }
});

socket.on('memberRemove', function (data, user) {
    var messageResult = document.getElementById("messageResult");
    messageResult.innerHTML = data;
    socket.emit("memberSearch", user);
})



//********************** Fonction Constructeur - creation list for sharing list friend  *******************/
var ListeSharingListFriendConstructeur = function (x, id, pseudo, image) {
    //creation when you asearch for friends

    this.nouveau = document.createElement("LI");
    this.where = document.getElementById("affichageFriendsList").appendChild(this.nouveau).classList.add("listeFriends");
    this.name = document.getElementsByClassName("listeFriends")[x];

    this.newImage = document.createElement("span"); //creation image for sprite coins
    this.where1 = this.name.appendChild(this.newImage).classList.add("image");
    this.ajout = this.newImage.style.backgroundImage = "url(/images/pic/" + image + ")";

    this.pseudo = document.createElement("h6"); //creation image for sprite coins
    this.where2 = this.name.appendChild(this.pseudo).classList.add("pseudo");
    this.ajoutTitle = this.pseudo.innerHTML = pseudo;

    this.button = document.createElement("input"); //creation image for sprite coins
    this.buttonText = this.button.value = "Partager";
    this.attr = this.button.setAttribute("data-id", id);
    this.attr2 = this.button.setAttribute("friendSharing", "ask");
    this.where3 = this.button.classList.add("buttonShare");
    this.click = this.button.setAttribute("onclick", "functions.askForFriendFromSharing(this)");
    this.whereAsk = this.name.appendChild(this.button);

}

//********************** list of share Friend  *******************/
socket.on('sharing', function (data) {
    console.log("sharing", data);
    var title = document.getElementById("friendsList");
    title.innerHTML ="Lsite des amis à partager."
    var myList2 = document.getElementById("affichageFriendsList");
    myList2.innerHTML = "";
    if (data.length !== 0) {

        for (var i = 0; i < data.length; i++) {

            if (data[i].image === undefined || data[i].image === "" || data[i].image === "unconnue.png") {
                data[i].image = "inconnue.png";
            }
            //onsole.log("onfriends2", data[i], data[i].image);
            //console.log("hello", i, data[i].pseudo, data[i].image);
            var li = li + i;
            li = new ListeSharingListFriendConstructeur(i, data[i].id, data[i].pseudo, data[i].image);
        }
    }
});

socket.on("memberShared", function(data, user) {
    var messageResult = document.getElementById("messageResult");
    messageResult.innerHTML = data;
});
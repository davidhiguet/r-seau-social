const User = require('./bdd/user');

module.exports.connection = (io, socket, user) => {


  socket.on('connected', (user) => {

    User.findOne({ email: user.email }).then(myself => {

      if (myself !== null || myself !== undefined && socket.myEmail == undefined){
        myself.connection(socket.id);
        myself.messagingReceived = [];
        myself.messaging = [];
        myself.messagingRoom = "notDefined";
        myself.save()
        user = myself;
        console.log("myself.connected", myself.connected);
      }
    })
    .catch(err => {
      console.log(err);
    });

  });


  socket.on("startSocket", () => {
    if (socket.myEmail === undefined) {
      socket.emit("startSocket", user);
      socket.emit("startSocketFriends", user);
    }
    socket.emit("startSocketMessage", user);
    
    if(socket.myEmail){
      socket.emit("startSocketAnnexe", user);
    }

  });


//************************************** Friend Part  ***********************************/
/////////////  send property of friend user  ////////////////
  socket.on('startFriend', (user) => {
  let friends = [];
  let tableauFriends = [];
  friends = user.friends;

    if (socket.myEmail === undefined) {
      if(friends.length != 0){ 
        friends.map(friend => {
          console.log("startFriend");
          User.findOne({ _id: friend }).then(resultOne => {
            if( resultOne !== null && socket.myEmail === undefined){

            
              let friendDispatch = { pseudo: resultOne.pseudonyme, email: resultOne.email, id: resultOne._id, admin: resultOne.admin, image: resultOne.image};

              tableauFriends.push(friendDispatch);
              if (tableauFriends.length === friends.length) {
                socket.emit("friends", tableauFriends);
              }
            }
          })
          .catch(err => {
            console.log(err);
          });
          
        })
      } else {
        socket.emit("friends", tableauFriends);
      };   
    }
  });

  /////////////  send property of friend user  //////////////////
  socket.on('startFriendReceived', (user) => {
  let friendReceived = [];
  let tableauReceived = [];
  friendReceived = user.friendsReceived;    
  console.log("friendsReceiveduser.friendsReceived");
    if (friendReceived.length != 0 ) {
      friendReceived.map(friendR => {
        User.findOne({ _id: friendR })
          .then(resulTwo => {
            
              let friendDispatchOne = { pseudo: resulTwo.pseudonyme, email: resulTwo.email, id: resulTwo._id, admin: resulTwo.admin, image: resulTwo.image };

              tableauReceived.push(friendDispatchOne);
              console.log("received2", tableauReceived.length);
              if (tableauReceived.length === friendReceived.length) {
                console.log("friendsReceived", tableauReceived.length);
                socket.emit("friendsReceived", tableauReceived);
              }
  
          })
          .catch(err => {
            console.log(err);
          });
      });
    } else {
      socket.emit("friendsReceived", tableauReceived);
    };   
  });   
  /////////////  send result from friend search  //////////////////
  socket.on('friendSearch', (data) => {
console.log("socket.email", socket.myEmail);
    let result = [];
    if( socket.myEmail == undefined ){
      User.find({ "pseudonyme": data.pseudoSearch }).then((res) => {

        result = res;
        
          return User.findOne({ "_id": user._id });

        }).then((myself) => {

          characterSearchResult = []
          let relation = "";
          //console.log("result", myself._id);
          result.map(person => {
            //console.log("person._id", person._id);
            if (!myself._id.equals(person._id)) {
              //console.log("myself", myself.friends);
              //console.log("myselfAsked", myself.friendsAsked);
              //console.log("myselfReceived", myself.friendsReceived);
              if (myself.friends.indexOf(person._id) >= 0) {
                relation = "friend";
              } else if (myself.friendsAsked.indexOf(person._id) >= 0 && myself.friendsAsked != undefined) {
                relation = "asked";
              } else if (myself.friendsReceived.indexOf(person._id) >= 0 && myself.friendsReceived != undefined) {
                relation = "received";
              } else {
                relation = "";
              }

              let u = { pseudo: person.pseudonyme, email: person.email, id: person._id, admin: person.admin, image: person.image, relation: relation };

            characterSearchResult.push(u);
            }
          });
        //console.log("characterSearchResult",characterSearchResult)
        socket.emit("friendSearch", characterSearchResult);
      })
      .catch(err => {
        console.log(err);
        socket.emit("friendSearch", []);
    });
    }

  });
  
  /////////////  save friend request in database  //////////////////
  socket.on("askForFriend", idFromFriend => {
    console.log("idFromFriend", user._id);
    User.findOne({ _id: idFromFriend })
      .then(friend => {
        console.log("1");
        if (friend.friendsReceived.indexOf(user._id) > 1) {
          console.log("2");
          throw new Error("friend request already received");
        }
        console.log("id", user._id)
        friend.friendsReceived.push(user._id);
        return friend.save();
      })
      .then(result => {
        return User.findOne({ _id: user._id });
      })
      .then(usr => {
        user = usr;
        if (usr.friendsAsked.indexOf(usr._id) > 1) {
          throw new Error("friend request already sent");
        }
        usr.friendsAsked.push(idFromFriend);
        return user.save();
      })
      .then(() => {
        socket.emit("askForFriend", idFromFriend);
      })
      .catch(err => {
        console.log(err);
      });
  });

  /////////////  Accept Friend   //////////////////
  socket.on('YesToFriend', (friendId) => {
    console.log("YesToFriend");
    User.findOne({ '_id': friendId }).then((person) => {
      console.log("YesToFriend1");
      person.friends.push(user._id);
      person.friendsAsked.pull(user._id);
      return person.save();
    })
      .then(() => {
        console.log("YesToFriend2");
        return User.findOne({ '_id': user._id });
      })
      .then((usr) => {
        console.log("YesToFriend3");
        usr.friends.push(friendId);
        usr.friendsReceived.pull(friendId);
        return usr.save();
      })
      .then((myselfSave) => {
        console.log("YesToFriend4", myselfSave);
        socket.emit("startSocketFriends", myselfSave);

      })
      .catch((err) => {
        console.log(err);
      });
  });
  /////////////    Refuse Friend    //////////////////
  socket.on('NoToFriend', (friendId) => {
    console.log("NoToFriend", user._id);

    User.findOne({ '_id': friendId }).then((person) => {

      person.friendsAsked.pull(user._id);
      return person.save();
    })
      .then(() => {
        console.log("NoToFriend2");
        return User.findOne({ '_id': user._id });
      })
      .then((usr) => {
        console.log("NoToFriend3");
        usr.friendsReceived.pull(friendId);
        console.log("NoToFriendpullllllllllll");
        return usr.save();
      })
      .then((myselfSave) => {
        socket.emit("startSocketFriends", myselfSave);
      })
      .catch((err) => {
        console.log(err);
      });
  });
  /////////////    Remove Friend    //////////////////
  socket.on('removeFriend', (friendId) => {
    console.log("removeFriend");
    User.findOne({ '_id': friendId }).then((person) => {

      person.friends.pull(user._id);
      return person.save();
    })
      .then(() => {
        console.log("removeFriend2");
        return User.findOne({ '_id': user._id });
      })
      .then((usr) => {
        console.log("removeFriend3");
        usr.friends.pull(friendId);
        return usr.save();
      })
      .then((myselfSave) => {
        socket.emit("startSocketFriends", myselfSave);
      })
      .catch((err) => {
        console.log(err);
      });
  });


  socket.on('startMessage', (user) => {
    let messages = user.messag;
    let tableauMessages = [];

    if (messages.length != 0) {
      
      messages.map(message => {
        //console.log("messages", socket.myEmail);
        let email = user.email;
        let deleteMes= '';
        if (socket.myEmail === undefined  || socket.myEmail === "007@yahoo.fr" ) {
          //console.log("yes");
          deleteMes = "yes";
          
        } else {
          deleteMes = "no";
          //console.log("no");
        }

        let messageDispatch = { creator: message.creator, messageId: message.creatorId, date: message.date, comment: message.comment, image: message.image, text: message.text, deleteMes:deleteMes };

        tableauMessages.push(messageDispatch);
        //console.log("messages", tableauMessages.length);

        if (tableauMessages.length === messages.length) {
          socket.emit("messagesDispatch", tableauMessages);
        }
      });
    } else {
      socket.emit("messagesDispatch", tableauMessages);
    };
});

  // Create a post message

  socket.on("createMessage", (data) => {
    let message = {};
    console.log("message")
    if (data.id && data.pseudo && data.message && data.image) {
      

      User.findOne({ _id: data.id })
        .then(one => {
          
          function entierAleatoire(min, max) {
            return Math.floor(Math.random() * (max - min + 1)) + min;
          }
          //Utilisation
          //La variable contient un nombre aléatoire compris entre 1 et 10
          var entier = entierAleatoire(100000, 900000);
          message.Id = entier;

          if(socket.myEmail === undefined){
            console.log("mes1");
            message.text = data.message;
            message.creator = data.pseudo;
            message.image = data.image;
            message.date = Date.now();
            message.commentaires = [];
            one.messag.unshift(message);

          } else {
            console.log("mes2");
            message.text = data.message;
            message.creator = socket.myPseudo;
            message.image = socket.myImage;
            message.date = Date.now();
            message.commentaires = [];
            one.messag.unshift(message);
          }

          console.log("createMessagemethod", message)
          return one.save();
          
        })
        .then((creator) => {
          console.log("message3", creator);
          socket.emit("messageCreate", creator);
        })
        .catch(err => {
          console.log(err);
        });
    }
  });

  socket.on('removeMessage', (data) => {
    let idpseudo = user.pseudo;
    let Msg = []
    User.findOne({ _id: user._id }).then(one => {
      let Msg = one.message

      Msg.map(nb => {
        if (nb.id === data) {
  
          one.message.pull(nb)
          console.log("taba", nbMsg);
          return one.save()
        }
      });

    }).then((userSave) => {
      socket.emit("messageCreate", userSave);
    })
  });

  socket.on('disconnect', function () {

  });


  
  /////////////*********************  share friend  ****************************////////////////
  socket.on('startListSharing', (user) => {
    let friends = [];
    let tableauFriends = [];
    friends = user.friends;
    
    if (friends.length != 0 || socket.myEmail != undefined) {
      friends.map(friend => {

        User.findOne({ _id: friend }).then(resultOne => {
          if (resultOne != null ) {

            //console.log("sharing.length", friends.length);
            let friendDispatch = { pseudo: resultOne.pseudonyme, email: resultOne.email, id: resultOne._id, admin: resultOne.admin, image: resultOne.image };

            tableauFriends.push(friendDispatch);
            if (tableauFriends.length === friends.length) {
              socket.emit("sharing", tableauFriends);
            }
          }
        })
        .catch(err => {
          console.log(err);
        });

      })
    } else {
      socket.emit("startSocketAnnexe", tableauFriends);
    };
  });
  /////////////  for sharing a friend  //////////////////
  socket.on('askForSharing', (data) => {
    let person = {};
    let email = socket.myEmail;
    //console.log("askForSharing", email);
    let msgBack = "";
      if (socket.myEmail !== undefined) {
        User.find({ email: email }).then(myself => {
          //console.log("askForSharing", );
          person._id = data;
          return myself[0];
        }).then((me) => {
        
        if (!me._id.equals(person._id)) {
          

          if (me.friends.indexOf(person._id) >= 0) {

            msgBack = "Vous avez déjà cette personne comme ami.";
            socket.emit("memberShared", msgBack);

          } else if (me.friendsAsked.indexOf(person._id) >= 0) {

            relation = "Vous avez déja fait une demande a cette personne.";
            socket.emit("memberShared", msgBack);

          } else if (me.friendsReceived.indexOf(person._id) >= 0 && me.friendsReceived != undefined) {

            msgBack = "Vous avez déja reçu une demande provenant de cette personne.";
            socket.emit("memberShared", msgBack);

          } else {
            me.friendsAsked.push(person._id);
            me.save();
            msgBack = "La demande a été prise en compte.";
            socket.emit("memberShared", msgBack);

          }
        } else {
          
          msgBack = "Vous êtes déjà ami avec vous même.";
          socket.emit("memberShared", msgBack);
        }
      })
    .catch(err => {
      console.log(err);
    });
  }
});


  /////////////*********************  admin part  ****************************////////////////

    /////////////  when you search a the beginnig the list of member //////////////////
  socket.on('memberSearch', (user) => {
    
  let result = [];

    if(socket.myEmail === undefined && user.email === "007@yahoo.fr"){
      User.find().then((res) => {

        result = res;
        //console.log("result", res.length)
        return User.findOne({ "_id": user._id });

      }).then((myself) => {

        let memberSearchResult = [];
        result.map(person => {
            //console.log("person._id", person._id);
          let u = { pseudo: person.pseudonyme, id: person._id, image: person.image };

          memberSearchResult.push(u);
        });

        socket.emit("memberSearch", memberSearchResult);
      })
      .catch (err => {
        console.log(err);
        socket.emit("memberSearch", []);
      });
    }
  });
  //  when the admin remove a member //
  socket.on("removeMember", (userID, userName) => {

    User.remove({ _id: userID })
      .then(() => {
        let msgConfirmation = "Le membre " + userName + " a été supprimé.";
        socket.emit("memberRemove", msgConfirmation, user);
      })
      .catch(e => {
        console.log(err);
      });
  });
};

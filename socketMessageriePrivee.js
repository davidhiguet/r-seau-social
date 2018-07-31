const User = require('./bdd/user');
const PrivateMessage = require('./bdd/privateMessage');


module.exports.connection = (io, socket, user) => {
  socket.on("startSocket", () => {
    socket.emit("startSocketFriends", user);
  });
  /////////////  when you search a the beginnig the list of member //////////////////

  socket.on("startFriend", user => {
    let friends = [];
    let tableauFriends = [];
    friends = user.friends;

  
      if (friends.length != 0) {
        friends.map(friend => {
          
          User.findOne({ _id: friend })
            .then(resultOne => {
              if (resultOne !== null ) {
                let friendDispatch = {
                  pseudo: resultOne.pseudonyme,
                  id: resultOne._id,
                };

                tableauFriends.push(friendDispatch);
                if (tableauFriends.length === friends.length) {
                  socket.emit("friends", tableauFriends);
                }
              }
            })
            .catch(err => {
              console.log(err);
            });
        });
      } else {
        socket.emit("friends", tableauFriends);
      }

  });
    //************************************** when you select your friend  ***********************************/
  
  socket.on("ajouter", (userFriendId, userName) => {
    socket.emit("ajout", userFriendId, userName);
  });

/////////////  when you want to creat a message  ////////////////
  socket.on("creation", (tableauAjout, t, p, id) => {
      console.log("hello1")
    
    let privateMessage = new PrivateMessage()

        tableauAjout.forEach(function (id) {
            console.log("hello2", id)
            if(id != undefined){
                privateMessage.friends.push(id);
            }
            
        });
        privateMessage.creatorId = id;
        privateMessage.theme = t;
        privateMessage.pseudo = p;
        privateMessage.messages = [];
        

      User.findOne({ _id: user._id }).then(myself => {
          console.log("hello3")
          return privateMessage.save();

        })
        .then((msg) => {
            console.log("msg", msg);
            let error = "L'enregistrement a été effectué avec succès.";

            socket.emit("ajoutm", error);
        })
        .catch(err => {
          console.log(err);
            let error = "l'enregistrement n'a pas pu s'effectuer";

            socket.emit("ajoutm", error );

        });
  
  }); 
}
"use strict";
const User = require('./bdd/user');

module.exports.connection = (io, socket, user) => {
    
    socket.on("startSocket", () => {
        User.findOne({ _id: user._id }).then(myself => {
            myself.messagingAsked = [];
            myself.messaging = [];
            myself.messagingRoom = "notDefined";

            console.log("myself.messagingAsked", myself.messagingReceived);
            return myself.save()
            //console.log("user.messagingAsked", myself.messagingRoom);

        })
        .then((myself) => {
            user = myself;
            socket.emit("startSocket", myself);
        })
        .catch(err => {
            console.log(err);
        });


    });
    /////////////  when you search a the beginnig the list of member //////////////////
    socket.on('memberSearch', (user) => {

        let result = [];
        User.find().then((res) => {

            result = res;
            console.log("result", res.length)
            return User.findOne({ "_id": user._id });

        }).then((myself) => {

            let memberSearchResult = [];
            let kind = "";
            //console.log("result", myself._id);
            result.map(person => {
                //console.log("person._id", person._id);
                if (!myself._id.equals(person._id)) {


                    if (myself.messaging.indexOf(person._id) >= 0) {
                        kind = "online";
                    } else if (myself.messagingAsked.indexOf(person._id) >= 0 && myself.messagingAsked != undefined) {
                        kind = "asked";
                    } else if (myself.messagingReceived.indexOf(person._id) >= 0 && myself.messagingReceived != undefined) {
                        kind = "received";
                    } else {
                        kind = "";
                    }

                    let u = { pseudo: person.pseudonyme, email: person.email, id: person._id, admin: person.admin, image: person.image, kind: kind };
                    //when you are the admin
                    /*if (myself.admin != true){
                        if (myself.friends.indexOf(person._id) >= 0) {
                            return
                        }
                    }*/
                    memberSearchResult.push(u);
                }
            });
            //console.log("characterSearchResult", memberSearchResult.length);
            socket.emit("memberSearch", memberSearchResult);
        })
        .catch(err => {
            console.log(err);
            socket.emit("memberSearch", []);
        });
    });

    /////////////  when you ask for a discussion  //////////////////
    socket.on("askForDiscussion", idFromFriend => {
        console.log("idFromFriend", user._id);
        //User.update({ _id: idFromFriend }, { "$set": { "messaging": [] } })
        User.findOne({ _id: idFromFriend }).then(friend => {
            //make sure you are not received a proposition from this member
            if (friend.messagingReceived.indexOf(user._id) > 1) {

                throw new Error("friend request already received");
            }
            console.log("id", user._id);
            friend.messagingReceived.push(user._id);
            return friend.save();
        })
        .then(() => {
            console.log("2");
            return User.findOne({ _id: user._id });
        })
        .then(usr => {
            user = myself;
            
            if (myself.messagingAsked.indexOf(myself._id) > 1) {
                
            }
            console.log("askForDiscussion3", user._id);
            myself.messagingAsked.push(idFromFriend);
            
            return user.save();
        })
        .then((myself) => {

            if (myself.messagingRoom === "notDefined") {
                socket.emit("discussion", idFromFriend);
            } else {
                socket.emit("startSocket", user);
            }
        })
        .catch(err => {
            console.log(err);
        });
    });

    /////////////  when the first people join the room  //////////////////
    socket.on("discussion", function (userFriendId) {
        //console.log("disc1");
        socket.emit("openDiscussionPart", socket.id);
        //console.log("disc2");
        User.findOne({ _id: user._id }).then(myself => {
            room = firstJoinRoom(socket, userFriendId);
        })
        .catch(err => {
            console.log(err);
        });
    });

    var availableRooms = [];
    var room;

    //for making a unique id for room
    var uniqueId = function () {
        const randomLetter = String.fromCharCode(65 + Math.floor(Math.random() * 26));
        return randomLetter + Date.now();
    };

    var firstJoinRoom = function (socket, userFriendId) {

        User.findOne({ _id: userFriendId }).then(friend => {
            //console.log("first1", friend.messaging);
            friend.messagingReceived.push(user._id);

            return friend.save();
        }).then(() => {

            return User.findOne({ _id: user._id });

        }).then((myself) => {
            //console.log("first2", myself.messagingRoom);

            if (myself.messagingRoom === "notDefined") {
                let room = uniqueId();
                myself.messagingRoom = room;
                availableRooms.push(myself.messagingRoom);
                myself.save();
                console.log("messagingRoom", myself.messagingRoom);
                socket.emit("startSocket", myself);
                console.log("room", room);
                socket.roomId = room
                socket.join(room);
                socket.emit("joinRoom", room);
            } else {
                socket.roomId = myself.messagingRoom;
                console.log("startSocket5", myself.messagingRoom);
                socket.join(myself.messagingRoom);
                socket.emit("startSocket", myself);

            }
        }).catch(err => {
            console.log(err);
        });
    };
    /////////////  when the second people join the room  //////////////////
    var secondJoinRoom = function (roomId) {
        socket.emit("openDiscussionPart", socket.id);
        User.findOne({ _id: user._id }).then(myself => {
            //console.log("second2", myself.email);
            
            return myself.save()

        }).then(() => {
            socket.roomId = roomId;
            socket.join(roomId);
            socket.emit("joinRoom", roomId);
            io.to(roomId).emit("roomFull", roomId);


            return roomId;
        })

    };
    //  Accept member request dor discussion  
    socket.on('YesForDiscussion', (friendId) => {

        User.findOne({ '_id': friendId }).then((person) => {
            console.log("YesForDiscussion1");
            person.messaging.push(user._id);
            person.messagingAsked.pull(user._id);

            return person.save();
        })
        .then((person) => {

            if (person.messagingRoom !== "notDefined" || user.messagingRoom == undefined) {

                User.findOne({ '_id': user._id }).then((myself) => {
                    myself.messagingRoom = person.messagingRoom;
                    myself.messaging.push(friendId);
                    myself.messagingReceived.pull(friendId);
                    socket.emit("startSocket", myself);
                    user = myself.save()
                    let roomId = person.messagingRoom;
                    secondJoinRoom(roomId);
                }).catch((err) => {
                    console.log(err);
                });

            } else {
                User.findOne({ '_id': user._id }).then((myself) => {
                    myself.messagingReceived.pull(person._id)
                    
                    user = myself.save()
                    return user
                })
                .then((me) => {

                    let err = "Votre correspondant s'est déconnecté";
                    socket.emit("roomDeconnectionBefore", err);
                    socket.emit("startSocket", me);

                }).catch((err) => {
                    console.log(err);
                });
            }
        })
        .catch((err) => {
            console.log(err);
        });
    });
    //  Accept you restart the list
    socket.on("reStartList", () => {
        User.findOne({ _id: user._id }).then(myself => {
            socket.emit("startSocket", myself);
        })
    });
    //  when a member exit
    socket.on("exitMember", (data) => {
      
        User.findOne({ pseudonyme: data }).then((member) => {
            console.log("exitMember", member._id);
            return member._id
        })
        .then(mid => {
   
            User.findOne({ _id: user._id }).then(myself => {

                if (myself.messaging.indexOf(person._id) >= 0) {
                    myself.messaging.pull(mid);
                }
                if (myself.messagingAsked.indexOf(person._id) >= 0 ) {
                    myself.messagingAsked.pull(mid);
                }
                if (myself.messagingReceived.indexOf(person._id) >= 0 ) {
                    myself.messagingReceived.pull(mid);
                }
                user = myself
                return myself.save();
              
            });
        })
        .then((my) => {
            if(user.promise){
                console.log("exitMember3", user.promise);
            console.log("exitMember2", myself.email);
                socket.emit("startSocket", user.promise);
            } else {
                socket.emit("startSocket", me);
            }
            
        });
    });
    //  Accept you are removing from the discusion you were
    socket.on("remove", (data) => {
        console.log("exitMember3", data);
        User.findOne({ "pseudonyme": data.obj.user }).then(myself => {
            console.log("exitMember3", myself);
                myself.messaging= [];
            
            myself.messagingRoom = "notDefined";
            myself.messagingAsked.pull(myself.messagingAsked);
            myself.messagingReceived.pull();
            return myself.save()

        }).then((myself) => {
            console.log("roomDeconnection1");
            socket.emit("roomDeconnected");
            socket.emit("startSocket", myself);
            
            socket.leave(data.obj.roomId);
            console.log("roomDeconnection2");
            io.to(data.obj.roomId).emit('oneDeconnect', data.obj.user);
        
        })
        .catch((err) => {
            console.log(err);
        });

    });
   

     /////////////  when you send a message inside the room  //////////////////
    socket.on('message', function (data) {
        console.log(data);
        let tb = []

        tb.push(data.obj)
        io.to(data.obj.roomId).emit("message", tb);

    });

    /////////////  when you socket is disconnect //////////////////
    socket.on('disconnect', function () {
        if(socket.roomId){
            io.to(socket.roomId).emit("oneDeconnect", user.pseudonyme);
        }
        
        User.findOne({ _id: user._id }).then(myself => {
            myself.messagingAsked = [];
            myself.messagingReceived = [];
            myself.messaging = [];
            myself.messagingRoom = "notDefined";
            myself.save()
            console.log("user.deconnected");

        })
        .catch(err => {
            console.log(err);
        });
        console.log("user.deconnected", socket.roomId);

    });

};

var mongoose = require('mongoose');
const bcrypt = require("bcrypt-nodejs");
const Schema = mongoose.Schema;

var UserSchema = Schema(
  {
    lastName: {
      type: String,
      required: true,
      trim: true
    },
    firstName: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      index: { unique: true },
      required: true,
      trim: true
    },
    image: {
      type: String,
      default: "inconnue.png",
      trim: true
    },
    age: {
      type: Number,
      required: true,
      min: 0
    },
    genre: {
      type: String
    },
    pseudonyme: {
      type: String,
      required: true,
      uppercase: true,
      trim: true
    },
    street: {
      type: String,
      uppercase: true,
      required: true
    },
    city: {
      type: String,
      uppercase: true,
      required: true,
      trim: true
    },
    country: {
      type: String,
      uppercase: true,
      required: true,
      trim: true
    },
    zip: {
      type: String,
      required: true,
      trim: true
    },
    biographie: {
      type: String
    },
    preferences: {
      type: String
    },
    motDePasse: {
      type: String,
      trim: true,
      required: true
    },
    motDePasseConfirmation: {
      type: String,
      trim: true,
      required: true
    },
    connected: {
      type: String,
      default: "notconnected"
    },
    messag: [
      {
        creator: String,
        Id: String,
        text: String,
        image: String,
        commentaires: []
      }
    ],

    friends: [
      {
        type: Schema.Types.ObjectId,
        ref: "User"
      }
    ],
    friendsAsked: [
      {
        type: Schema.Types.ObjectId,
        ref: "User"
      }
    ],
    friendsReceived: [
      {
        type: Schema.Types.ObjectId,
        ref: "User"
      }
    ],
    messagerie: [
      {
        pseudo: String,
        room: String,
        image: String
      }
    ],
    privateMessage: [{
      type: Schema.Types.ObjectId,
      ref: 'Post'
    }],
    messaging: [],
    messagingAsked: [],
    messagingReceived: [],
    messagingRoom: {
      type: String,
      default: "notDefined"
    }
  },
  {
    usePushEach: true
  }
);

UserSchema.methods.connection = function (state) {
  this.connected = state;
  return this.save();
};


//authenticate input against database
UserSchema.methods.comparePassword = function (candidatePassword) {
  var user = this;
  //console.log("comparePassword", user);
   return bcrypt.compareSync(candidatePassword, user.motDePasse)
};


//hashing a password before saving it to the database
  UserSchema.methods.cryptPassword = function (mdp) {
    //console.log("cryptPassword");
    return bcrypt.hashSync(mdp, bcrypt.genSaltSync(10), null);
  };



var User = mongoose.model('User', UserSchema);

module.exports = User;

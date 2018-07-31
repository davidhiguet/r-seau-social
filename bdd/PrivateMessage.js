const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const privateMessageSchema = Schema({
  creatorId: {
    type: Schema.Types.ObjectId,
    ref: "User"
  },
  pseudo: String,
  theme: String,
  messages: [],
  friends: [
    {
      type: Schema.Types.ObjectId,
      ref: "User"
    }
  ]
});


privateMessageSchema.post('save', function (messag, next) {

    messag.populate('friends').execPopulate().then((messag) => {
          
                messag.friends.map((person) => {
                let isACreation = person.friends.indexOf(messag._id) === -1;
                if (isACreation) {
                    person.privateMessage.push(messag._id);

                }
            });
        })
        .then(() => {
            next();
        })
        .catch((err) => {
            console.log(err);
            next();
        })
});


module.exports = mongoose.model("privateMessage", privateMessageSchema);
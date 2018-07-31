var express = require('express');
var router = express.Router(),
  User = require("../bdd/user");

router.get("/", function(req, res, next) {
  var globalMsg;
  var globalCnt;
  Promise.all([
    User.find({ connected: { $ne: "notconnected" } }).count().then(number => {
        globalCnt = number;
    }), 
    User.find("messag").then(number => {
      let nbMsg = 0

      number.map(nb => {
        
        if (nb.messag.length != 0) {
          nbMsg = nbMsg + Number(nb.messag.length);
          
          console.log("taba", nbMsg);
          
        }
        globalMsg = nbMsg;
      });
    })
  ]).then(()=> {
    
    let globalProperty= {};
    globalProperty.messages = globalMsg;
    globalProperty.connected = globalCnt;
    console.log("taba", globalProperty);
    
    return res.render("index", { globalProperty, auth: true});
  });

});

module.exports = router;

var express = require('express');
var router = express.Router(),
  User = require("../bdd/user");

router.get("/", function(req, res, next) {
 let
  Promise.all([
    User.find({ connected: { $ne: "notconnected" } }).count().then(number => {
      globalProperty = number;
    }), 
  ]).then(()=> {
    
    
    
    return res.render("index", { globalProperty, auth: true});
  });

});

module.exports = router;

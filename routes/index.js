var express = require('express');
var router = express.Router(),
  User = require("../bdd/user");

router.get("/", function(req, res, next) {
 
  Promise.all([
    User.find({ connected: { $ne: "notconnected" } }).count().then(number => {
      globalProperty = number;
    }), 
  ]).then(()=> {
    
    console.log("taba", globalProperty);
    
    return res.render("index", { globalProperty, auth: true});
  });

});

module.exports = router;

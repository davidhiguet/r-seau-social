var express = require('express');
  router = express.Router(),
  passport = require('passport'),
  LocalStrategy = require('passport-local').Strategy,
  formidable = require('formidable'),
  User = require("../bdd/user"),
  SocketProfile = require('../socketProfile'),
  SocketMessagerie = require('../SocketMessagerie'),
  SocketMessageriePrivee = require('../SocketMessageriePrivee');
;
//**************************** MODULE PASSEPORT WHEN YOU WANT TO LOG IN ***************************//
passport.use(new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password'
},
  function (email, password, done) {
    //console.log("pass2", email, password);
    User.findOne({ email: email }, function (err, user) {
      //console.log("pass", user);
      if (err || !user) {
        return done(err);
      } else {
        // Return if user not found in database
        if (user.comparePassword(password)) {

          //console.log("match", user);
          return done(null, user);
        } else {
          return done(null, false);
        }
      }
    }).catch(function (err) { // handle possible errors
      return done(err);
    })

  }
));
passport.serializeUser(function (user, done) {
  // placeholder for custom user serialization
  // null is for errors
  done(null, user);
});

passport.deserializeUser(function (user, done) {
  // placeholder for custom user deserialization.
  // maybe you are going to get the user from mongo by id?
  // null is for errors
  done(null, user);
});

//**************************** FUNCTION FORMIDABLE MODULE TO UPLOAD IMAGE ***************************//
function formidableReq(req, res, next) {
  console.log("formidable");
  var form = new formidable.IncomingForm({
    encoding: "utf-8",
    uploadDir: "./public/images/pic",
    multiples: true,
    keepExtensions: true,
    maxFileSize: 200 * 1024 * 1024
  });

  form.parse(req, (err, fields, files) => {
    if (err) {
      console.log("error");
      next();
    }
    console.log("files", files.image.size);
    var filename = req.files;
    Object.assign(req, { fields, files });
    next();

  });
  form.on("fileBegin", function (name, file) {

    if (file.name != "") {
      console.log("filename", file.name);
      file.path = form.uploadDir + "/" + file.name;
    }
  });
}

//**************************** FUNCTION WHO VERIFY IF YOUR ARE CONNECTED OR NOT ***************************//
function checkAuthentication(req, res, next) {
  if (req.isAuthenticated()) {
    //req.isAuthenticated() will return true if user is logged in
    next();
  } else {
    res.redirect("/profile/auth");
  }
}


//************************************* TO GET THE PROFILE PAGE **************************************//
router.get('/', checkAuthentication, function (req, res, next) {
  return res.render('profile');
});

router.get('/auth', function (req, res, next) {
  console.log("connectedprofile");

  return res.render('connection', { auth: true});

});

//************************************************** THE LOGIN PART **************************************************//
router.post('/auth',
  passport.authenticate('local', {
    failureRedirect: '/profile/loginFailure',
    successRedirect: '/profile/loginSuccess'
  }
));

router.get('/loginFailure', function (req, res, next) {
  var err = new Error("Mot de passe ou email incorrect.");
  err.status = 400;
  return res.render("connection", { err , auth: true});
});

// Login success should return user object
router.get('/loginSuccess', function (req, res, next) {

  user = req.user
  res.io.once("connection", socket => {
    SocketProfile.connection(socket, user);
  });

  req.session.userId = req.user._id;
  return res.render("profile");
});

//**************************** THE PART WHERE YOU CAN MODIFY YOUR INFORMATIONS *********************************//
router.get('/modification/:userId', (req, res, next) => {
  console.log(req.params.userId);
  User.findOne({ '_id': req.params.userId })
    .then((user) => {
      let admin = req.user;
      return res.render("modification", { user });
    })
    .catch((e) => {
      err = e
      return res.render("profile", { err });
    });
});

//***************** FROM MODIFICATION PART WHEN YOU WANT TO GO BACK TO THE profile PAGE *************************//

router.get("/back/:userId", (req, res, next) => {
  console.log("retour");
  User.findOne({ '_id': req.params.userId })
    .then(user => {
      res.io.once("connection", socket => {
        SocketProfile.connection(socket, user);
      });
      return res.render("profile", { user });
    })
    .catch(e => {
      var error = "Retour en arrière impossible, veuillez-vous reconnectez !!!";
      return res.render("modification", { error });
    });
});

//***************** FROM MODIFICATION PART WHEN YOU HAVE MADE SOME CHANGE IN YOUR INFORMATION *************************/
router.post('/modifyInfo/:userId', formidableReq, function (req, res, next) {

  // contains data about file fields  
  User.findOne({ '_id': req.params.userId }).then((user) => {
    // confirm that user typed same password twice
    if (req.fields.motDePasse !== req.fields.motDePasseConfirmation) {
      var errMDP = new Error("Erreur de Mot de passe");
      errMDP.status = 400;

      return res.render("modification", { user, errMDP });
    }
    console.log("champion")
    //Verify all data and save it if it changes

    //Verify email
    user.email = req.fields.email.trim() !== user.email || req.fields.email !== "undefined" ?
      req.fields.email : user.email;

    //Verify name information
    user.firstName = req.fields.firstName.trim() !== user.firstName || req.fields.firstName !== 'undefined' ?
      req.fields.firstName : user.firstName;
    user.pseudonyme = req.fields.pseudonyme.trim().toUpperCase() !== user.pseudonyme || req.fields.pseudonyme != 'undefined' ?
      req.fields.pseudonyme : user.pseudonyme;
    user.lastName = req.fields.lastName.trim() !== user.lastName || req.fields.lastName !== 'undefined' ?
      req.fields.lastName : user.lastName;
    //Verify age an gender
    user.genre = req.fields.genre !== user.genre ? req.fields.genre : user.genre;
    user.age = req.fields.age !== user.age || req.fields.age !== 'undefined' || isNaN(req.fields.age) ?
      req.fields.age : user.age;
    //Verify adress
    user.street = req.fields.street.toUpperCase() !== user.street || req.fields.street !== 'undefined' ?
      req.fields.street : user.street;
    user.zip = req.fields.zip.trim() !== user.zip || req.fields.zip !== 'undefined' ?
      req.fields.zip : user.zip;
    user.city = req.fields.city.trim().toUpperCase() !== user.city || req.fields.city !== 'undefined' ?
      req.fields.city : user.city;
    user.country = req.fields.country.trim().toUpperCase() !== user.country || req.fields.country !== 'undefined' ?
      req.fields.country : user.country;
    //Verify bio and preferences
    user.preferences = req.fields.preferences !== user.preferences || req.fields.preferences !== 'undefined' ?
      req.fields.preferences : user.preferences;

    user.biographie = req.fields.biographie !== user.biographie || req.fields.biographie.trim() !== 'undefined' ?
      req.fields.biographie : user.biographie;
    //Verify mot de passe
    if (req.fields.motDePasse.trim() !== user.motDePasse ||
      req.fields.motDePasse.trim() !== 'undefined') {
      user.motDePasse = user.cryptPassword(req.fields.motDePasse.trim())
    } else {
      user.motDePasse = user.motDePasse;
    }

    user.motDePasseConfirmation = req.fields.motDePasseConfirmation !== user.motDePasseConfirmation || req.fields.motDePasseConfirmation.trim() !== 'undefined' ?
      req.fields.motDePasseConfirmation : user.motDePasseConfirmation;

    //******************* The image gestion ******************//
    if (req.files.image.size !== 0) {
      console.log("req.files.image", req.files.image.name);
      user.image = req.files.image.name;
    }

    user.save((err, user) => {
      if (err) {
        console.log("inside " + err);
        err = "Les modifications n'ont pu être sauvegardées !"
        return res.render("profile", { user, err });
      }


          console.log("INSIDE2 ");
          res.io.once("connection", socket => {
  
            SocketProfile.connection(socket, user);
          })
          return res.render("profile", { user });


    });
  });
});

//***************** WHEN YOU WANT TO SEE THE PROFILE OF ANOTHER FRIEND ************************/
router.get("/friend/:userId", (req, res, next) => {
  let myInfo = req.user
  console.log("retour", myInfo.pseudonyme, myInfo.image, myInfo.email);
  User.findOne({ _id: req.params.userId })
    .then(user => {

      res.io.once("connection", socket => {

        socket.myPseudo = myInfo.pseudonyme,
        socket.myImage = myInfo.image,
        socket.myEmail = myInfo.email,
        SocketProfile.connection(socket, user);
      });

      let friend = true;
      let admin = true;
      if (myInfo.email === "007@yahoo.fr") {
        return res.render("profile", { user, friend, admin });
      } else {
        return res.render("profile", { user, friend });
      }
    })
    .catch(e => {

      var error = "Retour en arrière impossible, veuillez-vous reconnectez !!!";
      return res.render("modification", { error });
    });
});

//***************** WHEN YOU WANT TO COME BACK TO YOUR PROFILE FROM FRIEND ACCOUNT************************/
router.get("/monProfile/", (req, res, next) => {
  if (req.user) {
    user = req.user;

    res.io.once("connection", socket => {
      SocketProfile.connection(socket, user);
    });
    return res.render("profile", { user });

  } else {
  var error = "Retour en arrière impossible, veuillez-vous reconnectez !!!";
  return res.render("profile", { error });
  
  }
});


router.get("/acceuil/:userId", function(req, res, next) {

  var globalCnt;
  Promise.all([
    User.find({ connected: { $ne: "notconnected" } })
      .count()
      .then(number => {
        globalCnt = number;
      }),
  ])
  User.find({ '_id': req.params.userId }).then(myself => {
    let globalProperty = {};
    globalProperty.connected = globalCnt;
    myself.map(me =>{
      console.log(me);
      user = me
    })

    console.log(user)
    return res.render("index", { user, auth: false, globalProperty });
  });
});

//***************** WHEN YOU WANT TO GO ON THE MESSAGERIE PART *************************/
router.get('/messagerie/:userId', (req, res, next) => {
  console.log(req.params.userId);
  User.findOne({ '_id': req.params.userId })
    .then((user) => {
      res.io.once("connection", socket => {
        SocketMessagerie.connection(res.io, socket, user);
      });
      return res.render("messagerie", { user });
    })
    .catch((e) => {
      err = e
      return res.render("profile", { err });
    });
});

//**************************** THE PART WHERE ADMIN MODIFY YOUR INFORMATIONS *********************************//
router.get('/admin/modification/:userId', (req, res, next) => {
  console.log(req.params.userId);
  User.findOne({ '_id': req.params.userId })
    .then((user) => {
      
      return res.render("modification", { user ,admin: true});
    })
    .catch((e) => {
      err = e
      return res.render("profile", { err });
    });
});

//***************** FROM MODIFICATION PART WHEN THE ADLMIN MADE SOME CHANGE IN YOUR INFORMATION *************************/
router.post('/friends/modifyInfo/:userId', formidableReq, function (req, res, next) {

  // contains data about file fields  
  User.findOne({ '_id': req.params.userId }).then((user) => {
    // confirm that user typed same password twice
    if (req.fields.motDePasse !== req.fields.motDePasseConfirmation) {
      var errMDP = new Error("Erreur de Mot de passe");
      errMDP.status = 400;

      return res.render("modification", { user, errMDP });
    }
    console.log("champion")
    //Verify all data and save it if it changes

    //Verify email
    user.email = req.fields.email.trim() !== user.email || req.fields.email !== "undefined" ?
      req.fields.email : user.email;

    //Verify name information
    user.firstName = req.fields.firstName.trim() !== user.firstName || req.fields.firstName !== 'undefined' ?
      req.fields.firstName : user.firstName;
    user.pseudonyme = req.fields.pseudonyme.trim().toUpperCase() !== user.pseudonyme || req.fields.pseudonyme != 'undefined' ?
      req.fields.pseudonyme : user.pseudonyme;
    user.lastName = req.fields.lastName.trim() !== user.lastName || req.fields.lastName !== 'undefined' ?
      req.fields.lastName : user.lastName;
    //Verify age an gender
    user.genre = req.fields.genre !== user.genre ? req.fields.genre : user.genre;
    user.age = req.fields.age !== user.age || req.fields.age !== 'undefined' || isNaN(req.fields.age) ?
      req.fields.age : user.age;
    //Verify adress
    user.street = req.fields.street.toUpperCase() !== user.street || req.fields.street !== 'undefined' ?
      req.fields.street : user.street;
    user.zip = req.fields.zip.trim() !== user.zip || req.fields.zip !== 'undefined' ?
      req.fields.zip : user.zip;
    user.city = req.fields.city.trim().toUpperCase() !== user.city || req.fields.city !== 'undefined' ?
      req.fields.city : user.city;
    user.country = req.fields.country.trim().toUpperCase() !== user.country || req.fields.country !== 'undefined' ?
      req.fields.country : user.country;
    //Verify bio and preferences
    user.preferences = req.fields.preferences !== user.preferences || req.fields.preferences !== 'undefined' ?
      req.fields.preferences : user.preferences;

    user.biographie = req.fields.biographie !== user.biographie || req.fields.biographie.trim() !== 'undefined' ?
      req.fields.biographie : user.biographie;
    //Verify mot de passe
    if (req.fields.motDePasse.trim() !== user.motDePasse ||
      req.fields.motDePasse.trim() !== 'undefined') {
      user.motDePasse = user.cryptPassword(req.fields.motDePasse.trim())
    } else {
      user.motDePasse = user.motDePasse;
    }

    user.motDePasseConfirmation = req.fields.motDePasseConfirmation !== user.motDePasseConfirmation || req.fields.motDePasseConfirmation.trim() !== 'undefined' ?
      req.fields.motDePasseConfirmation : user.motDePasseConfirmation;
    //*********** The image gestion *****************//
    if (req.files.image.size !== 0) {

      console.log("req.files.image", req.files.image.name);
      user.image = req.files.image.name;

    }

    user.save((err, user) => {
      if (err) {
        console.log("inside " + err);
        err = "Les modifications n'ont pu être sauvegardées !"
        return res.render("profile", { user, err });
      }
        console.log("INSIDE2 ");
        res.io.once("connection", socket => {

            socket.myPseudo = user.pseudonyme,
            socket.myImage = user.image,
            socket.myEmail = user.email,
            SocketProfile.connection(socket, user);
        })
        let friend = true;
        let admin = true;
        return res.render("profile", { user, friend, admin });
    });
  });
});

//***************** WHEN YOU WANT TO GO ON THE MESSAGERIE PART *************************/
router.get('/messagerieprivee/:userId', (req, res, next) => {
  console.log(req.params.userId);
  User.findOne({ '_id': req.params.userId })
    .then((user) => {
      res.io.once("connection", socket => {
        SocketMessageriePrivee.connection(res.io, socket, user);
      });
      return res.render("messageriePrivee", { user });
    })
    .catch((e) => {
      err = e
      res.io.once("connection", socket => {
        SocketProfile.connection(user);
      });
      return res.render("profile", { err });
    });
});
//***************** WHEN YOU WANT TO QUIT *************************//

router.get("/logout/:userId", function (req, res, next) {

  if (req.params.userId == undefined){
    req.session.destroy(function (err) {
      if (err) {
        return next(err);
      } else {
        req.logout();

        return res.redirect("/profile");
      }
    })

  } else {


    User.findOne({ '_id':  req.params.userId }).then((user) => {
     
        user.connection("notconnected");
        user.save()
     
    }).then(()=>{
      req.session.destroy(function (err) {
        if (err) {
          return next(err);
        } else {
          req.logout();

          return res.redirect("/profile");
        }
      })
     })   
    }
  
});


module.exports = router;

'use strict';
const express = require("express"),
    router = express.Router(),
    formidable = require("formidable"),
    SocketProfile = require("../socketProfile"),
    User = require("../bdd/user.js"),
    nodemailer = require("nodemailer"),
    nodeEmailer = require("../nodeEmailer");


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
/* GET inscription page. */
router.get('/', function (req, res, next) {
    return res.render("inscription", { auth: true});
});

router.post('/', formidableReq, function (req, res, next) {
    
    // confirm that user typed same password twice
    if (req.fields.motDePasse !== req.fields.motDePasseConfirmation) {
        var errMDP = new Error("Erreur de Mot de passe");
        err.status = 400;
        return res.render("inscription", { errMDP });
    }
    console.log("Fields " + req.fields.lastName);
    // all are required was written
    if (req.fields.lastName && req.fields.firstName && req.fields.email && req.fields.pseudonyme && req.fields.age && req.fields.genre && req.fields.street && req.fields.zip && req.fields.city && req.fields.country && req.fields.motDePasse && req.fields.motDePasseConfirmation) {
        
        User.findOne({ 'email': req.fields.email }).then((user) => {
            if (user) {
                var errMail = "Cette email est déjà pris !";
                return res.render("inscription", { errMail });

            } else {

                let newUser = new User();
                    newUser.lastName = req.fields.lastName.trim();
                    newUser.firstName = req.fields.firstName.trim();
                    newUser.pseudonyme = req.fields.pseudonyme.trim().toUpperCase();
                    newUser.age = req.fields.age.trim();
                    newUser.genre = req.fields.genre;
                    newUser.street = req.fields.street.trim();
                    newUser.zip = req.fields.zip.trim();
                    newUser.city = req.fields.city.trim().toUpperCase();
                    newUser.country = req.fields.country.trim();
                    newUser.email = req.fields.email.trim();
                    newUser.motDePasse = newUser.cryptPassword(req.fields.motDePasse.trim());
                    newUser.motDePasseConfirmation = req.fields.motDePasseConfirmation.trim();

                    /*if (req.fields.pseudonyme.trim().toUpperCase() === 'ADMIN') {
                        newUser.administrateur = 'yes'
                    }*/
                    // if the preference was written 
                    if (req.fields.preferences != '') 
                        console.log("ca marche 1");
                        newUser.preferences = req.fields.preferences;
                    // if the biographie was written 
                    if (req.fields.biographie != '') 
                        console.log("ca marche 2");
                        newUser.biographie = req.fields.biographie;

            //****************************************** The image gestion **************************************************//
                    if (req.files.image.size != '0' ){
                        console.log("req.files.image.name", req.files.image.name);
                        newUser.image = req.files.image.name;
                    } else {
                        console.log("else", newUser)
                        newUser.image = "inconnue.png";
                    }
                    
                    newUser.save(function (err, user){
                        if (err) {
                            console.log(err);
                            err = "l'enregistrement de votre compte n'a pu être réaliser"
                            return res.render("inscription", { err });
                        }
                        nodeEmailer.sendEmail({
                            from: '"RoleCinema" <admin@rolecinema.com>',
                            to: user.email,
                            subject: 'INSCRIPTION',
                            text: 'Votre inscription a bien été validé.',
                        });
                            console.log("enregistrement", user);
                            req.session.userId = user._id;
                            req.user= user;
                            res.io.once("connection", socket => {
                                socket.removeAllListeners();
                                SocketProfile.connection(res.io, socket, user);
                            });
                        console.log("helloworld HELLO", req.session.userId);
                        let messageResult = "Votre compte a été créé"
                        return res.render("profile", { user, inscri: true, messageResult});
                    })

                }
            })
            .catch((err) => {
                return res.render("inscription", { err });
            });
        } else {
            var err = new Error("All fields required.");
            err.status = 400;
            return res.render("inscription", { err });
        }
})

module.exports = router;
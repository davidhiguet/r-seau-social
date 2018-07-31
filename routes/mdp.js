var express = require('express');
var router = express.Router();
var nodemailer = require("nodemailer"),
    User = require("../bdd/user");
var nodeEmailer = require("../nodeEmailer");

router.get("/", function (req, res, next) {
    return res.render("mdp", { auth: true });
});


router.post("/", function(req, res, next) {
    let email = req.body.email;
    //******************** partie pour generer un nouveau mot de passe **********************//
    function entierAleatoire(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    //Utilisation
    //La variable contient un nombre aléatoire compris entre 1 et 10
    var entier = entierAleatoire(100000, 900000);

    //******************** partie pour verifier l'email et enregistrer le ouveau mot de passe **********************//
        User.findOne({ email: email }, function (err, user) {
            console.log("pass", entier );
            if (err || !user) {
                let err= "Cette email ne correspond à aucun compte"
                return res.render("mdp", { auth: true , err});
            } else {
                user.motDePasseConfirmation= entier;
                user.motDePasse = user.cryptPassword(entier);
                user.save()
                    nodeEmailer.sendEmail({
                        from: '"RoleCinema" <admin@rolecinema.com>',
                        to: user.email,
                        subject: 'REINITIALISATION MOT DE PASSE',
                        text: 'Votre nouveau mot de passe est ' + user.motDePasseConfirmation + ".",
                    });
                let confirmation = "un email vous a été envoyé avec un nouveau mot de passe."
                return res.render("mdp", { auth: true , confirmation });
            }
        })
});


module.exports = router;
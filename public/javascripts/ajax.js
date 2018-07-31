$(document).ready(function () {
    /*////////AJAX COPYRIGHT////////*/

    $('#cpy').on("click", function () {
        afficherenajax("about.txt");
        $('#couverture').show();
    });

    $('#couverture').on("click", function () {

        $('#couverture').hide();
    });
    function afficherenajax(fichier) {
        $.get('/ressources/' + fichier, function (data) {
            $('#popup_contenu').html(data);
            $('couverture').show();
        });
    };
});
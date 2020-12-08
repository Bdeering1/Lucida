$("#setFen").click(function() {
    var fenStr = $("#fenIn").val();
    ParseFen(fenStr);
    PrintBoard();
});

$("h3").click(function() {
    $("h3").hide();
    $("#BoardDiv").slideToggle();
});

$("#BoardDiv").click(function() {
    $("h3").show();
    $("#BoardDiv").fadeToggle();
});
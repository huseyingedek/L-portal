/**
 * Source: http://t4t5.github.io/sweetalert/
 */

$("button").click(function() {
  $(".sa-success").addClass("hide");
  setTimeout(function() {
    $(".sa-success").removeClass("hide");
  }, 10);
});

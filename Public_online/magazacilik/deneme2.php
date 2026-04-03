<?php

require_once "nusoap.php";
require_once "caniasConnector.php";

$caniasConnector = new caniasConnector();
$caniasConnector->wsCanias("getCityCode", ["SGENC","GB"]);
$sonuc = $caniasConnector->wsGetResponse();
$sonuc_json = json_decode($sonuc, true);


// Ülke adlarını ekrana bas
echo "<pre>";
var_dump($sonuc_json);
echo "</pre>";
?>
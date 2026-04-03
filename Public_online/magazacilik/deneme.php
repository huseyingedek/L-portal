<?php

require_once "nusoap.php";
require_once "caniasConnector.php";

$caniasConnector = new caniasConnector();
$caniasConnector->wsCanias("getCountryCode", ["P2000C"]);
$sonuc = $caniasConnector->wsGetResponse();
$sonuc_json = json_decode($sonuc, true);

$ulke_adlari = [];
$ulke_kodlari = [];
foreach ($sonuc_json as $ulke) {
    $ulke_adlari[] = explode("-", $ulke["COUNTRY"])[1];
    $ulke_kodlari[] = explode("-", $ulke["COUNTRY"])[0];
}

// Ülke adlarını ekrana bas
echo "<pre>";
print_r($ulke_adlari);
echo "</pre>";
?>
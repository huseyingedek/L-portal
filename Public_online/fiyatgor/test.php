<?php
// Allow from any origin
if (isset($_SERVER["HTTP_ORIGIN"])) {
    header("Access-Control-Allow-Origin: {$_SERVER["HTTP_ORIGIN"]}");
    header("Access-Control-Allow-Credentials: true");
    header("Access-Control-Max-Age: 86400"); // cache for 1 day
}

// Access-Control headers are received during OPTIONS requests
if ($_SERVER["REQUEST_METHOD"] == "OPTIONS") {
    if (isset($_SERVER["HTTP_ACCESS_CONTROL_REQUEST_METHOD"])) {
        header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
    }

    if (isset($_SERVER["HTTP_ACCESS_CONTROL_REQUEST_HEADERS"])) {
        header(
            "Access-Control-Allow-Headers:       {$_SERVER["HTTP_ACCESS_CONTROL_REQUEST_HEADERS"]}"
        );
    }

    exit(0);
}

require_once "nusoap.php";
require_once "caniasConnector.php";

// RETAIL BATCH CHECK SERVİSİ
$barkod_kodu = trim(strtoupper($_POST['barkod_kodu']));

$caniasConnector = new caniasConnector();
$caniasConnector->wsCanias("RetailBatchCheck", ["P2000C", $barkod_kodu]);
$sonuc      = $caniasConnector->wsGetResponse();
$sonuc_json = json_decode($sonuc, true);

//Benzer ürün yoksa bura çalışır
if (isset($sonuc_json["ROW"])) {
    $ana_data = [];
    foreach ($sonuc_json as $key => $value) {

        $ana_data["ROW"]["BARKOD"] = $barkod_kodu;
        if ($value["D2TEXT"] != "") {
            $ana_data["ROW"]["DIAMOND"] =
            trim(mb_substr($value["D1TEXT"], 3, 4)) +
            trim(mb_substr($value["D2TEXT"], 3, 4));
        } else {
            $ana_data["ROW"]["DIAMOND"] = trim(
                mb_substr($value["D1TEXT"], 3, 4)
            );
        }
    

        if (!empty($value["D3TEXT"])) {
            $ana_data[$key]["COLORSTONE"] = $value["D3TEXT"];
        } else {
            $ana_data[$key]["COLORSTONE"] = "";
        } 
        $ana_data["ROW"]["URUNADI"]    = $value["DETCOLOR"];

        // $ana_data["ROW"]["ILKFIYAT"]   = $value["SPRICE"];
        $ana_data["ROW"]["SONFIYAT"]   = $value["SPRICE"];
        $ana_data["ROW"]["SABITFIYAT"] = $value["SABITFIYAT"];
        $ana_data["ROW"]["GOLDK"]      = $value["ISMATGRP"];
        $ana_data["ROW"]["AGIRLIK"]    = $value["QUANTITYX"];
        $ana_data["ROW"]["STOKDURUMU"]     = $value["ISSTCK"];
        $ana_data["ROW"]["STOKACIKLAMA"]   = $value["ISWARE"];
        $ana_data["ROW"]["MODEL"]          = $value["MATERIAL"];
        $ana_data["ROW"]["SPRICECURRENCY"] = $value["SPRICECURRENCY"];
        $ana_data["ROW"]["COLORCLARITY"]   = $value["D3TEXT"];

        if (!empty($value["D1TEXT"])) {
            $ana_data["ROW"]["COLORCLARITY"] = mb_substr($value["D1TEXT"], 7, 7);
        } else {
            $ana_data["ROW"]["COLORCLARITY"] = "";
        }

        $image = str_replace(
            ["-----BEGIN CERTIFICATE-----", "-----END CERTIFICATE-----"],
            "",
            $value["PICTURE"]
        );
        $image                        = "data:image/png;base64," . $image;
        $ana_data["ROW"]["IMGBASE64"] = $image;
    }


    //Benzer ürün varsa bura çalışır
} else {
    $ana_data = [];
    foreach ($sonuc_json as $key => $value) {
        $ana_data[$key]["BARKOD"] = $value["BARKOD"];
        if ($value["D2TEXT"] != "") {
            $ana_data[$key]["DIAMOND"] =
            trim(mb_substr($value["D1TEXT"], 3, 4)) +
            trim(mb_substr($value["D2TEXT"], 3, 4));
        } else {
            $ana_data[$key]["DIAMOND"] = trim(
                mb_substr($value["D1TEXT"], 3, 4)
            );
        }
     
        if (!empty($value["D3TEXT"])) {
            $ana_data[$key]["COLORSTONE"] = $value["D3TEXT"];
        } else {
            $ana_data[$key]["COLORSTONE"] = "";
        }

        $ana_data[$key]["URUNADI"] = $value["DETCOLOR"];

        // $ana_data["ROW"]["ILKFIYAT"]   = $value["SPRICE"];
        $ana_data[$key]["SONFIYAT"]   = $value["SPRICE"];
        $ana_data[$key]["SABITFIYAT"] = $value["SABITFIYAT"];
        $ana_data[$key]["GOLDK"]      = $value["ISMATGRP"];
        $ana_data[$key]["AGIRLIK"]    = $value["QUANTITYX"];
        $ana_data[$key]["STOKDURUMU"]     = $value["ISSTCK"];
        $ana_data[$key]["STOKACIKLAMA"]   = $value["ISWARE"];
        $ana_data[$key]["MODEL"]          = $value["MATERIAL"];
        $ana_data[$key]["SPRICECURRENCY"] = $value["SPRICECURRENCY"];
        $ana_data[$key]["COLORCLARITY"]   = $value["D3TEXT"];

        if (!empty($value["D1TEXT"])) {
            $ana_data[$key]["COLORCLARITY"] = mb_substr($value["D1TEXT"], 7, 7);
        } else {
            $ana_data[$key]["COLORCLARITY"] = "";
        }

        $image = str_replace(
            ["-----BEGIN CERTIFICATE-----", "-----END CERTIFICATE-----"],
            "",
            $value["PICTURE"]
        );
        $image                       = "data:image/png;base64," . $image;
        $ana_data[$key]["IMGBASE64"] = $image;

    }
}

echo json_encode($ana_data);


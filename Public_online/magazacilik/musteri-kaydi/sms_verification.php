<?php
session_start();  
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
require_once "../nusoap.php";
require_once "../caniasConnector.php";
$username = $_SESSION['usern'];
$userInput = $_POST["userInput"];


$kvkk_code = $_SESSION['kvkk']; 
$etk_code = $_SESSION['etk'];  
$kvkk_etk_codes = $_SESSION['kvkk_etk_codes']; 

if (isset($_SESSION['kisiVerileri'])) {
    $kisiVerileri = $_SESSION['kisiVerileri'];

    $date = date('d.m.Y');
    $kisi_cinsiyet = $kisiVerileri['kisi_cinsiyet'];
    $kisi_ad_soyad = $kisiVerileri['kisi_ad_soyad'];
    $kisi_tc = $kisiVerileri['kisi_tc'];
    $kisi_tel = $kisiVerileri['kisi_tel'];
    $kisi_eposta = $kisiVerileri['kisi_eposta'];
    $kisi_vergi_dairesi = $kisiVerileri['kisi_vergi_dairesi'];
    $kisi_dogum_tarihi = $kisiVerileri['kisi_dogum_tarihi'];
    $kisi_es_dogum_tarihi = $kisiVerileri['kisi_es_dogum_tarihi'];
    $kisi_evlilik_tarihi = $kisiVerileri['kisi_evlilik_tarihi'];
    $kisi_yuzuk_olcusu = $kisiVerileri['kisi_yuzuk_olcusu'];
    $kisi_pasaport_numarasi = $kisiVerileri['kisi_pasaport_numarasi'];
    $kisi_pasaport_tarihi = $kisiVerileri['kisi_pasaport_tarihi'];
    $kisi_ulke = $kisiVerileri['kisi_ulke'];
    $kisi_sehir = $kisiVerileri['kisi_sehir'];
    $kisi_ilce = $kisiVerileri['kisi_ilce'];
    // $kisi_semt = $kisiVerileri['kisi_semt'];
    // $kisi_cadde = $kisiVerileri['kisi_cadde'];
    // $kisi_sokak = $kisiVerileri['kisi_sokak'];
    // $kisi_bina_no = $kisiVerileri['kisi_bina_no'];
    $kisi_adres = $kisiVerileri['kisi_adres'];
    $kisi_not = $kisiVerileri['kisi_not'];
}

if (strtoupper($userInput) === $kvkk_code) {
    $xml = "<?xml version='1.0' encoding='UTF-8'?>
<XMLCUSTTBL>
	<ROW>
		<ISCUSTORVEND>3</ISCUSTORVEND>
		<TAXNUM>$kisi_tc</TAXNUM>
		<TITLE></TITLE>
		<NAME1>$kisi_ad_soyad</NAME1>
		<ADDRESSLINE1>$kisi_adres</ADDRESSLINE1>
		<COUNTRY>$kisi_ulke</COUNTRY>
		<ISLOCKED>0</ISLOCKED>
		<ZIPSTREET>34000</ZIPSTREET>
		<CITY>$kisi_sehir</CITY>
		<TOWN>$kisi_ilce</TOWN>
		<LOCALITY></LOCALITY>
		<AVENUE></AVENUE>
		<STREET></STREET>
		<OTHERINFO></OTHERINFO>
		<TELNUM>$kisi_tel</TELNUM>
		<TLXNUM>aa.a.com.trr</TLXNUM>
		<CURRENCY>TL</CURRENCY>
		<LANGU>T</LANGU>
		<BRANCH>*</BRANCH>
		<SORTBY>*</SORTBY>
		<ACCLASS>C</ACCLASS>
		<CUSTACC></CUSTACC>
		<RECACC>120.01</RECACC>
		<ADVPACC>120.01</ADVPACC>
		<VATKEY>20</VATKEY>
		<PAYMCOND>000</PAYMCOND>
		<PAYMTYPE>*</PAYMTYPE>
		<ISSMSCONF>1</ISSMSCONF>
		<ISSMSCONFDATE>$date</ISSMSCONFDATE>
		<GENDER>$kisi_cinsiyet</GENDER>
		<PASSPORTNUM>$kisi_pasaport_numarasi</PASSPORTNUM>
		<BIRTHDAY>$kisi_dogum_tarihi</BIRTHDAY>
		<PRBIRTHDAY>$kisi_es_dogum_tarihi</PRBIRTHDAY>
		<WEDDINGDAT>$kisi_evlilik_tarihi</WEDDINGDAT>
		<PASSPORTDATE>$kisi_pasaport_tarihi</PASSPORTDATE>
        <ISRINGSIZE>$kisi_yuzuk_olcusu</ISRINGSIZE>
        <NOT>$kisi_not</NOT>
	</ROW>
</XMLCUSTTBL>";
$caniasConnector = new caniasConnector();
$caniasConnector->wsCanias("addCustomer", ["0","$xml","$username","1"]);
    echo "KVKK"; 
    unset($_SESSION['kisiVerileri']);
} elseif (strtoupper($userInput) === $etk_code) {

    $xml = "<?xml version='1.0' encoding='UTF-8'?>
    <XMLCUSTTBL>
        <ROW>
            <ISCUSTORVEND>3</ISCUSTORVEND>
            <TAXNUM>$kisi_tc</TAXNUM>
            <TITLE></TITLE>
            <NAME1>$kisi_ad_soyad</NAME1>
            <ADDRESSLINE1>$kisi_adres</ADDRESSLINE1>
            <COUNTRY>$kisi_ulke</COUNTRY>
            <ISLOCKED>0</ISLOCKED>
            <ZIPSTREET>34000</ZIPSTREET>
            <CITY>$kisi_sehir</CITY>
            <TOWN>$kisi_ilce</TOWN>
            <LOCALITY></LOCALITY>
            <AVENUE></AVENUE>
            <STREET></STREET>
            <OTHERINFO></OTHERINFO>
            <TELNUM>$kisi_tel</TELNUM>
            <TLXNUM>aa.a.com.trr</TLXNUM>
            <CURRENCY>TL</CURRENCY>
            <LANGU>T</LANGU>
            <BRANCH>*</BRANCH>
            <SORTBY>*</SORTBY>
            <ACCLASS>C</ACCLASS>
            <CUSTACC></CUSTACC>
            <RECACC>120.01</RECACC>
            <ADVPACC>120.01</ADVPACC>
            <VATKEY>20</VATKEY>
            <PAYMCOND>000</PAYMCOND>
            <PAYMTYPE>*</PAYMTYPE>
            <ISSMSCONF>1</ISSMSCONF>
            <ISSMSCONFDATE>$date</ISSMSCONFDATE>
            <GENDER>$kisi_cinsiyet</GENDER>
            <PASSPORTNUM>$kisi_pasaport_numarasi</PASSPORTNUM>
            <BIRTHDAY>$kisi_dogum_tarihi</BIRTHDAY>
            <PRBIRTHDAY>$kisi_es_dogum_tarihi</PRBIRTHDAY>
            <WEDDINGDAT>$kisi_evlilik_tarihi</WEDDINGDAT>
            <PASSPORTDATE>$kisi_pasaport_tarihi</PASSPORTDATE>
            <ISRINGSIZE>$kisi_yuzuk_olcusu</ISRINGSIZE>
            <NOT>$kisi_not</NOT>
        </ROW>
    </XMLCUSTTBL>";
    $caniasConnector = new caniasConnector();
    $caniasConnector->wsCanias("addCustomer", ["0","$xml","$username","1"]);
    echo "ETK"; 
    unset($_SESSION['kisiVerileri']);
} elseif (strtoupper($userInput) === $kvkk_etk_codes) {

    $xml = "<?xml version='1.0' encoding='UTF-8'?>
    <XMLCUSTTBL>
        <ROW>
            <ISCUSTORVEND>3</ISCUSTORVEND>
            <TAXNUM>$kisi_tc</TAXNUM>
            <TITLE></TITLE>
            <NAME1>$kisi_ad_soyad</NAME1>
            <ADDRESSLINE1>$kisi_adres</ADDRESSLINE1>
            <COUNTRY>$kisi_ulke</COUNTRY>
            <ISLOCKED>0</ISLOCKED>
            <ZIPSTREET>34000</ZIPSTREET>
            <CITY>$kisi_sehir</CITY>
            <TOWN>$kisi_ilce</TOWN>
            <LOCALITY></LOCALITY>
            <AVENUE></AVENUE>
            <STREET></STREET>
            <OTHERINFO></OTHERINFO>
            <TELNUM>$kisi_tel</TELNUM>
            <TLXNUM>aa.a.com.trr</TLXNUM>
            <CURRENCY>TL</CURRENCY>
            <LANGU>T</LANGU>
            <BRANCH>*</BRANCH>
            <SORTBY>*</SORTBY>
            <ACCLASS>C</ACCLASS>
            <CUSTACC></CUSTACC>
            <RECACC>120.01</RECACC>
            <ADVPACC>120.01</ADVPACC>
            <VATKEY>20</VATKEY>
            <PAYMCOND>000</PAYMCOND>
            <PAYMTYPE>*</PAYMTYPE>
            <ISSMSCONF>2</ISSMSCONF>
            <ISSMSCONFDATE>$date</ISSMSCONFDATE>
            <GENDER>$kisi_cinsiyet</GENDER>
            <PASSPORTNUM>$kisi_pasaport_numarasi</PASSPORTNUM>
            <BIRTHDAY>$kisi_dogum_tarihi</BIRTHDAY>
            <PRBIRTHDAY>$kisi_es_dogum_tarihi</PRBIRTHDAY>
            <WEDDINGDAT>$kisi_evlilik_tarihi</WEDDINGDAT>
            <PASSPORTDATE>$kisi_pasaport_tarihi</PASSPORTDATE>
            <ISRINGSIZE>$kisi_yuzuk_olcusu</ISRINGSIZE>
            <NOT>$kisi_not</NOT>
        </ROW>
    </XMLCUSTTBL>";
    $caniasConnector = new caniasConnector();
    $caniasConnector->wsCanias("addCustomer", ["0","$xml","$username","2"]);
    echo "KVKK_ETK"; 
    unset($_SESSION['kisiVerileri']);
} else {

    $xml = "<?xml version='1.0' encoding='UTF-8'?>
    <XMLCUSTTBL>
        <ROW>
            <ISCUSTORVEND>3</ISCUSTORVEND>
            <TAXNUM>$kisi_tc</TAXNUM>
            <TITLE></TITLE>
            <NAME1>$kisi_ad_soyad</NAME1>
            <ADDRESSLINE1>$kisi_adres</ADDRESSLINE1>
            <COUNTRY>$kisi_ulke</COUNTRY>
            <ISLOCKED>0</ISLOCKED>
            <ZIPSTREET>34000</ZIPSTREET>
            <CITY>$kisi_sehir</CITY>
            <TOWN>$kisi_ilce</TOWN>
            <LOCALITY></LOCALITY>
            <AVENUE></AVENUE>
            <STREET></STREET>
            <OTHERINFO></OTHERINFO>
            <TELNUM>$kisi_tel</TELNUM>
            <TLXNUM>aa.a.com.trr</TLXNUM>
            <CURRENCY>TL</CURRENCY>
            <LANGU>T</LANGU>
            <BRANCH>*</BRANCH>
            <SORTBY>*</SORTBY>
            <ACCLASS>C</ACCLASS>
            <CUSTACC></CUSTACC>
            <RECACC>120.01</RECACC>
            <ADVPACC>120.01</ADVPACC>
            <VATKEY>20</VATKEY>
            <PAYMCOND>000</PAYMCOND>
            <PAYMTYPE>*</PAYMTYPE>
            <ISSMSCONF>0</ISSMSCONF>
            <ISSMSCONFDATE></ISSMSCONFDATE>
            <GENDER>$kisi_cinsiyet</GENDER>
            <PASSPORTNUM>$kisi_pasaport_numarasi</PASSPORTNUM>
            <BIRTHDAY>$kisi_dogum_tarihi</BIRTHDAY>
            <PRBIRTHDAY>$kisi_es_dogum_tarihi</PRBIRTHDAY>
            <WEDDINGDAT>$kisi_evlilik_tarihi</WEDDINGDAT>
            <PASSPORTDATE>$kisi_pasaport_tarihi</PASSPORTDATE>
            <ISRINGSIZE>$kisi_yuzuk_olcusu</ISRINGSIZE>
            <NOT>$kisi_not</NOT>
        </ROW>
    </XMLCUSTTBL>";
    $caniasConnector = new caniasConnector();
    $caniasConnector->wsCanias("addCustomer", ["0","$xml","$username","0"]);
    echo "Reddedildi."; 
    unset($_SESSION['kisiVerileri']);
}

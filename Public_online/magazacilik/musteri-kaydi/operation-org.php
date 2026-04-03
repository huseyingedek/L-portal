<?php
session_start();  
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
require_once "../nusoap.php";
require_once "../caniasConnector.php";
$username = $_SESSION['usern'];


// $veriler = array();
// foreach ($_POST as $anahtar => $deger) {
//     $veriler[$anahtar] = $deger;
// }

// // Diziyi ekrana yazdır
// print_r($veriler);



$date = date('d.m.y');
// $kisi_fk = $_POST['kisi_fk'];
$kisi_hesap_tipi = "C";
$kisi_hesap_no = "120.01";
$kisi_para_birimi = "TL";
$kisi_sirala = "*";
$kisi_sube = "*";
$kisi_dil = "T";
$kisi_gr = "PR";
$kisi_p_kodu = "0054";
$kisi_kdv_anh = "00";
$kisi_on_kosulu = "000";
$kisi_odeme_tipi = "*";
$kisi_cinsiyet = $_POST['kisi_cinsiyet'];
$kisi_ad_soyad = $_POST['kisi_ad_soyad'];
$kisi_tc = $_POST['kisi_tc'];
$kisi_tel = $_POST['kisi_tel'];
$kisi_eposta = $_POST['kisi_eposta'];
$kisi_vergi_dairesi = $_POST['kisi_vergi_dairesi'];
// $kisi_vergi_numarasi = $_POST['kisi_vergi_numarasi'];
$kisi_dogum_tarihi = $_POST['kisi_dogum_tarihi'];
$kisi_es_dogum_tarihi = $_POST['kisi_es_dogum_tarihi'];
$kisi_evlilik_tarihi = $_POST['kisi_evlilik_tarihi'];
$kisi_yuzuk_olcusu = $_POST['kisi_yuzuk_olcusu'];
$kisi_pasaport_numarasi = $_POST['kisi_pasaport_numarasi'];
$kisi_pasaport_tarihi = $_POST['kisi_pasaport_tarihi'];
$kisi_ulke = $_POST['kisi_ulke'];
$kisi_sehir = $_POST['kisi_sehir'];
$kisi_ilce = $_POST['kisi_ilce'];
$kisi_semt = $_POST['kisi_semt'];
$kisi_cadde = $_POST['kisi_cadde'];
$kisi_sokak = $_POST['kisi_sokak'];
$kisi_bina_no = $_POST['kisi_bina_no'];
if (empty($_POST['kisi_adres'])) {
    $kisi_adres = $kisi_semt."/ ".$kisi_cadde."/ ".$kisi_sokak."/ ".$kisi_bina_no. " - " . $kisi_ilce."/".strtoupper($kisi_sehir);
}else{
    $kisi_adres = $_POST['kisi_adres'];
}
if(isset($_POST['kisi_sms'])){
    $kisi_sms = $_POST['kisi_sms'];
}else{
    $kisi_sms = '0';
}
if(!isset($SMSCONF)){
    $SMSCONF = 0;
}
if(!isset($SMS_DATE)){
    $SMS_DATE = '01.01.1975';
}
// echo "<hr>".$SMSCONF."<hr>".$SMS_DATE;
// $kisi_sms = '0';
// echo $kisi_sms."<br>".$username."<br>";
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
		<LOCALITY>$kisi_semt</LOCALITY>
		<AVENUE>$kisi_cadde</AVENUE>
		<STREET>$kisi_sokak</STREET>
		<OTHERINFO>$kisi_bina_no</OTHERINFO>
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
		<ISSMSCONF>$SMSCONF</ISSMSCONF>
		<ISSMSCONFDATE>$SMS_DATE</ISSMSCONFDATE>
		<GENDER>$kisi_cinsiyet</GENDER>
		<PASSPORTNUM>$kisi_pasaport_numarasi</PASSPORTNUM>
		<BIRTHDAY>$kisi_dogum_tarihi</BIRTHDAY>
		<PRBIRTHDAY>$kisi_es_dogum_tarihi</PRBIRTHDAY>
		<WEDDINGDAT>$kisi_evlilik_tarihi</WEDDINGDAT>
		<PASSPORTDATE>$kisi_pasaport_tarihi</PASSPORTDATE>
        <ISRINGSIZE>$kisi_yuzuk_olcusu</ISRINGSIZE>
	</ROW>
</XMLCUSTTBL>";


// print_r($xml);

$caniasConnector = new caniasConnector();
$caniasConnector->wsCanias("addCustomer", ["0","$xml","$username","$kisi_sms"]);
$sonuc = $caniasConnector->wsGetResponse();
// $sonuc_json = json_decode($sonuc,true);

$kvkk_code = strtoupper(substr($sonuc, 0, 4));
$etk_code = substr($sonuc, 4);
$kvkk_etk_codes = $kvkk_code.$etk_code;
echo $kvkk_etk_codes;
if(!empty($sonuc)){

?>
<!DOCTYPE html>
<html>
<head>
    <title>Kayıt Sonuç Ekranı</title>
</head>
<body>
    <script>
function openPopup() {
  var userInput = prompt("Kodu kontrol etmek için bir değer girin:");
  var kvkk_code = "<?php echo $kvkk_code ?>";
  var etk_code = "<?php echo $etk_code ?>";
  var kvkk_etk_codes = "<?php echo $kvkk_etk_codes ?>";
  if (userInput.toUpperCase() === kvkk_code) {
    <?php 
    $SMSCONF = 1; 
    $SMS_DATE = date('d.m.Y');
    $caniasConnector->wsCanias("addCustomer", ["0","$xml","$username","0"]);
    ?>
    alert("Yalnızca KVKK Kabul Edildi!");
  } else if (userInput.toUpperCase() === etk_code) {
    <?php 
    $SMSCONF = 1; 
    $SMS_DATE = date('d.m.Y');
    $caniasConnector->wsCanias("addCustomer", ["0","$xml","$username","0"]);
    ?>
    alert("Yalnızca ETK Kabul Edildi!");
  } else if (userInput.toUpperCase() === kvkk_etk_codes) {
    <?php 
    $SMSCONF = 2;
    $SMS_DATE = date('d.m.Y');
    $caniasConnector->wsCanias("addCustomer", ["0","$xml","$username","0"]);
     ?>
    alert("KVKK ve ETK Kabul Edildi!");
  } else {
    <?php 
    $SMSCONF = 0;
    $SMS_DATE = null;
    $caniasConnector->wsCanias("addCustomer", ["0","$xml","$username","0"]);
    ?>
    alert("KVKK ve ETK Reddedildi!");
  }
}
window.onload = function() {
  openPopup();
};
    </script>
</body>
</html>


<?php } ?>


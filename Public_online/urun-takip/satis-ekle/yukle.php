<?php
session_start();
if(!isset($_SESSION['firma_ad']))
{
  header('Location: ' . '../index.php', true, '303');
  exit;
}
// Veritabanı bağlantısı
require('../../class/db.php');


$barkod_no = strtoupper($_POST['barkod_no']);
$urun_fiyat = $_POST['urun_fiyat'];
$satis_tarih = $_POST['satis_tarih']." ".date("H:i:s");
$para_birimi = $_POST['para_birimi'];
$firma_ad =  $_SESSION['firma_ad'];
$kisi_ad_soyad =  $_SESSION['kisi_ad_soyad'];
$kisi_tel =  $_SESSION['kisi_tel'];
$url = "https://online.lizaypirlanta.com/urun-takip/satis-ekle/";
  

  // db

$query = "INSERT INTO SATIS_TAKIPLERI (barkod_no, urun_fiyat, para_birimi, satis_tarih, firma_ad, kisi_ad_soyad, kisi_tel) VALUES (:barkod_no, :urun_fiyat, :para_birimi, :satis_tarih, :firma_ad, :kisi_ad_soyad, :kisi_tel)";

$params = [
  ':firma_ad' => $firma_ad,
  ':kisi_ad_soyad' => $kisi_ad_soyad,
  ':kisi_tel' => $kisi_tel,
  ':barkod_no' => $barkod_no,
  ':urun_fiyat' => $urun_fiyat,
  ':satis_tarih' =>$satis_tarih,
  ':para_birimi' =>$para_birimi,
];

if(isset($barkod_no) && $barkod_no != "" && isset($urun_fiyat) && $urun_fiyat != "" && isset($satis_tarih) && $satis_tarih != ""){
try {
   $query = $db->query($query, $params);
   if($query){
    echo "<script>alert('Başarıyla eklendi! Ekleme sayfasına geri yönlendiriliyorsunuz.'); window.location = '$url';</script>";
    exit;
   }


} catch (PDOException $e) {
  echo "<script>alert('$e'); window.location = '$url';</script>";

  exit;
}
}else{
  echo "<script>alert('Eksik bilgi girdiniz. Tarih, fiyat ve barkod bilgisi girilmesi zorunludur.'); window.location = '$url';</script>";
  exit;
}


?>

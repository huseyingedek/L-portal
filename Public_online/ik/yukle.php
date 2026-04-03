<?php

// Veritabanı bağlantısı
require('../class/settings.php');

// Yüklenen kisi_resim
$kisi_tur = $_POST['kisi_tur'];
$kisi_ad = $_POST['kisi_ad'];
$kisi_soyad = $_POST['kisi_soyad'];
$kisi_ad_soyad = $kisi_ad." ".$kisi_soyad;
$kisi_gorev = $_POST['kisi_gorev'];
$kisi_eposta = $_POST['kisi_eposta'];
$kayit_saati = date('H:i:s');
$kisi_kayit_tarihi = $_POST['kisi_kayit_tarihi']." ".$kayit_saati;

if(strlen($_POST['kisi_vekalet_suresi'])<1){
  $kisi_vekalet_suresi = null;
}else{
  $kisi_vekalet_suresi = $_POST['kisi_vekalet_suresi'];
}
if(strlen($_POST['kisi_onceki_gorevi'])<1){
  $kisi_onceki_gorevi = null;
}else{
  $kisi_onceki_gorevi = $_POST['kisi_onceki_gorevi'];
}



if($kisi_tur == 'ise_alim'){
  $target_dir = "ise-alim-duyurulari/img/";
  $url = "ise-alim-duyurulari";  //dönüştürülecek
}elseif($kisi_tur == 'gorev_atamasi'){
  $target_dir = "atama-gorev-degisiklikleri/img/";
  $url = "atama-gorev-degisiklikleri";  //dönüştürülecek
}

$timestamp = date("Y-m-d_H:i:s");
$filename_parts = pathinfo($_FILES["kisi_resim"]["name"]);
$extension = strtolower($filename_parts['extension']);
$new_filename = $filename_parts['filename'] . "_" . $timestamp . "." . $extension;
$target_file = $target_dir . $new_filename;

$uploadOk = 1;
$imageFileType = strtolower(pathinfo($target_file,PATHINFO_EXTENSION));


if(isset($_POST["submit"])) {
  $check = getimagesize($_FILES["kisi_resim"]["tmp_name"]);
  if($check !== false) {
    echo "Resim dosyası yüklenmekte - " . $check["mime"] . "."; //resim türü kontrolü mime
    $uploadOk = 1;
  } else {
    echo "Bu bir resim dosyası değildir.";
    $uploadOk = 0;
  }
}

if (file_exists($target_file)) {
  echo "Bu isimde bir resim zaten mevcut.";
  $uploadOk = 0;
}

if ($_FILES["kisi_resim"]["size"] > 200000) {
  echo "Resim boyutu 2mb'dan büyük olamaz.";
  $uploadOk = 0;
}


if($imageFileType != "jpg" && $imageFileType != "png" && $imageFileType != "jpeg") {
  echo "Sadece JPG, JPEG, PNG uzantılı resimler kabul edilmektedir.";
  $uploadOk = 0;
}


if ($uploadOk == 0) {
  echo "<br>";
  echo "Resim yüklenirken bir hata oluştu. <b> 5 saniye sonra yönlendirileceksiniz.</b><br>";
  echo "Dosya uzantısı: $imageFileType"."<br>"; 
  echo '<script type="text/javascript">
  setTimeout(function () {
      window.location.href = "ekle.php";
  }, 5000); // 5000 milisaniye (5 saniye)
</script>';
  

} else {
  if (move_uploaded_file($_FILES["kisi_resim"]["tmp_name"], $target_file)) {
    // db

$kisi_resim = "img/".$new_filename;

$query = "INSERT INTO KAYITLAR (kisi_ad, kisi_soyad, kisi_ad_soyad, kisi_eposta, kisi_gorev, kisi_tur, kisi_resim, kisi_kayit_tarihi, kisi_onceki_gorevi, kisi_vekalet_suresi) VALUES (:kisi_ad, :kisi_soyad, :kisi_ad_soyad, :kisi_eposta, :kisi_gorev, :kisi_tur, :kisi_resim, :kisi_kayit_tarihi, :kisi_onceki_gorevi, :kisi_vekalet_suresi)";

$params = [
  ':kisi_ad' => $kisi_ad,
  ':kisi_soyad' => $kisi_soyad,
  ':kisi_ad_soyad' => $kisi_ad_soyad,
  ':kisi_gorev' => $kisi_gorev,
  ':kisi_tur' => $kisi_tur,
  ':kisi_resim' => $kisi_resim,
  ':kisi_kayit_tarihi' =>$kisi_kayit_tarihi,
  ':kisi_vekalet_suresi' => $kisi_vekalet_suresi,
  ':kisi_onceki_gorevi' => $kisi_onceki_gorevi,
  ':kisi_eposta' => $kisi_eposta,
];

try {
   $query = $db->query($query, $params);
   if($query){
    $success_message = htmlspecialchars( basename( $_FILES["kisi_resim"]["name"])). " resimli $kisi_ad_soyad başarıyla eklendi.";
    echo "<script>alert('$success_message'); window.location = '$url';</script>";
    exit;
   }


} catch (PDOException $e) {
  $failed_message = htmlspecialchars( basename( $_FILES["kisi_resim"]["name"])). " resimli $kisi_ad_soyad veritabanına aktarılırken bir hata oluştu.";

  echo "<script>alert('$failed_message'); window.location = '$url';</script>";
  exit;
}

  } else {
    echo "Resim yüklenirken hata oluştu.";
  }
}

?>

<?php

// Veritabanı bağlantısı
require('../../db.php');

// Form verileri
$adsoyad = $_POST["adsoyad"];
$gorev = $_POST["gorev"];
$isealim = isset($_POST["isealim"]) ? 1 : 0;
$atamagorev = isset($_POST["atamagorev"]) ? 1 : 0;

// Yüklenen resim
$target_dir = "uploads/";
$target_file = $target_dir . basename($_FILES["resim"]["name"]);
$imageFileType = strtolower(pathinfo($target_file,PATHINFO_EXTENSION));
$uploadOk = 1;
// Dosya var mı kontrolü
if(isset($_POST["submit"])) {
  $check = getimagesize($_FILES["resim"]["tmp_name"]);
  if($check !== false) {
    echo "Dosya bir resim - " . $check["mime"] . ".";
    $uploadOk = 1;
  } else {
    echo "Dosya bir resim değil.";
    $uploadOk = 0;
  }
}
// Dosya boyutu kontrolü (2 MB)
if ($_FILES["resim"]["size"] > 2000000) {
  echo "Maalesef, dosya boyutu çok büyük.";
  $uploadOk = 0;
}
// Dosya uzantısı kontrolü
if($imageFileType != "jpg" && $imageFileType != "png" && $imageFileType != "jpeg" && $imageFileType != "gif" ) {
  echo "Sadece JPG, JPEG, PNG ve GIF dosyaları yükleyebilirsiniz.";
  $uploadOk = 0;
}
// Upload işlemi
if ($uploadOk == 0) {
  echo "Dosya yüklenemedi.";
} else {
  if (move_uploaded_file($_FILES["resim"]["tmp_name"], $target_file)) {
    echo "Dosya başarıyla yüklendi.";
  } else {
    echo "Dosya yüklenirken bir hata oluştu.";
  }
}

// Veritabanına ekleme
$sql = "INSERT INTO kayitlar (adsoyad, gorev, isealim, atamagorev, resim) VALUES ('$adsoyad', '$gorev', $isealim, $atamagorev, '$target_file')";
if ($conn->query($sql) === TRUE) {
  echo "Veri başarıyla eklendi.";
} else {
  echo "Veri eklenirken bir hata oluştu: " . $sql . "<br>" . $conn->error;
}

$conn->close();
?>

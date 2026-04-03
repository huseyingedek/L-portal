<?php session_start();

require('../class/db.php');
// KAYIT İŞLEMLERİ
if($_POST['firma_ad'])
{
    $firma_ad = $_POST['firma_ad'];
    $kisi_ad_soyad = $_POST['kisi_ad_soyad'];
    $kisi_tel = $_POST['kisi_tel'];
    $kisi_password = $_POST['kisi_password'];
    $kisi_eposta = $_POST['kisi_eposta'];

$query = "INSERT INTO BAYILER_ODEME_HESAPLARI (firma_ad, kisi_tel, kisi_ad_soyad, kisi_password, kisi_eposta) VALUES (:firma_ad, :kisi_tel, :kisi_ad_soyad, :kisi_password, :kisi_eposta)";

$params = [
  ':firma_ad' => $firma_ad,
  ':kisi_ad_soyad' => $kisi_ad_soyad,
  ':kisi_tel' => $kisi_tel,
  ':kisi_password' => $kisi_password,
  ':kisi_eposta' => $kisi_eposta,
];

try {
   $query = $db->query($query, $params);
   if($query){
    $success_message = "Başarıyla kayıt olundu!";
    echo "<script>alert('$success_message'); window.location.href = 'index.php#login'; </script>";
    exit;
   }else{
    $error_message = "Başarısız.";
    echo "<script>alert('$error_message'); window.location.href = 'index.php';</script>";
    exit;
   }


} catch (PDOException $e) {
    echo $e;
}


}
// GİRİŞ İŞLEMLERİ
elseif(!empty($_POST['kisi_tel']) && !empty($_POST['kisi_password']) && empty($_POST['firma_ad']) && empty($_POST['kisi_ad_soyad']))
{

 $kisi_tel = $_POST['kisi_tel'];
 $kisi_password = $_POST['kisi_password'];

$query = "SELECT * FROM BAYILER_ODEME_HESAPLARI WHERE kisi_tel = :kisi_tel AND kisi_password = :kisi_password";
$params = [
    ':kisi_tel' => $kisi_tel,
    ':kisi_password' => $kisi_password,
  ];
$queryResult = $db->query($query, $params);

// Sonuçları kontrol et
if ($queryResult->rowCount() > 0) {
    $firma = $queryResult->fetch(PDO::FETCH_ASSOC);
    $_SESSION['firma_ad'] = $firma['firma_ad'];
    $_SESSION['kisi_ad_soyad'] = $firma['kisi_ad_soyad'];
    $_SESSION['kisi_tel'] = $firma['kisi_tel'];
    $_SESSION['kisi_oncelik'] = $firma['kisi_oncelik'];
    $_SESSION['kisi_eposta'] = $firma['kisi_eposta'];
    header('Location: wsindex.php');
    exit;
} else {
    session_destroy();
    $error_message = "Giriş bilgileriniz hatalı.";
    echo "<script>alert('$error_message'); window.location.href = 'index.php';</script>";
    exit;
}
}
//ŞİFREMİ UNUTTUM
if($_POST['remind_password'])
{
header('Location: functions/passwordReminder.php');
exit;
}

?>
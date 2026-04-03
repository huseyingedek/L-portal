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

$query = "INSERT INTO SATIS_EKLEME_KULLANICI (firma_ad, kisi_tel, kisi_ad_soyad, kisi_password, kisi_eposta) VALUES (:firma_ad, :kisi_tel, :kisi_ad_soyad, :kisi_password, :kisi_eposta)";

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

$query = "SELECT * FROM SATIS_EKLEME_KULLANICI WHERE kisi_tel = :kisi_tel AND kisi_password = :kisi_password";
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
use PHPMailer\PHPMailer\PHPMailer;

if ($_POST['remind_password']) {
    require '../vendor/autoload.php';
    function sendEmail($to, $subject, $body) {
        $mail = new PHPMailer(true);
        $mail->isSMTP();
        $mail->Host = 'smtp.ethereal.email';
        $mail->SMTPAuth = true;
        $mail->Username = 'darrel.boehm@ethereal.email';
        $mail->Password = 'gsCg9u8GJHHkmG8CPh';
        $mail->SMTPSecure = 'tls';
        $mail->Port = 587;
        
        // Gönderen bilgileri
        $mail->setFrom('darrel.boehm@ethereal.email', 'Darrel Boehm'); // Kendi e-posta bilgileriniz
        $mail->addReplyTo('darrel.boehm@ethereal.email', 'Darrel Boehm'); // Yanıt adresi
    
        // Alıcı adresi
        $mail->addAddress($to);
    
        // E-posta içeriği
        $mail->isHTML(true);
        $mail->Subject = $subject;
        $mail->Body = $body;
        $mail->CharSet = 'UTF-8';
        try {
            $mail->send();
            echo 'E-posta başarıyla gönderildi. İşte e-posta bilgileri:<br>';
            echo 'Alıcı: ' . $to . '<br>';
            echo 'Konu: ' . $subject . '<br>';
            echo 'İçerik: ' . $body . '<br>';
            echo 'E-posta URL: ' . $mail->getSentMIMEMessage() . '<br>';
        } catch (Exception $e) {
            echo 'E-posta gönderilemedi. Hata: ' . $mail->ErrorInfo;
        }
    }
    
    // Test için kullanılacak alıcı e-posta adresi
    $to = 'fredrick.kozey45@ethereal.email';
    $subject = 'Test E-posta';
    $body = 'Bu bir test e-postasıdır.';
    
    // E-postayı gönderin
    sendEmail($to, $subject, $body);
}

?>
<?php
require '../../vendor/autoload.php';
use PHPMailer\PHPMailer\PHPMailer;

function sendEmail($to, $subject, $body) {
    $mail = new PHPMailer(true);
    $mail->isSMTP();
    $mail->Host = 'mail.lizaysystem.com';
    $mail->SMTPAuth = true;
    $mail->Username = 'bilgilendirme@lizay.com.tr';
    $mail->Password = '232023Lizay';
    $mail->SMTPSecure = 'ssl';
    $mail->Port = 465;
    

    // Gönderen bilgileri
    $mail->setFrom('bilgilendirme@lizay.com.tr', 'Lizay Pırlanta Bilgilendirme'); // Kendi e-posta bilgileriniz
    $mail->addReplyTo('bilgilendirme@lizay.com.tr', 'Lizay Pırlanta Bilgilendirme'); // Yanıt adresi

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
$to = 'ahmetihsanbozaci@lizay.com.tr';
$subject = 'Test E-posta';
$body = 'Bu bir test e-postasıdır. sunucudan';

// E-postayı gönderin
sendEmail($to, $subject, $body);
?>

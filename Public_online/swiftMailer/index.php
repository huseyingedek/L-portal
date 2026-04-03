<?php

require_once 'vendor/autoload.php';

// Create the Transport
$transport = (new Swift_SmtpTransport('mail.lizaysystem.com', 465))
  ->setUsername('bilgilendirme@lizay.com.tr')
  ->setPassword('232023Lizay')
;

// Create the Mailer using your created Transport
$mailer = new Swift_Mailer($transport);

// Create a message
$message = (new Swift_Message('Wonderful Subject'))
  ->setFrom(['bilgilendirme@lizay.com.tr' => 'Lizay Pırlanta Bilgilendirme'])
  ->setTo(['rohleder00@yandex.com' => 'Ahmet İhsan Bozacı'])
  ->setBody('Here is the message itself')
  ;

// Send the message
$result = $mailer->send($message);

?>
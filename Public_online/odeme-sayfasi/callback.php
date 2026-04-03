<?php
ob_start();

// ini_set('display_errors', 1);
// ini_set('display_startup_errors', 1);
// error_reporting(E_ALL);

require_once('iyzipay-php/samples/config.php');


$token = $_POST['token'];



require_once('iyzipay-php/samples/retrieve_pay_with_iyzico_result.php');
if($status == "failure"){
    echo '<script>
    window.location.href = "https://online.lizaypirlanta.com/odeme-sayfasi/index.php?status=err";
  </script>';
    exit;
}
if($payWithIyzico->getPaymentStatus() === "SUCCESS"){

  try {
    require_once('../class/db.php');
    $db = new AhmDB();
    date_default_timezone_set('Europe/Istanbul');
    $paymentId = $payWithIyzico->getPaymentId();
    $odeme_tutar = $payWithIyzico->getPaidPrice();
    $para_birimi = $payWithIyzico->getCurrency();
    $taksit = $payWithIyzico->getInstallment();
    $kart_son_4_hane = $payWithIyzico->getLastFourDigits();
    $tarih = date('Y-m-d H:i:s');
    

    $query = "INSERT INTO IYZICO (odeme_conversation_id, odeme_payment_id,
     odeme_tutar, odeme_para_birimi, odeme_taksit, odeme_kart_son_4_hane, odeme_tarih) VALUES 
     (:odeme_conversation_id, :odeme_payment_id, :odeme_tutar, 
     :odeme_para_birimi, :odeme_taksit, :odeme_kart_son_4_hane, :odeme_tarih)";
    $params = [
        ':odeme_conversation_id' => $conversationId,
        ':odeme_payment_id' => $paymentId,
        ':odeme_tutar' =>$odeme_tutar,
        ':odeme_para_birimi' => $para_birimi,
        ':odeme_taksit' =>$taksit,
        ':odeme_kart_son_4_hane' => $kart_son_4_hane,
        ':odeme_tarih' => $tarih,
      ];

        $query = $db->query($query, $params);
        if($query){
          echo '<script>
            window.location.href = "https://online.lizaypirlanta.com/odeme-sayfasi/index.php?status=success";
          </script>';
          exit;
        }else{
          echo '<script>
          window.location.href = "https://online.lizaypirlanta.com/odeme-sayfasi/index.php?status=err";
        </script>';
    exit;
        }
        
    } catch (PDOException $e) {
        die("Veritabanına kaydedilirken bir hata oluştu: " . $e->getMessage());
        
    }
  //   echo '<script>
  //   window.location.href = "https://online.lizaypirlanta.com/odeme-sayfasi/index.php?status=success";
  // </script>';
}

elseif($payWithIyzico->getStatus() === "failure"){


  if($payWithIyzico->getErrorCode() == '5126'){
  echo '<script>
    window.location.href = "https://online.lizaypirlanta.com/odeme-sayfasi/index.php?status=success";
  </script>';
  exit;
  }else{
    $errMsg = $payWithIyzico->getErrorMessage();
   echo $hata_mesaji = "Hata kodu: " . $errMsg;
    
    echo '<script>
          window.location.href = "https://online.lizaypirlanta.com/odeme-sayfasi/index.php?status=err";
        </script>';
    exit;
  }
  

}

    ob_end_flush();
?>
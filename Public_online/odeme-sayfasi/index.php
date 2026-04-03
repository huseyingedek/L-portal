<?php
require_once('../class/settings.php');
// if ($_SESSION['login'] != 1) {
// header('Location: ' . '../index.php', true, '303');
// exit;
// }

// ini_set('display_errors', 1);
// ini_set('display_startup_errors', 1);
// error_reporting(E_ALL);
$status = $_GET["status"];
if($_POST){


//proxyli ip kontrolü ve ip adresi çekme
if(isset($_SERVER["HTTP_X_FORWARDED_FOR"])){
  $odeme_ip = $_SERVER["HTTP_X_FORWARDED_FOR"]; 
}else{
  $odeme_ip = $_SERVER['REMOTE_ADDR'];
}

// IP adresini kullanarak konumu
$location = json_decode(file_get_contents("https://ipinfo.io/{$odeme_ip}/json"));
$odeme_sehir = $location->city;
$odeme_ulke = $location->country;
$odeme_posta_kodu = $location->postal;
$odeme_email = $_POST['odeme_email'];
$odeme_tc = $_POST['odeme_tc'];
$odeme_kisi_ad = getFirstName($_POST['odeme_kisi']);
$odeme_kisi_soyad = getLastName($_POST['odeme_kisi']);
$odeme_kisi = $odeme_kisi_ad . " " . $odeme_kisi_soyad;
$odeme_tel = $_POST['odeme_tel'];
$odeme_fatura = $_POST['odeme_fatura'];

if(strlen($odeme_kisi_ad)<2 || strlen($odeme_kisi_soyad)<2){
  $hata_mesaji = "Kart sahibinin adı tam girilmelidir.";
}

$odeme_tutar = $_POST['odeme_tutar'];


require('iyzipay-php/samples/initialize_pay_with_iyzico.php');
if($payWithIyzicoInitialize->getStatus() === "success"){
echo "<script>window.location.replace('" . $_SESSION['payWithIyzicoPageUrl'] . "');</script>";
unset($_SESSION['payWithIyzicoPageUrl']);
}
}
?>
<!DOCTYPE html>
<html lang="tr">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>iyzico Ödeme Sayfası</title>
  <link rel="stylesheet" href="styles.css">
  <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11.7.28/dist/sweetalert2.all.min.js"></script>
  <link href="https://cdn.jsdelivr.net/npm/sweetalert2@11.7.28/dist/sweetalert2.min.css" rel="stylesheet">
</head>
<?php

?>

<body>
  <header>
    <h1>iyzico Güvenli Ödeme Sayfası</h1>
  </header>
  <br>
  <main>
    <div class="payment-form">
      <h2>Ödeme Bilgileri</h2>
      <form id="odemeForm" action="" method="post">
        <div class="form-group">
          <label for="odeme_tc">T.C Kimlik No:</label>
          <input type="text" id="odeme_tc" name="odeme_tc" maxlength="11" onkeypress="return isNumber(event)" required>
        </div>
        <div class="form-group">
          <label for="odeme_kisi">Ad Soyad:</label>
          <input type="text" id="odeme_kisi" name="odeme_kisi" required>
        </div>
        <div class="form-group">
          <label for="odeme_tel">Telefon Numarası:</label>
          <input type="text" id="odeme_tel" name="odeme_tel" maxlength="11" onkeypress=" return isNumber(event)" oninput="inputValue(this)" required>
        </div>
        <div class="form-group">
          <label for="odeme_tel">E-Posta Adresi:</label>
          <input type="email" id="odeme_email" name="odeme_email" required>
        </div>
        <div class="form-group">
          <label for="odeme_fatura">Fatura Adresi:</label>
          <input type="text" id="odeme_fatura" name="odeme_fatura" required>
        </div>
        <div class="form-group">
          <label for="odeme_tutar">Ödeme Miktarı (TL):</label>
          <input type="text" id="odeme_tutar" name="odeme_tutar" onkeypress="return isNumber(event)" required>
        </div>
        <div class="form-group">
          <span id="hata_mesaji" style="color: red;"><?php echo $hata_mesaji; ?></span>
        </div>
        <button type="submit">Ödemeyi Tamamla</button>
      </form>
    </div>
  </main><br>
  <footer>
    <p>&copy;<b> Lizay Pırlanta </b> 2023 iyzico Ödeme Sistemi</p>
  </footer>

  <script>
    var status = <?php echo json_encode($status); ?>;
    if (status === 'success') {
    Swal.fire({
        icon: 'success',
        title: 'Başarılı',
        text: 'Ödemeniz başarıyla alınmıştır. Teşekkürler!'
    }).then((result) => {
        if (result.isConfirmed) {
            window.location.href = 'https://online.lizaypirlanta.com/odeme-sayfasi';
        }
    });
} else if (status === 'err' || status === 'failure') {
    Swal.fire({
        icon: 'error',
        title: 'Başarısız',
        text: 'Ödeme işlemi başarısız oldu.'
    }).then((result) => {
        if (result.isConfirmed) {
            window.location.href = 'https://online.lizaypirlanta.com/odeme-sayfasi';
        }
    });
}
    // Telefon numarasının başına 0 getiren ve 11 karakterden uzun girdiye engel olan JavaScript kodu
    function inputValue(el) {
      el.value = el.value.replace(/[0+]/, '');
      el.value = '0' + el.value;
      if (el.value.length > 11) {
        el.value = el.value.slice(0, 11);
      }
    }
    // Telefon numarasında string tipine izin vermeyen JavaScript kodu
    function isNumber(evt) {
      evt = (evt) ? evt : window.event;
      var charCode = (evt.which) ? evt.which : evt.keyCode;
      if (charCode > 31 && (charCode < 48 || charCode > 57)) {
        return false;
      }
      return true;
    }

    document.getElementById("odemeForm").addEventListener("submit", function(event) {
      var odemeMiktari = document.getElementById("odeme_tutar").value;
      if (parseInt(odemeMiktari) > 500000) {
        document.getElementById("hata_mesaji").textContent = "Ödeme miktarı 500,000 TL'den fazla olamaz.";
        event.preventDefault(); // Formun gönderilmesini engelle
      } else {
        document.getElementById("hata_mesaji").textContent = "";
      }

    });

  </script>
</body>

</html>
<?php
session_start();
if ($_SESSION['login'] != 1) {
  header('Location: ' . '../index.php', true, '303');
  exit;
}
$username = $_SESSION['usern'];
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
require_once "../nusoap.php";
require_once "../caniasConnector.php";
$caniasConnector = new caniasConnector();
?>
<!DOCTYPE html>
<html>

<head>
  <meta charset="UTF-8">
  <title>Lizay Pırlanta - Müşteri Kaydı</title>
  <!-- Bootstrap CSS -->
  <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css">
</head>

<body>

  <header>
    <nav style="background-color: black;" class="navbar navbar-dark bg-dark">
      <a style="color: white;" class="navbar-brand" href="../index.php">
        Geri Dön
      </a>
    </nav>
  </header>
  <div class="container">
    <h2>Müşteri Kaydı</h2>
    <hr>
    <form action="operation.php" method="POST">
      <!-- <div style="display: none;">
      <input name="kisi_fk" type="text" value="30">
      <input name="kisi_hesap_tipi" type="text" value="C">
      <input name="kisi_hesap_no" type="text" value="120.01">
      <input name="kisi_para_birimi" type="text" value="TL">
      <input name="kisi_sirala" type="text" value="*">
      <input name="kisi_sube" type="text" value="*">
      <input name="kisi_dil" type="text" value="T">
      <input name="kisi_gr" type="text" value="PR">
      <input name="kisi_p_kodu" type="text" value="0054">
      <input name="kisi_kdv_anh" type="text" value="00">
      <input name="kisi_on_kosulu" type="text" value="000">
      <input name="kisi_odeme_tipi" type="text" value="*">
      </div> -->
      <!-- <div class="form-group col-md-4">
        <label for="talep_tarihi">Müşt./Ted. No</label>
        <input type="text" class="form-control" id="talep_tarihi" name="talep_tarihi" required>
      </div> -->
      <!-- Cinsiyet -->


      <div class="form-group col-md-4">
        <label for="kisi_ad_soyad">Ad Soyad:</label>
        <input type="text" class="form-control" id="kisi_ad_soyad" name="kisi_ad_soyad" required>
      </div>
      <div class="form-group col-md-4">
        <label for="kisi_tel">Tel No:</label>
        <input type="number" class="form-control" id="kisi_tel" name="kisi_tel">
      </div>
      <div class="form-group col-md-4">
        <label for="kisi_eposta">E-Posta:</label>
        <input type="email" class="form-control" id="kisi_eposta" name="kisi_eposta">
      </div>
      <div class="form-group col-md-4">
        <label for="kisi_tc">TC/Vergi No:</label>
        <input type="number" class="form-control" id="kisi_tc" name="kisi_tc">
      </div>
      <div class="form-group col-md-4">
        <label for="kisi_vergi_dairesi">Vergi Dairesi:</label>
        <input type="text" class="form-control" id="kisi_vergi_dairesi" name="kisi_vergi_dairesi">
      </div>
      <div class="form-group col-md-4">
        <label for="kisi_ulke">Ülke:</label>
        <select name="kisi_ulke" id="kisi_ulke" class="form-control">
          <?php

          $caniasConnector->wsCanias("getCountryCode", ["P2000C"]);
          $sonuc = $caniasConnector->wsGetResponse();
          $sonuc_json = json_decode($sonuc, true);

          $ulke_adlari = [];
          $ulke_kodlari = [];
          foreach ($sonuc_json as $ulke) {
            $ulke_adlari[] = explode("-", $ulke["COUNTRY"])[1];
            $ulke_kodlari[] = explode("-", $ulke["COUNTRY"])[0];
          }
          for ($i = 0; $i < count($ulke_adlari); $i++) {
            $selected = ($ulke_kodlari[$i] === 'TR') ? 'selected' : ''; // Varsayılan olarak "Türkiye" seçili
            echo '<option value="' . $ulke_kodlari[$i] . '" ' . $selected . '>' . $ulke_adlari[$i] . '</option>';
          }
          ?>
        </select>
      </div>
      <div class="form-group col-md-4">
        <label for="kisi_sehir">Şehir:</label>
        <select name="kisi_sehir" id="kisi_sehir" class="form-control">
          <?php
          $caniasConnector->wsCanias("getCityCode", ["$username", "TR"]);
          $sonuc = $caniasConnector->wsGetResponse();
          $sonuc_json = json_decode($sonuc, true);

          $sehir_adlari = [];
          $sehir_kodlari = [];
          foreach ($sonuc_json as $sehir) {
            $sehir_adlari[] = explode("-", $sehir["CITY"])[1];
            $sehir_kodlari[] = explode("-", $sehir["CITY"])[0];
          }
          echo '<option value="">Seçiniz</option>';
          for ($i = 0; $i < count($sehir_adlari); $i++) {
            $selected = ($sehir_kodlari[$i] === '34') ? 'selected' : '';
            echo '<option value="' . $sehir_kodlari[$i] . '" ' . $selected . '>' . $sehir_adlari[$i] . '</option>';
          }
          ?>
        </select>
      </div>
      
      <div class="form-group col-md-4">
        <label for="kisi_ilce">İlçe:</label>
        <input type="text" class="form-control" id="kisi_ilce" name="kisi_ilce">
      </div>

      <div class="form-group col-md-4">
        <label for="kisi_adres">Adres:</label>
        <input type="text" class="form-control" id="kisi_adres" name="kisi_adres">
      </div>
      <div class="form-group col-md-4">
        <label for="kisi_dogum_tarihi">Doğum Tarihi:</label>
        <input type="date" class="form-control" id="kisi_dogum_tarihi" name="kisi_dogum_tarihi" value="1975-01-01">
      </div>
      <div class="form-group col-md-4">
        <label for="kisi_pasaport_numarasi">Pasaport No:</label>
        <input type="text" class="form-control" id="kisi_pasaport_numarasi" name="kisi_pasaport_numarasi">
      </div>
      <div class="form-group col-md-4">
        <label for="kisi_pasaport_tarihi">Pasaport Geçerlilik Tarihi:</label>
        <input type="date" class="form-control" id="kisi_pasaport_tarihi" name="kisi_pasaport_tarihi">
      </div>

      <!-- <div class="form-group col-md-4">
        <label for="kisi_vergi_numarasi">Vergi Numarası:</label>
        <input type="number" class="form-control" id="kisi_vergi_numarasi" name="kisi_vergi_numarasi">
      </div> -->

      <div class="form-group col-md-4">
        <label for="kisi_es_dogum_tarihi">Eş Doğum Tarihi:</label>
        <input type="date" class="form-control" id="kisi_es_dogum_tarihi" name="kisi_es_dogum_tarihi" value="1975-01-01">
      </div>
      <div class="form-group col-md-4">
        <label for="kisi_evlilik_tarihi">Evlilik Tarihi:</label>
        <input type="date" class="form-control" id="kisi_evlilik_tarihi" name="kisi_evlilik_tarihi" value="1975-01-01">
      </div>
      <!-- Yüzük Ölçüsü Selectbox -->
      <div class="form-group col-md-4">
        <label for="kisi_yuzuk_olcusu">Yüzük Ölçüsü:</label>
        <select name="kisi_yuzuk_olcusu" id="kisi_yuzuk_olcusu" class="form-control">
          <!-- <option value="Standart Ölçü">Ölçü Seçiniz</option> -->
          <option value="">Seçiniz</option>
          <option value="6">6</option>
          <option value="7">7</option>
          <option value="8">8</option>
          <option value="9">9</option>
          <option value="10">10</option>
          <option value="11">11</option>
          <option value="12">12</option>
          <option value="13">13</option>
          <option value="14">14</option>
          <option value="15">15</option>
          <option value="16">16</option>
          <option value="17">17</option>
          <option value="18">18</option>
          <option value="19">19</option>
          <option value="20">20</option>
          <option value="21">21</option>
          <option value="22">22</option>
        </select>
      </div>


   


      <div class="form-group col-md-4">
        <label for="kisi_cinsiyet">Cinsiyet:</label>
        <select name="kisi_cinsiyet" id="kisi_cinsiyet" class="form-control">
          <option value="Erkek">Erkek</option>
          <option value="Kadın">Kadın</option>
        </select>
      </div>
      <!-- <div class="form-group col-md-4">
        <label for="kisi_semt">Semt:</label>
        <input type="text" class="form-control" id="kisi_semt" name="kisi_semt">
      </div>
      <div class="form-group col-md-4">
        <label for="kisi_cadde">Cadde:</label>
        <input type="text" class="form-control" id="kisi_cadde" name="kisi_cadde">
      </div>
      <div class="form-group col-md-4">
        <label for="kisi_sokak">Sokak:</label>
        <input type="text" class="form-control" id="kisi_sokak" name="kisi_sokak">
      </div>
      <div class="form-group col-md-4">
        <label for="kisi_bina_no">Bina/Kapı No:</label>
        <input type="text" class="form-control" id="kisi_bina_no" name="kisi_bina_no">
      </div> -->
      <br>
      <div class="form-group col-md-4" style="margin-top: 25px;">
        <input type="checkbox" id="kisi_sms" name="kisi_sms" value="1" checked>
        <label for="kisi_sms">SMS Bildirimi</label><br><br>
      </div>
      <br>
      <div class="form-group col-md-12">
        <label for="kisi_bina_no">Müşteri Notları:</label>
        <textarea class="form-control" id="kisi_not" name="kisi_not" rows="8" cols="50"></textarea>
      </div> 
      <br><br><br>

      <div class="form-group col-md-12" style="display: flex; align-items: center; justify-content: center;">
        <button type="submit" class="btn btn-primary">Kaydet</button>
      </div>
    </form>
  </div>
  <!-- jQuery -->
  <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script>
  <!-- Bootstrap JS -->
  <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js"></script>
  <script>
    const kisiSmsCheckbox = document.getElementById("kisi_sms");
    const kisiTelInput = document.getElementById("kisi_tel");
    if (kisiSmsCheckbox.checked) {
      kisiTelInput.setAttribute("required", true);
    } else {
      kisiTelInput.removeAttribute("required");
    }
    $(function() {
      const kisiSmsCheckbox = $("#kisi_sms");
      const kisiTelInput = $("#kisi_tel");
      kisiSmsCheckbox.on("change", function() {
        if (this.checked) {
          kisiTelInput.prop("required", true);
        } else {
          kisiTelInput.prop("required", false);
        }
      });
    });
  </script>
</body>

</html>
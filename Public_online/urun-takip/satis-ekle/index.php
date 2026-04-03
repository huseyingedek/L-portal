<?php
session_start();
if(!isset($_SESSION['firma_ad']))
{
  header('Location: ' . '../index.php', true, '303');
  exit;
}
$firma_ad =  $_SESSION['firma_ad'];
?>
<!DOCTYPE html>
<html lang="tr">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
  <title>Lizay Pırlanta Ürün Takibi</title>
  <!-- Bootstrap CSS -->

  <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css">

</head>

<body>

<header>
<div class="navbar navbar-dark bg-dark shadow-sm" style="background-color: #343A40; color:white;">
  <div class="container d-flex justify-content-between">
  <p class="navbar-brand d-flex align-items-center" style="float:left">
      <svg width="20" height="20" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" aria-hidden="true" class="mr-2" viewBox="0 0 24 24" focusable="false">
      </svg>
      <a href="../wsindex.php">
    <strong style="color:white; text-decoration: none; cursor: pointer;">Geri Dön</strong>
      </a>
    </p>
    <p class="navbar-brand d-flex align-items-center" style="float:right">
    <svg width="20" height="20" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" aria-hidden="true" class="mr-2" viewBox="0 0 24 24" focusable="false">
      </svg>
      <strong>Lizay Pırlanta Satış Ekleme Sayfası - <?php echo $firma_ad; ?></strong>
    </p>
  </div>
</div>
</header>

  <div class="container">
    <h2>Lizay Pırlanta</h2>
    <hr>
    <form action="yukle.php" method="POST">
  <div class="form-group">
    <label for="satis_tarih">Tarih:</label>
    <input type="date" class="form-control" id="satis_tarih" name="satis_tarih" required>
  </div>
  <div class="form-group">
    <label for="barkod_no">Barkod Numarası:</label>
    <input type="text" class="form-control" id="barkod_no" maxlength="8" name="barkod_no" required>
  </div>
  <div class="form-group">
    <label for="urun_fiyat">Fiyat:</label>
    <input type="number" class="form-control" id="urun_fiyat" name="urun_fiyat" required>
  </div>
  <div class="form-group">
    <label for="para_birimi">Para Birimi:</label>
    <select class="form-control" name="para_birimi">
      <option value="TRY" selected>(₺) Türk Lirası</option>
      <option value="USD">($) Dolar</option>
      <option value="EUR">(€) Euro</option>
      <option value="GBP">(£) Pound</option>
    </select>
  </div>
  <button type="submit" class="btn btn-primary">Yükle</button>
</form>

  </div>
  <!-- jQuery -->
  <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script>
  <!-- Bootstrap JS -->
  <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js"></script>


</body>

</html>

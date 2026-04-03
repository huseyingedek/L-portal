<?php
session_start();
if($_SESSION['login']!= 1){
header('Location: ' . '../index.php', true, '303');
exit;
}
?>
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <title>Lizay Pırlanta</title>
    <!-- Bootstrap CSS -->
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css">
  </head>
  <body>

  <header>
  <nav style="background-color: black;" class="navbar navbar-dark bg-dark">
  <a style="color: white;" class="navbar-brand" href="../wsindex.php">
    Geri Dön
  </a>
</nav>
</header>
    <div class="container">
      <h2>Lizay Pırlanta</h2>
      <hr>
      <form action="operation.php" method="POST">
      <div class="form-group col-md-6">
          <label for="talep_tarihi">İzin Talep Tarihi(*):</label>
          <input type="date" class="form-control" id="talep_tarihi" name="talep_tarihi" required>
        </div>
        <div class="form-group col-md-6">
          <label for="kisi_ad_soyad">Ad Soyad(*):</label>
          <input type="text" class="form-control" id="kisi_ad_soyad" name="kisi_ad_soyad" required>
        </div>
        <div class="form-group col-md-6">
          <label for="kisi_tc">TC No(*):</label>
          <input type="number" class="form-control" id="kisi_tc" name="kisi_tc" required>
        </div>
        <div class="form-group col-md-6">
          <label for="kisi_tel">Tel No(*):</label>
          <input type="number" class="form-control" id="kisi_tel" name="kisi_tel" required>
        </div>
        <div class="form-group col-md-6">
          <label for="kisi_birim">Görev Departmanı(*):</label>
          <input type="text" class="form-control" id="kisi_birim" name="kisi_birim" required>
        </div>
        <div class="form-group col-md-6">
          <label for="kisi_giris">İşe Giriş Tarihi:</label>
          <input type="date" class="form-control" id="kisi_giris" name="kisi_giris">
        </div>
        <div class="form-group col-md-6">
          <label for="kisi_izin_baslangic">İzin Başlangıç Tarihi(*):</label>
          <input type="date" class="form-control" id="kisi_izin_baslangic" name="kisi_izin_baslangic" required>
        </div>
        <div class="form-group col-md-6">
          <label for="kisi_izin_bitis">İzin Bitiş (İşe Dönüş) Tarihi(*):</label>
          <input type="date" class="form-control" id="kisi_izin_bitis" name="kisi_izin_bitis" required>
        </div>
        <div class="form-group col-md-6">
          <label for="kisi_izin_yeri">İzinde Bulunacağı Yer:</label>
          <input type="text" class="form-control" id="kisi_izin_yeri" name="kisi_izin_yeri">
        </div>
        <div style="visibility:hidden" class="form-group col-md-6"> <!-- hidden -->
          <label for="kisi_izin_gun">İzin Kullanılan Gün Sayısı(*):</label>
          <input type="number" class="form-control" id="kisi_izin_gun" name="kisi_izin_gun">
        </div>
        <button type="submit" style="margin-left:15px" class="btn btn-primary">PDF İndir</button>
      </form>
    </div>
    <!-- jQuery -->
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script>
    <!-- Bootstrap JS -->
    <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js"></script>

  </body>
</html>

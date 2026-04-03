<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <title>Lizay Pırlanta</title>
    <!-- Bootstrap CSS -->
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css">
  </head>
  <body>
    <div class="container">
      <h2>Lizay Pırlanta</h2>
      <form action="yukle.php" method="POST" enctype="multipart/form-data">
        <div class="form-group">
          <label for="adsoyad">Ad Soyad:</label>
          <input type="text" class="form-control" id="adsoyad" name="adsoyad" required>
        </div>
        <div class="form-group">
          <label for="gorev">Görev:</label>
          <input type="text" class="form-control" id="gorev" name="gorev" required>
        </div>
        <div class="checkbox">
          <label><input type="checkbox" name="isealim">İşe Alım</label>
        </div>
        <div class="checkbox">
          <label><input type="checkbox" name="atamagorev">Atama-Görev Değişikliği</label>
        </div>
        <div class="form-group">
          <label for="resim">Resim:</label>
          <input type="file" class="form-control-file" id="resim" name="resim" accept="image/*">
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

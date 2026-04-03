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
    <div class="container">
      <h2>Lizay Pırlanta</h2>
      <hr>
      <form action="yukle.php" method="POST" enctype="multipart/form-data">
      <div class="form-group">
          <label for="kisi_kayit_tarihi">Tarih:</label>
          <input type="date" class="form-control" id="kisi_kayit_tarihi" name="kisi_kayit_tarihi" required>
        </div>
        <div class="form-group">
          <label for="kisi_ad">Ad:</label>
          <input type="text" class="form-control" id="kisi_ad" name="kisi_ad" required>
        </div>
        <div class="form-group">
          <label for="kisi_soyad">Soyad:</label>
          <input type="text" class="form-control" id="kisi_soyad" name="kisi_soyad" required>
        </div>
        <div class="form-group">
          <label for="kisi_eposta">E-Posta:</label>
          <input type="email" class="form-control" id="kisi_eposta" name="kisi_eposta" required>
        </div>
        <div class="form-group">
          <label for="kisi_gorev">Görev:</label>
          <input type="text" class="form-control" id="kisi_gorev" name="kisi_gorev" required>
        </div>
      <div>
        <input type="radio" id="kisi_ise_alimlar" name="kisi_tur" value="ise_alim" required>  
        <label for="kisi_ise_alimlar">İşe Alım</label><br>
        <input type="radio" id="kisi_gorev_atamalari" name="kisi_tur" value="gorev_atamasi" required> 
        <label for="kisi_gorev_atamalari">Atama-Görev Değişikliği</label>
      </div>
      <div class="form-group hidden" id="kisi_onceki_gorevi">
          <label for="kisi_onceki_gorevi">Önceki Görevi:</label>
          <input type="text" class="form-control" id="kisi_onceki_gorevi" name="kisi_onceki_gorevi" onclick="clearDefaultText(this)" placeholder="Önceki görevi giriniz." >
        </div>
      <div class="form-group hidden" id="kisi_vekalet_suresi">
          <label for="kisi_vekalet_suresi">Vekalet Süresi (Opsiyonel):</label>
          <input type="text" class="form-control" id="kisi_vekalet_suresi" name="kisi_vekalet_suresi" onclick="clearDefaultText(this)" placeholder="Süresiz ise boş bırakınız.">
        </div>
        <div class="form-group">
          <label for="kisi_resim">Resim:</label>
          <input type="file" class="form-control-file" id="kisi_resim" name="kisi_resim" required>
        </div>
        <button type="submit" class="btn btn-primary">Yükle</button>
      </form>
    </div>
    <!-- jQuery -->
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script>
    <!-- Bootstrap JS -->
    <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js"></script>
    <script>
function handleRadioChange() {
    var gorevAtamasiRadio = document.getElementById("kisi_gorev_atamalari");
    var vekaletSuresiDiv = document.getElementById("kisi_vekalet_suresi");
    var oncekiGorevDiv = document.getElementById("kisi_onceki_gorevi");

    if (gorevAtamasiRadio.checked) {
        vekaletSuresiDiv.classList.remove("hidden");
        oncekiGorevDiv.classList.remove("hidden");
        oncekiGorevDiv.querySelector("input").required = true;
    } else {
        vekaletSuresiDiv.classList.add("hidden");
        oncekiGorevDiv.classList.add("hidden");
        oncekiGorevDiv.querySelector("input").required = false;
    }
}

        var radioButtons = document.getElementsByName("kisi_tur");
        for (var i = 0; i < radioButtons.length; i++) {
            radioButtons[i].addEventListener("change", handleRadioChange);
        }
        handleRadioChange();
    </script>

  </body>
</html>

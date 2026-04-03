<?php

/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */



session_start();
if ($_SESSION['login'] != 1) {
  header('Location: ' . '../index.php', true, '303');
  exit;
}
require('../../class/settings.php');

$query = "SELECT * FROM KAYITLAR WHERE kisi_tur = 'gorev_atamasi' ORDER BY id DESC";

try {
  $result = $db->select($query);
} catch (PDOException $e) {
  echo "Sorgu hatası: " . $e->getMessage();
}


?>

<!doctype html>
<html lang="tr">

<head>
  <!-- Required meta tags -->
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">

  <!-- Bootstrap CSS -->
  <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css" integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T" crossorigin="anonymous">
  <link rel="stylesheet" href="../css/style.css">

  <title>Lizay Pırlanta | Web Uygulamaları</title>




</head>


<body>
<header>

<div class="navbar navbar-dark bg-dark shadow-sm">
  <div class="container d-flex justify-content-between">
    <a href="../index.php" class="navbar-brand d-flex align-items-center">
    <i class="fa fa-rotate-left"><strong> Geri Dön</strong></i>
    </a>
    <a href="http://online.lizaypirlanta.com/wsindex.php" class="navbar-brand d-flex align-items-center">
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" aria-hidden="true" class="mr-2" viewBox="0 0 24 24" focusable="false"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
      <strong>Web Uygulamaları</strong>
    </a>
  </div>
</div>

</header>


  <main role="main">


    <div class="album py-5 bg-light">
      <div class="container">
        <div class="row">
          <?php if ($result) {
            foreach ($result as $row) {
              // $kisi_ad = $row['kisi_ad'];
              // $kisi_soyad = $row['kisi_soyad'];
              $kisi_ad_soyad = $row['kisi_ad_soyad'];
              $kisi_gorev = $row['kisi_gorev'];
              $kisi_resim = $row['kisi_resim'];
              $kisi_kayit_tarihi = date("d.m.Y", strtotime($row['kisi_kayit_tarihi']));
              $kisi_onceki_gorevi = $row['kisi_onceki_gorevi'];
              $kisi_vekalet_suresi = $row['kisi_vekalet_suresi'];
          ?>
              <!-- Referans değer -->
              <div class="col-md-4" style="margin-bottom: 20px;">
                <div class="col-md-12 p0 text-center">
                  <img class="myImages" id="myImg" src="<?php echo $kisi_resim; ?>" alt="<?php echo $kisi_ad_soyad . " - " . $kisi_gorev; ?>" width="250" height="250" style="width: 250px; height: 250px;">
                </div>
                <div class="col-md-12 isim text-center">
                  <?php echo $kisi_ad_soyad . " - " . $kisi_gorev; ?>
                  <hr>
                  <?php if (!isset($kisi_vekalet_suresi)) {
                    echo "<small>Değerli Çalışanlarımız,<br> Şirketimizde $kisi_onceki_gorevi olarak görev yapmakta olan Sn. $kisi_ad_soyad $kisi_kayit_tarihi tarihi itibariyle $kisi_gorev olarak ataması yapılmıştır. <br> Sn. $kisi_ad_soyad için yeni görevinde başarılar dileriz.</small>";
                  } else {
                    echo "<small>Değerli Çalışanlarımız,<br> Şirketimizde $kisi_onceki_gorevi olarak görev yapmakta olan Sn. $kisi_ad_soyad $kisi_kayit_tarihi tarihi itibariyle <b> $kisi_vekalet_suresi </b> süre boyunca $kisi_gorev olarak ataması yapılmıştır. <br> Sn. $kisi_ad_soyad için yeni görevinde başarılar dileriz.</small>";
                  }  ?>
                </div>
              </div>
          <?php           }
          } else {
            echo "Veri bulunamadı.";
          } ?>



        </div>
      </div>
    </div>

  </main>



  <!-- The Modal -->
  <div id="myModal" class="modal close1">
    <span class="close">&times;</span>
    <img class="modal-content" id="img01">
    <div id="caption"></div>
  </div>

  <script>
    // create references to the modal...
    var modal = document.getElementById('myModal');
    // to all images -- note I'm using a class!
    var images = document.getElementsByClassName('myImages');
    // the image in the modal
    var modalImg = document.getElementById("img01");
    // and the caption in the modal
    var captionText = document.getElementById("caption");

    // Go through all of the images with our custom class
    for (var i = 0; i < images.length; i++) {
      var img = images[i];
      // and attach our click listener for this image.
      img.onclick = function(evt) {
        modal.style.display = "block";
        modalImg.src = this.src;
        captionText.innerHTML = this.alt;
      }
    }

    var span = document.getElementsByClassName("close")[0];
    var span = document.getElementsByClassName("close1")[0];


    span.onclick = function() {
      modal.style.display = "none";
    }
  </script>


  <script src="https://code.jquery.com/jquery-3.3.1.slim.min.js" integrity="sha384-q8i/X+965DzO0rT7abK41JStQIAqVgRVzpbzo5smXKp4YfRvH+8abtTE1Pi6jizo" crossorigin="anonymous"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.7/umd/popper.min.js" integrity="sha384-UO2eT0CpHqdSJQ6hJty5KVphtPhzWj9WO1clHTMGa3JDZwrnQq4sF86dIHNDz0W1" crossorigin="anonymous"></script>
  <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/js/bootstrap.min.js" integrity="sha384-JjSmVgyd0p3pXB1rRibZUAYoIIy6OrQ6VrjIEaFf/nJGzIxFDsf4x0xIM+B07jRM" crossorigin="anonymous"></script>



</body>

</html>
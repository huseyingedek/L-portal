<?php
ob_start();
session_start();
if($_SESSION['login']!= 1){
header('Location: ' . '../index.php', true, '303');
exit;
}
?>
<!DOCTYPE html>
<html lang="tr">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <!-- Bootstrap CSS -->
    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css" integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T" crossorigin="anonymous">
    <link rel="stylesheet" href="../css/style.css">
    <title>Lizay Pýrlanta | Web Uygulamalarý</title>
    <style>
      .bd-placeholder-img {
        font-size: 1.525rem;
        text-anchor: middle;
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
        font-family: calibri;
      }
      @media (min-width: 768px) {
        .bd-placeholder-img-lg {
          font-size: 3.5rem;
        }
      }
    </style>
  </head>
  <body>

    <header>
      <div class="navbar navbar-dark bg-dark shadow-sm">
        <div class="container d-flex justify-content-between">
          <a href="http://online.lizaypirlanta.com/wsindex.php" class="navbar-brand d-flex align-items-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" aria-hidden="true" class="mr-2" viewBox="0 0 24 24" focusable="false"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
            <strong>Anasayfa</strong>
          </a>
        
          <? if ($_SESSION['usern']=="EALPER" OR $_SESSION['usern']=="SGENC" OR $_SESSION['usern']=="MSAHINBAY" OR $_SESSION['usern']=="IYILMAZ" OR $_SESSION['usern']=="CICIGEN") { ?>
           <a href="https://online.lizaypirlanta.com/ik/ekle.php" class="navbar-brand d-flex align-items-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" aria-hidden="true" class="mr-2" viewBox="0 0 24 24" focusable="false"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
            <strong>Çalýþan Ekleme</strong>
          </a>
          <? } ?>
        </div>
      </div>
    </header>
    <main role="main">
      <div class="album py-5 bg-light">
        <div class="container">
          <div class="row">
            <div class="col-lg-12">


              
              <?php 

                $dbname = "lizaypirlanta_online";
                $dbuser = "lizaypirlanta_online";
                $dbpass = "xn1tATvu7L+8";

                try {
                     $db = new PDO("mysql:host=localhost;dbname=" . $dbname, $dbuser, $dbpass);
                } catch ( PDOException $e ){
                     print $e->getMessage();
                }


                  function post($value){
                    if (isset($_POST[$value])) {
                      return htmlspecialchars(strip_tags(trim($_POST[$value])), ENT_QUOTES);
                    } else {
                      return false;
                    }
                  }


                  function dosyaadi($degisken){
                    $bul    = array('Ç', '?', '?', 'Ü', 'Y', 'Ö', 'ç', '?', '?', 'ü', 'ö', 'y', '-','o¨','u¨');
                    $degistir   = array('c', 's', 'g', 'u', 'i', 'o', 'c', 's', 'g', 'u', 'o', 'i', ' ','o','u');
                    $sonuc = strtolower(str_replace($bul, $degistir, $degisken));
                    $sonuc = str_replace(' ', '-', $sonuc);
                    return $sonuc;
                  }
                  
                  
                  function resimupload($resimadi) {
                    //$zaman =  time();
                    $klasor = __DIR__ ."/img/";
                    
                    $tmp_name = $resimadi["tmp_name"];
                    $name = $resimadi["name"];
                    $type = $resimadi["type"];
                    
                     $dosyaformati = array("image/pjpeg", "image/jpeg", "image/gif", "image/bmp", "image/x-png", "image/png", "image/jpg");
                     
                     if(in_array($type, $dosyaformati)) {
                        $yuklenecek_klasor = $klasor . dosyaadi($name);
                 
                        $yukle = move_uploaded_file($tmp_name, $yuklenecek_klasor);
                        
                        if($yukle ) {
                            echo "yükleme baþarýlý";
                        }else {
                            echo "yükleme baþarýsýz.";
                        }
                     
                     }
                    
                    
                  }


                  
                $isim     = post("isim");
                $gorev    = post("gorev");
                $resimAdi = $_FILES["resim"];
                
                
    


                if(isset($_POST["isealim"])) {

                  $kayit = $db->prepare("INSERT INTO ik SET isim=?, gorev=?, resim=?, tur=?")->execute([$isim, $gorev, $resimAdi["name"], "1"]);

                  if($kayit) {
                    echo "
                      <div class='alert  alert-success alert-dismissible fade show' role='alert'>
                          <span class='badge badge-pill badge-success'>Baþarýlý</span> Kayýt Tamamlanmýþtýr.
                          <button type='button' class='close' data-dismiss='alert' aria-label='Close'>
                              <span aria-hidden='true'>×</span>
                          </button>
                      </div> ";
                      
                     resimupload($resimAdi);
                  } else {
                    echo "
                      <div class='alert  alert-danger alert-dismissible fade show' role='alert'>
                          <span class='badge badge-pill badge-danger'>Baþarýsýz</span> Kayýt Tamamlanamadý.
                          <button type='button' class='close' data-dismiss='alert' aria-label='Close'>
                              <span aria-hidden='true'>×</span>
                          </button>
                      </div>
                      ";
                  }

                } elseif(isset($_POST["atamagorev"])) {

                  $kayit = $db->prepare("INSERT INTO ik SET isim=?, gorev=?, resim=?, tur=?")->execute([$isim, $gorev, $resimAdi["name"], "2"]);

                  if($kayit) {
                    echo "
                    <div class='alert  alert-success alert-dismissible fade show' role='alert'>
                        <span class='badge badge-pill badge-success'>Baþarýlý</span> Kayýt Tamamlanmýþtýr.
                        <button type='button' class='close' data-dismiss='alert' aria-label='Close'>
                            <span aria-hidden='true'>×</span>
                        </button>
                    </div>";
                    
                     resimupload($resimAdi);
                  }else {
                     echo "
                      <div class='alert  alert-danger alert-dismissible fade show' role='alert'>
                          <span class='badge badge-pill badge-danger'>Baþarýsýz</span> Kayýt Tamamlanamadý.
                          <button type='button' class='close' data-dismiss='alert' aria-label='Close'>
                              <span aria-hidden='true'>×</span>
                          </button>
                      </div>";
                  }
                }

              ?>

              





              <form action="" method="post" enctype="multipart/form-data">
                <div class="form-row">
                  <div class="form-group col-md-12">
                    <div class="form-check">
                      <input class="form-check-input" type="checkbox" name="isealim" id="isealim" style="width: 20px; height: 20px;">
                      <label class="form-check-label" for="isealim" style="font-size: 18px; margin-left:10px;">
                        Ýþe Alým
                      </label>
                    </div>
                    <div class="form-check">
                      <input class="form-check-input" type="checkbox" name="atamagorev" id="atamagorev" style="width: 20px; height: 20px;">
                      <label class="form-check-label" for="atamagorev" style="font-size: 18px; margin-left:10px;">
                        Atama-Görev Deðiþikliði
                      </label>
                    </div>
                  </div>
                </div>

                 <div class="form-isim" style="margin-bottom:15px;">
                  <label for="isim">Ýsim Soyisim</label>
                  <input type="text" class="form-control" id="isim" name="isim" placeholder="Ýsim Soyisim Giriniz">
                </div>


                <div class="form-group" style="margin-bottom:15px;">
                  <label for="gorev">Görevi</label>
                  <input type="text" class="form-control" id="gorev" name="gorev" placeholder="Görev Giriniz">
                </div>
                <div class="form-group">
                  <label for="gorev">Resim Boyutu 645x803 Olmalý</label><br>
                 
                      <input type="file" class="" name="resim" id="resim">
                    
                </div>

                <button type="submit" class="btn btn-primary">Kaydet</button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </main>


    <script src="https://code.jquery.com/jquery-3.3.1.slim.min.js" integrity="sha384-q8i/X+965DzO0rT7abK41JStQIAqVgRVzpbzo5smXKp4YfRvH+8abtTE1Pi6jizo" crossorigin="anonymous"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.7/umd/popper.min.js" integrity="sha384-UO2eT0CpHqdSJQ6hJty5KVphtPhzWj9WO1clHTMGa3JDZwrnQq4sF86dIHNDz0W1" crossorigin="anonymous"></script>
    <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/js/bootstrap.min.js" integrity="sha384-JjSmVgyd0p3pXB1rRibZUAYoIIy6OrQ6VrjIEaFf/nJGzIxFDsf4x0xIM+B07jRM" crossorigin="anonymous"></script>

  </body>
</html>

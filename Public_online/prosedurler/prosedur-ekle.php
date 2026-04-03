

  <?php 
include_once('../header.php');
// ini_set('display_errors', 1);
// ini_set('display_startup_errors', 1);
// error_reporting(E_ALL);
require('../class/settings.php');
if(isset($_POST['submit']))
{
  $prosedur_icerik = $_POST['prosedur_icerik'];
  $prosedur_gorsel_baslik = $_POST['prosedur_gorsel_baslik'];
  $prosedur_baslik = $_POST['prosedur_baslik'] ;
  $prosedur_tarih = date('Y-m-d H:i:s');
  $dosya_adi = dosyaAdiOlustur($prosedur_gorsel_baslik);

 if($prosedur_icerik != '' && $prosedur_icerik != null){
  try {
      $query = "INSERT INTO PROSEDURLER (prosedur_baslik, prosedur_gorsel_baslik, prosedur_icerik, prosedur_tarih, prosedur_dosya_adi) VALUES (:prosedur_baslik, :prosedur_gorsel_baslik, :prosedur_icerik, :prosedur_tarih, :prosedur_dosya_adi)";
      $params = [
          ':prosedur_baslik' => $prosedur_baslik,
          ':prosedur_gorsel_baslik' => $prosedur_gorsel_baslik,
          ':prosedur_icerik' => $prosedur_icerik,
          ':prosedur_tarih' => $prosedur_tarih,
          ':prosedur_dosya_adi' => $dosya_adi,
        ];
        $query = $db->query($query, $params);
        $x = 1;
        $msg = "Başarıyla yüklendi!";
    } catch (PDOException $e) {
        die("Veritabanına kaydedilirken bir hata oluştu: " . $e->getMessage());
    }
}else{
  $x = 0;
  $msg = "Başarısız.";
}
  }

  ?>
<body>
<div class="container" >

  <br>
  <div class="box">
    <form method="post">
    <div class="form-group">
    <b> Prosedür Görsel Başlık</b>
  <input id="prosedur_gorsel_baslik" name="prosedur_gorsel_baslik" class="form-control" required>
  </div>
  <div class="form-group"><b>Prosedür Detaylı Başlık</b>
  <input id="prosedur_baslik" name="prosedur_baslik" class="form-control" required>
  </div>
  <div class="form-group"><b>Prosedür Metni</b>
  <textarea id="prosedur_icerik" name="prosedur_icerik" class="form-control"></textarea>
  </div>
  <div class="form-group">
  <input type="submit" name="submit" value="Yükle" class="btn btn-primary">
  </div>
  </form>
  <div class="<?php if($x == 1){echo "success";}else{echo "error";} ?>"><?php if(!empty($msg)){ echo $msg; } ?></div>
  </div>
</div> 
 </body>  
</html>  
<script src="https://cdn.ckeditor.com/ckeditor5/36.0.1/classic/ckeditor.js"></script>
<script>
    ClassicEditor
        .create( document.querySelector( '#prosedur_icerik' ),{
          ckfinder:
          {
            uploadUrl: 'fileupload.php'
          },
          link: {
            defaultProtocol: 'http://'
        },
        mediaEmbed: {
    previewsInData:true
}
        })
        .then(editor => {
          console.log(editor);
        })
        .catch( error => {
            console.error( error );
        });        
</script>

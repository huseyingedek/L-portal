<?php 
// ini_set('display_errors', 1);
// ini_set('display_startup_errors', 1);
// error_reporting(E_ALL);
include_once('header.php');
require('../class/settings.php');
if(isset($_POST['submit']))
{

  $bilgilendirme_icerik = $_POST['bilgilendirme_icerik'];
  $bilgilendirme_gorsel_baslik = $_POST['bilgilendirme_gorsel_baslik'];
  $bilgilendirme_baslik = $_POST['bilgilendirme_baslik'] ;
  $bilgilendirme_tarih = date('Y-m-d H:i:s');
  $dosya_adi = dosyaAdiOlustur($bilgilendirme_gorsel_baslik);

 if($bilgilendirme_icerik != '' && $bilgilendirme_icerik != null){
  try {
      $query = "INSERT INTO BILGILENDIRMELER (bilgilendirme_baslik, bilgilendirme_gorsel_baslik, bilgilendirme_icerik, bilgilendirme_tarih, bilgilendirme_dosya_adi) VALUES (:bilgilendirme_baslik, :bilgilendirme_gorsel_baslik, :bilgilendirme_icerik, :bilgilendirme_tarih, :bilgilendirme_dosya_adi)";
      $params = [
          ':bilgilendirme_baslik' => $bilgilendirme_baslik,
          ':bilgilendirme_gorsel_baslik' => $bilgilendirme_gorsel_baslik,
          ':bilgilendirme_icerik' => $bilgilendirme_icerik,
          ':bilgilendirme_tarih' => $bilgilendirme_tarih,
          ':bilgilendirme_dosya_adi' => $dosya_adi,
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
    <b> Bilgilendirme Görsel Başlık</b>
  <input id="bilgilendirme_gorsel_baslik" name="bilgilendirme_gorsel_baslik" class="form-control" required>
  </div>
  <div class="form-group"><b>Bilgilendirme Detaylı Başlık</b>
  <input id="bilgilendirme_gorsel_baslik" name="bilgilendirme_baslik" class="form-control" required>
  </div>
  <div class="form-group"><b>Bilgilendirme Metni</b>
  <textarea id="bilgilendirme_icerik" name="bilgilendirme_icerik" class="form-control"></textarea>
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
        .create( document.querySelector( '#bilgilendirme_icerik' ),{
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

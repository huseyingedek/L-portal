

  <?php 
include_once('../header.php');
// ini_set('display_errors', 1);
// ini_set('display_startup_errors', 1);
// error_reporting(E_ALL);
require('../class/settings.php');
if(isset($_POST['submit']))
{
  $kampanya_icerik = $_POST['kampanya_icerik'];
  $kampanya_gorsel_baslik = $_POST['kampanya_gorsel_baslik'];
  $kampanya_baslik = $_POST['kampanya_baslik'] ;
  $kampanya_tarih = date('Y-m-d H:i:s');
  $dosya_adi = dosyaAdiOlustur($kampanya_gorsel_baslik);

 if($kampanya_icerik != '' && $kampanya_icerik != null){
  try {
      $query = "INSERT INTO KAMPANYALAR (kampanya_baslik, kampanya_gorsel_baslik, kampanya_icerik, kampanya_tarih, kampanya_dosya_adi) VALUES (:kampanya_baslik, :kampanya_gorsel_baslik, :kampanya_icerik, :kampanya_tarih, :kampanya_dosya_adi)";
      $params = [
          ':kampanya_baslik' => $kampanya_baslik,
          ':kampanya_gorsel_baslik' => $kampanya_gorsel_baslik,
          ':kampanya_icerik' => $kampanya_icerik,
          ':kampanya_tarih' => $kampanya_tarih,
          ':kampanya_dosya_adi' => $dosya_adi,
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
    <b> Kampanya Görsel Başlık</b>
  <input id="kampanya_gorsel_baslik" name="kampanya_gorsel_baslik" class="form-control" required>
  </div>
  <div class="form-group"><b>Kampanya Detaylı Başlık</b>
  <input id="kampanya_baslik" name="kampanya_baslik" class="form-control" required>
  </div>
  <div class="form-group"><b>Kampanya Metni</b>
  <textarea id="kampanya_icerik" name="kampanya_icerik" class="form-control"></textarea>
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
        .create( document.querySelector( '#kampanya_icerik' ),{
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

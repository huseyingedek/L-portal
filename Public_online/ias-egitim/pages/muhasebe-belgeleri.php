<?php
 	session_start();  
     if($_SESSION['login']!= 1){
         header('Location: ' . '../../index.php', true, '303');
         exit;
     }
?>
<!DOCTYPE html>
<html lang="tr">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Lizay Pırlanta IAS Franchise Ürün Kabulü</title>
  <link rel="stylesheet" href="../styles.css">
</head>


<body>
  <header>
    <h1>Franchise Ürün Kabulü</h1>
  </header>
  <center>
  <video width="800" height="580" controls>
  <source src="../vids/LIZFIN01-kullanimi.mp4" type="video/mp4">
 Tarayıcınız videoyu desteklemiyor.
  </video>
  </center>
  <br><br>
  <footer>
    <p>&copy;<b> Lizay Pırlanta </b> 2023 Ias Eğitim Sayfası</p>
  </footer>

</body>

</html>
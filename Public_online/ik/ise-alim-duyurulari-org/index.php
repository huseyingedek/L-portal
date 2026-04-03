<?php

/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
 

 	session_start();  
	if($_SESSION['login']!= 1){
		header('Location: ' . '../index.php', true, '303');
		exit;
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
 <!-- <div class="collapse bg-dark" id="navbarHeader">
    <div class="container">
      <div class="row">
        <div class="col-sm-8 col-md-7 py-4">
          <h4 class="text-white">About</h4>
          <p class="text-muted">Add some information about the album be tidbits.</p>
        </div>
        <div class="col-sm-4 offset-md-1 py-4">
          <h4 class="text-white">Contact</h4>
          <ul class="list-unstyled">
            <li><a href="#" class="text-white">Follow on Twitter</a></li>
         
          </ul>
        </div>
      </div>
    </div>
  </div> -->
  <div class="navbar navbar-dark bg-dark shadow-sm">
    <div class="container d-flex justify-content-between">
      <a href="http://online.lizaypirlanta.com/wsindex.php" class="navbar-brand d-flex align-items-center">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" aria-hidden="true" class="mr-2" viewBox="0 0 24 24" focusable="false"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
        <strong>Web Uygulamaları</strong>
      </a>
     <!-- <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarHeader" aria-controls="navbarHeader" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>               -->
    </div>
  </div>
</header>

<main role="main">


  <div class="album py-5 bg-light">
    <div class="container">
          <div class="row">
          
              <?php    
              require('../../db.php');
               $goster=mysqli_query($conn,"SELECT * FROM ik WHERE tur='1'"); 
          while ($row = mysqli_fetch_array($goster)) 
          { 
          ?>          
        <div class="col-md-4" style="margin-bottom:20px;">
              <div class="col-md-12 p0">
                  <img class="myImages" id="myImg" src="../img/<?php echo $row['resim']; ?>" alt="<?php echo $row['isim']; ?> - <?php echo $row['gorev']; ?>" width="100%" height="100%" style="height: 312px;">
              </div>
               <div class="col-md-12 isim">
                   <?php echo $row['isim']; ?> - <?php echo $row['gorev']; ?>
              </div>
          </div> 
          
           <?php } ?>     
          
          
            <div class="col-md-4" style="margin-bottom:20px;">
              <div class="col-md-12 p0">
                  <img class="myImages" id="myImg" src="gulcan-sobaci.jpg" alt="Gülcan SOBACI - Temizlik Personeli" width="100%" height="100%" style="height: 312px;">
              </div>
               <div class="col-md-12 isim">
                   Gülcan SOBACI - Temizlik Personeli   
              </div>
          </div>              
              
            <div class="col-md-4" style="margin-bottom:20px;">
              <div class="col-md-12 p0">
                  <img class="myImages" id="myImg" src="gokhan-ozturk.jpg" alt="Gökhan ÖZTÜRK - Uzman Satış Danışmanı" width="100%" height="100%" style="height: 312px;">
              </div>
               <div class="col-md-12 isim">
                   Gökhan ÖZTÜRK - Uzman Satış Danışmanı   
              </div>
          </div>              
              
            <div class="col-md-4" style="margin-bottom:20px;">
              <div class="col-md-12 p0">
                  <img class="myImages" id="myImg" src="mustafa-akkus.jpg" alt="Mustafa AKKUŞ - Satış Pazarlama Bölge Müdürü" width="100%" height="100%" style="height: 312px;">
              </div>
               <div class="col-md-12 isim">
                   Mustafa AKKUŞ - Satış Pazarlama Bölge Müdürü   
              </div>
          </div>
              
             <div class="col-md-4" style="margin-bottom:20px;">
              <div class="col-md-12 p0">
                  <img class="myImages" id="myImg" src="mustafa-volkan-gurcay.jpg" alt="Mustafa Volkan GÜRÇAY - Pırlanta Üretim Atölye Yöneticisi" width="100%" height="100%" style="height: 312px;">
              </div>
               <div class="col-md-12 isim">
                   Mustafa Volkan GÜRÇAY - Pırlanta Üretim Atölye Yöneticisi   
              </div>
          </div>
              
             <div class="col-md-4" style="margin-bottom:20px;">
              <div class="col-md-12 p0">
                  <img class="myImages" id="myImg" src="merve-ece.jpg" alt="Merve ECE - Crm Uzmanı" width="100%" height="100%" style="height: 312px;">
              </div>
               <div class="col-md-12 isim">
                   Merve ECE - Crm Uzmanı  
              </div> 
          </div>
              
             <div class="col-md-4" style="margin-bottom:20px;">
              <div class="col-md-12 p0">
                  <img class="myImages" id="myImg" src="semih-saracoglu.jpg" alt="Semih SARAÇOĞLU - Franchise ve Satış Noktaları Müdürü" width="100%" height="100%" style="height: 312px;">
              </div>
               <div class="col-md-12 isim">
                   Semih SARAÇOĞLU - Franchise ve Satış Noktaları Müdürü 
              </div> 
          </div>
              
            <div class="col-md-4" style="margin-bottom:20px;">
              <div class="col-md-12 p0">
                  <img class="myImages" id="myImg" src="zeynep-meziyet-akbay.jpg" alt="Zeynep Meziyet AKBAY - E-Ticaret Koordinatörü" width="100%" height="100%" style="height: 312px;">
              </div>
               <div class="col-md-12 isim">
                   Zeynep Meziyet AKBAY - E-Ticaret Koordinatörü  
              </div> 
          </div>
    
          <div class="row">
              
             <div class="col-md-4" style="margin-bottom:20px;">
              <div class="col-md-12 p0">
                  <img class="myImages" id="myImg" src="cumaali-sentuna.jpg" alt="Cumaali ŞENTUNA - Altın Toptan ve Üretim Grup Müdürü" width="100%" height="100%" style="height: 312px;">
              </div>
               <div class="col-md-12 isim">
                   Cumaali ŞENTUNA - Altın Toptan ve Üretim Grup Müdürü  
              </div> 
          </div>

              
            <div class="col-md-4" style="margin-bottom:20px;">
              <div class="col-md-12 p0">
                  <img class="myImages" id="myImg" src="onur-topcu.jpg" alt="Onur TOPÇU - Altın Toptan Satış Danışmanı" width="100%" height="100%" style="height: 312px;">
              </div>
               <div class="col-md-12 isim">
                   Onur TOPÇU - Altın Toptan Satış Danışmanı  
              </div> 
          </div>
        
            <div class="col-md-4" style="margin-bottom:20px;">
              <div class="col-md-12 p0">
                  <img class="myImages" id="myImg" src="esra-sokmen.jpg" alt="Esra SÖKMEN - Muhasebe Uzmanı" width="100%" height="100%" style="height: 312px;">
              </div>
               <div class="col-md-12 isim">
                   Esra SÖKMEN - Muhasebe Uzmanı  
              </div> 
          </div>
        
            <div class="col-md-4" style="margin-bottom:20px;">
              <div class="col-md-12 p0">
                  <img class="myImages" id="myImg" src="neslihan-guven.jpg" alt="Neslihan GÜVEN - Mağaza Müdür Yardımcısı" width="100%" height="100%" style="height: 312px;">
              </div>
               <div class="col-md-12 isim">
                   Neslihan GÜVEN - Mağaza Müdür Yardımcısı  
              </div> 
          </div>
          
             <div class="col-md-4" style="margin-bottom:20px;">
              <div class="col-md-12 p0">
                  <img class="myImages" id="myImg" src="muhammet-cevher.jpg" alt="Muhammet CEVHER - Üretim Destek Personeli" width="100%" height="100%" style="height: 312px;">
              </div>
               <div class="col-md-12 isim">
                   Muhammet CEVHER - Üretim Destek Personeli  
              </div> 
          </div>
          
              <div class="col-md-4" style="margin-bottom:20px;">
              <div class="col-md-12 p0">
                  <img class="myImages" id="myImg" src="elif-akbas.jpg" alt="Elif AKBAŞ - Muhasebe Müdürü" width="100%" height="100%" style="height: 312px;">
              </div>
               <div class="col-md-12 isim">
                   Elif AKBAŞ - Muhasebe Müdürü  
              </div> 
          </div>
          
            <div class="col-md-4" style="margin-bottom:20px;">
              <div class="col-md-12 p0">
                  <img class="myImages" id="myImg" src="nisanur-ozbek.jpg" alt="Nisanur ÖZBEK - Barkod Uzmanı" width="100%" height="100%" style="height: 312px;">
              </div>
               <div class="col-md-12 isim">
                   Nisanur ÖZBEK - Barkod Uzmanı  
              </div> 
          </div>
          
               <div class="col-md-4" style="margin-bottom:20px;">
              <div class="col-md-12 p0">
                  <img class="myImages" id="myImg" src="candemir-celik.jpg" alt="Candemir ÇELİK - Satış ve Pazarlamadan Sorumlu Genel Müdür Yardımcısı" width="100%" height="100%" style="height: 312px;">
              </div>
               <div class="col-md-12 isim">
                   Candemir ÇELİK - Satış ve Pazarlamadan Sorumlu Genel Müdür Yardımcısı  
              </div> 
          </div>
          
              <div class="col-md-4" style="margin-bottom:20px;">
              <div class="col-md-12 p0">
                  <img class="myImages" id="myImg" src="onder-islek.jpg" alt="Önder İŞLEK - Mali İşler Direktörü" width="100%" height="100%" style="height: 312px;">
              </div>
               <div class="col-md-12 isim">
                   Önder İŞLEK - Mali İşler Direktörü  
              </div> 
          </div>
          
               <div class="col-md-4" style="margin-bottom:20px;">
              <div class="col-md-12 p0">
                  <img class="myImages" id="myImg" src="ediz-imamoglu.jpg" alt="Ediz İMAMOĞLU - Üretim Şefi" width="100%" height="100%" style="height: 312px;">
              </div>
               <div class="col-md-12 isim">
                   Ediz İMAMOĞLU - Üretim Şefi  
              </div> 
          </div>
      
           <div class="col-md-4" style="margin-bottom:20px;">
              <div class="col-md-12 p0">
                  <img class="myImages" id="myImg" src="tutku-altun.jpg" alt="Tutku ALTUN - Bordro ve Özlük İşleri Uzmanı" width="100%" height="100%" style="height: 312px;">
              </div>
               <div class="col-md-12 isim">
                   Tutku ALTUN - Bordro ve Özlük İşleri Uzmanı  
              </div> 
          </div>
          
           <div class="col-md-4" style="margin-bottom:20px;">
              <div class="col-md-12 p0">
                  <img class="myImages" id="myImg" src="alpay-boztepe.jpg" alt="Alpay BOZTEPE - Bilgi İşlem Donanım Uzmanı" width="100%" height="100%" style="height: 312px;">
              </div>
               <div class="col-md-12 isim">
                   Alpay BOZTEPE - Bilgi İşlem Donanım Uzmanı  
              </div> 
          </div>
          
           <div class="col-md-4" style="margin-bottom:20px;">
              <div class="col-md-12 p0">
                  <img class="myImages" id="myImg" src="nur-acar.jpg" alt="Nur ACAR - Pırlanta Kalitelendirme Uzmanı" width="100%" height="100%" style="height: 312px;">
              </div>
               <div class="col-md-12 isim">
                   Nur ACAR - Pırlanta Kalitelendirme Uzmanı  
              </div> 
          </div>
          
          		  <div class="col-md-4" style="margin-bottom:20px;">
              <div class="col-md-12 p0">
                  <img class="myImages" id="myImg" src="meryem-kececi.jpg" alt="Meryem KEÇECİ - Barkod Uzmanı" width="100%" height="100%" style="height: 312px;">
              </div>
               <div class="col-md-12 isim">
                   Meryem KEÇECİ - Barkod Uzmanı  
              </div> 
          </div>
          
             <div class="col-md-4" style="margin-bottom:20px;">
              <div class="col-md-12 p0">
                  <img class="myImages" id="myImg" src="ahsen-hilal-olmez.jpg" alt="Ahsen Hilal ÖLMEZ - Sosyal Medya Satış Danışmanı" width="100%" height="100%" style="height: 312px;">
              </div>
               <div class="col-md-12 isim">
                   Ahsen Hilal ÖLMEZ - Sosyal Medya Satış Danışmanı  
              </div> 
          </div>
          
      <div class="row">
            <div class="col-md-4" style="margin-bottom:20px;">
              <div class="col-md-12 p0">
                  <img class="myImages" id="myImg" src="abdulkadir-celik.jpg" alt="Abdülkadir ÇELİK - Muhasebe Uzmanı" width="100%" height="100%" style="height: 312px;">
              </div>
               <div class="col-md-12 isim">
                   Abdülkadir ÇELİK - Muhasebe Uzmanı   
              </div> 
          </div>
          
          	<div class="col-md-4" style="margin-bottom:20px;">
              <div class="col-md-12 p0">
                  <img class="myImages" id="myImg" src="kadri-baykara.jpg" alt="Kadri BAYKARA - Finans ve Kasa Uzmanı " width="100%" height="100%" style="height: 312px;">
              </div>
               <div class="col-md-12 isim">
                   Kadri BAYKARA - Finans ve Kasa Uzmanı   
              </div> 
          </div>
          
          	<div class="col-md-4" style="margin-bottom:20px;">
              <div class="col-md-12 p0">
                  <img class="myImages" id="myImg" src="gokhan-ok.jpg" alt="Gökhan OK - Vekaleten Muhasebe Müdürü" width="100%" height="100%" style="height: 312px;">
              </div>
               <div class="col-md-12 isim">
                   Gökhan OK - Vekaleten Muhasebe Müdürü  
              </div> 
          </div>
          
		  <div class="col-md-4" style="margin-bottom:20px;">
              <div class="col-md-12 p0">
                  <img class="myImages" id="myImg" src="erkan-duyar.jpg" alt="Erkan DUYAR - Mağazalar Koordinatörü" width="100%" height="100%" style="height: 312px;">
              </div>
               <div class="col-md-12 isim">
                   Erkan DUYAR - Mağazalar Koordinatörü  
              </div> 
          </div>
          
		  <div class="col-md-4" style="margin-bottom:20px;">
              <div class="col-md-12 p0">
                  <img class="myImages" id="myImg" src="ayse-nazli-guven.jpg" alt="Ayşe Nazlı Güven - Müşteri İlişkileri Uzmanı" width="100%" height="100%" style="height: 312px;">
              </div>
               <div class="col-md-12 isim">
                   Ayşe Nazlı Güven - Müşteri İlişkileri Uzmanı  
              </div> 
          </div>
		  
		  <div class="col-md-4" style="margin-bottom:20px;">
              <div class="col-md-12 p0">
                  <img class="myImages" id="myImg" src="husna-yilmaz.jpg" alt="Hüsna Yılmaz - Barkod Uzmanı" width="100%" height="100%" style="height: 312px;">
              </div>
               <div class="col-md-12 isim">
                   Hüsna Yılmaz - Barkod Uzmanı  
              </div> 
          </div>
		  
		  <div class="col-md-4" style="margin-bottom:20px;">
              <div class="col-md-12 p0">
                  <img class="myImages" id="myImg" src="anil-zeren.jpg" alt="Anıl Zeren - Toptan Satış Uzmanı" width="100%" height="100%" style="height: 312px;">
              </div>
               <div class="col-md-12 isim">
                   Anıl Zeren - Toptan Satış Uzmanı  
              </div> 
          </div>
		  
		  <div class="col-md-4" style="margin-bottom:20px;">
              <div class="col-md-12 p0">
                  <img class="myImages" id="myImg" src="sezgin-turkcan.jpg" alt="Sezgin Türkcan - Muhasebe ve Finans Direktörü" width="100%" height="100%" style="height: 312px;">
              </div>
               <div class="col-md-12 isim">
                   Sezgin Türkcan - Muhasebe ve Finans Direktörü  
              </div> 
          </div>
		  
		  <div class="col-md-4" style="margin-bottom:20px;">
              <div class="col-md-12 p0">
                  <img class="myImages" id="myImg" src="rabia-ozge-sazak.jpg" alt="Rabia Özge Sazak - Stok ve Raporlama Uzmanı" width="100%" height="100%" style="height: 312px;">
              </div>
               <div class="col-md-12 isim">
                   Rabia Özge Sazak - Stok ve Raporlama Uzmanı  
              </div> 
          </div>
		  
         <div class="col-md-4" style="margin-bottom:20px;">
              <div class="col-md-12 p0">
                  <img class="myImages" id="myImg" src="fatih-yilmaz.jpg" alt="Fatih Yılmaz" width="100%" height="100%" style="height: 312px;">
              </div>
               <div class="col-md-12 isim">
                   Fatih Yılmaz - İdari İşler
              </div>  
          </div>
          
           <div class="col-md-4" style="margin-bottom:20px;">
              <div class="col-md-12 p0">
                  <img class="myImages" id="myImg" src="bedirhan-isik.jpg" alt="Bedirhan Işık" width="100%" height="100%">
              </div>
               <div class="col-md-12 isim">
                Bedirhan Işık - Diamond Stone
              </div>  
          </div>
          
           <div class="col-md-4" style="margin-bottom:20px;">
              <div class="col-md-12 p0">
                  <img class="myImages" id="myImg" src="umut-bilmac.jpg" alt="Umut Bilmaç" width="100%" height="100%">
              </div>
               <div class="col-md-12 isim">
                   Umut Bilmaç  - İhracat
              </div>  
          </div>
          
          <div class="col-md-4" style="margin-bottom:20px;">
              <div class="col-md-12 p0">
                  <img class="myImages" id="myImg" src="leyla-demir.jpg" alt="Leyla Demir" width="100%" height="100%" style="height: 312px;">
              </div>
               <div class="col-md-12 isim">
                   Leyla Demir - Ürün Yönetimi
              </div>  
          </div>
          
          <div class="col-md-4" style="margin-bottom:20px;">
              <div class="col-md-12 p0">
                  <img class="myImages" id="myImg" src="davut-zor.jpg" alt="Leyla Demir" width="100%" height="100%" style="height: 312px;">
              </div>
               <div class="col-md-12 isim">
                   Davut Zor - Pırlanta Üretim
              </div> 
		  </div>
		  
		  <div class="col-md-4" style="margin-bottom:20px;">
              <div class="col-md-12 p0">
                  <img class="myImages" id="myImg" src="selin-duman.jpg" alt="Selin Duman" width="100%" height="100%" style="height: 312px;">
              </div>
               <div class="col-md-12 isim">
                   Selin Duman - Kurumsal İletişim ve Pazarlama 
              </div> 
          </div>
          
           <div class="col-md-4" style="margin-bottom:20px;">
              <div class="col-md-12 p0">
                  <img class="myImages" id="myImg" src="kenan-beltekin.jpg" alt="Kenan Beltekin" width="100%" height="100%" style="height: 312px;">
              </div>
               <div class="col-md-12 isim">
                   Kenan Beltekin - Finans ve Kasa Uzmanı  
              </div> 
          </div>
		  
		     <div class="col-md-4" style="margin-bottom:20px;">
              <div class="col-md-12 p0">
                  <img class="myImages" id="myImg" src="rumeysa-karakoc.jpg" alt="Rümeysa Karakoç" width="100%" height="100%" style="height: 312px;">
              </div>
               <div class="col-md-12 isim">
                   Rümaysa Karakoç - Yönetici Asistanı  
              </div> 
          </div>
      
      
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

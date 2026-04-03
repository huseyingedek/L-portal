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
               $goster=mysqli_query($conn,"SELECT * FROM ik WHERE tur='2'"); 
          while ($row = mysqli_fetch_array($goster)) 
          { 
          ?>       
      <div class="col-md-4" style="margin-bottom:20px;">
              <div class="col-md-12 p0">
                  <img class="myImages" id="myImg" src="../img/<?php echo $row['resim']; ?>" width="100%" height="100%" style="height: 100%;">
              </div>
               <div class="col-md-12 isim">
               <?php echo $row['isim']; ?> - <?php echo $row['gorev']; ?>
              </div>
          </div> 
          
           <?php } ?>   
          
      
       <div class="col-md-4" style="margin-bottom:20px;">
              <div class="col-md-12 p0">
                  <img class="myImages" id="myImg" src="umit-danisan.jpg" width="100%" height="100%" style="height: 100%;">
              </div>
               <div class="col-md-12 isim">
               Ümit Danışan - Uzman Satış Danışmanı 
              </div>
          </div> 
      
        <div class="col-md-4" style="margin-bottom:20px;">
              <div class="col-md-12 p0">
                  <img class="myImages" id="myImg" src="sinan-mutlu.jpg" width="100%" height="100%" style="height: 100%;">
              </div>
               <div class="col-md-12 isim">
               Sinan Mutlu - Uzman Satış Danışmanı 
              </div>
          </div> 
      
       <div class="col-md-4" style="margin-bottom:20px;">
              <div class="col-md-12 p0">
                  <img class="myImages" id="myImg" src="muhsin-aktas.jpg" width="100%" height="100%" style="height: 100%;">
              </div>
               <div class="col-md-12 isim">
               Muhsin Aktaş - Uzman Satış Danışmanı 
              </div>
          </div> 
      
         <div class="col-md-4" style="margin-bottom:20px;">
              <div class="col-md-12 p0">
                  <img class="myImages" id="myImg" src="seda-karabulut.jpg" width="100%" height="100%" style="height: 100%;">
              </div>
               <div class="col-md-12 isim">
               Seda Karabulut - Uzman Satış Danışmanı 
              </div>
          </div> 
      
        <div class="col-md-4" style="margin-bottom:20px;">
              <div class="col-md-12 p0">
                  <img class="myImages" id="myImg" src="emine-yaldiz.jpg" width="100%" height="100%" style="height: 100%;">
              </div>
               <div class="col-md-12 isim">
               Emine Yaldız - Vekaleten (6 ay) Mağaza Müdürü 
              </div>
          </div> 
      
      
       <div class="col-md-4" style="margin-bottom:20px;">
              <div class="col-md-12 p0">
                  <img class="myImages" id="myImg" src="sehriban-ozkan.jpg" width="100%" height="100%" style="height: 100%;">
              </div>
               <div class="col-md-12 isim">
               Şehriban Özkan - Mağaza Müdür Yardımcısı
              </div>
          </div> 
      
       <div class="col-md-4" style="margin-bottom:20px;">
              <div class="col-md-12 p0">
                  <img class="myImages" id="myImg" src="huseyin-alakel.jpg" width="100%" height="100%" style="height: 100%;">
              </div>
               <div class="col-md-12 isim">
                Hüseyin Alakel - Vekaleten (6 ay) Mağaza Müdür Yardımcısı
              </div>
          </div> 
      
        <div class="col-md-4" style="margin-bottom:20px;">
              <div class="col-md-12 p0">
                  <img class="myImages" id="myImg" src="melek-cankaya.jpg" width="100%" height="100%" style="height: 100%;">
              </div>
               <div class="col-md-12 isim">
                Melek Çankaya - Bölge Müdürü
              </div>
          </div> 
       
       <div class="col-md-4" style="margin-bottom:20px;">
              <div class="col-md-12 p0">
                  <img class="myImages" id="myImg" src="elif-alper.jpg" width="100%" height="100%" style="height: 100%;">
              </div>
               <div class="col-md-12 isim">
                Elif Alper Erdoğan - İnsan Kaynakları Yöneticisi 
              </div>
          </div> 
      
         <div class="col-md-4" style="margin-bottom:20px;">
              <div class="col-md-12 p0">
                  <img class="myImages" id="myImg" src="suleyman-genc.jpg" width="100%" height="100%" style="height: 100%;">
              </div>
               <div class="col-md-12 isim">
                Süleyman Genç - Bölge Müdürü 
              </div>
          </div> 
      
        <div class="col-md-4" style="margin-bottom:20px;">
              <div class="col-md-12 p0">
                  <img class="myImages" id="myImg" src="halim-duman.jpg" width="100%" height="100%" style="height: 100%;">
              </div>
               <div class="col-md-12 isim">
                 Halim Duman - Bölge Müdürü 
              </div>
          </div>  
      
          <div class="col-md-4" style="margin-bottom:20px;">
              <div class="col-md-12 p0">
                  <img class="myImages" id="myImg" src="salih-c.jpg" width="100%" height="100%" style="height: 100%;">
              </div>
               <div class="col-md-12 isim">
                  Salih Çelikçi - Vekaleten (6 ay) Mağaza Müdür Yardımcısı 
              </div>
          </div>  
          
          <div class="col-md-4" style="margin-bottom:20px;">
              <div class="col-md-12 p0">
                  <img class="myImages" id="myImg" src="seyfi-inam.jpg" alt="Seyfi İnam - Mağaza Müdürü" width="100%" height="100%" style="height: 100%;">
              </div>
               <div class="col-md-12 isim">
                  Seyfi İnam - Mağaza Müdürü 
              </div>
          </div>  
          
           <div class="col-md-4" style="margin-bottom:20px;">
              <div class="col-md-12 p0">
                  <img class="myImages" id="myImg" src="seba-aydin.jpg" alt="Seba Aydın - Finans Müdürü" width="100%" height="100%" style="height: 100%;">
              </div>
               <div class="col-md-12 isim">
                  Seba Aydın - Finans Müdürü  
              </div>
          </div>   
		  
		  		  <div class="col-md-4" style="margin-bottom:20px;">
              <div class="col-md-12 p0">
                   <img class="myImages" id="myImg" src="sibel-tasdemir1.jpg" alt="Sibel Taşdemir - Mağaza Müdür Yardımcısı" width="100%" height="100%">
              </div>
               <div class="col-md-12 isim">
                Sibel Taşdemir - Mağaza Müdür Yardımcısı
              </div>  
          </div>
		  
		  <div class="col-md-4" style="margin-bottom:20px;">
              <div class="col-md-12 p0">
                   <img class="myImages" id="myImg" src="78-kenan-yeniceri-uzman-satis-danismani.png" alt="Kenan Yeniçeri - Uzman Satış Danışmanı" width="100%" height="100%">
              </div>
               <div class="col-md-12 isim">
                Kenan Yeniçeri - Uzman Satış Danışmanı
              </div>  
          </div>
		  
		  <div class="col-md-4" style="margin-bottom:20px;">
              <div class="col-md-12 p0">
                   <img class="myImages" id="myImg" src="74-cuneyt-denizci-uzman-satis-danismani.png" alt="Cüneyt Denizci - Uzman Satış Danışmanı" width="100%" height="100%">
              </div>
               <div class="col-md-12 isim">
                Cüneyt Denizci - Uzman Satış Danışmanı
              </div>  
          </div>
		  
		  <div class="col-md-4" style="margin-bottom:20px;">
              <div class="col-md-12 p0">
                   <img class="myImages" id="myImg" src="73-efekan-tuncel-uzman-satis-danismani.png" alt="Efekan Tuncel - Uzman Satış Danışmanı" width="100%" height="100%">
              </div>
               <div class="col-md-12 isim">
                Efekan Tuncel - Uzman Satış Danışmanı
              </div>  
          </div>
		  
		  <div class="col-md-4" style="margin-bottom:20px;">
              <div class="col-md-12 p0">
                   <img class="myImages" id="myImg" src="71-kubilay-gunay-uzman-satis-danismani.png" alt="Kubilay Günay - Uzman Satış Danışmanı" width="100%" height="100%">
              </div>
               <div class="col-md-12 isim">
                Kubilay Günay - Uzman Satış Danışmanı
              </div>  
          </div>
		  
		  <div class="col-md-4" style="margin-bottom:20px;">
              <div class="col-md-12 p0">
                   <img class="myImages" id="myImg" src="70-ercan-maranci-uzman-satis-danismani.png" alt="Ercan Marancı - Uzman Satış Danışmanı" width="100%" height="100%">
              </div>
               <div class="col-md-12 isim">
                Ercan Marancı - Uzman Satış Danışmanı
              </div>  
          </div>
		  
		  <div class="col-md-4" style="margin-bottom:20px;">
              <div class="col-md-12 p0">
                   <img class="myImages" id="myImg" src="69-yavuz-akyurek-uzman-satis-danismani.png" alt="Yavuz Akyürek - Uzman Satış Danışmanı" width="100%" height="100%">
              </div>
               <div class="col-md-12 isim">
                Yavuz Akyürek - Uzman Satış Danışmanı
              </div>  
          </div>
		  
		  <div class="col-md-4" style="margin-bottom:20px;">
              <div class="col-md-12 p0">
                   <img class="myImages" id="myImg" src="68-hakan-filiz-finans-muduru.png" alt="Hakan Filiz - Finans Müdürü" width="100%" height="100%">
              </div>
               <div class="col-md-12 isim">
                Hakan Filiz - Finans Müdürü
              </div>  
          </div>
		  
		  <div class="col-md-4" style="margin-bottom:20px;">
              <div class="col-md-12 p0">
                   <img class="myImages" id="myImg" src="67-busra-temel-finans-uzmani.png" alt="Büşra Temel - Finans Uzmanı" width="100%" height="100%">
              </div>
               <div class="col-md-12 isim">
                Büşra Temel - Finans Uzmanı
              </div>  
          </div>
		  
		  <div class="col-md-4" style="margin-bottom:20px;">
              <div class="col-md-12 p0">
                   <img class="myImages" id="myImg" src="66-yildiz-koseoglu-magaza-mudur-yardimcisi.png" alt="Yıldız Köseoğlu - Mağaza Müdür Yardımcısı" width="100%" height="100%">
              </div>
               <div class="col-md-12 isim">
                Yıldız Köseoğlu - Mağaza Müdür Yardımcısı
              </div>  
          </div>
		  
		  <div class="col-md-4" style="margin-bottom:20px;">
              <div class="col-md-12 p0">
                   <img class="myImages" id="myImg" src="65-gonul-bozdemir-muhasebe-mudur-yardimcisi.png" alt="Gönül Bozdemir - Muhasebe Müdür Yardımcısı" width="100%" height="100%">
              </div>
               <div class="col-md-12 isim">
                Gönül Bozdemir - Muhasebe Müdür Yardımcısı
              </div>  
          </div>
		  
		  <div class="col-md-4" style="margin-bottom:20px;">
              <div class="col-md-12 p0">
                   <img class="myImages" id="myImg" src="64-erdem-barbaros-toptan-mudur-yardimcisi.png" alt="Erdem Barbaros - Toptan Müdür Yardımcısı" width="100%" height="100%">
              </div>
               <div class="col-md-12 isim">
                Erdem Barbaros - Toptan Müdür Yardımcısı
              </div>  
          </div>
		  
		  <div class="col-md-4" style="margin-bottom:20px;">
              <div class="col-md-12 p0">
                   <img class="myImages" id="myImg" src="63-merve-sunaogullari-magaza-mudur-yardimcisi.png" alt="Merve Sunaoğulları - Mağaza Müdür Yardımcısı" width="100%" height="100%">
              </div>
               <div class="col-md-12 isim">
                Merve Sunaoğulları - Mağaza Müdür Yardımcısı
              </div>  
          </div>
		  
		  <div class="col-md-4" style="margin-bottom:20px;">
              <div class="col-md-12 p0">
                   <img class="myImages" id="myImg" src="62-deniz-akbalik-magaza-muduru.png" alt="Deniz Akbalık - Mağaza Müdürü" width="100%" height="100%">
              </div>
               <div class="col-md-12 isim">
                Deniz Akbalık - Mağaza Müdürü
              </div>  
          </div>
		  
		 <div class="col-md-4" style="margin-bottom:20px;">
              <div class="col-md-12 p0">
                   <img class="myImages" id="myImg" src="61-yunus-emre-karakoc-magaza-mudur-yardimcisi.png" alt="Yunus Emre Karakoç - Mağaza Müdür Yardımcısı" width="100%" height="100%">
              </div>
               <div class="col-md-12 isim">
                Yunus Emre Karakoç - Mağaza Müdür Yardımcısı
              </div>  
          </div>
		  
		 <div class="col-md-4" style="margin-bottom:20px;">
              <div class="col-md-12 p0">
                   <img class="myImages" id="myImg" src="60-meltem-aydin-magaza-muduru.png" alt="Meltem Aydın - Mağaza Müdürü" width="100%" height="100%">
              </div>
               <div class="col-md-12 isim">
                Meltem Aydın - Mağaza Müdürü
              </div>  
          </div> 
		 
		 <div class="col-md-4" style="margin-bottom:20px;">
              <div class="col-md-12 p0">
                   <img class="myImages" id="myImg" src="gonul-bozdemir.jpg" alt="Gönül Bozdemir - Muhasebe Yöneticisi" width="100%" height="100%">
              </div>
               <div class="col-md-12 isim">
                Gönül Bozdemir - Muhasebe Yöneticisi
              </div>  
          </div> 
		 <div class="col-md-4" style="margin-bottom:20px;">
              <div class="col-md-12 p0">
                   <img class="myImages" id="myImg" src="meltem-aydin.jpg" alt="Meltem Aydın - Mağaza Müdürü (Vekaleten 3-Ay)" width="100%" height="100%">
              </div>
               <div class="col-md-12 isim">
                Meltem Aydın - Mağaza Müdürü (Vekaleten 3-Ay)
              </div>  
          </div> 
		 <div class="col-md-4" style="margin-bottom:20px;">
              <div class="col-md-12 p0">
                   <img class="myImages" id="myImg" src="duygu-yurtsever.jpg" alt="Duygu Yurtsever - E-Ticaret Müdürü" width="100%" height="100%">
              </div>
               <div class="col-md-12 isim">
                Duygu Yurtsever - E-Ticaret Müdürü
              </div>  
          </div> 
		 <div class="col-md-4" style="margin-bottom:20px;">
              <div class="col-md-12 p0">
                   <img class="myImages" id="myImg" src="ozlem-bay.jpg" alt="Özlem Bay - Mağaza Müdür Yardımcısı" width="100%" height="100%">
              </div>
               <div class="col-md-12 isim">
                Özlem Bay - Mağaza Müdür Yardımcısı
              </div>  
          </div>
		 <div class="col-md-4" style="margin-bottom:20px;">
              <div class="col-md-12 p0">
                   <img class="myImages" id="myImg" src="ismail-hakki-guresci.jpg" alt="İsmail Hakkı Güreşçi - Uzman Satış Danışmanı" width="100%" height="100%">
              </div>
               <div class="col-md-12 isim">
                İsmail Hakkı Güreşçi - Uzman Satış Danışmanı
              </div>  
          </div>  
		 <div class="col-md-4" style="margin-bottom:20px;">
              <div class="col-md-12 p0">
                   <img class="myImages" id="myImg" src="yunus-emre-karakoc.jpg" alt="Yunus Emre KARAKOÇ - Mağaza Müdür Yardımcısı (Vekaleten 3-Ay)" width="100%" height="100%">
              </div>
               <div class="col-md-12 isim">
                Yunus Emre KARAKOÇ - Mağaza Müdür Yardımcısı (Vekaleten 3-Ay)
              </div>  
          </div> 
		 <div class="col-md-4" style="margin-bottom:20px;">
              <div class="col-md-12 p0">
                   <img class="myImages" id="myImg" src="deniz-akbalik.jpg" alt="Deniz Akbalık - Mağaza Müdürü (Vekaleten 3-Ay)" width="100%" height="100%">
              </div>
               <div class="col-md-12 isim">
                Deniz Akbalık - Mağaza Müdürü (Vekaleten 3-Ay)
              </div>  
          </div> 
		 <div class="col-md-4" style="margin-bottom:20px;">
              <div class="col-md-12 p0">
                   <img class="myImages" id="myImg" src="yavuz-selim-ulucay.jpg" alt="Yavuz Selim Uluçay - Uzman Satış Danışmanı" width="100%" height="100%">
              </div>
               <div class="col-md-12 isim">
                Yavuz Selim Uluçay - Uzman Satış Danışmanı
              </div>  
          </div>
       	 <div class="col-md-4" style="margin-bottom:20px;">
              <div class="col-md-12 p0">
                   <img class="myImages" id="myImg" src="zeynep-onmaz.jpg" alt="Zeynep Onmaz - Mağaza Müdür Yardımcısı" width="100%" height="100%">
              </div>
               <div class="col-md-12 isim">
                Zeynep Onmaz - Mağaza Müdür Yardımcısı
              </div>  
          </div>   
		 <div class="col-md-4" style="margin-bottom:20px;">
              <div class="col-md-12 p0">
                   <img class="myImages" id="myImg" src="huseyin-evren.jpg" alt="Hüseyin Evren - Uzman Satış Danışmanı" width="100%" height="100%">
              </div>
               <div class="col-md-12 isim">
                Hüseyin Evren - Uzman Satış Danışmanı
              </div>  
          </div>      
		 <div class="col-md-4" style="margin-bottom:20px;">
              <div class="col-md-12 p0">
                   <img class="myImages" id="myImg" src="polen-surekli.jpg" alt="Polen Sürekli - Mağaza Müdür Yardımcısı" width="100%" height="100%">
              </div>
               <div class="col-md-12 isim">
                Polen Sürekli - Mağaza Müdür Yardımcısı
              </div>  
          </div>     
		 <div class="col-md-4" style="margin-bottom:20px;">
              <div class="col-md-12 p0">
                   <img class="myImages" id="myImg" src="isa-tek.jpg" alt="İsa Tek - Uzman Satış Danışmanı" width="100%" height="100%">
              </div>
               <div class="col-md-12 isim">
                İsa Tek - Uzman Satış Danışmanı
              </div>  
          </div>    
		 <div class="col-md-4" style="margin-bottom:20px;">
              <div class="col-md-12 p0">
                   <img class="myImages" id="myImg" src="sibel-palavur.jpg" alt="Sibel Palavur - Dijital Pazarlama Grup Müdürü" width="100%" height="100%">
              </div>
               <div class="col-md-12 isim">
                Sibel Palavur - Dijital Pazarlama Grup Müdürü
              </div>  
          </div>   
		 <div class="col-md-4" style="margin-bottom:20px;">
              <div class="col-md-12 p0">
                   <img class="myImages" id="myImg" src="merve-sunaogullari.jpg" alt="Merve Sunaoğlulları - Mağaza Müdür Yardımcısı (Vekaleten 3-Ay)" width="100%" height="100%">
              </div>
               <div class="col-md-12 isim">
                Merve Sunaoğlulları - Mağaza Müdür Yardımcısı (Vekaleten 3-Ay) 
              </div>  
          </div>  
		 <div class="col-md-4" style="margin-bottom:20px;">
              <div class="col-md-12 p0">
                   <img class="myImages" id="myImg" src="harun-yilmaz.jpg" alt="Harun Yılmaz - Mağaza Müdürü" width="100%" height="100%">
              </div>
               <div class="col-md-12 isim">
                Harun Yılmaz - Mağaza Müdürü
              </div>  
          </div> 
		 <div class="col-md-4" style="margin-bottom:20px;">
              <div class="col-md-12 p0">
                   <img class="myImages" id="myImg" src="filiz-bayrak.jpg" alt="Filiz Bayrak - Muhasebe Müdür Yardımcısı" width="100%" height="100%">
              </div>
               <div class="col-md-12 isim">
                Filiz Bayrak - Muhasebe Müdür Yardımcısı
              </div>  
          </div>  
		 <div class="col-md-4" style="margin-bottom:20px;">
              <div class="col-md-12 p0">
                   <img class="myImages" id="myImg" src="seda-dugan.jpg" alt="Seda Duğan - Uzman Satış Danışmanı" width="100%" height="100%">
              </div>
               <div class="col-md-12 isim">
                Seda Duğan - Uzman Satış Danışmanı
              </div>  
          </div>  
		 <div class="col-md-4" style="margin-bottom:20px;">
              <div class="col-md-12 p0">
                   <img class="myImages" id="myImg" src="volkan-yagmur.jpg" alt="Volkan Yağmur - Uzman Satış Danışmanı" width="100%" height="100%">
              </div>
               <div class="col-md-12 isim">
                Volkan Yağmur - Uzman Satış Danışmanı
              </div>  
          </div>  
		 <div class="col-md-4" style="margin-bottom:20px;">
              <div class="col-md-12 p0">
                   <img class="myImages" id="myImg" src="cengiz-beyoglu.jpg" alt="Cengiz Beyoğlu - Uzman Satış Danışmanı" width="100%" height="100%">
              </div>
               <div class="col-md-12 isim">
                Cengiz Beyoğlu - Uzman Satış Danışmanı
              </div>  
          </div> 
         <div class="col-md-4" style="margin-bottom:20px;">
              <div class="col-md-12 p0">
                   <img class="myImages" id="myImg" src="sibel-tasdemir.jpg" alt="Sibel Taşdemir - Mağaza Müdür Yardımcısı (Vekaleten 3-Ay) " width="100%" height="100%">
              </div>
               <div class="col-md-12 isim">
                Sibel Taşdemir - Mağaza Müdür Yardımcısı (Vekaleten 3-Ay) 
              </div>  
          </div>
         <div class="col-md-4" style="margin-bottom:20px;">
              <div class="col-md-12 p0">
                   <img class="myImages" id="myImg" src="yildiz-koseoglu.jpg" alt="Yıldız Köseoğlu - Uzman Satış Danışmanı" width="100%" height="100%">
              </div>
               <div class="col-md-12 isim">
                Yıldız Köseoğlu - Uzman Satış Danışmanı
              </div>  
          </div>
         <div class="col-md-4" style="margin-bottom:20px;">
              <div class="col-md-12 p0">
                   <img class="myImages" id="myImg" src="zeliha-sariusak.jpg" alt="Zeliha Sarıuşak - Uzman Satış Danışmanı" width="100%" height="100%">
              </div>
               <div class="col-md-12 isim">
                Zeliha Sarıuşak - Uzman Satış Danışmanı
              </div>  
          </div>
		<div class="col-md-4" style="margin-bottom:20px;">
              <div class="col-md-12 p0">
                  <img class="myImages" id="myImg" src="erdem-barbaros.jpg" alt="Erdem Barbaros - Toptan Müdür Yardımcısı (Vekaleten 3-Ay) " width="100%" height="100%">
              </div>
               <div class="col-md-12 isim">
                   Erdem Barbaros - Toptan Müdür Yardımcısı (Vekaleten 3-Ay) 
              </div>  
          </div> 	
      	<div class="col-md-4" style="margin-bottom:20px;">
              <div class="col-md-12 p0">
                  <img class="myImages" id="myImg" src="cuneyt-aydinoglu.jpg" alt="Cüneyt Aydınoğlu - Genel Müdür Yardımcısı" width="100%" height="100%">
              </div>
               <div class="col-md-12 isim">
                   Cüneyt Aydınoğlu - Genel Müdür Yardımcısı  
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

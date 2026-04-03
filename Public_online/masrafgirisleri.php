<?php
 	session_start();  
	if($_SESSION['login']!= 1){
		header('Location: ' . 'index.php', true, '303');
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
    <link rel="stylesheet" href="css/style.css">

    <title>Lizay Pırlanta | Web Uygulamaları</title>
    
    
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
      <a href="wsindex.php" class="navbar-brand d-flex align-items-center">
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
       
        <div class="col-md-4">
          <a href="expenses.php" style="text-decoration:none;">
          <div class="card mb-4 shadow-sm flip-2-hor-bottom-1">
            <svg class="bd-placeholder-img card-img-top" width="100%" height="225" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice" focusable="false" role="img" aria-label="Placeholder: Thumbnail">
            <title>Placeholder</title><rect width="100%" height="100%" fill="#F29500"/><text x="50%" y="50%" fill="#eceeef" dy=".3em">MASRAF GİRİŞLERİ</text></svg>
            <div class="card-body">
              <p class="card-text" style="color: black;">Masraf Girişlerinin Yapıldığı Bölüm</p>
            
            </div>
          </div> 
           </a>
        </div>
      
        <div class="col-md-4">
          <a href="expensesatdocn.php" style="text-decoration:none;">
          <div class="card mb-4 shadow-sm flip-2-hor-bottom-1">
            <svg class="bd-placeholder-img card-img-top" width="100%" height="225" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice" focusable="false" role="img" aria-label="Placeholder: Thumbnail"><title>BELGEYE MASRAF GİRİŞLERİ</title><rect width="100%" height="100%" fill="#3C7780"/><text x="50%" y="50%" fill="#eceeef" dy=".3em">BELGEYE MASRAF GİRİŞLERİ</text></svg>
            <div class="card-body">
              <p class="card-text" style="color: black;">Belgeye Masraf Girişlerinin Yapıldığı Bölüm</p>
             
            </div>
          </div>
          </a>
        </div>
        <div class="col-md-4">
         <a href="expensesekli.php" style="text-decoration:none;">
          <div class="card mb-4 shadow-sm flip-2-hor-bottom-1">
            <svg class="bd-placeholder-img card-img-top" width="100%" height="225" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice" focusable="false" role="img" aria-label="Placeholder: Thumbnail"><title>MERKEZ OFİS MASRAF GİRİŞLERİ</title><rect width="100%" height="100%" fill="#C23916"/><text x="50%" y="50%" fill="#eceeef" dy=".3em">MERKEZ OFİS MASRAF GİRİŞLERİ</text></svg>
            <div class="card-body">
              <p class="card-text" style="color: black;">Merkez Ofis Tarafından Yapılan Girişler</p>
           
            </div>
          </div>
          </a>
        </div>

        <div class="col-md-4">
         <a href="expensesConfirm.php" style="text-decoration:none;">
          <div class="card mb-4 shadow-sm flip-2-hor-bottom-1">
            <svg class="bd-placeholder-img card-img-top" width="100%" height="225" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice" focusable="false" role="img" aria-label="Placeholder: Thumbnail"><title>MASRAF ONAYLARI</title><rect width="100%" height="100%" fill="#01acc1"/><text x="50%" y="50%" fill="#eceeef" dy=".3em">MASRAF ONAYLARI</text></svg>
            <div class="card-body">
              <p class="card-text" style="color: black;">Masrafların Onaylarının Bulunduğu Bölüm</p>
            
            </div>
          </div>
          </a>
        </div>
        <div class="col-md-4">
        <a href="expensesfat.php" style="text-decoration:none;">
          <div class="card mb-4 shadow-sm flip-2-hor-bottom-1">
            <svg class="bd-placeholder-img card-img-top" width="100%" height="225" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice" focusable="false" role="img" aria-label="Placeholder: Thumbnail"><title>FATURA ONAYLARI</title><rect width="100%" height="100%" fill="#88bd26"/><text x="50%" y="50%" fill="#eceeef" dy=".3em">FATURA ONAYLARI</text></svg>
            <div class="card-body">
              <p class="card-text" style="color: black;">Fatura Onaylarının Bulunduğu Bölüm</p>
             
            </div>
          </div>
          </a>
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

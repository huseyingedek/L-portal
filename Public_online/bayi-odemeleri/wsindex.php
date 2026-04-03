<?php
session_start();
if (!isset($_SESSION['firma_ad'])) {
  header('Location: ' . 'index.php', true, '303');
  exit;
}

$firma_ad =  $_SESSION['firma_ad'];

?>



<!doctype html>

<html lang="tr">

<head>

  <!-- Required meta tags -->

  <meta charset="utf-8">
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">



  <!-- Bootstrap CSS -->

  <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css" integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T" crossorigin="anonymous">

  <link rel="stylesheet" href="../css/style.css">



  <title>Lizay Pırlanta | Ürün Takip</title>





  <style>
    .card-text {
      white-space: nowrap;
      /* Başlıkları satır sonunda kes */
      overflow: hidden;
      /* Taşan içeriği gizle */
      text-overflow: ellipsis;
      /* Taşan içeriği üç nokta (...) ile göster */
      max-width: 100%;
    }

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

        <p class="navbar-brand d-flex align-items-center">

          <svg  width="20" height="20" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" aria-hidden="true" class="mr-2" viewBox="0 0 24 24" focusable="false">

          </svg>

          <strong>Lizay Pırlanta Ürün Takip Sayfası - <?php echo $firma_ad; ?></strong>

        </p>
        <p class="navbar-brand d-flex align-items-center" style="float: right;">

          <svg  width="20" height="20" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" aria-hidden="true" class="mr-2" viewBox="0 0 24 24" focusable="false">

          </svg>
          <a href="logout.php">
            <strong style="color:white; text-decoration: none; cursor: pointer;">Çıkış</strong>
          </a>
        </p>




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



          <!-- <div class="col-md-4">

            <a href="satis-tablosu/" style="text-decoration:none;">

              <div class="card mb-4 shadow-sm flip-2-hor-bottom-1">

                <svg class="bd-placeholder-img card-img-top" width="100%" height="225" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice" focusable="false" role="img" aria-label="Placeholder: Thumbnail">
                  <title>Ödemeleri Listele</title>
                  <rect width="100%" height="100%" fill="#ff7800

            " /><text x="50%" y="50%" fill="#eceeef" dy=".3em">ÖDEMELERİNİ LİSTELE</text>
                </svg>

                <div class="card-body">

                  <p class="card-text" style="color: black;">Ödeme Listeleme Tablosu</p>

                </div>

              </div>

            </a>

          </div> -->



          <div class="col-md-4">

            <a href="odeme-sayfasi/" style="text-decoration:none;">

              <div class="card mb-4 shadow-sm flip-2-hor-bottom-1">

                <svg class="bd-placeholder-img card-img-top" width="100%" height="225" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice" focusable="false" role="img" aria-label="Placeholder: Thumbnail">
                  <title>IYZICO</title>
                  <rect width="100%" height="100%" fill="#6c00ff

            " /><text x="50%" y="50%" fill="#eceeef" dy=".3em">IYZICO</text>
                </svg>

                <div class="card-body">

                  <p class="card-text" style="color: black;">Iyzico ile Öde</p>

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
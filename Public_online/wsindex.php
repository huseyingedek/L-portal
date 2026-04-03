<?php
session_start();
if ($_SESSION['login'] != 1) {
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

    .bg-light {
      background: radial-gradient(circle, rgba(63, 94, 251, 1) 0%, rgba(252, 70, 107, 1) 100%);
      overflow-x: hidden;
      background-repeat: no-repeat;
      background-position: 50% 50%;
      background-color: #000000;
      background-attachment: fixed;
      background-size: cover;
    }

    .card {
      position: relative;
      display: -ms-flexbox;
      display: flex;
      -ms-flex-direction: column;
      flex-direction: column;
      min-width: 0;
      word-wrap: break-word;
      background-color: #fff;
      background-clip: border-box;
      border: 1px solid rgba(0, 0, 0, .125);
      border-radius: 0.25rem;
      border-radius: 11%;
    }

    .bd-placeholder-img {
      font-size: 1.525rem;
      text-anchor: middle;
      -webkit-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
      user-select: none;
      font-family: calibri;
      border-radius: 18%;
    }
  </style>
</head>

<body>
  <header>
    <!--  <div class="safa">  <?php echo $_SESSION['usern']; ?> </div>    -->
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
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" aria-hidden="true" class="mr-2" viewBox="0 0 24 24" focusable="false">
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
            <circle cx="12" cy="13" r="4" />
          </svg>
          <strong>Web Uygulamaları</strong>
        </a>
        <div style="float:right; color:white;"><a href="http://176.236.6.140:8099/caniasout.jnlp" style="color:white;" target="_blank">IAS Dış İp: 176.236.6.140:8099 </a>| <a href="http://192.168.1.50:8099/canias.jnlp" target="_blank" style="color:white;">IAS İç İp: 192.168.1.50:8099</a> | <a href="https://media.ias.com.tr/java8/windows/jre-8u191-windows-x64.exe" target="_blank" style="color:white;">JAVA</a></div>
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
          <? if (
            $_SESSION['usern'] != "LBURADA" and $_SESSION['usern'] != "LBURSA" and $_SESSION['usern'] != "LDUZCE" and $_SESSION['usern'] != "LEMAAR"
            and $_SESSION['usern'] != "LFATSA" and $_SESSION['usern'] != "LHILLTOWN" and $_SESSION['usern'] != "LIHILLTOWN" and $_SESSION['usern'] != "LISKENDERUN"
            and $_SESSION['usern'] != "LKRIKHAN" and $_SESSION['usern'] != "LMETROPOL" and $_SESSION['usern'] != "LMARAS" and $_SESSION['usern'] != "LNADIRE"
            and $_SESSION['usern'] != "LSILIVRI" and $_SESSION['usern'] != "LSYMBOL"
          ) {
            echo '  
        <div class="col-md-4">
          <a href="masrafgirisleri.php" style="text-decoration:none;">
          <div class="card mb-4 shadow-sm flip-2-hor-bottom-1">
            <svg class="bd-placeholder-img card-img-top" width="100%" height="225" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice" focusable="false" role="img" aria-label="Placeholder: Thumbnail">
            <title>Placeholder</title><rect width="100%" height="100%" fill="#F29500"/><text x="50%" y="50%" fill="#eceeef" dy=".3em">MASRAF GİRİŞLERİ</text></svg>
            <div class="card-body">
              <p class="card-text" style="color: black;">Masraf Girişlerinin Yapıldığı Bölüm</p>
            </div>
          </div> 
           </a>
        </div>   ';
          }
          ?>
          <div class="col-md-4">
            <a href="sirket-ici-iletisim/" style="text-decoration:none;">
              <div class="card mb-4 shadow-sm flip-2-hor-bottom-1">
                <svg class="bd-placeholder-img card-img-top" width="100%" height="225" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice" focusable="false" role="img" aria-label="Placeholder: Thumbnail">
                  <title>Şirket İçi İletişim</title>
                  <rect width="100%" height="100%" fill="#de3b59" /><text x="50%" y="50%" fill="#eceeef" dy=".3em">ŞİRKET İÇİ İLETİŞİM</text>
                </svg>
                <div class="card-body">
                  <p class="card-text" style="color: black;">Şirket İçi ve Mağaza Numaraları</p>
                </div>
              </div>
            </a>
          </div>

          <div class="col-md-4">
            <a href="ias-egitim/" style="text-decoration:none;">
              <div class="card mb-4 shadow-sm flip-2-hor-bottom-1">
                <svg class="bd-placeholder-img card-img-top" width="100%" height="225" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice" focusable="false" role="img" aria-label="Placeholder: Thumbnail">
                  <title>İTesr</title>
                  <rect width="100%" height="100%" fill="#12a9d6" /><text x="50%" y="50%" fill="#eceeef" dy=".3em">İAS EĞİTİM DÖKÜMANLARI</text>
                </svg>
                <div class="card-body">
                  <p class="card-text" style="color: black;">İas Programının Eğitim Sayfası</p>
                </div>
              </div>
            </a>
          </div>
          <div class="col-md-4">
            <a href="prosedurler/" style="text-decoration:none;">
              <div class="card mb-4 shadow-sm flip-2-hor-bottom-1">
                <svg class="bd-placeholder-img card-img-top" width="100%" height="225" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice" focusable="false" role="img" aria-label="Placeholder: Thumbnail">
                  <title>Şirket İçi Prosedürler</title>
                  <rect width="100%" height="100%" fill="#2ea568
            " /><text x="50%" y="50%" fill="#eceeef" dy=".3em">PROSEDÜRLER</text>
                </svg>
                <div class="card-body">
                  <p class="card-text" style="color: black;">Şirket İçi Prosedürler</p>
                </div>
              </div>
            </a>
          </div>
          <!-- <div class="col-md-4">
         <a href="kurumsal/" style="text-decoration:none;">
          <div class="card mb-4 shadow-sm flip-2-hor-bottom-1">
            <svg class="bd-placeholder-img card-img-top" width="100%" height="225" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice" focusable="false" role="img" aria-label="Placeholder: Thumbnail"><title>Kurumsal Firmalarla Anlaşmalar</title><rect width="100%" height="100%" fill="#823633
            "/><text x="50%" y="50%" fill="#eceeef" dy=".3em">KURUMSAL</text></svg>
            <div class="card-body">
              <p class="card-text" style="color: black;">Kurumsal Firmalarla Anlaşmalar</p> 
            </div>
          </div>
          </a>
        </div> -->
          <div class="col-md-4">
            <a href="bilgilendirme/" style="text-decoration:none;">
              <div class="card mb-4 shadow-sm flip-2-hor-bottom-1">
                <svg class="bd-placeholder-img card-img-top" width="100%" height="225" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice" focusable="false" role="img" aria-label="Placeholder: Thumbnail">
                  <title>Bildilendirme</title>
                  <rect width="100%" height="100%" fill="#5a6b00
            " /><text x="50%" y="50%" fill="#eceeef" dy=".3em">BİLGİLENDİRME</text>
                </svg>
                <div class="card-body">
                  <p class="card-text" style="color: black;">Bildilendirme-Duyuru</p>
                </div>
              </div>
            </a>
          </div>
          <div class="col-md-4">
            <a href="ik/index.php" style="text-decoration:none;">
              <div class="card mb-4 shadow-sm flip-2-hor-bottom-1">
                <svg class="bd-placeholder-img card-img-top" width="100%" height="225" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice" focusable="false" role="img" aria-label="Placeholder: Thumbnail">
                  <title>İnsan Kaynakları</title>
                  <rect width="100%" height="100%" fill="#ff4800
            " /><text x="50%" y="50%" fill="#eceeef" dy=".3em">İNSAN KAYNAKLARI</text>
                </svg>
                <div class="card-body">
                  <p class="card-text" style="color: black;">İnsan Kaynakları Bilgilendirme</p>
                </div>
              </div>
            </a>
          </div>
          <div class="col-md-4">
         <a href="magazacilik/" style="text-decoration:none;">
          <div class="card mb-4 shadow-sm flip-2-hor-bottom-1">
            <svg class="bd-placeholder-img card-img-top" width="100%" height="225" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice" focusable="false" role="img" aria-label="Placeholder: Thumbnail"><title>Mağazacılık</title><rect width="100%" height="100%" fill="#4ca8bd
            "/><text x="50%" y="50%" fill="#eceeef" dy=".3em">MAĞAZACILIK</text></svg>
            <div class="card-body">
              <p class="card-text" style="color: black;">Mağazacılık</p> 
            </div>
          </div>
          </a>
        </div>
          <div class="col-md-4">
            <a href="fiyatgor/" style="text-decoration:none;">
              <div class="card mb-4 shadow-sm flip-2-hor-bottom-1">
                <svg class="bd-placeholder-img card-img-top" width="100%" height="225" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice" focusable="false" role="img" aria-label="Placeholder: Thumbnail">
                  <title>Barkod ile Ürün Detayları Sorgulama</title>
                  <rect width="100%" height="100%" fill="#905E96
            " /><text x="50%" y="50%" fill="#eceeef" dy=".3em">FİYAT GÖR</text>
                </svg>
                <div class="card-body">
                  <p class="card-text" style="color: black;">Barkod ile Ürün Sorgulama</p>
                </div>
              </div>
            </a>
          </div>
          <div class="col-md-4">
            <a href="odeme-sayfasi/" style="text-decoration:none;">
              <div class="card mb-4 shadow-sm flip-2-hor-bottom-1">
                <svg class="bd-placeholder-img card-img-top" width="100%" height="225" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice" focusable="false" role="img" aria-label="Placeholder: Thumbnail">
                  <title>Iyzico ile Öde</title>
                  <rect width="100%" height="100%" fill="#0000FF
   " /><text x="50%" y="50%" fill="#FFFFFF" dy=".3em">ÖDEME YAP</text>
                </svg>
                <div class="card-body">
                  <p class="card-text" style="color: black;">Iyzico ile Öde</p>
                </div>
              </div>
            </a>
          </div>
          <div class="col-md-4">
            <a href="izin-formu/" style="text-decoration:none;">
              <div class="card mb-4 shadow-sm flip-2-hor-bottom-1">
                <svg class="bd-placeholder-img card-img-top" width="100%" height="225" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice" focusable="false" role="img" aria-label="Placeholder: Thumbnail">
                  <title>İzin Talep Formu</title>
                  <rect width="100%" height="100%" fill="#4169E1
   " /><text x="50%" y="50%" fill="#FFFFFF" dy=".3em">İZİN FORMU</text>
                </svg>
                <div class="card-body">
                  <p class="card-text" style="color: black;">İzin Talep Formu</p>
                </div>
              </div>
            </a>
          </div>
          <!--
        <div class="col-md-4">
         <a href="kurumsal/" style="text-decoration:none;">
          <div class="card mb-4 shadow-sm flip-2-hor-bottom-1">
            <svg class="bd-placeholder-img card-img-top" width="100%" height="225" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice" focusable="false" role="img" aria-label="Placeholder: Thumbnail"><title>Bankalarla Anlaşmalar</title><rect width="100%" height="100%" fill="#6d14bf
            "/><text x="50%" y="50%" fill="#eceeef" dy=".3em">BANKALAR</text></svg>
            <div class="card-body">
              <p class="card-text" style="color: black;">Bankalarla Anlaşmalar</p> 
            </div>
          </div>
          </a>
        </div> -->
        </div>
      </div>
    </div>
  </main>
  <script src="https://code.jquery.com/jquery-3.3.1.slim.min.js" integrity="sha384-q8i/X+965DzO0rT7abK41JStQIAqVgRVzpbzo5smXKp4YfRvH+8abtTE1Pi6jizo" crossorigin="anonymous"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.7/umd/popper.min.js" integrity="sha384-UO2eT0CpHqdSJQ6hJty5KVphtPhzWj9WO1clHTMGa3JDZwrnQq4sF86dIHNDz0W1" crossorigin="anonymous"></script>
  <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/js/bootstrap.min.js" integrity="sha384-JjSmVgyd0p3pXB1rRibZUAYoIIy6OrQ6VrjIEaFf/nJGzIxFDsf4x0xIM+B07jRM" crossorigin="anonymous"></script>
</body>

</html>
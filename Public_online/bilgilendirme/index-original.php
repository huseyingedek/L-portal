<?php
session_start();
if ($_SESSION['login'] != 1) {

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

  <link rel="stylesheet" href="../vendors/css/bootstrap.min.css">
  <link rel="stylesheet" href="../vendors/fontawesome-free-6.4.2-web/css/all.min.css">
  <link rel="stylesheet" href="../vendors/css/style.css">

  <title>Lizay Pırlanta | Web Uygulamaları</title>

</head>

<body>

  <header>

    <div class="navbar navbar-dark bg-dark shadow-sm">

      <div class="container d-flex justify-content-between">

        <a href="../wsindex.php" class="navbar-brand d-flex align-items-center">

          <p>
            <i class="fa-solid fa-house"></i><strong> WEB Uygulamaları</strong>
          </p>

        </a>

        <a href="bilgilendirme-ekle.php" class="navbar-brand d-flex align-items-center">
          <p>
            <i class="fas fa-edit"></i><strong> Bilgilendirme Ekle</strong>
          </p>
        </a>
      </div>

    </div>

  </header>

  <main role="main">

    <div class="album py-5 bg-light">

      <div class="container">

        <div class="row">

          <div class="col-md-4">

            <a href="urun-yonetimi.php" style="text-decoration:none;">

              <div class="card mb-4 shadow-sm flip-2-hor-bottom-1">

                <svg class="bd-placeholder-img card-img-top" width="100%" height="225"
                  xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice" focusable="false" role="img"
                  aria-label="Placeholder: Thumbnail">

                  <title>Placeholder</title>
                  <rect width="100%" height="100%" fill="#2456af" /><text x="50%" y="50%" fill="#eceeef" dy=".3em">ÜRÜN
                    YÖNETİMİ</text>
                </svg>

                <div class="card-body">

                  <p class="card-text" style="color: black;">Ürün yönetimini Önemi ve Sistemin Kurulması</p>

                </div>

              </div>

            </a>

          </div>

          <div class="col-md-4">

            <a href="avansas.php" style="text-decoration:none;">

              <div class="card mb-4 shadow-sm flip-2-hor-bottom-1">

                <svg class="bd-placeholder-img card-img-top" width="100%" height="225"
                  xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice" focusable="false" role="img"
                  aria-label="Placeholder: Thumbnail">

                  <title>Placeholder</title>
                  <rect width="100%" height="100%" fill="#006b26" /><text x="50%" y="50%" fill="#eceeef"
                    dy=".3em">AVANSAS</text>
                </svg>

                <div class="card-body">

                  <p class="card-text" style="color: black;">Avansas Siparişleri</p>

                </div>

              </div>

            </a>

          </div>

          <div class="col-md-4">

            <a href="sertifika-duzeni.php" style="text-decoration:none;">

              <div class="card mb-4 shadow-sm flip-2-hor-bottom-1">

                <svg class="bd-placeholder-img card-img-top" width="100%" height="225"
                  xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice" focusable="false" role="img"
                  aria-label="Placeholder: Thumbnail">

                  <title>Placeholder</title>
                  <rect width="100%" height="100%" fill="#187f90" /><text x="50%" y="50%" fill="#eceeef"
                    dy=".3em">SERTİFİKA</text>
                </svg>

                <div class="card-body">

                  <p class="card-text" style="color: black;">Sertifika Düzeni</p>

                </div>

              </div>

            </a>

          </div>

          <div class="col-md-4">

            <a href="shift-duzeni.php" style="text-decoration:none;">

              <div class="card mb-4 shadow-sm flip-2-hor-bottom-1">

                <svg class="bd-placeholder-img card-img-top" width="100%" height="225"
                  xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice" focusable="false" role="img"
                  aria-label="Placeholder: Thumbnail">

                  <title>Placeholder</title>
                  <rect width="100%" height="100%" fill="#ff9030" /><text x="50%" y="50%" fill="#eceeef"
                    dy=".3em">SHİFT</text>
                </svg>

                <div class="card-body">

                  <p class="card-text" style="color: black;">Shift Düzeni</p>

                </div>

              </div>

            </a>

          </div>

          <div class="col-md-4">

            <a href="musteri-ismi.php" style="text-decoration:none;">

              <div class="card mb-4 shadow-sm flip-2-hor-bottom-1">

                <svg class="bd-placeholder-img card-img-top" width="100%" height="225"
                  xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice" focusable="false" role="img"
                  aria-label="Placeholder: Thumbnail">

                  <title>Placeholder</title>
                  <rect width="100%" height="100%" fill="#d62828" /><text x="50%" y="50%" fill="#eceeef"
                    dy=".3em">MÜŞTERİ SİPARİŞİ</text>
                </svg>

                <div class="card-body">

                  <p class="card-text" style="color: black;">Müşteri Siparişi Oluşturulması</p>

                </div>

              </div>

            </a>

          </div>

          <div class="col-md-4">

            <a href="masraf.php" style="text-decoration:none;">

              <div class="card mb-4 shadow-sm flip-2-hor-bottom-1">

                <svg class="bd-placeholder-img card-img-top" width="100%" height="225"
                  xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice" focusable="false" role="img"
                  aria-label="Placeholder: Thumbnail">

                  <title>Placeholder</title>
                  <rect width="100%" height="100%" fill="#6866dc" /><text x="50%" y="50%" fill="#eceeef" dy=".3em">İŞ
                    AVANSI</text>
                </svg>

                <div class="card-body">

                  <p class="card-text" style="color: black;">İş Avansı</p>

                </div>

              </div>

            </a>

          </div>

          <div class="col-md-4">

            <a href="tektas-bestas.php" style="text-decoration:none;">

              <div class="card mb-4 shadow-sm flip-2-hor-bottom-1">

                <svg class="bd-placeholder-img card-img-top" width="100%" height="225"
                  xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice" focusable="false" role="img"
                  aria-label="Placeholder: Thumbnail">

                  <title>Placeholder</title>
                  <rect width="100%" height="100%" fill="#01c5c4" /><text x="50%" y="50%" fill="#eceeef"
                    dy=".3em">TEKTAŞ-BEŞTAŞ FİYAT LİSTESİ</text>
                </svg>

                <div class="card-body">

                  <p class="card-text" style="color: black;">Tektaş-Beştaş Fiyat Listesi</p>

                </div>

              </div>

            </a>

          </div>

          <div class="col-md-4">

            <a href="kampanya-gorselleri.php" style="text-decoration:none;">

              <div class="card mb-4 shadow-sm flip-2-hor-bottom-1">

                <svg class="bd-placeholder-img card-img-top" width="100%" height="225"
                  xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice" focusable="false" role="img"
                  aria-label="Placeholder: Thumbnail">

                  <title>Placeholder</title>
                  <rect width="100%" height="100%" fill="#eecfa1" /><text x="50%" y="50%" fill="#eceeef"
                    dy=".3em">KAMPANYA GÖRSELLERİ</text>
                </svg>

                <div class="card-body">

                  <p class="card-text" style="color: black;">Kampanya görsellerinin bulunduğu alan</p>

                </div>

              </div>

            </a>

          </div>

        </div>

      </div>

    </div>

  </main>

  <script src="https://code.jquery.com/jquery-3.3.1.slim.min.js"
    integrity="sha384-q8i/X+965DzO0rT7abK41JStQIAqVgRVzpbzo5smXKp4YfRvH+8abtTE1Pi6jizo" crossorigin="anonymous">
  </script>

  <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.7/umd/popper.min.js"
    integrity="sha384-UO2eT0CpHqdSJQ6hJty5KVphtPhzWj9WO1clHTMGa3JDZwrnQq4sF86dIHNDz0W1" crossorigin="anonymous">
  </script>

  <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/js/bootstrap.min.js"
    integrity="sha384-JjSmVgyd0p3pXB1rRibZUAYoIIy6OrQ6VrjIEaFf/nJGzIxFDsf4x0xIM+B07jRM" crossorigin="anonymous">
  </script>

</body>

</html>
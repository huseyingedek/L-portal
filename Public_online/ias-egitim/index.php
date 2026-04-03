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
    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css" integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T" crossorigin="anonymous">
    <link rel="stylesheet" href="../css/style.css">
    <title>Lizay Pırlanta | Şirket İçi İletişim</title>
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
        <div class="navbar navbar-dark bg-dark shadow-sm">
            <div class="container d-flex justify-content-between">
                <a href="http://online.lizaypirlanta.com/wsindex.php" class="navbar-brand d-flex align-items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" aria-hidden="true" class="mr-2" viewBox="0 0 24 24" focusable="false">
                        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                        <circle cx="12" cy="13" r="4" />
                    </svg>
                    <strong>Web Uygulamaları</strong>
                </a>
            </div>
        </div>
    </header>
    <main role="main">
        <div class="album py-5 bg-light">
            <div class="container">
                <div class="row">
                    <div class="col-md-4">
                        <a href="pages/muhasebe-belgeleri.php" style="text-decoration:none;">
                            <div class="card mb-4 shadow-sm flip-2-hor-bottom-1">
                                <svg class="bd-placeholder-img card-img-top" width="100%" height="225" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice" focusable="false" role="img" aria-label="Placeholder: Thumbnail">
                                    <title>FRANCHISE ÜRÜN KABULÜ</title>
                                    <rect width="100%" height="100%" fill="#ff7800
            " /><text x="50%" y="50%" fill="#eceeef" dy=".3em">FRANCHISE ÜRÜN KABULÜ</text>
                                </svg>
                                <div class="card-body">
                                    <p class="card-text" style="color: black;">Franchise Ürün Kabulü</p>
                                </div>
                            </div>
                        </a>
                    </div>
                    <div class="col-md-4">
                        <a href="pages/musteri-bakiye-listesi.php" style="text-decoration:none;">
                            <div class="card mb-4 shadow-sm flip-2-hor-bottom-1">
                                <svg class="bd-placeholder-img card-img-top" width="100%" height="225" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice" focusable="false" role="img" aria-label="Placeholder: Thumbnail">
                                    <title>MÜŞTERİ BAKİYE LİSTESİ</title>
                                    <rect width="100%" height="100%" fill="#6c00ff
            " /><text x="50%" y="50%" fill="#eceeef" dy=".3em">MÜŞTERİ BAKİYE LİSTESİ</text>
                                </svg>
                                <div class="card-body">
                                    <p class="card-text" style="color: black;">Müşteri Bakiye Listesi</p>
                                </div>
                            </div>
                        </a>
                    </div>
                    <div class="col-md-4">
                        <a href="pages/banko-transferleri.php" style="text-decoration:none;">
                            <div class="card mb-4 shadow-sm flip-2-hor-bottom-1">
                                <svg class="bd-placeholder-img card-img-top" width="100%" height="225" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice" focusable="false" role="img" aria-label="Placeholder: Thumbnail">
                                    <title>BANKO TRANSFERLERİ</title>
                                    <rect width="100%" height="100%" fill="#20b2aa
   " /><text x="50%" y="50%" fill="#eceeef" dy=".3em">BANKO AKTARIMLARI</text>
                                </svg>
                                <div class="card-body">
                                    <p class="card-text" style="color: black;">Banko Aktarımları</p>
                                </div>
                            </div>
                        </a>
                    </div>

                    <div class="col-md-4">
                        <a href="pages/barkod-sayimi.php" style="text-decoration:none;">
                            <div class="card mb-4 shadow-sm flip-2-hor-bottom-1">
                                <svg class="bd-placeholder-img card-img-top" width="100%" height="225" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice" focusable="false" role="img" aria-label="Placeholder: Thumbnail">
                                    <title>BARKOD SAYIM UYGULAMASI</title>
                                    <rect width="100%" height="100%" fill="	#6a5acd
   " /><text x="50%" y="50%" fill="#eceeef" dy=".3em">BARKOD SAYIM UYGULAMASI</text>
                                </svg>
                                <div class="card-body">
                                    <p class="card-text" style="color: black;">Barkod Sayım Uygulamaları</p>
                                </div>
                            </div>
                        </a>
                    </div>
                    <div class="col-md-4">
                        <a href="pages/stoklar.php" style="text-decoration:none;">
                            <div class="card mb-4 shadow-sm flip-2-hor-bottom-1">
                                <svg class="bd-placeholder-img card-img-top" width="100%" height="225" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice" focusable="false" role="img" aria-label="Placeholder: Thumbnail">
                                    <title>STOKLAR</title>
                                    <rect width="100%" height="100%" fill="	#3cb371
   " /><text x="50%" y="50%" fill="#eceeef" dy=".3em">STOKLAR</text>
                                </svg>
                                <div class="card-body">
                                    <p class="card-text" style="color: black;">Stok Listesi</p>
                                </div>
                            </div>
                        </a>
                    </div>
                    <div class="col-md-4">
                        <a href="pages/barkod-giris.php" style="text-decoration:none;">
                            <div class="card mb-4 shadow-sm flip-2-hor-bottom-1">
                                <svg class="bd-placeholder-img card-img-top" width="100%" height="225" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice" focusable="false" role="img" aria-label="Placeholder: Thumbnail">
                                    <title>BARKOD GİRİŞİ</title>
                                    <rect width="100%" height="100%" fill="	#ff6a6a
   " /><text x="50%" y="50%" fill="#eceeef" dy=".3em">BARKOD GİRİŞ UYGULAMASI</text>
                                </svg>
                                <div class="card-body">
                                    <p class="card-text" style="color: black;">Barkod Giriş Uygulaması</p>
                                </div>
                            </div>
                        </a>
                    </div>
                    <div class="col-md-4">
                        <a href="pages/satis-istatistikleri.php" style="text-decoration:none;">
                            <div class="card mb-4 shadow-sm flip-2-hor-bottom-1">
                                <svg class="bd-placeholder-img card-img-top" width="100%" height="225" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice" focusable="false" role="img" aria-label="Placeholder: Thumbnail">
                                    <title>SATIŞLAR</title>
                                    <rect width="100%" height="100%" fill="	#ff3030
   " /><text x="50%" y="50%" fill="#eceeef" dy=".3em">SATIŞ İSTATİSTİKLERİ</text>
                                </svg>
                                <div class="card-body">
                                    <p class="card-text" style="color: black;">Satış İstatistikleri</p>
                                </div>
                            </div>
                        </a>
                    </div>
                    <div class="col-md-4">
                        <a href="pages/satis-raporlari.php" style="text-decoration:none;">
                            <div class="card mb-4 shadow-sm flip-2-hor-bottom-1">
                                <svg class="bd-placeholder-img card-img-top" width="100%" height="225" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice" focusable="false" role="img" aria-label="Placeholder: Thumbnail">
                                    <title>SATIŞ RAPORLARI</title>
                                    <rect width="100%" height="100%" fill="#008080
   " /><text x="50%" y="50%" fill="#eceeef" dy=".3em">SATIŞ RAPORLARI</text>
                                </svg>
                                <div class="card-body">
                                    <p class="card-text" style="color: black;">Barkod Bazlı Satış Kontrolü</p>
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
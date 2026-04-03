<?php

require('../class/settings.php');
$query = "SELECT * FROM `PROSEDURLER` ORDER BY `PROSEDURLER`.`prosedur_tarih` DESC";

try {
    $result = $db->select($query);
} catch (PDOException $e) {
    echo "Sorgu hatası: " . $e->getMessage();
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
    <link rel="stylesheet" href="../vendors/css/style.css">
    <link rel="stylesheet" href="../vendors/fontawesome-free-6.4.2-web/css/all.min.css">


    <title>Lizay Pırlanta | Web Uygulamaları</title>
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
    </style>
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
                <?php if($_SESSION['usern'] == "CICIGEN" || $_SESSION['usern'] == "BTEMUR" || $_SESSION['usern'] == "EALPER" || $_SESSION['usern'] == "SGENC"){ ?> 
                <a href="prosedur-ekle.php" class="navbar-brand d-flex align-items-center">
                    <p>
                        <i class="fa fa-edit"></i><strong> Prosedür Ekle</strong>
                    </p>
                </a>
                <?php } ?>
            </div>

        </div>

    </header>



    <main role="main">

        <div class="album py-5 bg-light">

            <div class="container">

                <div class="row">
                    <?php if ($result) {
                        $renkler = array(
                            "#9ADEDB", "#77dd77", "#836953",  "#99c5c4", "#aa9499", "#b39eb5",
                            "#befd73", "#cb99c9", "#ff6961", "#ff964f", "#ff9899", "#ca9bf7", "#483D8B",
                            "#00FF7F", "#2E8B57", "#008B8B", "#191970"
                        );
                        $sira = 0;
                        foreach ($result as $row) {
                            $rect_rengi = $renkler[$sira];
                            $sira++;
                            if ($sira >= count($renkler)) {
                                $sira = 0;
                            }

                            // $rect_rengi = $renkler[array_rand($renkler)];
                            $prosedur_baslik = $row['prosedur_baslik'];
                            $prosedur_gorsel_baslik = $row['prosedur_gorsel_baslik'];
                            $prosedur_icerik = $row['prosedur_icerik'];
                            $prosedur_dosya_adi = $row['prosedur_dosya_adi'];

                            $dosya_adi = dosyaAdiOlustur($prosedur_gorsel_baslik); //sunucuda oluşturulacak dosyanın adı

                            // Dosya zaten varsa üzerine yazma
                            if (!file_exists($dosya_adi)) {

                                $dosya_icerik = "<?php
                                header('Content-Type: text/html; charset=utf-8');
                                require_once('../class/settings.php');
                                include_once('header.php');
                                
                                \$query = \"SELECT * FROM `PROSEDURLER` WHERE prosedur_dosya_adi = '$dosya_adi'\";
                                try {
                                    \$result = \$db->select(\$query);
                                } catch (PDOException \$e) {
                                    echo \"Sorgu hatası: \" . \$e->getMessage();
                                }
                                
                                if (\$result) {
                                    foreach (\$result as \$row) {
                                        \$prosedur_baslik = \$row['prosedur_baslik'];
                                        \$prosedur_gorsel_baslik = \$row['prosedur_gorsel_baslik'];
                                        \$prosedur_icerik = \$row['prosedur_icerik'];
                                
                                        echo '
                                        <header class=\"bg-primary text-white\" style=\"padding: 50px 0 50px;\">
                                        <div class=\"container text-center\">
                                        <h1>' . \$prosedur_gorsel_baslik . '</h1>
                                        <p class=\"lead\"></p>
                                        </div>
                                        </header>
                                        <section id=\"about\">
                                        <div class=\"container\">
                                        <div class=\"row\">
                                        <div class=\"col-lg-8 mx-auto\" style=\"padding-top: 41px;\">
                                        <strong>' . \$prosedur_baslik . ':</strong></p>';
                                
                                        echo \$prosedur_icerik;
                                    }
                                }
                                
                                include_once('footer.php'); ?>";
                                file_put_contents($dosya_adi, $dosya_icerik);

                                chmod($dosya_adi, 0777);
                            }
                            //   <div class=\"container\">';  
                    ?>
                            <!-- start -->
                            <div class="col-md-4">
                                <a href="<?php echo $dosya_adi; ?>" style="text-decoration:none;">
                                    <div class="card mb-4 shadow-sm flip-2-hor-bottom-1">
                                        <svg class="bd-placeholder-img card-img-top" width="100%" height="225" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice" focusable="false" role="img" aria-label="Placeholder: Thumbnail">
                                            <title><?php echo $prosedur_baslik; ?></title>
                                            <rect width="100%" height="100%" fill="<?php echo $rect_rengi; ?>" />
                                            <text x="50%" y="50%" fill="white" bolder dy=".3em">
                                                <tspan font-weight="bold"><?php echo $prosedur_gorsel_baslik; ?></tspan>
                                            </text>
                                        </svg>
                                        <div class="card-body">
                                            <p class="card-text" style="color: black;"><?php echo $prosedur_baslik; ?></p>
                                        </div>
                                    </div>
                                </a>
                            </div>
                            <!-- end --> <?php           }
                                    } else {
                                        echo "Veri bulunamadı.";
                                    } ?>
                </div>

            </div>

        </div>

    </main>





    <script src="https://code.jquery.com/jquery-3.3.1.slim.min.js" integrity="sha384-q8i/X+965DzO0rT7abK41JStQIAqVgRVzpbzo5smXKp4YfRvH+8abtTE1Pi6jizo" crossorigin="anonymous"></script>

    <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.7/umd/popper.min.js" integrity="sha384-UO2eT0CpHqdSJQ6hJty5KVphtPhzWj9WO1clHTMGa3JDZwrnQq4sF86dIHNDz0W1" crossorigin="anonymous"></script>

    <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/js/bootstrap.min.js" integrity="sha384-JjSmVgyd0p3pXB1rRibZUAYoIIy6OrQ6VrjIEaFf/nJGzIxFDsf4x0xIM+B07jRM" crossorigin="anonymous"></script>

</body>

</html>
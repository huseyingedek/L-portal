<?php
                header('Content-Type: text/html; charset=utf-8');
                require_once('../class/settings.php');
                include_once('header.php');
                
                $query = "SELECT * FROM `BILGILENDIRMELER` WHERE bilgilendirme_dosya_adi = 'Kampanya-Gorselleri.php'";
                try {
                    $result = $db->select($query);
                } catch (PDOException $e) {
                    echo "Sorgu hatası: " . $e->getMessage();
                }
                
                if ($result) {
                    foreach ($result as $row) {
                        $bilgilendirme_baslik = $row['bilgilendirme_baslik'];
                        $bilgilendirme_gorsel_baslik = $row['bilgilendirme_gorsel_baslik'];
                        $bilgilendirme_icerik = $row['bilgilendirme_icerik'];
                
                        echo '
                        <header class="bg-primary text-white" style="padding: 50px 0 50px;">

                        <div class="container text-center">
                        <h1>' . $bilgilendirme_gorsel_baslik . '</h1>
                        <p class="lead"></p>
                        </div>
                        </header>
                        <section id="about">
                        <div class="container">
                        <div class="row">
                        <div class="col-lg-8 mx-auto" style="padding-top: 41px;">
                        <strong>' . $bilgilendirme_baslik . ':</strong></p>';
                
                        echo $bilgilendirme_icerik;
                    }
                }
                
                include_once('footer.php'); 
                echo "<br> <script src=\"https://code.jquery.com/jquery-3.6.0.min.js\"></script>
                <script>
                $(document).ready(function() {
                    $('img').css({
                        'max-width': '100%',
                        'height': 'auto'
                    });
                });
                </script>"
                ?>
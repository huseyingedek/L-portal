<?php
                                header('Content-Type: text/html; charset=utf-8');
                                require_once('../class/settings.php');
                                include_once('header.php');
                                
                                $query = "SELECT * FROM `KAMPANYALAR` WHERE kampanya_dosya_adi = 'DENTGROUP.php'";
                                try {
                                    $result = $db->select($query);
                                } catch (PDOException $e) {
                                    echo "Sorgu hatası: " . $e->getMessage();
                                }
                                
                                if ($result) {
                                    foreach ($result as $row) {
                                        $kampanya_baslik = $row['kampanya_baslik'];
                                        $kampanya_gorsel_baslik = $row['kampanya_gorsel_baslik'];
                                        $kampanya_icerik = $row['kampanya_icerik'];
                                
                                        echo '
                                        <header class="bg-primary text-white" style="padding: 50px 0 50px;">
                                        <div class="container text-center">
                                        <h1>' . $kampanya_gorsel_baslik . '</h1>
                                        <p class="lead"></p>
                                        </div>
                                        </header>
                                        <section id="about">
                                        <div class="container">
                                        <div class="row">
                                        <div class="col-lg-8 mx-auto" style="padding-top: 41px;">
                                        <strong>' . $kampanya_baslik . ':</strong></p>';
                                
                                        echo $kampanya_icerik;
                                    }
                                }
                                
                                include_once('footer.php'); ?>
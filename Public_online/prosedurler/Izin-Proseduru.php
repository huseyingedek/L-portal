<?php

                                header('Content-Type: text/html; charset=utf-8');
                                require_once('../class/settings.php');
                                include_once('header.php');
                                
                                $query = "SELECT * FROM `PROSEDURLER` WHERE prosedur_dosya_adi = 'Izin-Proseduru.php'";
                                try {
                                    $result = $db->select($query);
                                } catch (PDOException $e) {
                                    echo "Sorgu hatası: " . $e->getMessage();
                                }
                                
                                if ($result) {
                                    foreach ($result as $row) {
                                        $prosedur_baslik = $row['prosedur_baslik'];
                                        $prosedur_gorsel_baslik = $row['prosedur_gorsel_baslik'];
                                        $prosedur_icerik = $row['prosedur_icerik'];
                                
                                        echo '
                                        <header class="bg-primary text-white" style="padding: 50px 0 50px;">
                                        <div class="container text-center">
                                        <h1>' . $prosedur_gorsel_baslik . '</h1>
                                        <p class="lead"></p>
                                        </div>
                                        </header>
                                        <section id="about">
                                        <div class="container">
                                        <div class="row">
                                        <div class="col-lg-8 mx-auto" style="padding-top: 41px;">
                                        <strong>' . $prosedur_baslik . ':</strong></p>';
                                
                                        echo $prosedur_icerik;
                                    }
                                }
                                
                                include_once('footer.php'); ?>
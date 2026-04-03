<?php
session_start();
if (!isset($_SESSION['firma_ad'])) {
    header('Location: ' . '../index.php', true, '303');
    exit;
}
$firma_ad = $_SESSION['firma_ad'];
?>
<!DOCTYPE html>
<html lang="tr">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <title>Lizay Pırlanta Ürün Takibi</title>
    <!-- Bootstrap CSS -->
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css">
</head>

<body>

    <header>
        <div class="navbar navbar-dark bg-dark shadow-sm" style="background-color: #343A40; color:white;">
            <div class="container d-flex justify-content-between">
                <p class="navbar-brand d-flex align-items-center" style="float:left">
                    <svg width="20" height="20" fill="none" stroke="currentColor" stroke-linecap="round"
                        stroke-linejoin="round" stroke-width="2" aria-hidden="true" class="mr-2" viewBox="0 0 24 24"
                        focusable="false">
                    </svg>
                    <a href="../wsindex.php">
                        <strong style="color:white; text-decoration: none; cursor: pointer;">Geri Dön</strong>
                    </a>
                </p>
                <p class="navbar-brand d-flex align-items-center" style="float:right">
                    <svg width="20" height="20" fill="none" stroke="currentColor" stroke-linecap="round"
                        stroke-linejoin="round" stroke-width="2" aria-hidden="true" class="mr-2" viewBox="0 0 24 24"
                        focusable="false">
                    </svg>
                    <strong>Lizay Pırlanta Satış Listeleme Sayfası - <?php echo $firma_ad; ?></strong>
                </p>
            </div>
        </div>
    </header>

    <?php
    require('../../class/db.php');


    // Sayfa numarasını 
    $page = isset($_GET['page']) ? $_GET['page'] : 1;

    // Her sayfada kaç veri görüntüleneceği
    $veriSayisiSayfaBasi = 10;

    // LIMIT ve OFFSET hesaplama
    $offset = ($page - 1) * $veriSayisiSayfaBasi;


$sql = "SELECT * FROM SATIS_TAKIPLERI LIMIT $veriSayisiSayfaBasi OFFSET $offset";
$veriler = $db->select($sql);


?>
<div class='container'>
<table class='table table-bordered table-striped'>
<thead><tr><th>Firma</th><th>Barkod No</th><th>Fiyat</th><th>Tarih</th></tr></thead><tbody>
<?php 
if (!empty($veriler)) {
    foreach ($veriler as $row) {
        echo "<tr>";
        echo "<td>" . $row['firma_ad'] . "</td>";
        echo "<td>" . $row['barkod_no'] . "</td>";
        echo "<td>" . $row['urun_fiyat'] . " " . $row['para_birimi'] . "</td>";
        echo "<td>" . $row['satis_tarih'] . "</td>";
        echo "</tr>";
    }
} else {
    echo "<tr><td colspan='4'>Veri bulunamadı.</td></tr>";
}

echo "</tbody></table></div>";


$sqlCount = "SELECT COUNT(*) as total FROM SATIS_TAKIPLERI";
$totalData = $db->select($sqlCount)[0]['total'];
$totalPages = ceil($totalData / $veriSayisiSayfaBasi);

echo "<div class='text-center'>";
echo "<ul class='pagination'>";
for ($i = 1; $i <= $totalPages; $i++) {
    echo "<li><a href='index.php?sayfa=$i'>$i</a></li>";
}
echo "</ul>";
echo "</div>";


echo "<div class='text-center'>Toplam Satış Sayısı: $totalData</div>";


    ?>

</body>

</html>

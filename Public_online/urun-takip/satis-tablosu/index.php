<?php
session_start();
if (!isset($_SESSION['firma_ad'])) {
  header('Location: ' . '../index.php', true, '303');
  exit;
}
require('../../class/db.php');
$firma_ad = $_SESSION['firma_ad'];
$kisi_oncelik = $_SESSION['kisi_oncelik'];
$kisi_tel = $_SESSION['kisi_tel'];
?>
<!DOCTYPE html>
<html lang="tr">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
  <title>Lizay Pırlanta Ürün Takibi</title>
  <!-- DataTables CSS -->
  <link rel="stylesheet" href="https://cdn.datatables.net/1.11.5/css/jquery.dataTables.min.css">
  <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css">
</head>

<body>
  <header>
    <div class="navbar navbar-dark bg-dark shadow-sm" style="background-color: #343A40; color:white;">
      <div class="container d-flex justify-content-between">
        <p class="navbar-brand d-flex align-items-center" style="float:left">
          <svg width="20" height="20" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" aria-hidden="true" class="mr-2" viewBox="0 0 24 24" focusable="false">
          </svg>
          <a href="../wsindex.php">
            <strong style="color:white; text-decoration: none; cursor: pointer;">Geri Dön</strong>
          </a>
        </p>
        <p class="navbar-brand d-flex align-items-center" style="float:right">
          <svg width="20" height="20" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" aria-hidden="true" class="mr-2" viewBox="0 0 24 24" focusable="false">
          </svg>
          <strong>Lizay Pırlanta Satış Listeleme Sayfası - <?php echo $firma_ad; ?></strong>
        </p>
      </div>
    </div>
  </header>


  <div class='container'>
    <?php if ($kisi_oncelik == 5) {
      $firmalar = $db->select("SELECT DISTINCT firma_ad FROM SATIS_TAKIPLERI"); ?>
      <select id="firmaSelect" name="firmaSelect" class="input-sm">
        <option value="">Tüm Firmalar</option>
        <?php foreach ($firmalar as $firma) : ?>
          <option value="<?php echo $firma['firma_ad']; ?>"><?php echo $firma['firma_ad']; ?></option>
        <?php endforeach; ?>
      </select>
    <?php } ?>
    <form id="dateRangeForm" style="float:right;" action="" method="POST">
      <label for="startDate">Başlangıç Tarihi:</label>
      <input type="date" id="startDate" name="startDate">
      <label for="endDate">Bitiş Tarihi:</label>
      <input type="date" id="endDate" name="endDate">
      <button type="submit" id="filterButton">Aralığı Filtrele</button>
    </form>
    <table id='satisTable' class='table table-bordered table-striped'>
      <thead>
        <tr>
          <th style='text-align:center;'>Firma</th>
          <th style='text-align:center;'>Barkod No</th>
          <th style='text-align:center;'>Fiyat</th>
          <th style='text-align:center;'>Para Birimi</th>
          <th style='text-align:center;'>Tarih</th>
        </tr>
      </thead>
      <tbody>
        <?php

        if ($kisi_oncelik == 5) {
          if (isset($_POST['startDate']) && isset($_POST['endDate'])) {
            $startDate = $_POST['startDate'];
            $endDate = $_POST['endDate'];
            $sql = "SELECT * FROM SATIS_TAKIPLERI WHERE satis_tarih BETWEEN '$startDate' AND '$endDate'";
          } else {
            $sql = "SELECT * FROM SATIS_TAKIPLERI";
          }
        } elseif ($kisi_oncelik == 3) {
          if (isset($_POST['startDate']) && isset($_POST['endDate'])) {
            $startDate = $_POST['startDate'];
            $endDate = $_POST['endDate'];
            $sql = "SELECT * FROM SATIS_TAKIPLERI WHERE kisi_tel = $kisi_tel AND satis_tarih BETWEEN '$startDate' AND '$endDate'";
          } else {
            $sql = "SELECT * FROM SATIS_TAKIPLERI WHERE kisi_tel = $kisi_tel";
          }
        }

        $veriler = $db->select($sql);
        echo "<a href='index.php'><button>Filtreleri Temizle</button></a>";
        if (!empty($veriler)) {
          foreach ($veriler as $row) {
            echo "<tr style='text-align:center;'>";
            echo "<td>" . $row['firma_ad'] . "</td>";
            echo "<td>" . $row['barkod_no'] . "</td>";
            echo "<td>" . $row['urun_fiyat']  . "</td>";
            echo "<td>" . $row['para_birimi'] . "</td>";
            echo "<td>" . $satisTarihi = date('d-m-Y H:i:s', strtotime($row['satis_tarih'])) . "</td>";
            echo "</tr>";
          }

        } else {
          echo "<tr><td colspan='5'>Veri bulunamadı.</td></tr>";
        }
        ?>
        
      </tbody>
    </table>
  </div>

  <!-- DataTables JS ve jQuery -->
  <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
  <script src="https://cdn.datatables.net/1.11.5/js/jquery.dataTables.min.js"></script>

  <script>
    $(document).ready(function() {
        var table = $('#satisTable').DataTable({
            language: {
                url: '//cdn.datatables.net/plug-ins/1.13.6/i18n/tr.json' // Türkçe dil dosyasının yolu
            },
            order: [
                [4, "desc"]
            ]
        });

        $('#filterForm').on('submit', function(e) {
            e.preventDefault();
            var startDate = $('#startDate').val();
            var endDate = $('#endDate').val();
            var selectedFirma = $('#firmaSelect').val();

            if (startDate && endDate) {
                table.columns(4).search(startDate + ' to ' + endDate, true, false);
            } else {
                table.columns(4).search('');
            }

            if (selectedFirma) {
                table.columns(0).search(selectedFirma);
            } else {
                table.columns(0).search('');
            }

            table.draw();
        });

        // Selectbox değiştiğinde filtrelemeyi uygula
        $('#firmaSelect').on('change', function() {
            table.columns(0).search($(this).val()).draw();
        });
    });
    
</script>
</body>

</html>
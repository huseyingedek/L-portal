<?php
session_start();
if (!isset($_SESSION['usern'])) {
  header('Location: ' . '../../index.php', true, '303');
  exit;
}
require('../../class/db.php');
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $kisi_id = $_POST['id'];

    // SQL sorgusunu hazırla
    $sql = "DELETE FROM KAYITLAR WHERE id = $kisi_id";

    // SQL sorgusunu çalıştır ve hata mesajını kontrol et
    if ($db->query($sql)) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'error' => $db->error()]);
    }
}
?>
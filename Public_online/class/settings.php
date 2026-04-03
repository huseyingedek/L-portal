<?php

session_start();
header('Content-Type: text/html; charset=utf-8');
if ($_SESSION['login'] != 1) {
header('Location: ' . '../index.php', true, '303');
  exit;
}
setlocale(LC_ALL, 'turkish');
date_default_timezone_set('Europe/Istanbul');

$username = $_SESSION['usern'];
require_once('db.php');
require_once('credit_card.php');

function dosyaAdiOlustur($baslik)
{
    // Türkçe karakterleri İngilizce karakterlere çevir
    $baslik = str_replace(array('Ç', 'ç', 'Ğ', 'ğ', 'I', 'ı', 'İ', 'i', 'Ö', 'ö', 'Ş', 'ş', 'Ü', 'ü'), array('C', 'c', 'G', 'g', 'I', 'i', 'I', 'i', 'O', 'o', 'S', 's', 'U', 'u'), $baslik);

    // Boşluk karakterlerini - ile değiştir
    $baslik = str_replace(' ', '-', $baslik);

    $baslik = preg_replace('/[^A-Za-z0-9\-]/', '', $baslik);

    $dosya_adi =  $baslik . ".php";

    return $dosya_adi;
}




?>
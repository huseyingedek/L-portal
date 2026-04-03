<?php
require 'vendor/autoload.php'; 
use setasign\Fpdi\Fpdi;




$talep_tarihi = date("d.m.Y", strtotime($_POST['talep_tarihi']));
$kisi_ad_soyad = $_POST['kisi_ad_soyad'];
$kisi_tc = $_POST['kisi_tc'];
$kisi_tel = $_POST['kisi_tel'];
$kisi_birim = $_POST['kisi_birim'];
$kisi_giris = date("d.m.Y", strtotime($_POST['kisi_giris']));
$kisi_izin_yeri = $_POST['kisi_izin_yeri'];

$kisi_izin_baslangic = date("d.m.Y", strtotime($_POST['kisi_izin_baslangic']));
$kisi_izin_bitis = date("d.m.Y", strtotime($_POST['kisi_izin_bitis']));

//Tarih farkı (izin günü) hesaplama
$kisi_izin_baslangicStr = strtotime($_POST['kisi_izin_baslangic']);
$kisi_izin_bitisStr = strtotime($_POST['kisi_izin_bitis']);
$tarih_farki_saniye = $kisi_izin_bitisStr - $kisi_izin_baslangicStr;
$tarih_farki_gun = $tarih_farki_saniye / (60 * 60 * 24);
$kisi_izin_gun = $tarih_farki_gun;




// PDF dosyası oluşturuluyor
$pdf = new Fpdi();
$pdf->AddPage();

// PDF'yi okutuyor
$existingPdfFile = 'yillik-izin-lizay.pdf'; // Varolan PDF dosyasının yolu
$pdf->setSourceFile($existingPdfFile);

// Sayfayı ekliyor
$pageId = $pdf->importPage(1); // 1. sayfayı içe aktarır
$pdf->useTemplate($pageId, 0, 0);

// Yazıları ekliyor

$pdf->SetFont('Calibri', '', 10); // Font ve yazı büyüklüğünü ayarlayın

$coordinates = [
    ['x' => 50, 'y' => 35],
    ['x' => 50, 'y' => 45],
    ['x' => 50, 'y' => 53],
    ['x' => 50, 'y' => 64],
    ['x' => 50, 'y' => 77],
    ['x' => 50, 'y' => 89],
    ['x' => 50, 'y' => 100],
    ['x' => 50, 'y' => 112],
    ['x' => 50, 'y' => 128],
    ['x' => 122, 'y' => 55],
    ['x' => 154, 'y' => 93],
    ['x' => 157, 'y' => 102],
];

$tarihler = "$kisi_izin_baslangic ile $kisi_izin_bitis";
$lines = [
    $kisi_ad_soyad,
    $kisi_tc,
    $kisi_birim,
    $kisi_giris,
    $kisi_izin_baslangic,
    $kisi_izin_bitis,
    $kisi_tel,
    $kisi_izin_yeri,
    $kisi_izin_gun,
    $tarihler,
    $kisi_ad_soyad,
    $talep_tarihi
];

for ($i = 0; $i < count($lines); $i++) {
    $pdf->SetXY($coordinates[$i]['x'], $coordinates[$i]['y']);
    $pdf->MultiCell(0, 10, $lines[$i], 0, 'L'); // MultiCell kullanarak çoklu satırlı metin desteği
}

$pdf->Output('Lizay-izin-formu.pdf', 'D'); // Dosyayı indirir
?>

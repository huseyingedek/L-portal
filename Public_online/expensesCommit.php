<!DOCTYPE html>

<html xmlns="http://www.w3.org/1999/xhtml">
<meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>Günlük Masraf Girişleri</title>
<head></head>
<body>
    
<?php
error_reporting(0);
// ini_set('display_errors', 1);
// ini_set('display_startup_errors', 1);
// error_reporting(E_ALL);

/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

session_start();  
require_once 'libs/nusoap/nusoap.php';
require_once 'caniasConnector.php';

$userName= $_SESSION['usern'];
$project= ''; /*$_POST['Project']; */
$sharedNum= $_POST['InvoiceSharedNumb'];
$busArea= $_POST['BusArea'];
$invoiceD= $_POST['InvoiceDate'];
$invoiceQ= $_POST['InvoiceQuine'];
$invoiceN= $_POST['InvoiceNumber'];
$invoiceA= $_POST['InvoiceAmount'];
$ctype= $_POST['CostType'];
$stext= $_POST['Stext']; 
$exp_paratp= $_POST['exp_paratp']; 
$ppaytype= $_POST['ppaytype']; 




if($_FILES['InvoiceImage']['size'] > 0){
	
	$tmp_file = $_FILES['InvoiceImage']['tmp_name'];
	$new_file = 'temp/'.uniqid().'.jpg';
	$imm_content = file_get_contents($tmp_file);

	$imm_size = getimagesize($tmp_file);
	$imm_ratio = $imm_size[1]/$imm_size[0] /*H/W*/ ; 
	$imm_src = imagecreatefromstring($imm_content);
	$imm_dst = imagecreatetruecolor(550,550*$imm_ratio);

	imagecopyresampled($imm_dst,$imm_src,0,0,0,0,550,550*$imm_ratio,$imm_size[0],$imm_size[1]);
	imagedestroy($imm_src);
	imagejpeg($imm_dst,$new_file); 
	imagedestroy($imm_dst);

	$imm_final_string = file_get_contents($new_file);
	$imm_base64_string = base64_encode($imm_final_string);
	unlink($new_file);
}
else{
	$imm_base64_string = "";
}

$joinedpar = array(
	$userName,
	$project,
	$sharedNum,
	$busArea,
	$invoiceD,
	$invoiceQ,
	$invoiceN,
	$invoiceA,
	$ctype,
	$stext,    
	$imm_base64_string,
	'jpg',
     $exp_paratp,
    $ppaytype,
   

);

$caniasConnector = new caniasConnector;
$ress= $caniasConnector->wsCanias('consExpensesCommit',$joinedpar);

if($ress== "OK"){
	echo("<div style='text-align: center; font-size: 30px; margin-top: 30px; margin-bottom: 20px;'>Kayıt işlemi tamamlanmıştır.</div><br>");
	echo("<div style='text-align: center; font-size: 25px;'><a href='https://online.lizaypirlanta.com/masrafgirisleri.php' style='text-decoration: none;'>Yeni Masraf Girişi</a> | <a href='wsindex.php' style='text-decoration: none;'>Ana Menü</a></div>");

  
}
else{
	echo($ress);
}	

// echo "<br>tipi=". $ppaytype;

?>


</body>
</html>
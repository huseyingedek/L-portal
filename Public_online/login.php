<?php
ob_start();
session_start();  
$userlogin = $_POST['user_login'] !='' ? $_POST['user_login'] : ''; 
$userpass = $_POST['user_pass'] !='' ? $_POST['user_pass'] : ''; 

echo $userlogin;

require_once 'caniasConnector.php';
$caniasConnector = new caniasConnector;
 
$caniasConnector->wsCanias('userCheck',array($userlogin,$userpass));

if( $caniasConnector->wsGetResponse() == "OK" ){
	$_SESSION['login']= 1;
	$_SESSION['usern']= $userlogin;
	setcookie("lizzusername",$userlogin, time()+ 7200);
	header('Location: ' . 'wsindex.php', true, '303');
}
else
{
	header('Location: ' . 'index.php', true, '303');
	die;
}
ob_end_flush();
?>

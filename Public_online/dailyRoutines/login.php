<?php

/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

session_start();  
$userlogin = $_POST['user_login'] !='' ? $_POST['user_login'] : ''; 
$userpass = $_POST['user_pass'] !='' ? $_POST['user_pass'] : ''; 

echo $userlogin;

require_once 'caniasConnector.php';
$caniasConnector = new caniasConnector;
 
$caniasConnector->wsCanias('userCheck',array($userlogin,$userpass));
echo $caniasConnector->wsGetResponse();
 
if( $caniasConnector->wsGetResponse() == "OK" ){
	$_SESSION['login']= 1;
	$_SESSION['usern']= $userlogin;
	setcookie("lizzusername",$userlogin, time()+ 3600);
	header('Location: ' . 'wsindex.php', true, '303');
}
else
{
	header('Location: ' . 'index.php', true, '303');
	die;
}
 
?>
        
        

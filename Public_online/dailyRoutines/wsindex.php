<?php

/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

 	session_start();  
	if($_SESSION['login']!= 1){
		header('Location: ' . 'index.php', true, '303');
		exit;
	}
	
?>

<!DOCTYPE html>

<html xmlns="http://www.w3.org/1999/xhtml">
<meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<link href="//fonts.googleapis.com/css?family=Raleway:400,300,600" rel="stylesheet" type="text/css"/>
<link rel="stylesheet" href="styles/css/normalize.css"/>
<link rel="stylesheet" href="styles/css/skeleton.css"/>
<link rel="stylesheet" href="styles/css/wsindex.css"/>
<link rel="icon" type="image/png" href="images/favicon.png"/>
<title>Lizay Web Uygulamaları</title>
<head></head>
<body>
    <form id="form1" runat="server">
    <div style="width:100%">
		<div id="lizzlist">
		   <h3>Lizay Web Uygulamaları Menüsü</h3>
		   <ul>
			  <li><a href="expenses.php">Masraf Girişleri</a></li>
			  <li><a href="expensesatdocn.php">Belgeye Masraf Girişleri</a></li>
			  <li><a href="expensesConfirm.php">Masraf Onayları</a></li>
			  <li><a href="internlines.php">Dahili Numaralar</a></li>
		   </ul>
		</div>	
    </div>
    </form>
</body>
</html>
        
        

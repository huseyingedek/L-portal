
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
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<link href="//fonts.googleapis.com/css?family=Raleway:400,300,600" rel="stylesheet" type="text/css"/>
<link rel="stylesheet" href="styles/css/normalize.css"/>
<link rel="stylesheet" href="styles/css/skeleton.css"/>
<link rel="stylesheet" href="styles/css/wsindex.css"/>
<link rel="icon" type="image/png" href="images/favicon.png"/>
<title>Lizay Dahili Numaralar Listesi</title>
<head></head>
<body>

<?php    
//$host = "94.73.150.21";
$host = "localhost";
$user = "u8559882_userliz";
$pass = "770hA6k5x894DBT7goD5";
$name = "u8559882_db9lizk";

$baglan = mysqli_connect($host, $user, $pass, $name);
mysqli_set_charset($baglan, "utf8");

if ($baglan->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}


?>

  
    <div style="width:100%">
	
		<div>
		   <table style="margin:auto;"> 
				<tr> 
					<th>BÖLÜM</th> 
					<th>DAHİLİ</th> 
					<th>YETKİLİ</th> 
					<th>MAİL</th> 
				</tr>
				<?php	$sorgu = mysqli_query($baglan,'SELECT * FROM sirket_tel order by id asc');
		 while($sorgu1=mysqli_fetch_array($sorgu)){ ?>
				<tr> 
					<td><?php echo $sorgu1['bolum']; ?></td> 
					<td><?php echo $sorgu1['dahili']; ?></td> 
					<td><?php echo $sorgu1['yetkili']; ?></td>
					<td><a href="mailto:<?php echo $sorgu1['mail']; ?>"><?php echo $sorgu1['mail']; ?></a></td>
								
				</tr> 
				 <?php } ?>
			</table>


		</div>	
    </div>
  
		
</body>
</html>
        
        

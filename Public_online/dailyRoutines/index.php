<?php

/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

?>

<!DOCTYPE html>

<html xmlns="http://www.w3.org/1999/xhtml">
<meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
<link rel="stylesheet" type="text/css" href="styles/css/index.css">
<link href='https://fonts.googleapis.com/css?family=Oswald' rel='stylesheet' type='text/css'>
<link rel="icon" type="image/png" href="images/favicon.png"/>
<title>Lizay Web Uygulamaları</title>
<head></head>
<body>
	<div id="main" class="container"> 	
		<form name="loginform" id="loginform" action="login.php" method="post" class="wpl-track-me"> 
			<p class="login-username">
			<label for="user_login">Username</label> 
				<input type="text" name="user_login" id="user_login" class="input" placeholder="Kullanıcı Adı" value="<?php echo $_COOKIE["lizzusername"] ?>" size="20" /> 
			</p> 
			<p class="login-password"> 
				<label for="user_pass">Password</label><input type="password" name="user_pass" id="user_pass" class="input" placeholder="Şifre" value="" size="20" /> 
			</p> 	
			<p class="login-submit"><input type="submit" name="wp-submit" id="wp-submit" class="button-primary" value="Oturum Aç" />
				<input type="hidden" name="redirect_to" value="login.php"/>
			</p> 	
		</form> 
	</div>
</body>
</html>
        
        

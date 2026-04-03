<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="description" content="">
<meta name="author" content="">
<meta name="robots" content="noindex, nofollow"> 

<title>Bayi Web Girişi</title>


<link rel="stylesheet" href="https://demo.w3layouts.com/demos_new/template_demo/27-02-2019/key-demo_Free/282453819/web/css/font-awesome.min.css" type="text/css" media="all">
 <link href='https://fonts.googleapis.com/css?family=Oswald' rel='stylesheet' type='text/css'>
<link rel="icon" type="image/png" href="images/favicon.png"/>

<style>
     @media only screen and (max-width: 768px) {
  /* For mobile phones: */
   body, html { 
   background-color:black;
  -webkit-background-size: cover;
  -moz-background-size: cover;
  -o-background-size: cover;
  background-size: cover;
  box-shadow: 2px 2px 10px #0a0a0a;
  margin: 0;
  padding: 0;
  font-family: 'Open Sans', sans-serif;
}
          }
          
      @media only screen and (min-width: 768px) {
  /* For mobile phones: */
   body, html { 
  background: url(img/bgyeni.jpg) no-repeat center center fixed; 
  -webkit-background-size: cover;
  -moz-background-size: cover;
  -o-background-size: cover;
  background-size: cover;
  box-shadow: 2px 2px 10px #0a0a0a;
  margin: 0;
  padding: 0;
  font-family: 'Open Sans', sans-serif;
}  }
         
          
::selection {
  background:black;
  color: #333;
}
::-moz-selection {
  background: rgba(0,0,0,.5);
  color: red;
}

.mobile-screen{
  position: absolute;
  margin: auto;
  top: 0; left: 0; bottom: 0; right: 0;
  width: 400px;
  height: 500px;
  background: rgba(3,3,3,.7);
  overflow: hidden;
}

.header{
  position: relative;
  margin: 0;
  padding: 0;
  width: 100%;
  height: auto;
  background: rgba(3,3,3,.1);
}

h1{
  margin: 0;
  padding: 10px 0;
  text-align: center;
  font-weight: 300;
  font-size: 21px;
  color: rgba(255,255,255,.5);
}

.logo{
  position: relative;

  width: 220px;
  height: 120px;
  margin: auto;
  background: url(img/logo-beyaz-siyah.png) no-repeat center; 
  -webkit-background-size: cover;
  -moz-background-size: cover;
  -o-background-size: cover;
  background-size: cover;
  -webkit-transition: all .2s ease-in-out;
  -moz-transition: all .2s ease-in-out;
  -o-transition: all .2s ease-in-out;
  transition: all .2s ease-in-out;
}

form{
  position: absolute;
  bottom: 30px;
  width: 100%;
}

input,
.login-btn{
  font-family: 'Open Sans', sans-serif;
  position: relative;
  display: block;
  margin: 20px auto;
  padding: 10px;
  width: 84%;
  box-sizing: border-box;
  -moz-box-sizing: border-box;
  -webkit-box-sizing: border-box;
}

input{
  border: none;
  border-left: 5px solid;
  background: none;
  border-color: rgb(225, 40, 54);
  color: #fff;
  font-weight: 300;
  font-size: 18px;
  -webkit-transition: all .2s ease-in-out;
  -moz-transition: all .2s ease-in-out;
  -o-transition: all .2s ease-in-out;
  transition: all .2s ease-in-out;
}

input:focus{
  outline: 0;
  background: rgba(225, 40, 54,.2);
  border-radius: 20px;
  border-color: transparent;
}

a{
  text-decoration: none;
}

.login-btn{
  border-radius: 4px;
  text-align: center;
  background: rgb(225, 40, 54);
  color: #fff;
}

.other-options{
  position: absolute;
  width: 100%;
  height: 30px;
  bottom: 2px;
  left: 0;
}

.option{
  position: relative;
  display: block;
  float: right;
  width: 45%;
  margin: auto;
  box-sizing: border-box;
  -moz-box-sizing: border-box;
  -webkit-box-sizing: border-box;
  background: rgba(0,0,0,.2);
  border-bottom: 2px solid  rgb(225, 40, 54);
  cursor: pointer;
}

.option:first-child{
  float: left;
  left: 3.3%;
}

.option:last-child{
  margin-right: 3.3%;
}

.option-text{
  position: relative;
  margin: 0;
  line-height: 30px;
  color: #ccc;
  text-align: center;
  font-size: 12px;
  font-weight: 100;
}

#fpass-form,
#registration-form{
  display: none;
}

/* Change colors container */
.change-colors-container{
  position: absolute;
  height: 300px;
  width: 50px;
  left: 0;
  top: 0;
  bottom: 0;
  margin: auto;
  background: rgba(255,255,255,.5);
}
</style>
<script type="text/javascript">
   $("#newUser").click(function(){
  $("h1").text("Registration");
  $(".logo").css({
    "width":"120px",
    "height":"120px",
    "top":"10px"
  });
  $("#login-form").fadeOut(200);
  $("#registration-form").delay(300).fadeIn(500);
  $(".other-options").fadeOut(200);
});

$("#signup-btn,#getpass-btn").click(function(){
  $("h1").text("Log in");
  $(".logo").css({
    "width":"150px",
    "height":"150px",
    "top":"30px"
  });

  $("#registration-form,#fpass-form").fadeOut(200);
  $("#login-form").delay(300).fadeIn(500);
  $(".other-options").fadeIn(300);
});

$("#fPass").click(function(){
  $("h1").text("Forgotten password");
  $(".logo").css({
    "width":"190px",
    "height":"190px",
    "top":"40px"
  });

  $("#login-form").fadeOut(200);
  $("#fpass-form").delay(300).fadeIn(500);
  $(".other-options").fadeOut(200);
});
</script>
    
</head>
  

<body>
  <div class="mobile-screen">
  <a href="https://online.lizaypirlanta.com/urun-takip/"><button class="button-primary login-btn" style="font-size:18px; font-weight:300; border:none;">Bayi Web Girişi</button></a>
  <div class="header">
    <h1>Canias ile Giriş</h1>
  </div>
  
  <div class="logo"></div>
  
<br>
  <form id="login-form"  name="loginform" id="loginform" action="login.php" method="post">
    <input type="text" name="user_login" id="user_login" class="input" placeholder="Canias Kullanıcı Adı" value="<?php echo $_COOKIE["lizzusername"] ?>" size="20" /> 
    <input type="password" name="user_pass" id="user_pass" class="input" placeholder="Canias Şifre" value="" size="20" />    
    <input type="submit" name="wp-submit" id="wp-submit" class="button-primary login-btn" value="Oturum Aç" />
		<input type="hidden" name="redirect_to" value="login.php"/>
  </form>
</div>

</body>
</html>

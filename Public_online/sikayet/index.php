<?php include("header.php"); 
  

        $user        =    "u8559882_userliz";
        $pass        =    "770hA6k5x894DBT7goD5";
        $host        =    "94.73.150.21";
        $db            =    "u8559882_db9lizk";
        $baglan = mysql_connect($host,$user,$pass) or die(mysql_error());
        mysql_select_db($db,$baglan) or die(mysql_error());  
        mysql_query("SET NAMES UTF8");

                                           
?>
</head>

<body>

	<div class="container-contact100">

     	<div class="contact100-map" style="background: url('http://online.lizaypirlanta.com/img/bgyeniters.jpg') no-repeat center center fixed; background-size: cover;"></div> 
		<div class="wrap-contact100">
			<form class="contact100-form validate-form" method="POST" action="mail.php">
				<span class="contact100-form-title">
					Şikayet/Öneri
				</span>
                
                <div class="wrap-input100 validate-input" data-validate="Başlık Bölümünü Boş Bırakmayınız">
					<span class="label-input100">Başlık</span>
					<input class="input100" type="text" name="isim" placeholder="Başlık Giriniz...">
					<span class="focus-input100"></span>
				</div>

				<div class="wrap-input100 validate-input" data-validate = "Mesaj Bölümünü Boş Bırakmayınız">
					<span class="label-input100">Mesajınız</span>
					<textarea class="input100" name="mesaj" placeholder="Mesajınızı Yazınız..." ></textarea>
					<span class="focus-input100"></span>
				</div>

				<div class="container-contact100-form-btn">
					<div class="wrap-contact100-form-btn">
						<div class="contact100-form-bgbtn"></div>
						<button id="checkMark" class="contact100-form-btn">
							Gönder
						</button>
					</div>
				</div>
			</form>
		</div>
	</div>
	<div id="dropDownSelect1"></div>
    

     
<?php include("footer.php");  ?>


</body>
</html>

<?php include("header.php"); 
  
//hatali baglanti
        $user        =    "u8559882_userliz";
        $pass        =    "770hA6k5x894DBT7goD5";
        $host        =    "94.73.150.21";
        $db            =    "u8559882_db9lizk";
        $baglan = mysql_connect($host,$user,$pass) or die(mysql_error());
        mysql_select_db($db,$baglan) or die(mysql_error());  
        mysql_query("SET NAMES UTF8");
                                           
?>

<meta http-equiv="refresh" content="6;URL=http://online.lizaypirlanta.com">
</head>

   <body style="margin-top: 6%;">
    <? 
function GetIP(){
    if(getenv("HTTP_CLIENT_IP")) {
         $ip = getenv("HTTP_CLIENT_IP");
     } elseif(getenv("HTTP_X_FORWARDED_FOR")) {
         $ip = getenv("HTTP_X_FORWARDED_FOR");
         if (strstr($ip, ',')) {
             $tmp = explode (',', $ip);
             $ip = trim($tmp[0]);
         }
     } else {
     $ip = getenv("REMOTE_ADDR");
     }
    return $ip;
}
 


if($_POST){

$mail = $_POST["mesaj"];
$isim = $_POST["isim"];
$ip_adresi = GetIP();
$tarihsaat=date("Y-m-d h:i:s");
                           
$ekle = mysql_query("INSERT into lizay_sikayet(baslik,mesaj,ip,tarih) VALUES ('$isim','$mail','$ip_adresi','$tarihsaat')");

if($ekle)
{       
echo '<div class="check_mark" style="height: 95px;">
  <div class="sa-icon sa-success animate">
    <span class="sa-line sa-tip animateSuccessTip"></span>
    <span class="sa-line sa-long animateSuccessLong"></span>
    <div class="sa-placeholder"></div>
    <div class="sa-fix"></div>
  </div>
</div> <br>

<center>
  <div id="restart">Mesajınız Gönderilmiştir. <br> En kısa sürede incelenecek ve işlem sağlanacaktır. <br> 5 saniye içinde anasayfaya yönlendirileceksiniz.</div>
</center>
'; }else{
                echo "Bir Sorun Oluştu";
            } } ?>
     


<?php include("footer.php"); ?>
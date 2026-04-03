<html>
<body style="margin:0px;padding:0px;overflow:hidden">
<head>
<meta name="viewport" content="width=device-width,initial-scale=1,minimum-scale=1.0 maximum-scale=1.0" />


<style>
     [style*="--aspect-ratio"] > :first-child {
  width: 100%;
}
[style*="--aspect-ratio"] > img {  
  height: 100%;
} 
@supports (--custom:property) {
  [style*="--aspect-ratio"] {
    position: relative;
  }
  [style*="--aspect-ratio"]::before {
    content: "";
    display: block;
    padding-bottom: calc(100% / (var(--aspect-ratio)));
  }  
  [style*="--aspect-ratio"] > :first-child {
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
  }  
}

</style>
<script>
         
</script>
</head>

<?php
ob_start();
session_start();

if($_SESSION['login'] == 1){

?>
 <div>
  <!-- Bu site yok içeriğini çekemez aib -->
  <iframe 
  src="http://iasegitim.lizaypirlanta.com" style="width:100%; height:100%;" >
  </iframe>
</div>

<?
}
else { echo "yok";}
?>
                         
</body>
</html>
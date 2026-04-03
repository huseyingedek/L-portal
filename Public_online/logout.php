<?php
session_start();
unset($_SESSION["login"]);
unset($_SESSION["usern"]);
header("Location:login.php");
?>
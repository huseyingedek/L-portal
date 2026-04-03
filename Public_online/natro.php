<?php
$servername = "94.73.150.21";
$username = "u8559882_userliz";
$password = "770hA6k5x894DBT7goD5";

// Create connection
$conn = new mysqli($servername, $username, $password);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}
echo "Connected successfully";
?>
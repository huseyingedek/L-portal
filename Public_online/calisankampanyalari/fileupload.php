<?php 
require('../class/settings.php');

$data = array();

if(isset($_FILES['upload']['name']))
{
	$now = date('Y-m-d_H-i-s');
	$file_name = $now . '_' . $_FILES['upload']['name'];
	$file_path= 'upload/'.$file_name;
	$file_extension = strtolower(pathinfo($file_path, PATHINFO_EXTENSION));
	if($file_extension=='jpg' || $file_extension=='jpeg' || $file_extension=='png')
	{
		if(move_uploaded_file($_FILES['upload']['tmp_name'], $file_path))
		{
			$data['file']= $file_name;
			$data['url']= $file_path;
			$data['uploaded']= 1;
		}
		else
		{
			$data['uploaded']= 0;
			$data['error']['message']= 'Hata! Dosya yüklenemedi!';
		}
	}
	else
	{
		$data['uploaded']= 0;
		$data['error']['message']= 'Hata! Kabul edilmeyen dosya türü gönderdiniz!';
	}
}
echo json_encode($data);
?>
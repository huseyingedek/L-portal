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
<title>Lizay Ürünler</title>


<script type="text/javascript">
fn_exp_urunler= function() {
			$('#exp_grid').jtable({
						actions: {
							listAction: 'expensesXresp.php?resp=listurunler'
						},
						fields: {
							CLIENT: {
								title: 'Mağaza',
								width: '20%',
								edit: false
							},								
							EXTINVTYPE: {
								title: 'Fat.Seri',
								width: '10%',
								edit: false
							},		
							EXTINVNUM: {
								title: 'Fat.No',
								width: '10%',
								edit: false
							},		
							GROSSAMOUNT: {
								title: 'Tutar',
								width: '10%',
								edit: false
							},
							CURRENCY: {
								title: 'P.Birimi',
								width: '10%',
								edit: false
							},
							DOCDATE: {
								title: 'Tarih',
								width: '10%',
								edit: false
							},	
							
							LTEXT: {
								title: 'Açıklama',
								width: '20%'
							},					
							COSTX: {
								title: 'Gider Açk.',
								width: '20%'
							},							
							IMSTBT: {
								title: '',
								display: function (data) {
									return '<input type="button" value="Fiş" onclick="fn_exp_imm_show();"></input>';
								}								
							},	
							EXPCONF: {
								title: '',
								display: function (data) {
									if( data.record.STATUS != "0" ){
										switch (data.record.STATUS) {
											case "2":
												return '<span style="background-color:#ccffff;">Onaylı</span>';
												break;
											default:
												return '<span></span>';
										}	
									}
									else{
										return '<input type="button" value="Onay" onclick="fn_exp_confirm();"></input>';
									}
								}								
							},	
							EXPRFS: {
								title: '',
								display: function (data) {
									if( data.record.STATUS != "0" ){
										switch (data.record.STATUS) {
											case "1":
												return '<span style="background-color:#ff3300;">Red</span>';
												break;
											default:
												return '<span></span>';
										}	
									}
									else{
										return '<input type="button" value="Red" onclick="fn_exp_refuse();"></input>';
									}
								}								
							},								
							IMST: {
								visibility: 'hidden'
							}
						},
						selecting: true,
						multiselect: false,
						selectingCheckboxes: true,
						selectionChanged: function () {
							/*moved click event
							var $selectedRow = $('#exp_grid').jtable('selectedRows');		
							$selectedRow.each(function () {
								var record = $(this).data('record');
								$.post( "expensesXresp.php", { resp: "consExpensesPict", exp_comp: record.COMPANY, exp_typp: record.EXTINVTYPE, exp_numm: record.EXTINVNUM } )
								.done(function( data ) {
									obj = JSON.parse(data);
									$('#exp_image').attr('src','data:image/png;base64,' + obj.Records.ROW.IMST.replace('-----BEGIN CERTIFICATE-----','').replace('-----END CERTIFICATE-----',''));
								});
							});
							*/
						}
					});	
			$('#exp_grid').jtable('load', { exp_usern: $('#lizzusern').val(), exp_comp: $('#exp_comp').val(), exp_date: $('#exp_date').val(), exp_typp: $('#exp_typp').val(),exp_islemtp: $('#exp_islemtp').val(), exp_stat: $('#exp_sttt').val() });
		}
		</script>

<head></head>

<body>



  
    <div style="margin-left: auto;margin-right: auto;">
	
		<div style="text-align:center;">
		<table style="margin: auto;">
			<tr> 
				<td style="padding: 50px 15px;font-size: 20px;">Ürün Kodu Giriniz</td>
				<td><input type="text" name="urunkodu" value=""></td>
				<td><input type="submit" value="Ara" style="width: 115px;" onclick="myFunction()"></td>
			</tr>
		</table>
		<form method="post" action="#" id="dpnone" style="display:none;">
		   <table style="margin:auto;"> 
		 	
			
				<tr> 
					<th>ÜRÜN ADI</th> 
					<th>KODU</th> 
					<th>FİYAT</th> 
					<th>TAŞ</th>
					<th>GRAM</th> 
					<th>KARAT</th>
					<th>RENK</th>
					<th>BERRAKLIK</th>
				</tr>
				<tr> 
					<th>0.32 Karat Pırlantalı Safir Yüzük</th> 
					<th>DR26164</th> 
					<th>800 Dolar</th> 
					<th>Pırlanta</th>
					<th>1.5</th> 
					<th>0.20</th> 
					<th>G</th>
					<th>SI</th>
				</tr>
				
				<tr> 
					<th>
					<img src="https://www.lizaypirlanta.com/resim/urun/lizay-pirlanta-safir-yuzukler-DR26164-1552399504-1.jpg" alt="" style="width:400px;">
					</th>
				</tr>
		
				
			</table>
		</form>

		</div>	
    </div>
  
  <script>
function myFunction() {
  document.getElementById("dpnone").style.display = "block";
}
</script>
		
</body>
</html>
        
        

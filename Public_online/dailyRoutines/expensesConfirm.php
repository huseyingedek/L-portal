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
<link rel="stylesheet" href="//code.jquery.com/ui/1.12.1/themes/base/jquery-ui.css"/>
<link href="libs/jtable/themes/metro/blue/jtable.min.css" rel="stylesheet" type="text/css" />
<link rel="stylesheet" href="styles/css/normalize.css"/>
<link rel="stylesheet" href="styles/css/skeleton.css"/>
<link rel="stylesheet" href="libs/loading/jquery.loading.css"/>
<link rel="icon" type="image/png" href="images/favicon.png"/>
<script src="https://code.jquery.com/jquery-1.12.4.js"></script>
<script src="https://code.jquery.com/ui/1.12.1/jquery-ui.js"></script>  
<script src="libs/jtable/jquery.jtable.min.js"></script>  
<script src="libs/loading/jquery.loading.js"></script> 
<script src="libs/jquery.lightbox_me.js"></script> 

<script type="text/javascript">

    $( document ).ready(function() {
		var dt = new Date();
		//dt.setDate(dt.getDate() - 30);
		$("#exp_date").datepicker();
        $("#exp_date").datepicker("option", { dateFormat: "yy/mm/dd" });
		$("#exp_date").val(dt.getFullYear() + "/" + dt.getMonth() + "/" + dt.getDate());
	
		$("#reff_form").dialog({
			title: 'Red Sebep Girişi',
			width: '70%',
			height: 'auto',
			modal: 'true',
			autoOpen: false		
		});
		
		fn_exp_confirm= function() {
			var $selectedRow = $('#exp_grid').jtable('selectedRows');
			if ($selectedRow.length > 0) {
				$selectedRow.each(function () {
					var record = $(this).data('record');
					$.post( "expensesXresp.php", { resp: "confirmexpense", expcomp: record.COMPANY, exptyp: record.EXTINVTYPE, expnum: record.EXTINVNUM } )
					.done(function( data ) {
						if( data != "" ){
							alert( data );
						}
					});
					fn_exp_search();
				});
			};			
		}

		fn_cmm_refuse= function() {			
			$("#reff_form").dialog('close');
			$.post( "expensesXresp.php", { resp: "refuseexpense", expcomp: $("#reff_input1").val(), exptyp: $("#reff_input2").val(), expnum: $("#reff_input3").val(), ress: $("#reff_reason").val() } )
			.done(function( data ) {
				if( data != "" ){
					alert( data );
					$("#reff_reason").val('');
				}
			});
			fn_exp_search();			
		}
		
		fn_exp_refuse= function() {
			var $selectedRow = $('#exp_grid').jtable('selectedRows');
			if ($selectedRow.length > 0) {
				$selectedRow.each(function () {
					var record = $(this).data('record');
					$("#reff_input1").val(record.COMPANY);
					$("#reff_input2").val(record.EXTINVTYPE);
					$("#reff_input3").val(record.EXTINVNUM);
					$("#reff_form").dialog('open');
					/*
					$.post( "expensesXresp.php", { resp: "refuseexpense", expcomp: record.COMPANY, exptyp: record.EXTINVTYPE, expnum: record.EXTINVNUM } )
					.done(function( data ) {
						if( data != "" ){
							alert( data );
							fn_exp_search();
						}
					});
					*/
				});
			};			
		}
		
		fn_exp_imm_show= function() {
			var $selectedRow = $('#exp_grid').jtable('selectedRows');		
			$selectedRow.each(function () {
				var record = $(this).data('record');
				$('body').loading({
					message: 'Yükleniyor..',
					stoppable: false
				});
				$.post( "expensesXresp.php", { resp: "consExpensesPict", exp_comp: record.COMPANY, exp_typp: record.EXTINVTYPE, exp_numm: record.EXTINVNUM } )
				.done(function( data ) {
					$('body').loading('stop');
					obj = JSON.parse(data);
					if(obj.Records.ROW.IMST != "")
					{
						$('#exp_image').attr('src','data:image/png;base64,' + obj.Records.ROW.IMST.replace('-----BEGIN CERTIFICATE-----','').replace('-----END CERTIFICATE-----',''));
						$('#exp_image').css({'width': $('#exp_image_w').width() });
						$('#exp_image_w').lightbox_me({
							centered: true
						});	
					}
				});
			});			
		}
		
		fn_exp_search= function() {
			$('#exp_grid').jtable({
						actions: {
							listAction: 'expensesXresp.php?resp=listexpenses'
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
			$('#exp_grid').jtable('load', { exp_usern: $('#lizzusern').val(), exp_comp: $('#exp_comp').val(), exp_date: $('#exp_date').val(), exp_typp: $('#exp_typp').val(), exp_stat: $('#exp_sttt').val() });
		}
		
    });
	
</script>

<title>Masraf Listesi</title>
<head></head>
<body>
	<div id="exp_form" name="exp_form" style="width:100%;">
		<input type="hidden" id="lizzusern" name="lizzusern" value="<?php session_start(); echo $_SESSION['usern']; ?>">
		<div id="exp_image_w" name="exp_image_w" style="overflow:scroll; width:550px; height:300px; display: none;">
			<img id="exp_image" src="" alt=""  />
		</div>
		<table style="width:100%">  
			<tr>
				<td style="width:10%">Firma</td>
				<td style="width:20%">Tarih</td>
				<td style="width:20%">Masraf Tipi</td>
				<td style="width:20%">Statü</td>
				<td style="width:30%"></td>
			</tr>
			<tr>
				<td><input type="text" id="exp_comp" name="exp_comp" style="width:100%; min-width:50px;" /></td>
				<td><input type="text" id="exp_date" name="exp_date" style="width:100%; min-width:50px;" /></td>
				<td><input type="text" id="exp_typp" name="exp_typp" style="width:100%; min-width:50px;" /></td>
				<td><select id="exp_sttt" name="exp_sttt" style="width:100%; min-width:50px;"><option value="0">Onaysız</option><option value="2">Onaylı</option><option value="1">Red</option><option value="3">Tümü</option></select></td>
				<td><input type="button" id="exp_search" name="exp_search" style="width:100%;" value="Ara" onclick="fn_exp_search()" /></td>			
			</tr>       
			<tr>
				<td colspan=5>
					<div id="exp_grid_w" name="exp_grid_w" style="overflow:scroll; width:100%; height:400px;">
						<div id="exp_grid" name="exp_grid" />
					</div>
				</td>
				<!--
				<td>
					<input type="button" id="exp_cnfrm" name="exp_cnfrm" style="width:100%; height:50px;" value="Onayla" onclick="fn_exp_confirm()" /></br>
					<input type="button" id="exp_refus" name="exp_refus" style="width:100%; height:50px;" value="Reddet" onclick="fn_exp_refuse()" /></br>
					<div id="exp_image_w" name="exp_image" style="overflow:scroll; width:550px; height:300px;">
						<img id="exp_image" src="" alt="" />
					</div>
				</td>	
				-->
			</tr>   				
		</table>
	</div>
	<div id="reff_form" name="refuse_form" style="width:100%;">
		<input type="hidden" id="reff_input1" />
		<input type="hidden" id="reff_input2" />
		<input type="hidden" id="reff_input3" />
		<table style="width:100%">  
			<tr>
				<td style="width:80%;">Lütfen Red Sebebini Giriniz.</td>
				<td style="width:20%;"><input type="button" value="Kaydet" onclick="fn_cmm_refuse();"></input></td>
			</tr>
			<tr>
				<td colspan="2"><textarea id="reff_reason" name="reff_reason" style="width:100%;" rows="4"></textarea></td>			
			</tr>    				
		</table>
	</div>	
</body>
</html>

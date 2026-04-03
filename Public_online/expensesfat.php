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
<link rel="stylesheet" href="/vendors/css/bootstrap.min.css"  crossorigin="anonymous">
<link rel="stylesheet" href="/vendors/css/style.css">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">
<link href="//fonts.googleapis.com/css?family=Raleway:400,300,600" rel="stylesheet" type="text/css"/>
<link rel="stylesheet" href="//code.jquery.com/ui/1.12.1/themes/base/jquery-ui.css"/>
<link href="libs/jtable/themes/metro/blue/jtable.min.css" rel="stylesheet" type="text/css" />
<link rel="stylesheet" href="styles/css/normalize.css"/>
<link rel="stylesheet" href="styles/css/skeleton.css"/>
<link rel="icon" type="image/png" href="images/favicon.png"/>
<script src="https://code.jquery.com/jquery-1.12.4.js"></script>
<script src="https://code.jquery.com/ui/1.12.1/jquery-ui.js"></script>  
<script src="libs/jtable/jquery.jtable.min.js"></script>  
<script src="libs/jquery.numeric_input.js"></script>  


	
	
<script type="text/javascript">



    $( document ).ready(function() {
		var dt = new Date();
		dt.setDate(dt.getDate() +0);
		dt.setMonth(+3);
		
		$("#exp_date").datepicker();
        $("#exp_date").datepicker("option", { dateFormat: "yy/mm/dd" });
		$("#exp_date").val(dt.getFullYear() + "/" + dt.getMonth()  + "/" + dt.getDate());
		
		$("#reff_form").dialog({
			title: 'Red Sebep Girişi',
			width: '70%',
			height: 'auto',
			modal: 'true',
			autoOpen: false		
		});
		
		fn_exp_new= function() {
			$.post( "expensesXresp.php", { resp: "newsharedocn", exp_usern: $('#lizzusern').val() } )
			.done(function( data ) {
				if( data != "" ){
					if( data.substring(0,2)=='FL' )
					{
						alert( data.replace('FL;','') );
					}
					else
					{
						window.location = "expenses.php?docnumb="+data.replace('OK;','');
					}
				}
			});			
		};
		
		fn_exp_add= function() {
			var $selectedRow = $('#exp_grid').jtable('selectedRows');
			if ($selectedRow.length > 0) {
				$selectedRow.each(function () {
					var record = $(this).data('record');
					if(record.SHAREDNUMB== "" )
					{
						alert("Belge No bulunamadı.");
						return;
					}
					if(record.STATUS== 2)
					{
						alert("Onaylı belgeye fiş eklenemez.");
						return;						
					}
					window.location = "expenses.php?docnumb="+record.SHAREDNUMB;
				});
			};				
		};		
	
		
		fn_exp_confirm= function() {
			var $selectedRow = $('#exp_grid').jtable('selectedRows');
			if ($selectedRow.length > 0) {
				$selectedRow.each(function () {
					var record = $(this).data('record');
					$.post( "expensesXresp.php", { resp: "confirmexpensever", expcomp: record.COMPANY, sharenumb: record.SHAREDNUMB, belgetip: record.BELGETIP } )
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
			$.post( "expensesXresp.php", { resp: "refuseexpensesh", expcomp: $("#reff_input1").val(), sharenumb: $("#reff_input2").val(), ress: $("#reff_reason").val() } )
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
					$("#reff_input2").val(record.SHAREDNUMB);
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
		
		fn_exp_imm_showw= function() {
			var $selectedRow = $('#exp_grid').jtable('selectedRows');		
			$selectedRow.each(function () {
				
				var record = $(this).data('record');
				$('body').loading({
				
					message: 'Yükleniyor..',
					stoppable: false
					
				});
				
				$.post( "expensesXresp.php", { resp: "consExpensesPictVER", exp_comp: record.COMPANY,exp_sharnmb: record.SHAREDNUMB, exp_btip: record.BELGETIP } )
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
						fn_exp_search();
					
						
					}
					
				/*	if(function closeLightbox()) {
						location.reload();
					}*/
					
				
						
				});
				
			});			
			
			
		}
		fn_exp_imm_show= function() {
			var $selectedRow = $('.jtable-child-table-container').jtable('selectedRows');		
			$selectedRow.each(function () {
				var record = $(this).data('record');
				$('body').loading({
					message: 'Yükleniyor..',
					stoppable: false
				});
				$.post( "expensesXresp.php", { resp: "consExpensesPictVER", exp_comp: record.COMPANY, exp_sharnmb: record.SHAREDNUMB, exp_btip: record.BELGETIP } )
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
				
						openChildAsAccordion: true,
						actions: {
							listAction: 'expensesXresp.php?resp=listshareddoc',
						
						},
						fields: {	
							CLIENT: {
								title: 'Mağaza',
								width: '10%',
								edit: false
							},
							BELGETIP: {
								title: 'Belge Tip',
								width: '10%',
								edit: false
							},							
							SHAREDNUMB: {
								title: 'Belge No',
								width: '10%',
								edit: false,
								listClass: 'child-opener-image-column',
								display: function (data) {
									var $img = $('<img class="child-opener-image" src="http://www.jtable.org/Content/images/Misc/list_metro.png" /><span id="lineSharedNumb_'+ data.record.SHAREDNUMB +'" invtype="'+ data.record.BELGETIP + '" >'+ data.record.SHAREDNUMB +'</>');
									//Open child table when user clicks the image
									$img.click(function () {
										$('#exp_grid').jtable('openChildTable',
												$img.closest('tr'),
												{
													title: data.record.SHAREDNUMB + ' Nolu Belge Detayı',
													actions: {
														listAction: 'expensesXresp.php?resp=listexpensesfatsh'
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
														NETAMOUNT: {
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
																return '<input type="button" value="Fiş" onclick="fn_exp_imm_show();" style="background-color:	#ecab53; color:white;"></input>';
															}								
														},							
														IMST: {
															visibility: 'hidden'
														}
													},
													selecting: true,
													multiselect: false,
													formCreated: function (event, data) {
														data.form.validationEngine();
													},
													formSubmitting: function (event, data) {
														return data.form.validationEngine('validate');
													},
													formClosed: function (event, data) {
														data.form.validationEngine('hide');
														data.form.validationEngine('detach');
													}
												}, function (data) { //opened handler
													data.childTable.jtable('load', { exp_comp: $('#exp_comp').val(), exp_bt: $( '#lineSharedNumb_'+ $(".jtable-data-row.jtable-row-selected>td>span").text() ).attr("invtype"), exp_sh: $( '#lineSharedNumb_'+ $(".jtable-data-row.jtable-row-selected>td>span").text() ).text() } );
												});
									});
									return $img;
								}								
											
							},	
							DOCDATE: {
								title: 'Belge Tarihi',
								width: '10%',
								edit: false
							},
						    VENDOR: {
								title: 'Müşteri No',
								width: '10%',
								edit: false
							},
							NAME1: {
								title: 'Tedarikçi Adı',
								width: '10%',
								edit: false
							},
							NETAMOUNT: {
								title: 'Tutar',
								width: '10%',
								edit: false
							},
							CURRENCY: {
								title: 'Para Birimi',
								width: '10%',
								edit: false
							},
						
						
							EXPCONF: {
								title: '',
								display: function (data) {
									if( data.record.STATUS != "0" ){
										switch (data.record.STATUS) {
											case "2":
												return '<input type="text" value="Onaylı" style="background-color:#4da6ff; color:white;" readonly />';
												break;
											default:
												return '<span></span>';
										}	
									}
									else{
										return '<input type="button" value="Onay" onclick="fn_exp_confirm();" style="background-color:#00cd66; color:white;"></input>';
									}
								}								
							},	
							
							IMSTBT: {
								title: '',
								display: function (data) {
									return '<input type="button" value="Fiş" onclick="fn_exp_imm_showw();" style="background-color:	#ecab53; color:white;"></input>';
								}								
							},	
												
						},
						selecting: true,
						multiselect: false,
						selectingCheckboxes: true,
						selectionChanged: function () {
							/*moved click event
							var $selectedRow = $('#exp_grid').jtable('selectedRows');		
							$selectedRow.each(function () {
								var record = $(this).data('record');
								$.post( "expensesXresp.php", { resp: "consExpensesPictVER", exp_comp: record.COMPANY, exp_typp: record.EXTINVTYPE, exp_numm: record.EXTINVNUM } )
								.done(function( data ) {
									obj = JSON.parse(data);
									$('#exp_image').attr('src','data:image/png;base64,' + obj.Records.ROW.IMST.replace('-----BEGIN CERTIFICATE-----','').replace('-----END CERTIFICATE-----',''));
								});
							});
							*/
						}
					});	
			$('#exp_grid').jtable('load', { exp_comp: $('#exp_comp').val(), exp_date: $('#exp_date').val(), exp_docn: $('#exp_docn').val(), exp_stat: $('#exp_sttt').val(),exp_islemtp: $('#exp_islemtp').val()  });
		}
		
    });
	
</script>
<head>
<title>Fatura Onayları Listesi</title>
<style>
    table {
        width: 100%;
        border-collapse: collapse;
    }

    table, th, td {
        border: 1px solid #ccc;
        padding: 8px;
    }

    .left-label {
        padding: 8px;
        text-align: center;
		font-weight: bold;
    }

    textarea {
        width: 100%;
        height: 100px;
    }
	header {
        font-size: 24px; 
        padding-top: 10px 0; 
		background-color: #343A40;
    }

    .navbar-brand {
        font-size: 24px; 
    }
</style>
</head>
<body>
<header>

<div class="navbar navbar-dark bg-dark shadow-sm">
  <div class="container d-flex justify-content-between">
	<a href="masrafgirisleri.php" class="navbar-brand d-flex align-items-center">
	<i class="fa fa-rotate-left"><strong> Geri Dön</strong></i>
	</a>
	<a href="http://online.lizaypirlanta.com/wsindex.php" class="navbar-brand d-flex align-items-center">
	  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" aria-hidden="true" class="mr-2" viewBox="0 0 24 24" focusable="false"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
	  <strong>Web Uygulamaları</strong>
	</a>
  </div>
</div>

</header>
	<div id="exp_image_w"  name="exp_image_w" style="overflow:scroll; width:570px; height:auto; display: none;">
		<img id="exp_image" src="" alt=""  />
	</div>
	<div id="exp_form" name="exp_form" style="width:95%; margin: 0 auto;">
		<input type="hidden" id="lizzusern" name="lizzusern" value="<?php session_start(); echo $_SESSION['usern']; ?>">
		<table style="width:100%">  
			<tr>
				<td class="left-label" style="width:10%">Firma</td>
				<td class="left-label" style="width:20%">Tarih</td>
				<td class="left-label" style="width:20%">Belge No</td>
				<td class="left-label" style="width:20%">Statü</td>
				<td class="left-label" style="width:15%"></td>
				<td class="left-label" style="width:15%"></td>
			</tr>
			<tr>
				<td><input type="text" id="exp_comp" name="exp_comp" style="width:100%; min-width:50px;" /></td>
				<td><input type="text" id="exp_date" name="exp_date" style="width:100%; min-width:50px;" /></td>
				<td><input type="text" id="exp_docn" name="exp_docn" style="width:100%; min-width:50px;" /></td>
				<td><select id="exp_sttt" name="exp_sttt" style="width:100%; min-width:50px;"><option value="0">Onaysız</option><option value="2">Onaylı</option><option value="1">Red</option><option value="3">Tümü</option></select></td>
				<td><select id="exp_islemtp" name="exp_islemtp" style="width:100%; min-width:50px;"><option value="2">Fatura</option><option value="0">Hepsi</option><option value="1">Fiş</option></select></td>
				<td><input type="button" id="exp_search" name="exp_search" style="width:100%; background-color:#00CCCC; color:white;" value="Ara" onclick="fn_exp_search()" /></td>		
				<td><input style="color:white; background-color:#0099FF;" type="button" id="exp_new" name="exp_new" style="width:100%;" value="Yeni" onclick="fn_exp_new()" /></td>						
			</tr>       
			<tr>
				<td colspan=8>
					<div id="exp_grid_w" name="exp_grid_w" style="overflow:scroll; width:100%; height:400px;">
						<div id="exp_grid" name="exp_grid">
					</div>
				</td>
				<!--
				<td>
					<input type="button" id="exp_cnfrm" name="exp_cnfrm" style="width:100%; height:50px;" value="Onayla" onclick="fn_exp_confirm()" /></br>
					<input type="button" id="exp_cnfrm" name="exp_cnfrm" style="width:100%; height:50px;" value="Fiş" onclick="fn_exp_imm_show()" /></br>
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
	
	
	
	<script src='https://www.lizkur.com/ias/jquery.zoom.js'></script>
	<script>
		$(document).ready(function(){
			$('#ex1').zoom();
				fn_exp_search();
				
		});
	</script>

</body>
</html>

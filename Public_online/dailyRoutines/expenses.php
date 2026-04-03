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
<link href="libs/jtable/themes/metro/blue/jtable.min.css" rel="stylesheet" type="text/css" 
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
		
		$("#Project").val('IASTR');
		
        $("#InvoiceDate").datepicker();
        $("#InvoiceDate").datepicker("option", { dateFormat: "yy/mm/dd" });
		$("#InvoiceDate").val(dt.getFullYear() + "/" + (dt.getMonth() + 1) + "/" + dt.getDate());
		
		$("#asf_date").datepicker();
        $("#asf_date").datepicker("option", { dateFormat: "yy/mm/dd" });
		$("#asf_date").val(dt.getFullYear() + "/" + (dt.getMonth() + 1) + "/" + dt.getDate());
		
		$("#InvoiceAmount").numeric_input({
			decimal: '.'
		});
		
		if($("#InvoiceSharedNumb").val()==""){
			$(".shareddocnrow").hide();
		}
		
		$("#asf_form").dialog({
			title: 'Aktivite Seçim (Liste sınırı 10 kayıt)',
			width: '70%',
			height: 'auto',
			modal: 'true',
			autoOpen: false		
		});
		
		$("#ctyp_form").dialog({
			title: 'Masraf Tipi Seçim (Liste sınırı 10 kayıt)',
			width: '70%',
			height: 'auto',
			modal: 'true',
			autoOpen: false		
		});

		$("#bstyp_form").dialog({
			title: 'İş Alanı Seçim (Liste sınırı 10 kayıt)',
			width: '70%',
			height: 'auto',
			modal: 'true',
			autoOpen: false		
		});
		
		fn_asf_list_open= function() {
			$('#asf_form').dialog('open');
		}
		
		fn_asf_select= function() {
			var $selectedRow = $('#asf_grid').jtable('selectedRows');
			if ($selectedRow.length > 0) {
				$selectedRow.each(function () {
					var record = $(this).data('record');
					$('#Project').val(record.ACTID);
					$("#InvoiceDate").val(record.WORKSTART.substring(0,10).replace(/-/g,'/'));
				});
			};
			$('#asf_form').dialog('close');
		}
		
		fn_asf_search= function() {
			$('#asf_grid').jtable({
						actions: {
							listAction: 'expensesXresp.php?resp=listaction'
						},
						fields: {
							ACTID: {
								title: 'Id',
								width: '20%',
								edit: false
							},		
							MATERIAL: {
								title: 'Proje',
								width: '20%',
								edit: false
							},		
							WORKSTART: {
								title: 'Başlama',
								width: '20%',
								edit: false
							},
							WORKEND: {
								title: 'Bitiş',
								width: '20%'
							},
							STEXT: {
								title: 'Konu',
								width: '20%'
							}
						},
						selecting: true,
						multiselect: false,
						selectingCheckboxes: true
					});
			$('#asf_grid').jtable('load', { asf_pers: $('#userName').val(), asf_project: '', asf_date: $('#asf_date').val() });
		}
		
		fn_ctyp_list_open= function() {
			$('#ctyp_form').dialog('open');
			fn_ctyp_search();
		}
		
		fn_ctyp_select= function() {
			var $selectedRow = $('#ctyp_grid').jtable('selectedRows');
			if ($selectedRow.length > 0) {
				$selectedRow.each(function () {
					var record = $(this).data('record');
					$('#CostType').val(record.MASRAFTIP);
					$('#CostTypeX').html(record.STEXT);
				});
			};
			$('#ctyp_form').dialog('close');
		}		

		fn_ctyp_search= function() {
			$('#ctyp_grid').jtable({
						actions: {
							listAction: 'expensesXresp.php?resp=listcosttype'
						},
						fields: {
							MASRAFTIP: {
								title: 'Kod',
								width: '20%',
								edit: false
							},		
							STEXT: {
								title: 'Açıklama',
								width: '80%',
								edit: false
							}
						},
						selecting: true,
						multiselect: false,
						selectingCheckboxes: true
					});
			$('#ctyp_grid').jtable('load', { exp_comp: '' });
		}
		
		fn_bstyp_list_open= function() {
			$('#bstyp_form').dialog('open');
			fn_bstyp_search();
		}
		
		fn_bstyp_select= function() {
			var $selectedRow = $('#bstyp_grid').jtable('selectedRows');
			if ($selectedRow.length > 0) {
				$selectedRow.each(function () {
					var record = $(this).data('record');
					$('#BusArea').val(record.BUSAREA);
					$('#BusAreaX').html(record.STEXT);
				});
			};
			$('#bstyp_form').dialog('close');
		}		

		fn_bstyp_search= function() {
			$('#bstyp_grid').jtable({
						actions: {
							listAction: 'expensesXresp.php?resp=listbusarea'
						},
						fields: {
							BUSAREA: {
								title: 'İA',
								width: '20%',
								edit: false
							},		
							STEXT: {
								title: 'Açıklama',
								width: '80%',
								edit: false
							}
						},
						selecting: true,
						multiselect: false,
						selectingCheckboxes: true
					});
			$('#bstyp_grid').jtable('load', { exp_comp: '' });
		}
		
		setTwoNumberDecimal= function() {
			$(this).val = parseFloat($(this).val).toFixed(2);
		}
		
    });
	
</script>

<title>Günlük Masraf Girişleri</title>
<head></head>
<body>
    <form enctype="multipart/form-data" method="post" action="expensesCommit.php">
        <div style="width:100%">
            <table style="width:100%">  
				<!--
                <tr>
                    <td>Proje Kodu</td>
                    <td><input type="text" id="Project" name="Project" readonly />&nbsp;<input type="button" id="asf_list" name="asf_list" value="Liste" onclick="fn_asf_list_open()" /></td>
                </tr>	
				-->
                <tr class="shareddocnrow">
                    <td>Belge No</td>
                    <td><input type="text" id="InvoiceSharedNumb" name="InvoiceSharedNumb" value="<?php $docnumb = $_REQUEST['docnumb'] !='' ? $_REQUEST['docnumb'] : ''; echo $docnumb; ?>" readonly  /></td>
                </tr>	
                <tr class="shareddocnrow">
                    <td>İş Alanı</td>
                    <td>
						<input type="text" id="BusArea" name="BusArea" readonly />&nbsp;
						<input type="button" id="bstyp_list" name="bstyp_list" value="Liste" onclick="fn_bstyp_list_open()" />&nbsp;
						<span id="BusAreaX" name="BusAreaX"></span>
					</td>
                </tr>					
                <tr>
                    <td>Tarih (YYYY/MM/DD)</td>
                    <td><input type="text" id="InvoiceDate" name="InvoiceDate" /></td>
                </tr>
                <tr>
                    <td>Fatura Serisi</td>
                    <td><input type="text" id="InvoiceQuine" name="InvoiceQuine" /></td>
                </tr>
                <tr>
                    <td>Fatura No</td>
                    <td><input type="text" id="InvoiceNumber" name="InvoiceNumber" /></td>
                </tr>
                <tr>
                    <td>Fatura Tutarı</td>
                    <td><input type="text" id="InvoiceAmount" name="InvoiceAmount" /></td>
                </tr>  
                <tr>
                    <td>Masraf Tipi</td>
                    <td>
						<input type="text" id="CostType" name="CostType" readonly />&nbsp;
						<input type="button" id="ctyp_list" name="ctyp_list" value="Liste" onclick="fn_ctyp_list_open()" />&nbsp;
						<span id="CostTypeX" name="CostTypeX"></span>
					</td>
                </tr>   				
                <tr>
                    <td>Açıklama</td>
                    <td><textarea id="Stext" name="Stext" ></textarea></td>
                </tr>            
                <tr>
                    <td>Fatura Resmi</td>
                    <td><input type="file" id="InvoiceImage" name="InvoiceImage" accept="image/*;capture=camera"/></td>
                </tr>      
                <tr>
                    <td></td>
                    <td><input type="submit"/></td>
                </tr>
            </table>
        </div>
    </form>
	<div id="asf_form" name="asf_form" style="width:100%;">
		<table style="width:100%">  
			<tr>
				<td style="width:60%">Tarih</td>
				<td style="width:20%"></td>
				<td style="width:20%"></td>
			</tr>
			<tr>
				<td><input type="text" id="asf_date" name="asf_date" style="width:100%; min-width:100px;" /></td>
				<td><input type="button" id="asf_search" name="asf_search" style="width:100%;" value="Ara" onclick="fn_asf_search()" /></td>
				<td><input type="button" id="asf_select" name="asf_select" style="width:100%;" value="Seç" onclick="fn_asf_select()" /></td>				
			</tr>       
			<tr>
				<td colspan=3>
					<div id="asf_grid" name="asf_grid" />
				</td>
			</tr>   				
		</table>
	</div>
	<div id="ctyp_form" name="ctyp_form" style="width:100%;">
		<table style="width:100%">  
			<tr>
				<td style="width:80%"></td>
				<td style="width:20%"></td>
			</tr>
			<tr>
				<td><input type="button" id="ctyp_search" name="ctyp_search" style="width:100%;" value="Ara" onclick="fn_ctyp_search()" /></td>
				<td><input type="button" id="ctyp_select" name="ctyp_select" style="width:100%;" value="Seç" onclick="fn_ctyp_select()" /></td>				
			</tr>       
			<tr>
				<td colspan=2>
					<div id="ctyp_grid" name="ctyp_grid" />
				</td>
			</tr>   				
		</table>
	</div>	
	<div id="bstyp_form" name="bstyp_form" style="width:100%;">
		<table style="width:100%">  
			<tr>
				<td style="width:80%"></td>
				<td style="width:20%"></td>
			</tr>
			<tr>
				<td><input type="button" id="bstyp_search" name="bstyp_search" style="width:100%;" value="Ara" onclick="fn_bstyp_search()" /></td>
				<td><input type="button" id="bstyp_select" name="bstyp_select" style="width:100%;" value="Seç" onclick="fn_bstyp_select()" /></td>				
			</tr>       
			<tr>
				<td colspan=2>
					<div id="bstyp_grid" name="bstyp_grid" />
				</td>
			</tr>   				
		</table>
	</div>		
</body>
</html>

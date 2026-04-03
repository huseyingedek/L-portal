<?php

/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

session_start();  
 
$params = $_REQUEST;
$resp = $params['resp'] !='' ? $params['resp'] : '';

require_once 'caniasConnector.php';
$caniasConnector = new caniasConnector;

switch($resp) {
	case 'listexpenses':
		$user = $_POST['exp_usern'] !='' ? $_POST['exp_usern'] : '%'; 
		$comp = $_POST['exp_comp'] !='' ? $_POST['exp_comp'] : '%'; 
		$datt = $_POST['exp_date'] !='' ? $_POST['exp_date'] : ''; 
		$typp = $_POST['exp_typp'] !='' ? $_POST['exp_typp'] : '%'; 		
		$stat = $_POST['exp_stat'] !='' ? $_POST['exp_stat'] : ''; 		
		$caniasConnector->wsCanias('consExpensesList',array($user,$comp,$datt,$typp,$stat));
		echo $caniasConnector->wsGetResponseforJtable();
		break;	
	case 'listexpensessh':
		$comp = $_POST['exp_comp'] !='' ? $_POST['exp_comp'] : '%'; 
		$exsh = $_POST['exp_sh'] !='' ? $_POST['exp_sh'] : ''; 
		$caniasConnector->wsCanias('consExpensesListSH',array($comp,$exsh));
		echo $caniasConnector->wsGetResponseforJtable();
		break;		
	case 'listshareddoc':
		$comp = $_POST['exp_comp'] !='' ? $_POST['exp_comp'] : '%'; 
		$datt = $_POST['exp_date'] !='' ? $_POST['exp_date'] : ''; 
		$docn = $_POST['exp_docn'] !='' ? $_POST['exp_docn'] : '%'; 
		$stat = $_POST['exp_stat'] !='' ? $_POST['exp_stat'] : ''; 			
		$caniasConnector->wsCanias('consSharedocList',array($comp,$datt,$docn,$stat));
		echo $caniasConnector->wsGetResponseforJtable();
		break;		
	case 'newsharedocn':
		$usern = $_POST['exp_usern'] !='' ? $_POST['exp_usern'] : '%'; 	
		$caniasConnector->wsCanias('consNewSharedocNumb',array($usern));
		echo $caniasConnector->wsCaniasResponseX.';'.$caniasConnector->wsGetResponse();
		break;
	case 'consExpensesPict':
		$comp = $_POST['exp_comp'] !='' ? $_POST['exp_comp'] : ''; 
		$typp = $_POST['exp_typp'] !='' ? $_POST['exp_typp'] : ''; 
		$numm = $_POST['exp_numm'] !='' ? $_POST['exp_numm'] : ''; 		
		$caniasConnector->wsCanias('consExpensesPict',array($comp,$typp,$numm));
		echo $caniasConnector->wsGetResponseforJtable();
		break;		
	case 'confirmexpense':
		$comp = $_POST['expcomp'] !='' ? $_POST['expcomp'] : ''; 
		$exptyp = $_POST['exptyp'] !='' ? $_POST['exptyp'] : ''; 
		$expnum = $_POST['expnum'] !='' ? $_POST['expnum'] : ''; 	
		echo $caniasConnector->wsCanias('consExpenseConfirm',array($_SESSION['usern'],$comp,$exptyp,$expnum));
		break;	
	case 'refuseexpense':
		$comp = $_POST['expcomp'] !='' ? $_POST['expcomp'] : ''; 
		$exptyp = $_POST['exptyp'] !='' ? $_POST['exptyp'] : ''; 
		$expnum = $_POST['expnum'] !='' ? $_POST['expnum'] : ''; 	
		$ress = $_POST['ress'] !='' ? $_POST['ress'] : ''; 
		echo $caniasConnector->wsCanias('consExpenseRefuse',array($_SESSION['usern'],$comp,$exptyp,$expnum,$ress));
		break;	
	case 'confirmexpensesh':
		$comp = $_POST['expcomp'] !='' ? $_POST['expcomp'] : ''; 
		$sharenumb = $_POST['sharenumb'] !='' ? $_POST['sharenumb'] : ''; 	
		echo $caniasConnector->wsCanias('consExpenseConfirmSH',array($_SESSION['usern'],$comp,$sharenumb));
		break;	
	
	case 'confirmexpensever':
		$comp = $_POST['expcomp'] !='' ? $_POST['expcomp'] : ''; 
		$exptyp = $_POST['exptyp'] !='' ? $_POST['exptyp'] : ''; 
		$expnum = $_POST['expnum'] !='' ? $_POST['expnum'] : ''; 	
		echo $caniasConnector->wsCanias('consExpenseConfirmVer',array($_SESSION['usern'],$comp,$exptyp,$expnum));
		break;	
	case 'refuseexpensesh':
		$comp = $_POST['expcomp'] !='' ? $_POST['expcomp'] : ''; 	
		$sharenumb = $_POST['sharenumb'] !='' ? $_POST['sharenumb'] : ''; 	
		$ress = $_POST['ress'] !='' ? $_POST['ress'] : ''; 
		echo $caniasConnector->wsCanias('consExpenseRefuseSH',array($_SESSION['usern'],$comp,$sharenumb,$ress));
		break;			
	case 'listaction':
		$prss = $_POST['asf_pers'] !='' ? $_POST['asf_pers'] : ''; 
		$prjj = $_POST['asf_project'] !='' ? $_POST['asf_project'] : ''; 
		$datt = $_POST['asf_date'] !='' ? $_POST['asf_date'] : ''; 	
		$caniasConnector->wsCanias('consActivityList',array($prss,$prjj,$datt));
		echo $caniasConnector->wsGetResponseforJtable();
		break;
	case 'listcosttype':
		$comp = $_POST['exp_comp'] !='' ? $_POST['exp_comp'] : ''; 
		$caniasConnector->wsCanias('consCostTypeList',array($comp));
		echo $caniasConnector->wsGetResponseforJtable();
		break;		
	case 'listbusarea':
		$comp = $_POST['exp_comp'] !='' ? $_POST['exp_comp'] : ''; 
		$caniasConnector->wsCanias('consBusAreaList',array($comp));
		echo $caniasConnector->wsGetResponseforJtable();
		break;	
	default:
		return;
}

?>

<?php

error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once 'libs/nusoap/nusoap.php';

class caniasConnector {

	public $wsCaniasResponse= "";
	public $wsCaniasResponseX= "";

	function wsCanias($function, array $params) {
		
		$soap_client = new nusoap_client("http://176.236.6.138:8088/caniasWS603/services/iasWebService?wsdl");

		$soap_client->http_encoding='utf-8';
		$soap_client->soap_defencoding='utf-8';
		$soap_client->decode_utf8 = false;
		
		$sessionId = $soap_client->call("login", array( 
											'00', 
											'T', 
											'NEW', 
											'CANIAS',         
											'192.168.5.10/PR', 
											'WSLIZAY', 
											'ws123lizay'));

		/*$sessionId = $login_respp['SessionId'];		*/
		
		$Argss  = "";
		foreach($params as $singlePar) {
			if( $Argss != "" ){
				$Argss .= ",";
			}
			$Argss .= $singlePar ;
		}

		$ress = $soap_client->call("callIASService", array(     $sessionId,
									$function,
									$Argss, 
									'string', 
									false ));

		$soap_client->call("logout", array($sessionId));
		$this->wsCaniasResponse= $ress;
		/*$this->wsCaniasResponse= $ress['Response']['Value'];                 */
	
		if(substr($this->wsCaniasResponse,0,2)=='FL'){
			$this->wsCaniasResponseX= "FL";
			$this->wsCaniasResponse= substr($this->wsCaniasResponse,3);
			return $this->wsCaniasResponse;
		}
		else{
			$this->wsCaniasResponseX= "OK";
			return $this->wsCaniasResponse;
		}
	
	}
	
	function wsGetResponse(){
		return $this->wsCaniasResponse;
	}

	function wsGetResponseforJtable(){
		if($this->wsCaniasResponseX == "OK"){
			$jtabresp= '{ "Result":"OK", "Records":' . $this->wsCaniasResponse . ' }';
		}
		else{
			$jtabresp= '{ "Result":"ERROR" }';	
		}
		return $jtabresp;
	}
	
}

?>
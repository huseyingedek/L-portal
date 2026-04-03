<?php

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

require_once 'libs/nusoap/nusoap.php';

class caniasConnector {
                                  
	public $wsCaniasResponse= "";
	public $wsCaniasResponseX= "";

	function wsCanias($function, array $params) {
		
		$soap_client = new nusoap_client("http://192.168.1.50:8080/CaniasWS-v1/services/iasWebService?wsdl");
             
		$soap_client->http_encoding='utf-8';
		$soap_client->soap_defencoding='utf-8';
		$soap_client->decode_utf8 = false;
		                                                    
		$sessionId = $soap_client->call("login", array( 
											'00', 
											'T', 
                                            'NEW',
											'CANIAS',   
											'192.168.1.50:27499/S2', 
											'WSLIZAY', 
											'Ws-123lizay'));

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

	function wsGetResponseX(){
		return $this->wsCaniasResponseX;
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

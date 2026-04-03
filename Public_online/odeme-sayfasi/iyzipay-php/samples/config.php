<?php

require_once(dirname(__DIR__).'/IyzipayBootstrap.php');

$usern = $_SESSION['usern'];

// ini_set('display_errors', 1);
// ini_set('display_startup_errors', 1);
// error_reporting(E_ALL);

switch ($usern) {
    case 'FRNIZMITC':
        $apiKey = '20KAhkPtoJwP8h3LFrPf2tazpJC2pp1F';
        $secretKey = 'q6tSJI3ziyEzpCrEqU5S507n6La9FOyS';
        break;
    case 'FRNNAUTILUS':
        $apiKey = 'gPPCVjtGtNpMzyn3fvBd1hJ0C5R4lFfC';
        $secretKey = 'MARE0lillu1FYj1wqiAD2ktrukigFAOW';
        break;
    case 'FRNFISTANBUL':
        $apiKey = 'H1w6NvUagTI3xdu6hLMnuN9vyoU3l4Sn';
        $secretKey = 'WT9b1coCAG1ilAn5xVZpVLIu6k7WtBTB';
        break;
    case 'FRNISTOZDILEK':
        $apiKey = 'E1VlBhBkraHoy02EAfIW5woT1ncdll88';
        $secretKey = '50BG326sl50Du8edRlbLgSXs3a3tW5I8';
        break;
    case 'FRNINEGOL':
        $apiKey = 'g2kW31Dfn2yHpxuemTF8zwWxvgmwLKHg';
        $secretKey = 'jIypKp9008dSaFSus6msTopY9fN9twu7';
        break;
    case 'LNADIRE':
        $apiKey = 'IIhpUhpuFWgj345ut5lbvhe4fVkSQY8E';
        $secretKey = 'LNu8FDgZi19ZDGBB5GvcSNOqe2YVUowS';
        break;
    case 'LIHILLTOWN':
        $apiKey = 'Elaa0jPwP9khuehxzXGL91rkng9gkhWk';
        $secretKey = 'zoIelpGkhSxOm30o9XsgB53mYMNFoRfJ';
        break;
    case 'FRNGUZELDAG':
        $apiKey = 'kO1UW8w80wHkE3X1LViXau4FwKs01cl7';
        $secretKey = 'PWDLmnrJ4OEE6hMM32GM69SQzNec7S0K';
        break;
    case 'FRNGORDION':
        $apiKey = '8M3PUZDdl0jyuFlFhZCZ6ASxTq4LFulO';
        $secretKey = 'DDD4LZ2gsz0GgDVQZ86sDsbgdBcPOtwa';
        break;
    case 'LSYMBOL':
        $apiKey = '8zbTgs25KXgefJy6FAL3gqnE9ehcRehcRVMU';
        $secretKey = 'az8RgTj2MX2nWtcOrL6iXWpmk52PgmJp';
        break;
    default:
        $apiKey = 'HTjq7Xl7yH9qWzxqbfRIC0OsjsR1e6au';
        $secretKey = 'GtXWaj32VOwXukJVpBMRVhkgM0QaF6lt';
}

$_SESSION['apiKey'] = $apiKey;
$_SESSION['secretKey'] = $secretKey;

IyzipayBootstrap::init();

class Config
{
    public static function options()
    {
        $apiKey = isset($_SESSION['apiKey']) ? $_SESSION['apiKey'] : 'HTjq7Xl7yH9qWzxqbfRIC0OsjsR1e6au';
        $secretKey = isset($_SESSION['secretKey']) ? $_SESSION['secretKey'] : 'GtXWaj32VOwXukJVpBMRVhkgM0QaF6lt';

        // echo $apiKey;

        $options = new \Iyzipay\Options();
        $options->setApiKey($apiKey);
        $options->setSecretKey($secretKey);
        $options->setBaseUrl('https://api.iyzipay.com');

        return $options;
    }
}
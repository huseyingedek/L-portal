<?php

require_once(dirname(__DIR__).'/IyzipayBootstrap.php');

IyzipayBootstrap::init();

class Config
{
    public static function options()
    {
        $options = new \Iyzipay\Options();
        $options->setApiKey('HTjq7Xl7yH9qWzxqbfRIC0OsjsR1e6au');
        $options->setSecretKey('GtXWaj32VOwXukJVpBMRVhkgM0QaF6lt');
        $options->setBaseUrl('https://api.iyzipay.com');

        return $options;
    }
}
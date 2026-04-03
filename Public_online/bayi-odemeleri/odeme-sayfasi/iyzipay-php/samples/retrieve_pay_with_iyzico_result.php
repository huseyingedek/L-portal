<?php

require_once('config.php');

# create request class
$request = new \Iyzipay\Request\RetrievePayWithIyzicoRequest();
$request->setLocale(\Iyzipay\Model\Locale::TR);
$conversationId = uniqid();
$request->setConversationId("$conversationId");
$request->setToken("$token");

# make request
$payWithIyzico = \Iyzipay\Model\PayWithIyzico::retrieve($request, Config::options());

# print result
echo "<pre style='display:none;'>";
print_r($payWithIyzico);
echo "<hr>";
print_r($payWithIyzico->getStatus());
echo "</pre>";

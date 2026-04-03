<?php



# create request class
$request = new \Iyzipay\Request\CreateThreedsPaymentRequest();
$request->setLocale(\Iyzipay\Model\Locale::TR);
$request->setConversationId($orderId);
$request->setPaymentId($paymentId); // ZORUNLU
$request->setConversationData($orderData);

# make request
$threedsPayment = \Iyzipay\Model\ThreedsPayment::create($request, Config::options());

# print result
echo "<pre>";
print_r($threedsPayment);
echo "</pre>";

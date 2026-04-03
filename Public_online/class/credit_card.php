<?php 

function getFirstName($name) {
    return implode(' ', array_slice(explode(' ', $name), 0, -1));
  }
  
  function getLastName($name) {
    return array_slice(explode(' ', $name), -1)[0];
  }
  
  //iyzico kredi kartı luhn algoritması
  function luhnAlgorithm($number) {
    $number = (string)$number;
    $sum = 0;
    $length = strlen($number);
  
    for ($i = 0; $i < $length; $i++) {
        $digit = (int)$number[$length - $i - 1];
  
        if ($i % 2 === 1) {
            $digit *= 2;
  
            if ($digit > 9) {
                $digit -= 9;
            }
        }
  
        $sum += $digit;
    }
  
    return ($sum % 10 === 0);
  }

  //kart tarihi sorgu
  function isExpirationDateValid($expirationDate) {
    // Geçerli tarih
    $currentDate = new DateTime();
    
    // Verilen skt 'mm/yy' formatında
    $parts = explode('/', $expirationDate);

    if (count($parts) !== 2) {
        return false; // Geçersiz format
    }

    $month = (int)$parts[0];
    $year = (int)$parts[1];

    if ($month >= 1 && $month <= 12 && $year >= date('y')) {
        // Son kullanma tarihi şu anki tarihten ileri bir tarih mi
        $expirationDate = new DateTime("20$year-$month-01");
        return $expirationDate >= $currentDate;
    }

    return false;
}


?>
<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');

$url = 'https://pydolarve.org/api/v2/dollar?page=bcv&format_date=default&rounded_price=true';

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, 0);

$response = curl_exec($ch);
$err = curl_error($ch);
curl_close($ch);

if ($err) {
    echo json_encode(["success" => false, "message" => "Error consultando tasa"]);
} else {
    $data = json_decode($response, true);

    if (isset($data['monitors']['usd']['price'])) {
        $bcv = $data['monitors']['usd']['price'];
        echo json_encode(["bcv" => $bcv]);
    } else {
        echo json_encode(["success" => false, "message" => "Tasa no encontrada", "data" => $data]);
    }
}
?>

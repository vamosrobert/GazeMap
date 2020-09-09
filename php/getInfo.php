<?php

	$executionStartTime = microtime(true) / 1000;

	$url='https://restcountries.eu/rest/v2/name/' . $_REQUEST['name'] . '?fields=flag;languages;currencies;population;capital;name;region;subregion;latlng';

	$ch = curl_init();
	curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
	curl_setopt($ch, CURLOPT_URL, $url);

	$result=curl_exec($ch);

	curl_close($ch);
	
	
	header('Content-Type: application/json; charset=UTF-8');

	echo json_encode($result,JSON_UNESCAPED_UNICODE); 

?>
    
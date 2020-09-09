<?php

	$executionStartTime = microtime(true) / 1000;

	$url='https://tile.openweathermap.org/map/' . $_REQUEST['layer'] . '/{z}/{x}/{y}.png?appid=API KEY';

	$ch = curl_init();

	curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
	curl_setopt($ch, CURLOPT_URL, $url);

	$result=curl_exec($ch);

	curl_close($ch);
	
	
	header('Content-Type: application/json; charset=UTF-8');


	echo json_encode($result,JSON_UNESCAPED_UNICODE); 

?>
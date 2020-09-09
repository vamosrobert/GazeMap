<?php

	include('openCage/AbstractGeocoder.php');
	include('openCage/Geocoder.php');

	$geocoder = new \OpenCage\Geocoder\Geocoder('API KEY');

	$result = $geocoder->geocode($_REQUEST['q']);

	if (in_array($result['status']['code'], [401,402,403,429])) {


		$handle = curl_init('https://geocoder.ls.hereapi.com/6.2/geocode.json?searchtext=' . urlencode($_REQUEST['q']) . '&gen=9&language=' . $_POST['lang'] . '&locationattributes=tz&locationattributes=tz&apiKey=API KEY');

        curl_setopt($handle, CURLOPT_HTTPHEADER, array('Content-Type: text/plain; charset=UTF-8'));
        curl_setopt($handle, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($handle, CURLOPT_SSL_VERIFYHOST, false);
        curl_setopt($handle, CURLOPT_RETURNTRANSFER, true);
        $json_result = curl_exec($handle);

		$searchResult = [];
		$searchResult['results'] = [];

		$temp = [];

		$r = json_decode($json_result, true);

		foreach ($r['Response']['View'][0]['Result'] as $result) {

			$temp['source'] = 'here';
			$temp['formatted'] = $result['Location']['Address']['Label'];
			$temp['geometry']['lat'] = $result['Location']['DisplayPosition']['Latitude'];
			$temp['geometry']['lng'] = $result['Location']['DisplayPosition']['Longitude'];
			$temp['countryCode'] = getCountryCode($result['Location']['Address']['Country']);
			$temp['timezone'] = $result['Location']['AdminInfo']['TimeZone']['id'];

			array_push($searchResult['results'], $temp);

		}

	} else {

		$searchResult = [];
		$searchResult['results'] = [];

		$temp = [];

		foreach ($result['results'] as $entry) {

			$temp['source'] = 'opencage';
			$temp['formatted'] = $entry['formatted'];
			$temp['geometry']['lat'] = $entry['geometry']['lat'];
			$temp['geometry']['lng'] = $entry['geometry']['lng'];
			$temp['countryCode'] = strtoupper($entry['components']['country_code']);
			$temp['timezone'] = $entry['annotations']['timezone']['name'];

			array_push($searchResult['results'], $temp);

		}

	}

	header('Content-Type: application/json; charset=UTF-8');

	
	echo json_encode($searchResult, JSON_UNESCAPED_UNICODE);

	

<?php
// define variable and set to empty value
$email = "";

if ($_SERVER["REQUEST_METHOD"] == "POST") {
  $email = test_input($_POST["email"]);
}

function test_input($x) {
  $x = trim($x);
  $x = stripslashes($x);
  // $x = htmlspecialchars($x);
  //I commented out that line since it was adding all these special characters and messing up my JSON file... but does it present a security threat to leave it out?
  return $x;
}


//Thank you to this post for help with reading JSON with php: http://stackoverflow.com/questions/19758954/get-data-from-json-file-with-php

//(Replace this file path with the real path when I upload it to the server)
$str = file_get_contents('http://localhost/TimePositive/scripts/treasure/users.js');

$json = json_decode($str, true); // decode the JSON into an associative array

$emailExists = false;

foreach ($json['users'] as $value) {
	if($email == $value){
		$emailExists = true;
		break;
	}
}

if($emailExists){
	echo 1;
}else{
	echo 0;
}
	

?>

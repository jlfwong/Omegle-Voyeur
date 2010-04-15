<?
include_once('simple_curl.php');
include_once('json.php');
$payload = "";
$page = "";
foreach ($_GET as $key=>$value) {
	if ($value == "") {
		$page = $key;	
	} else {
		$payload .= "$key=$value&";
	}
}
if (strlen($payload)) {
	$payload = substr($payload,0,-1);
}

print simple_post("omegle.com/$page",$payload);
?>

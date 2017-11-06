$APIKey = "Yo1WagtLBh9gUOUEaCo0q5zszsDrwjRA"
$xapikey = "d4b36f3ad624774367782985eea8d4cca6be7ac9177e70e5a158924c5a1c2e792f5a589c6ecead43a14357a10ff0d657"
$resource = "http://shaubtest002.shared.gkn.com/arrow-eolmig/api/account/setext2"

$head = New-Object "System.Collections.Generic.Dictionary[[String],[String]]"
$head = @{}
$head.Add("APIKey",$APIKey)
$head.Add("x-api-key",$xapikey)

while ($true) {
	"$(Get-Date -Format G): Searching for Queued tasks ...."

	$result = Invoke-RestMethod -Method Get -Uri $resource -Header $head 

	foreach($r in $result.result) {
		$dn = $r.parameter1
        $status = $r.status
        if ($status -eq "Queued") {
			"$(Get-Date -Format G): Found task for $dn ...."

			Set-ADUser -Server smaubdc001.sinter.gkn.com -Identity $dn -Clear "extensionAttribute2"
            Set-ADUser -Server smaubdc001.sinter.gkn.com -Identity $dn -Add @{"extensionAttribute2"="eolmig"}
	
			$test = Get-ADUser -Server smaubdc001.sinter.gkn.com -Identity $dn -Properties * | Select -ExpandProperty extensionAttribute2
			if ($test -eq "eolmig") {
				"$(Get-Date -Format G): Successfully updated $dn ...."

				$t = @{
					dn = $dn
				    status = "Completed"
				}
				$json = $t | ConvertTo-Json

				$response = Invoke-RestMethod -Uri $resource -Method PUT -Header $head -Body $json -ContentType "application/json"				
			} else {
				"$(Get-Date -Format G): Failed to update $dn ...."

				$t = @{
					dn = $dn
				    status = "Failed"
				}
				$json = $t | ConvertTo-Json

				$response = Invoke-RestMethod -Uri $resource -Method PUT -Header $head -Body $json -ContentType "application/json"
			}
		}
	}

	"$(Get-Date -Format G): Waiting ...."
	Start-Sleep -s 30
}
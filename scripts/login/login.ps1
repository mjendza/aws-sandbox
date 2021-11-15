
$secrets = Get-Content 'my-tenant.json.secret' | Out-String | ConvertFrom-Json

$result = aws cognito-idp admin-initiate-auth --cli-input-json file://login-data.json.secret
$authData = $result| Out-String | ConvertFrom-Json

# $getId = Get-Content 'get-id.json.secret' | Out-String | ConvertFrom-Json
# $getId.Logins[0]."${secrets.Provider}"=$authData.AuthenticationResult.IdToken
# ConvertTo-Json $getId | Out-File -FilePath .\get-id.json.generated.secret
$provider = $secrets.Provider
$idToken = $authData.AuthenticationResult.IdToken
$token = "$provider=$idToken"

$identityId = aws cognito-identity get-id --account-id $secrets.AccountId --identity-pool-id $secrets.PoolId --logins $token | Out-String | ConvertFrom-Json
# aws cognito-identity get-id --cli-input-json  file://get-id.json.generated.secret

# $getCredentials = Get-Content 'get-credentials-for-identity.json.secret' | Out-String | ConvertFrom-Json
# $getCredentials.IdentityId = $identityId.IdentityId
# $getCredentials.Logins[0]."${secrets.Provider}"=$authData.AuthenticationResult.IdToken
# ConvertTo-Json $getCredentials | Out-File -FilePath .\get-credentials-for-identity.json.generated.secret

#aws cognito-identity get-credentials-for-identity --cli-input-json file://get-credentials-for-identity.json.generated.secret
aws cognito-identity get-credentials-for-identity --identity-id $identityId.IdentityId --logins $token
#list user pools
aws cognito-idp list-user-pools --max-results 20

#list identity pools
aws cognito-identity list-identity-pools --max-results 20
# get providers
aws cognito-idp list-identity-providers --USER-POOL-Id PUT_ID_HERE


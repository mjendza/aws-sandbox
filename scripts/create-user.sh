aws cognito-idp admin-create-user --cli-input-json file://user-data.json
  # admin-create-user \
  # --user-pool-id eu-west-1_le5fWIsd3 \
  # --username dlopezp \
  # --user-attributes Name=email,Value=swgoh.dlopez@gmail.com Name=custom:role,Value='"Admin"' Name=email_verified,Value=True \
  # --desired-delivery-mediums EMAIL \
  # --profile vortice
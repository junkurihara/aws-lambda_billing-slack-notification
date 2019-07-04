#!/bin/bash

PROFILE=${1:-default}

echo "update lambda for daily-billing-notification with profile ${PROFILE}"

aws lambda update-function-code --zip-file fileb://${FILE_LAMBDA_ZIP} \
 --function-name ${LAMBDA_FUNC_NAME} \
 --publish \
 --region ap-northeast-1 \
 --profile ${PROFILE}

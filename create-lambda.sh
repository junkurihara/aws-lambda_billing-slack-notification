#!/bin/bash

PROFILE=${1:-default}

echo "upload lambda for daily-billing-notification with profile ${PROFILE}"

aws lambda create-function --zip-file fileb://${FILE_LAMBDA_ZIP} \
 --function-name ${LAMBDA_FUNC_NAME} \
 --runtime ${RUNTIME} \
 --role ${ROLE_ARN} \
 --handler ${HANDLER} \
 --timeout ${TIMEOUT} \
 --memory-size ${MEMORY} \
 --publish \
 --region ap-northeast-1 \
 --profile ${PROFILE}

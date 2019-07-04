#!/bin/bash

PROFILE=${1:-default}

echo "create role for lambda with profile ${PROFILE}"


aws iam create-role --role-name ${ROLE_NAME} --assume-role-policy-document file://role-policy.json --profile ${PROFILE}
aws iam get-role --role-name ${ROLE_NAME} --profile ${PROFILE}

aws iam attach-role-policy --role-name ${ROLE_NAME} --policy-arn "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole" --profile ${PROFILE}
aws iam attach-role-policy --role-name ${ROLE_NAME} --policy-arn "arn:aws:iam::aws:policy/CloudWatchReadOnlyAccess" --profile ${PROFILE}
aws iam list-attached-role-policies --role-name ${ROLE_NAME} --profile ${PROFILE}

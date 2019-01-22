#!/bin/bash

set -e

sam build 
sam package --output-template-file packaged.yaml \
            --s3-bucket "wogi-deployment-artifact"

sam deploy --template-file packaged.yaml \
            --stack-name "wogi-api" \
            --capabilities CAPABILITY_IAM \
            --region ap-southeast-1
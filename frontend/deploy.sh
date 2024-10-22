# Set up variables
STACK_NAME=huonglanto-final-stack-fe
REGION=us-east-1
CLI_PROFILE=myprofile

S3_BUCKET_NAME=huonglanto-final-bucket-fe  # Replace this with your bucket name
FOLDER_TO_COPY=build  # The folder you want to copy (the frontend build output)

# Deploy CloudFormation template
echo -e "\n\n=========== Deploying CloudFormation stack ==========="
aws cloudformation deploy \
  --region $REGION \
  --profile $CLI_PROFILE \
  --stack-name $STACK_NAME \
  --template-file cloudformation-fe.yaml \
  --no-fail-on-empty-changeset \
  --capabilities CAPABILITY_NAMED_IAM \
  --parameter-overrides S3BucketName=$S3_BUCKET_NAME

if [ $? -eq 0 ]; then
  echo -e "\n\n=========== CloudFormation deployment successful! ==========="

  # Uploading the frontend build to the S3 bucket
  echo -e "\n\n=========== Uploading $FOLDER_TO_COPY to S3 bucket ==========="
  aws s3 cp $FOLDER_TO_COPY/ s3://$S3_BUCKET_NAME/ --recursive --profile $CLI_PROFILE

  # Fetch and show the CloudFront URL from CloudFormation stack outputs
  echo -e "\n\n=========== Fetching CloudFront URL ==========="
  aws cloudformation list-exports \
    --profile $CLI_PROFILE \
    --query "Exports[?Name=='CloudFrontURL'].Value"

else
  echo "CloudFormation deployment failed!"
  exit 1
fi

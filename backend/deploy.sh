# Set up variables
STACK_NAME=huonglanto-final-stack-be
REGION=us-east-1
CLI_PROFILE=myprofile

TEMPLATE_FILE=cloudformation-be.yaml
API_BUCKET_NAME="huonglanto-final-bucket-apis"
FOLDER_TO_UPLOAD="zip"  

# Check if the S3 bucket already exists
echo -e "\n\n=========== Checking if S3 bucket $API_BUCKET_NAME exists ==========="
if aws s3api head-bucket --bucket "$API_BUCKET_NAME" 2>/dev/null; then
  echo "S3 bucket $API_BUCKET_NAME already exists."
else
  echo "S3 bucket $API_BUCKET_NAME does not exist. Creating it..."

    aws s3api create-bucket \
      --bucket $API_BUCKET_NAME \
      --region $REGION \
      --profile $CLI_PROFILE

  if [ $? -eq 0 ]; then
    echo "S3 bucket $API_BUCKET_NAME created successfully!"
  else
    echo "Failed to create S3 bucket. Exiting..."
    exit 1
  fi
fi

# Upload apis zip to S3 bucket
echo -e "\n\n=========== Uploading $FOLDER_TO_UPLOAD to S3 bucket ==========="
aws s3 cp $FOLDER_TO_UPLOAD/ s3://$API_BUCKET_NAME/ --recursive --profile $CLI_PROFILE

# Deploy CloudFormation template
echo -e "\n\n=========== Deploying CloudFormation stack ==========="
aws cloudformation deploy \
  --region $REGION \
  --profile $CLI_PROFILE \
  --stack-name $STACK_NAME \
  --template-file $TEMPLATE_FILE \
  --no-fail-on-empty-changeset \
  --capabilities CAPABILITY_NAMED_IAM \
  --parameter-overrides APIBucket=$API_BUCKET_NAME

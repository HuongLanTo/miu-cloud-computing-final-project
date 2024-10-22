import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3 = new S3Client({ region: "us-east-1" });
const dynamoDB = new DynamoDBClient({ region: "us-east-1" });

const DYNAMODB_TABLE_NAME = process.env.DYNAMODB_TABLE_NAME;

export const handler = async (event) => {
  try {
    const { filename, contentType, email, password, profileName } = JSON.parse(
      event.body
    );
    const bucketName = process.env.BUCKET_NAME;

    const uploadParams = {
      Bucket: bucketName,
      Key: filename,
      ContentType: contentType,
    };
    const command = new PutObjectCommand(uploadParams);
    const uploadURL = await getSignedUrl(s3, command, { expiresIn: 60 });

    const timestamp = new Date().toISOString();
    const item = {
      email: { S: email },
      password: { S: password },
      profileName: { S: profileName },
      imageUrl: { S: `https://${bucketName}.s3.amazonaws.com/${filename}` },
      datetime: { S: timestamp },
    };

    await dynamoDB.send(
      new PutItemCommand({
        TableName: DYNAMODB_TABLE_NAME,
        Item: item,
      })
    );

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST",
        "Access-Control-Allow-Headers": "Content-Type",
      },
      body: JSON.stringify({ uploadURL }),
    };
  } catch (error) {
    console.error("Error:", error);
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST",
        "Access-Control-Allow-Headers": "Content-Type",
      },
      body: JSON.stringify({ error: error.message }),
    };
  }
};

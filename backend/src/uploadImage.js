import { DynamoDBClient, UpdateItemCommand } from "@aws-sdk/client-dynamodb";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import jwt from "jsonwebtoken";

const awsRegion = "us-east-1";
const userTable = process.env.DYNAMODB_TABLE_NAME;
const jwtSecret = process.env.JWT_SECRET;
const bucketName = process.env.BUCKET_NAME;

const s3 = new S3Client({ region: awsRegion });
const dynamoDB = new DynamoDBClient({ region: awsRegion });

export const handler = async (event) => {
  const token = event.headers.Authorization.split(" ")[1];

  try {
    const decoded = jwt.verify(token, jwtSecret);
    const userEmail = decoded.email;

    const { fileName, contentType } = JSON.parse(event.body);
    const imageKey = fileName;

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: imageKey,
      ContentType: contentType,
    });

    const preSignedUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });

    const updateParams = {
      TableName: userTable,
      Key: {
        email: { S: userEmail },
      },
      UpdateExpression: "SET imageUrl = :newImage",
      ExpressionAttributeValues: {
        ":newImage": {
          S: `https://${bucketName}.s3.amazonaws.com/${fileName}`,
        },
      },
    };

    await dynamoDB.send(new UpdateItemCommand(updateParams));

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "PUT",
        "Access-Control-Allow-Headers": "Content-Type",
      },
      body: JSON.stringify({ preSignedUrl }),
    };
  } catch (error) {
    console.error("Error updating profile image:", error);
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "PUT",
        "Access-Control-Allow-Headers": "Content-Type",
      },
      body: JSON.stringify({ message: "Internal server error" }),
    };
  }
};

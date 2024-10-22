import { S3Client } from "@aws-sdk/client-s3";
import { DynamoDBClient, GetItemCommand } from "@aws-sdk/client-dynamodb";
import jwt from "jsonwebtoken";

const s3 = new S3Client({ region: "us-east-1" });
const dynamoDB = new DynamoDBClient({ region: "us-east-1" });

const DYNAMODB_TABLE_NAME = process.env.DYNAMODB_TABLE_NAME;
const JWT_SECRET = process.env.JWT_SECRET;

const generateToken = (email) => {
  return jwt.sign({ email }, JWT_SECRET, { expiresIn: "1h" });
};

export const handler = async (event) => {
  try {
    const { email, password } = JSON.parse(event.body);

    const getUserParams = {
      TableName: DYNAMODB_TABLE_NAME,
      Key: {
        email: { S: email },
      },
      ProjectionExpression: "profileName, email, imageUrl, password",
    };

    const userResult = await dynamoDB.send(new GetItemCommand(getUserParams));

    console.log(userResult.Item);

    if (!userResult.Item) {
      return {
        statusCode: 401,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST",
          "Access-Control-Allow-Headers": "Content-Type",
        },
        body: JSON.stringify({ error: "1: Invalid email or password." }),
      };
    }

    const storedPassword = userResult.Item.password.S;

    if (storedPassword !== password) {
      return {
        statusCode: 401,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST",
          "Access-Control-Allow-Headers": "Content-Type",
        },
        body: JSON.stringify({ error: "2: Invalid email or password." }),
      };
    }

    const token = generateToken(email);

    // Login successful
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST",
        "Access-Control-Allow-Headers": "Content-Type",
      },
      body: JSON.stringify({ message: "Login successful.", token }),
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
      body: JSON.stringify({ error: "login failed" + error.message }),
    };
  }
};

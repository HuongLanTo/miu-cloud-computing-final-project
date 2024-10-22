import { DynamoDBClient, GetItemCommand } from "@aws-sdk/client-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";
import jwt from "jsonwebtoken";

const awsRegion = "us-east-1";
const userTable = process.env.DYNAMODB_TABLE_NAME;
const jwtSecret = process.env.JWT_SECRET;

const dynamoDB = new DynamoDBClient({ region: awsRegion });

export const handler = async (event) => {
  const token = event.headers.Authorization.split(" ")[1];

  try {
    const decoded = jwt.verify(token, jwtSecret);
    const userEmail = decoded.email;

    const params = {
      TableName: userTable,
      Key: {
        email: { S: userEmail },
      },
    };

    const { Item } = await dynamoDB.send(new GetItemCommand(params));
    if (!Item) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: "User not found" }),
      };
    }

    const userData = unmarshall(Item);

    const responseBody = {
      profileName: userData.profileName,
      email: userData.email,
      imageUrl: userData.imageUrl,
    };

    const response = {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Allow-Methods": "OPTIONS, POST, GET",
      },
      body: JSON.stringify(responseBody),
    };

    return response;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    const errorResponse = { message: "Internal Server Error" };
    const response = {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Allow-Methods": "OPTIONS, POST, GET",
      },
      body: JSON.stringify(errorResponse),
    };
    return response;
  }
};

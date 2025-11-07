import type { Context, Config } from "@netlify/functions";
import serverless from "serverless-http";
import app from "../../src/app.js";

// Create serverless handler from Express app
const handler = serverless(app);

interface ServerlessResponse {
  statusCode: number;
  headers: Record<string, string>;
  body: string;
  isBase64Encoded?: boolean;
}

export default async (req: Request, context: Context) => {
  try {
    // Convert Netlify Request to Node.js-compatible format for serverless-http
    const url = new URL(req.url);
    const event = {
      httpMethod: req.method,
      path: url.pathname,
      queryStringParameters: Object.fromEntries(url.searchParams),
      headers: Object.fromEntries(req.headers.entries()),
      body: req.method !== "GET" && req.method !== "HEAD" ? await req.text() : null,
      isBase64Encoded: false,
    };

    const lambdaContext = {
      callbackWaitsForEmptyEventLoop: false,
      functionName: "api",
      functionVersion: "$LATEST",
      invokedFunctionArn: "",
      memoryLimitInMB: "1024",
      awsRequestId: context.requestId || Math.random().toString(36),
      logGroupName: "",
      logStreamName: "",
      getRemainingTimeInMillis: () => 30000,
      done: () => {},
      fail: () => {},
      succeed: () => {},
    };

    // Call the serverless handler
    const result = await handler(event, lambdaContext) as ServerlessResponse;

    // Convert response back to Netlify format
    return new Response(result.body, {
      status: result.statusCode,
      headers: result.headers,
    });

  } catch (error) {
    console.error("API Error:", error);
    
    return new Response(JSON.stringify({ 
      error: "Internal Server Error",
      message: error instanceof Error ? error.message : "Unknown error"
    }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }
};

export const config: Config = {
  path: "/api/*",
};
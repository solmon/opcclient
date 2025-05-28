import { NextResponse } from 'next/server';
import { 
  OPCUAClient, 
  MessageSecurityMode, 
  SecurityPolicy, 
  ClientSession, 
  UserTokenType 
} from 'node-opcua';
import { createLogger } from '@/lib/logger';

const logger = createLogger('OPC-API');

// Store active sessions
const activeSessions: Map<string, {
  client: OPCUAClient,
  session: ClientSession,
  endpointUrl: string
}> = new Map();

export async function POST(request: Request) {
  try {
    const { id, endpointUrl, useAnonymous, username, password } = await request.json();

    // Validate input
    if (!id || !endpointUrl) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    logger.info(`Connecting to OPC server at ${endpointUrl}`);

    // Create OPC UA client
    const client = OPCUAClient.create({
      applicationName: "OPC Client Web App",
      connectionStrategy: {
        initialDelay: 1000,
        maxRetry: 3
      },
      securityMode: MessageSecurityMode.None,
      securityPolicy: SecurityPolicy.None,
      endpointMustExist: false
    });

    try {
      // Connect to endpoint
      await client.connect(endpointUrl);
      logger.info(`Successfully connected to endpoint ${endpointUrl}`);

      // Create session
      let session;
      if (useAnonymous) {
        logger.info('Using anonymous authentication');
        session = await client.createSession();
      } else {
        logger.info(`Authenticating with username: ${username}`);
        session = await client.createSession({
          type: UserTokenType.UserName,
          userName: username,
          password: password
        });
      }

      // Store session for later use
      activeSessions.set(id, {
        client,
        session,
        endpointUrl
      });

      logger.info(`Successfully created session with id ${id}`);

      return NextResponse.json({ 
        success: true, 
        message: 'Connected to OPC server' 
      });
    } catch (error: any) {
      logger.error(`Connection error: ${error.message}`);
      
      // Try to disconnect client if it was connected
      try {
        await client.disconnect();
      } catch (disconnectError) {
        logger.error(`Error during disconnect: ${disconnectError}`);
      }

      // Determine error type
      let errorMessage = error.message || 'Unknown error';
      let statusCode = 500;
      
      if (errorMessage.includes('timed out') || errorMessage.includes('ECONNREFUSED')) {
        errorMessage = `Connection refused: ${errorMessage}`;
        statusCode = 503;
      } else if (errorMessage.includes('authentication') || errorMessage.includes('credentials')) {
        errorMessage = `Authentication failed: ${errorMessage}`;
        statusCode = 401;
      }

      return NextResponse.json(
        { error: errorMessage },
        { status: statusCode }
      );
    }
  } catch (error: any) {
    logger.error(`Request processing error: ${error.message}`);
    return NextResponse.json(
      { error: `Server error: ${error.message}` },
      { status: 500 }
    );
  }
}

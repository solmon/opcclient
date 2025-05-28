import { NextResponse } from 'next/server';
import { createLogger } from '@/lib/logger';

const logger = createLogger('OPC-API-Disconnect');

// This is a reference to the same Map used in the connect route
// In a production app, this should be replaced with a proper session store
declare global {
  var activeSessions: Map<string, any> | undefined;
}

if (!global.activeSessions) {
  global.activeSessions = new Map();
}

const activeSessions = global.activeSessions;

export async function POST(request: Request) {
  try {
    const { id } = await request.json();

    // Validate input
    if (!id) {
      return NextResponse.json(
        { error: 'Missing server ID' },
        { status: 400 }
      );
    }

    logger.info(`Disconnecting from OPC server with ID ${id}`);

    // Check if session exists
    const sessionData = activeSessions.get(id);
    if (!sessionData) {
      logger.warn(`No active session found for ID ${id}`);
      return NextResponse.json({ 
        success: true, 
        message: 'No active session to disconnect' 
      });
    }

    try {
      // Close session and disconnect
      const { client, session } = sessionData;
      
      logger.info(`Closing session for ID ${id}`);
      await session.close();
      
      logger.info(`Disconnecting client for ID ${id}`);
      await client.disconnect();
      
      // Remove from active sessions
      activeSessions.delete(id);
      
      logger.info(`Successfully disconnected from OPC server with ID ${id}`);
      return NextResponse.json({ 
        success: true, 
        message: 'Disconnected from OPC server' 
      });
    } catch (error: any) {
      logger.error(`Error during disconnect: ${error.message}`);
      
      // Clean up the session entry even if there was an error
      activeSessions.delete(id);
      
      return NextResponse.json(
        { error: `Disconnect error: ${error.message}` },
        { status: 500 }
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

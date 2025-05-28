import { NextResponse } from 'next/server';
import { createLogger } from '@/lib/logger';

const logger = createLogger('OPC-API-Read');

// Reference to global active sessions
declare global {
  var activeSessions: Map<string, any> | undefined;
}

if (!global.activeSessions) {
  global.activeSessions = new Map();
}

const activeSessions = global.activeSessions;

export async function POST(request: Request) {
  try {
    const { id, nodeId } = await request.json();

    // Validate input
    if (!id || !nodeId) {
      return NextResponse.json(
        { error: 'Missing server ID or nodeId' },
        { status: 400 }
      );
    }

    logger.info(`Reading value from node ${nodeId} for server ID ${id}`);

    // Check if session exists
    const sessionData = activeSessions.get(id);
    if (!sessionData) {
      logger.error(`No active session found for ID ${id}`);
      return NextResponse.json(
        { error: 'Server not connected' },
        { status: 404 }
      );
    }

    try {
      const { session } = sessionData;
      
      // Read the node value
      const dataValue = await session.read({
        nodeId: nodeId,
        attributeId: 13 // Value attribute
      });

      if (dataValue.statusCode.isGood()) {
        const value = dataValue.value.value;
        logger.info(`Successfully read value from node ${nodeId}: ${value}`);
        
        return NextResponse.json({ 
          success: true,
          value: value,
          dataType: dataValue.value.dataType,
          timestamp: dataValue.serverTimestamp
        });
      } else {
        logger.error(`Read failed with status code: ${dataValue.statusCode.toString()}`);
        return NextResponse.json(
          { error: `Read failed: ${dataValue.statusCode.toString()}` },
          { status: 400 }
        );
      }
    } catch (error: any) {
      logger.error(`Error reading node value: ${error.message}`);
      return NextResponse.json(
        { error: `Read error: ${error.message}` },
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

import { NextResponse } from 'next/server';
import { DataType, Variant } from 'node-opcua';
import { createLogger } from '@/lib/logger';

const logger = createLogger('OPC-API-Write');

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
    const { id, nodeId, value, dataType = 'Double' } = await request.json();

    // Validate input
    if (!id || !nodeId || value === undefined) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    logger.info(`Writing value ${value} to node ${nodeId} for server ID ${id}`);

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
      
      // Create variant with the correct data type
      let variant;
      try {
        variant = new Variant({
          dataType: DataType[dataType as keyof typeof DataType],
          value: value
        });
      } catch (error: any) {
        logger.error(`Error creating variant: ${error.message}`);
        return NextResponse.json(
          { error: `Invalid data type or value: ${error.message}` },
          { status: 400 }
        );
      }

      // Write the value
      const statusCode = await session.write({
        nodeId: nodeId,
        attributeId: 13, // Value attribute
        value: {
          value: variant
        }
      });

      if (statusCode.isGood()) {
        logger.info(`Successfully wrote value to node ${nodeId}`);
        return NextResponse.json({ 
          success: true,
          message: 'Value written successfully'
        });
      } else {
        logger.error(`Write failed with status code: ${statusCode.toString()}`);
        return NextResponse.json(
          { error: `Write failed: ${statusCode.toString()}` },
          { status: 400 }
        );
      }
    } catch (error: any) {
      logger.error(`Error writing node value: ${error.message}`);
      return NextResponse.json(
        { error: `Write error: ${error.message}` },
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

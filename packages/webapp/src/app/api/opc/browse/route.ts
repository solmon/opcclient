import { NextResponse } from 'next/server';
import { BrowseDirection, ReferenceTypeIds } from 'node-opcua';
import { createLogger } from '@/lib/logger';

const logger = createLogger('OPC-API-Browse');

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
    const { id, nodeId = 'i=84' /* Objects folder */ } = await request.json();

    // Validate input
    if (!id) {
      return NextResponse.json(
        { error: 'Missing server ID' },
        { status: 400 }
      );
    }

    logger.info(`Browsing node ${nodeId} for server ID ${id}`);

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
      
      // Browse the node
      const browseResult = await session.browse({
        nodeId: nodeId,
        browseDirection: BrowseDirection.Forward,
        includeSubtypes: true,
        nodeClassMask: 0, // All node classes
        resultMask: 63 // All fields
      });

      if (browseResult.statusCode.isGood()) {
        const references = browseResult.references || [];
        
        // Process references
        const nodes = await Promise.all(references.map(async (ref) => {
          // Get additional information for each node
          const nodeInfo = await session.read({
            nodeId: ref.nodeId.toString(),
            attributeId: 13 // Description attribute
          });

          return {
            nodeId: ref.nodeId.toString(),
            browseName: ref.browseName.name,
            displayName: ref.displayName.text,
            nodeClass: ref.nodeClass.toString(),
            description: nodeInfo.value?.value?.text || ''
          };
        }));

        logger.info(`Successfully browsed node ${nodeId}, found ${nodes.length} references`);
        return NextResponse.json({ 
          success: true,
          nodes
        });
      } else {
        logger.error(`Browse failed with status code: ${browseResult.statusCode.toString()}`);
        return NextResponse.json(
          { error: `Browse failed: ${browseResult.statusCode.toString()}` },
          { status: 400 }
        );
      }
    } catch (error: any) {
      logger.error(`Error browsing node: ${error.message}`);
      return NextResponse.json(
        { error: `Browse error: ${error.message}` },
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

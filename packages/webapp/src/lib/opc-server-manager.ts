import { OPCClient } from '@/lib/opc-client'
import { Server, ServerObjectModel, ServerNode } from '@/types/server'
import { createLogger } from '@/lib/logger'

// Create a logger specifically for OPC server operations
const logger = createLogger('OPCServerManager')

/**
 * OPC server connection manager
 */
export class OPCServerManager {
  private clients: Map<string, OPCClient> = new Map()
  private connectionStatus: Map<string, 'connected' | 'disconnected' | 'error'> = new Map()

  /**
   * Connect to an OPC server
   */
  async connectToServer(server: Server): Promise<void> {
    try {
      logger.info(`Connecting with server ${server.name}`)
      // Update connection status to indicate we're trying to connect
      this.connectionStatus.set(server.id, 'disconnected')
      
      const client = new OPCClient({ endpointUrl: server.endpointUrl })
      
      if (server.useAnonymous) {
        // Use anonymous authentication
        await client.connectAnonymous()
      } else {
        // Use username/password authentication
        await client.connect(server.username || '', server.password || '')
      }
      
      this.clients.set(server.id, client)
      this.connectionStatus.set(server.id, 'connected')
      
      logger.info(`Successfully connected to server ${server.name}`)
    } catch (error) {
      logger.error(`Error connecting to server ${server.name}:`, error)
      this.connectionStatus.set(server.id, 'error')
      throw error
    }
  }

  /**
   * Disconnect from an OPC server
   */
  async disconnectFromServer(serverId: string): Promise<void> {
    const client = this.clients.get(serverId)
    if (client) {
      await client.disconnect()
      this.clients.delete(serverId)
      this.connectionStatus.set(serverId, 'disconnected')
    }
  }
  
  /**
   * Get the connection status for a server
   */
  getConnectionStatus(serverId: string): 'connected' | 'disconnected' | 'error' | undefined {
    return this.connectionStatus.get(serverId)
  }

  /**
   * Get object model for an OPC server
   */
  async getObjectModel(server: Server): Promise<ServerObjectModel> {
    try {
      // Connect to server if not already connected
      if (!this.clients.has(server.id)) {
        await this.connectToServer(server)
      }
      
      const client = this.clients.get(server.id)
      if (!client) {
        throw new Error(`Client not found for server ${server.name}`)
      }

      // Browse the root Objects folder (i=84) using the actual client implementation
      logger.info(`Browsing root Objects folder for server ${server.name}`);
      
      // Get root nodes
      const rootNodes = await this.browseNodes(client, 'i=84', 1);
      
      logger.info(`Retrieved ${rootNodes.length} root nodes from server ${server.name}`);
      
      return {
        serverId: server.id,
        serverName: server.name,
        rootNodes
      }
    } catch (error) {
      logger.error(`Error getting object model for server ${server.name}:`, error)
      throw error
    }
  }

  /**
   * Browse nodes recursively up to specified depth
   */
  private async browseNodes(client: OPCClient, nodeId: string, maxDepth: number, currentDepth: number = 0): Promise<ServerNode[]> {
    try {
      const nodes = await client.browseNode(nodeId);
      
      // Process the nodes into our expected format
      const serverNodes: ServerNode[] = await Promise.all(
        nodes.map(async (node: any): Promise<ServerNode> => {
          // Only browse children if we haven't reached the max depth
          let children: ServerNode[] = [];
          
          // Only browse children for objects, not variables or other node types
          const shouldBrowseChildren = 
            currentDepth < maxDepth && 
            (node.nodeClass === 'Object' || node.nodeClass === 'ObjectType' || node.nodeClass === 'Folder');
            
          if (shouldBrowseChildren) {
            logger.debug(`Browsing children of node ${node.nodeId} (${node.browseName})`);
            children = await this.browseNodes(client, node.nodeId, maxDepth, currentDepth + 1);
          }
          
          return {
            nodeId: node.nodeId,
            browseName: node.browseName,
            displayName: node.displayName,
            description: node.description || '',
            nodeClass: node.nodeClass,
            children
          };
        })
      );
      
      return serverNodes;
    } catch (error) {
      logger.error(`Error browsing node ${nodeId}: ${error}`);
      return [];
    }
  }

  /**
   * Browse a specific node to get its children
   */
  async browseNode(serverId: string, nodeId: string): Promise<ServerNode[]> {
    const client = this.clients.get(serverId);
    if (!client) {
      throw new Error(`No client found for server ${serverId}`);
    }
    
    return this.browseNodes(client, nodeId, 1);
  }

  /**
   * Disconnect from all servers
   */
  async disconnectAll(): Promise<void> {
    const promises = Array.from(this.clients.keys()).map(
      serverId => this.disconnectFromServer(serverId)
    )
    await Promise.all(promises)
  }
}

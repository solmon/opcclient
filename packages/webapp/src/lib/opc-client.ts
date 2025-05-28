'use client'

import { createLogger } from '@/lib/logger'

/**
 * OPC UA client using API endpoints to communicate with the OPC server
 */
export class OPCClient {
  private endpointUrl: string;
  private connected: boolean = false;
  private connectionType: 'anonymous' | 'username' = 'username';
  private serverId: string | null = null;
  private logger = createLogger('OPCClient');

  constructor(options: { endpointUrl: string }) {
    this.endpointUrl = options.endpointUrl;
    this.logger.info(`OPC Client created for endpoint: ${this.endpointUrl}`);
  }

  /**
   * Connect to OPC server using anonymous authentication
   */
  async connectAnonymous(): Promise<boolean> {
    this.logger.info(`Connecting anonymously to ${this.endpointUrl}`);
    this.connectionType = 'anonymous';
    
    return this.connectToServer({
      useAnonymous: true
    });
  }

  /**
   * Connect to OPC server using username and password
   */
  async connect(username: string, password: string): Promise<boolean> {
    this.logger.info(`Connecting to ${this.endpointUrl} with username: ${username}`);
    this.connectionType = 'username';
    
    return this.connectToServer({
      useAnonymous: false,
      username,
      password
    });
  }

  /**
   * Internal method to handle server connection
   */
  private async connectToServer(options: {
    useAnonymous: boolean;
    username?: string;
    password?: string;
  }): Promise<boolean> {
    try {
      // Generate a unique ID for this connection if not already set
      if (!this.serverId) {
        this.serverId = crypto.randomUUID();
      }

      const response = await fetch('/api/opc/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: this.serverId,
          endpointUrl: this.endpointUrl,
          ...options
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMsg = data.error || 'Unknown error occurred';
        this.logger.error(`Connection failed: ${errorMsg}`);
        throw new Error(errorMsg);
      }

      this.connected = true;
      this.logger.info(`Connected successfully to ${this.endpointUrl}`);
      return true;
    } catch (error: any) {
      this.connected = false;
      if (error instanceof Error) {
        throw error;
      } else {
        throw new Error(`Failed to connect: ${error}`);
      }
    }
  }

  /**
   * Disconnect from OPC server
   */
  async disconnect(): Promise<boolean> {
    if (!this.serverId) {
      this.logger.warn('No active connection to disconnect');
      return true;
    }

    try {
      const response = await fetch('/api/opc/disconnect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: this.serverId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMsg = data.error || 'Unknown error occurred';
        this.logger.error(`Disconnect failed: ${errorMsg}`);
        throw new Error(errorMsg);
      }

      this.connected = false;
      this.logger.info(`Disconnected from ${this.endpointUrl}`);
      return true;
    } catch (error: any) {
      this.logger.error(`Error during disconnect: ${error.message}`);
      this.connected = false; // Consider it disconnected even if there was an error
      throw error;
    }
  }

  /**
   * Read a value from a node
   */
  async readValue(nodeId: string): Promise<any> {
    if (!this.serverId || !this.connected) {
      throw new Error('Not connected to server');
    }

    try {
      const response = await fetch('/api/opc/read', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: this.serverId,
          nodeId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMsg = data.error || 'Unknown error occurred';
        this.logger.error(`Read value failed: ${errorMsg}`);
        throw new Error(errorMsg);
      }

      this.logger.info(`Read value from ${nodeId}: ${data.value}`);
      return data.value;
    } catch (error: any) {
      this.logger.error(`Error reading value: ${error.message}`);
      throw error;
    }
  }

  /**
   * Write a value to a node
   */
  async writeValue(nodeId: string, value: any, dataType: string = 'Double'): Promise<boolean> {
    if (!this.serverId || !this.connected) {
      throw new Error('Not connected to server');
    }

    try {
      const response = await fetch('/api/opc/write', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: this.serverId,
          nodeId,
          value,
          dataType
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMsg = data.error || 'Unknown error occurred';
        this.logger.error(`Write value failed: ${errorMsg}`);
        throw new Error(errorMsg);
      }

      this.logger.info(`Wrote value ${value} to ${nodeId}`);
      return true;
    } catch (error: any) {
      this.logger.error(`Error writing value: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Browse nodes from a given node ID
   */
  async browseNode(nodeId: string = 'i=84') {
    if (!this.serverId || !this.connected) {
      throw new Error('Not connected to server');
    }

    try {
      const response = await fetch('/api/opc/browse', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: this.serverId,
          nodeId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMsg = data.error || 'Unknown error occurred';
        this.logger.error(`Browse failed: ${errorMsg}`);
        throw new Error(errorMsg);
      }

      this.logger.info(`Browsed node ${nodeId}, found ${data.nodes.length} nodes`);
      return data.nodes;
    } catch (error: any) {
      this.logger.error(`Error browsing node: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get server connection status
   */
  isConnected(): boolean {
    return this.connected;
  }

  /**
   * Get the server ID for this connection
   */
  getServerId(): string | null {
    return this.serverId;
  }
}

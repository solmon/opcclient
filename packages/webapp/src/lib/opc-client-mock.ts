'use client'

// Mock implementation for the client-side
// This will be replaced with API calls to the backend
export class OPCClient {
  private endpointUrl: string;
  private connected: boolean = false;
  private connectionType: 'anonymous' | 'username' = 'username';

  constructor(options: { endpointUrl: string }) {
    this.endpointUrl = options.endpointUrl;
  }

  async connectAnonymous(): Promise<boolean> {
    console.log(`[MOCK] Connecting anonymously to ${this.endpointUrl}`);
    
    // Simulate a connection delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Simulate connection failure for specific URLs (for testing)
    if (this.endpointUrl.includes('invalid') || this.endpointUrl.includes('error')) {
      console.error('[MOCK] Anonymous connection failed - invalid endpoint');
      throw new Error('Connection refused: Anonymous access denied');
    }
    
    this.connected = true;
    this.connectionType = 'anonymous';
    return true;
  }

  async connect(username: string, password: string): Promise<boolean> {
    console.log(`[MOCK] Connecting to ${this.endpointUrl} with username: ${username}`);
    
    // Simulate a connection delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Simulate authentication failure (for testing)
    if (username === 'invalid' || password === 'invalid') {
      console.error('[MOCK] Authentication failed - invalid credentials');
      throw new Error('Authentication failed: Invalid username or password');
    }
    
    // Simulate connection issues (for testing)
    if (this.endpointUrl.includes('invalid') || this.endpointUrl.includes('error')) {
      console.error('[MOCK] Connection failed - invalid endpoint');
      throw new Error('Connection refused: Invalid endpoint URL');
    }
    
    this.connected = true;
    this.connectionType = 'username';
    return true;
  }

  async disconnect(): Promise<boolean> {
    console.log(`[MOCK] Disconnecting from ${this.endpointUrl}`);
    await new Promise(resolve => setTimeout(resolve, 300));
    this.connected = false;
    return true;
  }

  async readValue(nodeId: string): Promise<number> {
    console.log(`[MOCK] Reading value from ${nodeId}`);
    return Math.random() * 100;
  }

  async writeValue(nodeId: string, value: number): Promise<boolean> {
    console.log(`[MOCK] Writing value ${value} to ${nodeId}`);
    return true;
  }
}

import {
  AttributeIds,
  ClientMonitoredItem,
  ClientSession,
  ClientSubscription,
  DataType,
  MonitoringParametersOptions,
  OPCUAClient,
  TimestampsToReturn,
  Variant,
  UserIdentityInfo,
  UserTokenType
} from 'node-opcua';

export interface OPCClientOptions {
  endpointUrl: string;
  securityMode?: string;
  securityPolicy?: string;
  username?: string;
  password?: string;
}

export interface SubscriptionOptions {
  requestedPublishingInterval?: number;
  requestedLifetimeCount?: number;
  requestedMaxKeepAliveCount?: number;
  maxNotificationsPerPublish?: number;
  publishingEnabled?: boolean;
  priority?: number;
}

export interface MonitorOptions extends MonitoringParametersOptions {
  nodeId: string;
  callback: (value: any) => void;
}

/**
 * Client for OPC UA communication
 */
export class OPCClient {
  private endpointUrl: string;
  private client: OPCUAClient;
  private session: ClientSession | null = null;
  private connected: boolean = false;
  private subscription: ClientSubscription | null = null;
  private monitoredItems: ClientMonitoredItem[] = [];

  /**
   * Creates a new OPC client
   * @param options - Configuration options for the OPC client
   */
  constructor(options: OPCClientOptions) {
    this.endpointUrl = options.endpointUrl;
    this.client = OPCUAClient.create({
      applicationName: "OPCClient",
      connectionStrategy: {
        initialDelay: 1000,
        maxRetry: 3
      },
      securityMode: options.securityMode as any,
      securityPolicy: options.securityPolicy as any,
      endpointMustExist: false
    });
  }

  /**
   * Connect to the OPC UA server
   */
  async connect(username?: string, password?: string): Promise<void> {
    if (this.connected) {
      return;
    }
    
    try {
      await this.client.connect(this.endpointUrl);
      
      let userIdentity: UserIdentityInfo | undefined = undefined;
      if (username && password) {
        userIdentity = {
          type: UserTokenType.UserName,
          userName: username,
          password: password
        };
      }
      
      this.session = await this.client.createSession(userIdentity);
      this.connected = true;
    } catch (error) {
      throw new Error(`Failed to connect: ${error}`);
    }
  }

  /**
   * Disconnect from the OPC UA server
   */
  async disconnect(): Promise<void> {
    if (!this.connected || !this.session) {
      return;
    }
    
    try {
      if (this.subscription) {
        await this.subscription.terminate();
        this.subscription = null;
        this.monitoredItems = [];
      }
      
      await this.session.close();
      await this.client.disconnect();
      this.connected = false;
      this.session = null;
    } catch (error) {
      throw new Error(`Failed to disconnect: ${error}`);
    }
  }

  /**
   * Read a value from the specified node
   * @param nodeId - The ID of the node to read
   * @returns The value read from the node
   */
  async readValue(nodeId: string): Promise<any> {
    if (!this.connected || !this.session) {
      throw new Error('Not connected to server');
    }
    
    try {
      const dataValue = await this.session.read({
        nodeId,
        attributeId: AttributeIds.Value
      });
      
      return dataValue.value.value;
    } catch (error) {
      throw new Error(`Failed to read value: ${error}`);
    }
  }

  /**
   * Write a value to the specified node
   * @param nodeId - The ID of the node to write to
   * @param value - The value to write
   */
  async writeValue(nodeId: string, value: any): Promise<void> {
    if (!this.connected || !this.session) {
      throw new Error('Not connected to server');
    }
    
    try {
      await this.session.write({
        nodeId,
        attributeId: AttributeIds.Value,
        value: {
          value: new Variant({
            dataType: DataType.Variant,
            value
          })
        }
      });
    } catch (error) {
      throw new Error(`Failed to write value: ${error}`);
    }
  }

  /**
   * Create a subscription to monitor nodes
   * @param options - Subscription options
   * @returns The subscription ID
   */
  async createSubscription(options?: SubscriptionOptions): Promise<number> {
    if (!this.connected || !this.session) {
      throw new Error('Not connected to server');
    }
    
    if (this.subscription) {
      return this.subscription.subscriptionId;
    }
    
    try {
      this.subscription = ClientSubscription.create(this.session, {
        requestedPublishingInterval: options?.requestedPublishingInterval || 1000,
        requestedLifetimeCount: options?.requestedLifetimeCount || 100,
        requestedMaxKeepAliveCount: options?.requestedMaxKeepAliveCount || 10,
        maxNotificationsPerPublish: options?.maxNotificationsPerPublish || 100,
        publishingEnabled: options?.publishingEnabled !== false,
        priority: options?.priority || 1
      });
      
      return this.subscription.subscriptionId;
    } catch (error) {
      throw new Error(`Failed to create subscription: ${error}`);
    }
  }

  /**
   * Monitor a node for changes
   * @param options - Monitor options
   * @returns The monitor ID
   */
  async monitorNode(options: MonitorOptions): Promise<number> {
    if (!this.connected || !this.session) {
      throw new Error('Not connected to server');
    }
    
    if (!this.subscription) {
      await this.createSubscription();
    }
    
    try {
      const monitoredItem = ClientMonitoredItem.create(
        this.subscription!,
        {
          nodeId: options.nodeId,
          attributeId: AttributeIds.Value
        },
        {
          samplingInterval: options.samplingInterval || 1000,
          discardOldest: options.discardOldest !== false,
          queueSize: options.queueSize || 10
        },
        TimestampsToReturn.Both
      );
      
      monitoredItem.on('changed', (dataValue) => {
        options.callback(dataValue.value.value);
      });
      
      this.monitoredItems.push(monitoredItem);
      return this.monitoredItems.length - 1;
    } catch (error) {
      throw new Error(`Failed to monitor node: ${error}`);
    }
  }
}

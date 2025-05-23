import { OPCClient } from '../src/client';

// Mock the node-opcua imports
jest.mock('node-opcua', () => {
  const mockClient = {
    connect: jest.fn().mockResolvedValue(undefined),
    createSession: jest.fn().mockResolvedValue({
      close: jest.fn().mockResolvedValue(undefined),
      read: jest.fn().mockResolvedValue({
        value: { value: 42 }
      }),
      write: jest.fn().mockResolvedValue(undefined)
    }),
    disconnect: jest.fn().mockResolvedValue(undefined)
  };

  return {
    OPCUAClient: {
      create: jest.fn().mockReturnValue(mockClient)
    },
    AttributeIds: {
      Value: 13
    },
    DataType: {
      Variant: 'Variant'
    },
    Variant: jest.fn().mockImplementation((options) => options),
    TimestampsToReturn: {
      Both: 'Both'
    },
    ClientSubscription: {
      create: jest.fn().mockReturnValue({
        subscriptionId: 1,
        terminate: jest.fn().mockResolvedValue(undefined)
      })
    },
    ClientMonitoredItem: {
      create: jest.fn().mockReturnValue({
        on: jest.fn(),
      })
    }
  };
});

describe('OPCClient', () => {
  let client: OPCClient;

  beforeEach(() => {
    client = new OPCClient({ endpointUrl: 'opc.tcp://example.com:4840' });
    jest.clearAllMocks();
  });

  test('connects to the server', async () => {
    await client.connect();
    expect(client['connected']).toBe(true);
  });

  test('reads a value from a node', async () => {
    await client.connect();
    const value = await client.readValue('ns=2;s=Device1.Tag1');
    expect(value).toBe(42);
  });

  test('writes a value to a node', async () => {
    await client.connect();
    await expect(client.writeValue('ns=2;s=Device1.Tag1', 42)).resolves.toBeUndefined();
  });

  test('disconnects from the server', async () => {
    await client.connect();
    await client.disconnect();
    expect(client['connected']).toBe(false);
  });
});

const { OPCClient } = require('../../packages/nodejs/dist');

async function main() {
  // Create a client
  const client = new OPCClient({ endpointUrl: 'opc.tcp://localhost:4840' });

  try {
    // Connect to the server
    console.log('Connecting to OPC UA server...');
    await client.connect('user', 'password');
    console.log('Connected');

    // Read a value
    console.log('Reading value...');
    const value = await client.readValue('ns=2;s=Device1.Tag1');
    console.log(`Value read: ${value}`);

    // Write a value
    console.log('Writing value...');
    await client.writeValue('ns=2;s=Device1.Tag1', 42);
    console.log('Value written');

    // Create a subscription
    console.log('Creating subscription...');
    await client.createSubscription({
      requestedPublishingInterval: 1000,
    });

    // Monitor a node
    console.log('Monitoring node...');
    await client.monitorNode({
      nodeId: 'ns=2;s=Device1.Tag1',
      samplingInterval: 1000,
      callback: (value) => {
        console.log(`New value: ${value}`);
      },
    });

    // Keep the application running for a while
    console.log('Monitoring started. Press Ctrl+C to exit.');
    await new Promise((resolve) => setTimeout(resolve, 30000));
  } catch (error) {
    console.error(`Error: ${error.message}`);
  } finally {
    // Disconnect
    console.log('Disconnecting...');
    await client.disconnect();
    console.log('Disconnected');
  }
}

main().catch(console.error);

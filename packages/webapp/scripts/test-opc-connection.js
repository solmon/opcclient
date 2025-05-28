/**
 * OPC Client Test Script
 * 
 * This script tests the connection to an OPC UA server
 * Usage: node scripts/test-opc-connection.js <endpoint-url>
 * 
 * Example: node scripts/test-opc-connection.js opc.tcp://localhost:4840
 */

const { OPCUAClient, MessageSecurityMode, SecurityPolicy, AttributeIds } = require('node-opcua');

// Default endpoint if not provided
const endpointUrl = process.argv[2] || 'opc.tcp://localhost:4840';

async function testOpcConnection() {
  console.log(`Testing connection to OPC UA server at: ${endpointUrl}`);

  // Create client with configuration
  const client = OPCUAClient.create({
    applicationName: "OPC Client Web App Test",
    connectionStrategy: {
      initialDelay: 1000,
      maxRetry: 3
    },
    securityMode: MessageSecurityMode.None,
    securityPolicy: SecurityPolicy.None,
    endpointMustExist: false
  });

  try {
    // Step 1: Connect to the server
    console.log("Step 1: Connecting to the server...");
    await client.connect(endpointUrl);
    console.log("✓ Successfully connected to the server");

    // Step 2: Create a session (anonymous)
    console.log("Step 2: Creating session...");
    const session = await client.createSession();
    console.log("✓ Session created successfully");

    // Step 3: Browse the server's object folder
    console.log("Step 3: Browsing the Objects folder...");
    const browseResult = await session.browse({
      nodeId: "i=84", // Objects folder
      browseDirection: 0, // Forward
      includeSubtypes: true,
      nodeClassMask: 0, // All node classes
      resultMask: 63  // All fields
    });

    if (browseResult.statusCode.isGood()) {
      console.log("✓ Browse successful");
      console.log(`Found ${browseResult.references?.length || 0} nodes in the Objects folder`);
      
      // List the first 5 nodes
      if (browseResult.references && browseResult.references.length > 0) {
        console.log("\nSample nodes:");
        for (let i = 0; i < Math.min(5, browseResult.references.length); i++) {
          const ref = browseResult.references[i];
          console.log(`- ${ref.displayName.text} (${ref.nodeId.toString()})`);
        }
      }
    } else {
      console.log(`✗ Browse failed: ${browseResult.statusCode.toString()}`);
    }

    // Step 4: Close the session and disconnect
    console.log("\nStep 4: Closing session and disconnecting...");
    await session.close();
    await client.disconnect();
    console.log("✓ Disconnected successfully");

    console.log("\n✅ OPC UA Connection test completed successfully!");
  } catch (error) {
    console.error(`\n❌ Error: ${error.message}`);
    
    // Try to disconnect if client was connected
    try {
      await client.disconnect();
    } catch (e) {
      // Ignore errors during disconnect
    }
    
    process.exit(1);
  }
}

testOpcConnection();

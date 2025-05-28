# OPC UA Client Implementation

This web application contains a real OPC UA client implementation that connects to OPC UA servers through server-side API routes in Next.js.

## Architecture

The implementation consists of:

1. **Client-side wrapper** (`src/lib/opc-client.ts`): Browser-safe client that makes API calls to the server
2. **Server-side API routes** (`src/app/api/opc/`): Next.js routes that use node-opcua to communicate with OPC servers
3. **OPC Server Manager** (`src/lib/opc-server-manager.ts`): Manages connections to different servers

## Testing the Connection

You can test OPC UA connections using the script in `scripts/test-opc-connection.js`:

```bash
node scripts/test-opc-connection.js opc.tcp://your-server:4840
```

## Setting Up an OPC UA Server for Testing

For testing, you can use one of the following options:

### Option 1: Public Test Servers

Several organizations maintain public OPC UA servers for testing:

- Unified Automation: opc.tcp://demo.unified-automation.com:4840
- Prosys: opc.tcp://uademo.prosysopc.com:53530/OPCUA/SimulationServer

### Option 2: Run a local Docker container

```bash
docker run -p 4840:4840 mcr.microsoft.com/iotedge/opc-plc:latest --aa
```

### Option 3: Install Node-RED with OPC UA plugin

1. Install Node-RED: `npm install -g node-red`
2. Install OPC UA nodes: `cd ~/.node-red && npm install node-red-contrib-opcua`
3. Run Node-RED: `node-red`
4. Access http://localhost:1880 and configure an OPC UA server node

## Configuration

Edit the `.env.local` file to configure the OPC client:

```
NEXT_PUBLIC_LOG_LEVEL=debug
NEXT_PUBLIC_OPC_BROWSE_MAX_DEPTH=3
NEXT_PUBLIC_OPC_RECONNECT_ATTEMPTS=3
```

## Security Considerations

- The current implementation uses no security mode (`MessageSecurityMode.None`)
- For production, you should implement proper security with certificates
- Sensitive credentials should be stored securely and not exposed to the client side

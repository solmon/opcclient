# OPC Client (Node.js)

A Node.js client for OPC (OLE for Process Control) communication.

## Installation

```bash
npm install opcclient
```

## Usage

```typescript
import { OPCClient } from 'opcclient';

// Create a client
const client = new OPCClient({ endpointUrl: 'opc.tcp://server:4840' });

// Connect to the server
await client.connect();

// Read a value
const value = await client.readValue('ns=2;s=Device1.Tag1');

// Write a value
await client.writeValue('ns=2;s=Device1.Tag1', 42);

// Disconnect
await client.disconnect();
```

## Development

1. Clone the repository
2. Install dependencies: `npm install`
3. Build the package: `npm run build`
4. Run tests: `npm test`

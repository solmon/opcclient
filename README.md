# OPC Client Monorepo

This repository contains client libraries for OPC (OLE for Process Control) communication in multiple languages.

## Packages

### Python OPC Client

A Python client for OPC communication.

```bash
# Installation
uv pip install --no-verify-ssl -e ./packages/python

# Usage
from opcclient import OPCClient

# Create a client
client = OPCClient(server_url="opc.tcp://server:4840")

# Connect to the server
client.connect()
```

[View Python package](./packages/python/README.md)

### Node.js OPC Client

A Node.js client for OPC communication.

```bash
# Installation
npm install --prefix ./packages/nodejs

# Usage
import { OPCClient } from 'opcclient';

// Create a client
const client = new OPCClient({ endpointUrl: 'opc.tcp://server:4840' });

// Connect to the server
await client.connect();
```

[View Node.js package](./packages/nodejs/README.md)

## Examples

- [Python examples](./examples/python/)
- [Node.js examples](./examples/nodejs/)

## Development

### Python Client

```bash
cd packages/python
uv venv
uv pip install --no-verify-ssl -e ".[dev]"
pytest
```

### Node.js Client

```bash
cd packages/nodejs
npm install
npm run build
npm test
```

## License

MIT

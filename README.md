# OPC Client Monorepo

This repository contains client libraries for OPC (OLE for Process Control) communication in multiple languages.

## Quick Start

```bash
# Clone the repository
git clone https://github.com/solmon/opcclient.git
cd opcclient

# Set up the workspace (installs all dependencies)
pnpm run setup

# Run examples
./run-examples.sh
```

## Packages

### Python OPC Client

A Python client for OPC communication.

```bash
# Installation
uv pip install --no-verify-ssl -e ./packages/python

# Usage
from opcclient import OPCClient
```

### Node.js OPC Client

A Node.js client for OPC UA communication.

```bash
# Installation (if using outside the monorepo)
npm install opcclient

# Usage
const { OPCClient } = require('opcclient');
// or
import { OPCClient } from 'opcclient';
```

### Web Application

A Next.js web application for browsing OPC UA servers.

```bash
# Start the development server
pnpm run webapp:dev

# Build for production
pnpm run webapp:build

# Start the production server
pnpm run webapp:start

# Rebuild the web application (reinstalls dependencies and builds)
pnpm run webapp:rebuild
```

The web application allows you to:
- Connect to OPC UA servers with username/password or anonymous authentication
- View server object models in an interactive tree view
- Search and filter nodes in the object model tree
- Save and manage multiple server connections
- Automatic dark/light theme support with manual toggle
- Real-time connection status indicators
- Responsive design optimized for all device sizes

Access the application at [http://localhost:3000](http://localhost:3000) after starting the server.

```bash
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
pnpm install --filter opcclient
pnpm run build --filter opcclient

# Usage
import { OPCClient } from 'opcclient';

// Create a client
const client = new OPCClient({ endpointUrl: 'opc.tcp://server:4840' });

// Connect to the server
await client.connect();
```

[View Node.js package](./packages/nodejs/README.md)

### Web Application

[View Web Application](./packages/webapp/README.md)

## Examples

- [Python examples](./examples/python/)
- [Node.js examples](./examples/nodejs/)

You can run the examples using the provided script:

```bash
# Run the interactive menu
./run-examples.sh

# Or run specific examples directly
./run-examples.sh python    # Run the Python example
./run-examples.sh nodejs    # Run the Node.js example
./run-examples.sh all       # Run both examples

# You can also use npm/pnpm scripts
pnpm run example:python
pnpm run example:nodejs
pnpm run example:all
pnpm run examples           # Interactive menu
```

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
pnpm install
pnpm run build
pnpm test
```

### Web Application

```bash
# From monorepo root
pnpm run webapp:dev

# Or from webapp directory
cd packages/webapp
pnpm install
pnpm run dev
```

#### Web Application Tech Stack

- **Frontend Framework**: Next.js 15+ with React 19
- **Styling**: Tailwind CSS with custom UI components
- **State Management**: React Context API
- **Form Handling**: React Hook Form with Zod validation
- **UI Components**: Custom components with Radix UI primitives
- **Icons**: Lucide React
- **OPC Connection**: Uses the Node.js OPC client library

## License

MIT

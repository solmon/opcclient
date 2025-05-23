# OPC Client

A Python client for OPC (OLE for Process Control) communication.

## Installation

```bash
uv pip install -e .
```

## Usage

```python
from opcclient import OPCClient

# Create a client
client = OPCClient(server_url="opc.tcp://server:4840")

# Connect to the server
client.connect()

# Read a value
value = client.read_value("ns=2;s=Device1.Tag1")

# Write a value
client.write_value("ns=2;s=Device1.Tag1", 42)

# Disconnect
client.disconnect()
```

## Development

1. Clone the repository
2. Create and activate a virtual environment: `uv venv`
3. Install development dependencies: `uv pip install -e ".[dev]"`
4. Run tests: `pytest`

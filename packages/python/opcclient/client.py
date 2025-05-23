"""OPC Client implementation."""

import time
from typing import Any, Dict, Optional, Union

from opcua import Client


class OPCClient:
    """Client for OPC UA communication."""

    def __init__(self, server_url: str):
        """Initialize the OPC client.

        Args:
            server_url: The URL of the OPC UA server.
        """
        self.server_url = server_url
        self._client = Client(server_url)
        self._connected = False

    def connect(self, username: Optional[str] = None, password: Optional[str] = None) -> None:
        """Connect to the OPC UA server.

        Args:
            username: Optional username for authentication.
            password: Optional password for authentication.
        """
        if self._connected:
            return

        if username and password:
            self._client.set_user(username)
            self._client.set_password(password)

        self._client.connect()
        self._connected = True

    def disconnect(self) -> None:
        """Disconnect from the OPC UA server."""
        if not self._connected:
            return

        self._client.disconnect()
        self._connected = False

    def read_value(self, node_id: str) -> Any:
        """Read a value from the specified node.

        Args:
            node_id: The ID of the node to read.

        Returns:
            The value of the node.
        """
        if not self._connected:
            raise RuntimeError("Client is not connected to OPC UA server")

        node = self._client.get_node(node_id)
        return node.get_value()

    def write_value(self, node_id: str, value: Any) -> None:
        """Write a value to the specified node.

        Args:
            node_id: The ID of the node to write to.
            value: The value to write.
        """
        if not self._connected:
            raise RuntimeError("Client is not connected to OPC UA server")

        node = self._client.get_node(node_id)
        node.set_value(value)

    def browse(self, node_id: Optional[str] = None) -> Dict[str, Any]:
        """Browse the OPC UA server from the specified node.

        Args:
            node_id: The ID of the node to browse from. If None, browse from root.

        Returns:
            A dictionary containing the browsed nodes.
        """
        if not self._connected:
            raise RuntimeError("Client is not connected to OPC UA server")

        if node_id:
            node = self._client.get_node(node_id)
        else:
            node = self._client.get_root_node()

        result = {}
        for child in node.get_children():
            name = child.get_browse_name().Name
            result[name] = {
                "node_id": child.nodeid.to_string(),
                "display_name": child.get_display_name().Text,
            }
            try:
                result[name]["value"] = child.get_value()
            except Exception:
                # Some nodes don't have values
                pass

        return result

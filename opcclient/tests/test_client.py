"""Tests for the OPCClient class."""

import unittest
from unittest.mock import MagicMock, patch

from opcclient import OPCClient


class TestOPCClient(unittest.TestCase):
    """Test cases for OPCClient."""

    def setUp(self):
        """Set up the test case."""
        self.server_url = "opc.tcp://server:4840"
        with patch("opcclient.client.Client"):
            self.client = OPCClient(self.server_url)
            self.client._client = MagicMock()

    def test_connect(self):
        """Test the connect method."""
        self.client.connect()
        self.client._client.connect.assert_called_once()
        self.assertTrue(self.client._connected)

    def test_disconnect(self):
        """Test the disconnect method."""
        self.client._connected = True
        self.client.disconnect()
        self.client._client.disconnect.assert_called_once()
        self.assertFalse(self.client._connected)

    def test_read_value(self):
        """Test the read_value method."""
        node_id = "ns=2;s=Device1.Tag1"
        mock_node = MagicMock()
        mock_node.get_value.return_value = 42
        self.client._client.get_node.return_value = mock_node
        self.client._connected = True

        value = self.client.read_value(node_id)

        self.client._client.get_node.assert_called_once_with(node_id)
        mock_node.get_value.assert_called_once()
        self.assertEqual(value, 42)

    def test_write_value(self):
        """Test the write_value method."""
        node_id = "ns=2;s=Device1.Tag1"
        value = 42
        mock_node = MagicMock()
        self.client._client.get_node.return_value = mock_node
        self.client._connected = True

        self.client.write_value(node_id, value)

        self.client._client.get_node.assert_called_once_with(node_id)
        mock_node.set_value.assert_called_once_with(value)


if __name__ == "__main__":
    unittest.main()

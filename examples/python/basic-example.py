from opcclient import OPCClient

def main():
    # Create a client
    client = OPCClient(server_url="opc.tcp://localhost:4841")

    try:
        # Connect to the server
        print("Connecting to OPC UA server...")
        client.connect(username="user", password="password")
        print("Connected")

        # Read a value
        print("Reading value...")
        value = client.read_value("ns=2;s=Device1.Tag1")
        print(f"Value read: {value}")

        # Write a value
        print("Writing value...")
        client.write_value("ns=2;s=Device1.Tag1", 42)
        print("Value written")

        # Subscribe to changes (if implemented)
        # client.subscribe_to_changes("ns=2;s=Device1.Tag1", callback=lambda value: print(f"New value: {value}"))
        # print("Monitoring started.")

        # Keep the application running for a while
        # import time
        # time.sleep(30)

    except Exception as e:
        print(f"Error: {e}")
    finally:
        # Disconnect
        print("Disconnecting...")
        client.disconnect()
        print("Disconnected")

if __name__ == "__main__":
    main()

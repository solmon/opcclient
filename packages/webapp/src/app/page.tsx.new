'use client'

import { useState, useEffect } from 'react'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

import { Server, ServerObjectModel } from '@/types/server'
import { OPCServerManager } from '@/lib/opc-server-manager'
import { ServerConnectionForm } from '@/components/server-connection-form'
import { ServerCard } from '@/components/server-card'
import { ObjectModelTree } from '@/components/object-model-tree'
import { Button } from '@/components/ui/button'

export default function Home() {
  const [servers, setServers] = useState<Server[]>([])
  const [selectedModel, setSelectedModel] = useState<ServerObjectModel | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [opcServerManager] = useState(() => new OPCServerManager())

  useEffect(() => {
    // Load saved servers from local storage
    const savedServers = localStorage.getItem('opcServers')
    if (savedServers) {
      setServers(JSON.parse(savedServers))
    }
    
    // Clean up connections on unmount
    return () => {
      opcServerManager.disconnectAll()
    }
  }, [opcServerManager])

  // Save servers to local storage when they change
  useEffect(() => {
    localStorage.setItem('opcServers', JSON.stringify(servers))
  }, [servers])

  const handleAddServer = async (data: Omit<Server, 'id'>) => {
    try {
      const newServer: Server = {
        ...data,
        id: crypto.randomUUID(),
      }
      
      // Test connection to server
      await opcServerManager.connectToServer(newServer)
      
      // If connection successful, add server to list
      setServers((prev) => [...prev, newServer])
      toast.success(`Connected to ${newServer.name}`)
      
      return newServer
    } catch (error) {
      console.error('Error connecting to server:', error)
      toast.error('Failed to connect to OPC server')
      throw error
    }
  }

  const handleRemoveServer = async (id: string) => {
    try {
      // Disconnect from server
      await opcServerManager.disconnectFromServer(id)
      
      // Remove server from list
      setServers((prev) => prev.filter((server) => server.id !== id))
      
      // If the selected model is from this server, clear it
      if (selectedModel && selectedModel.serverId === id) {
        setSelectedModel(null)
      }
      
      toast.success('Server removed')
    } catch (error) {
      console.error('Error removing server:', error)
      toast.error('Failed to remove server')
    }
  }

  const handleViewObjectModel = async (server: Server) => {
    try {
      const model = await opcServerManager.getObjectModel(server)
      setSelectedModel(model)
    } catch (error) {
      console.error('Error getting object model:', error)
      toast.error('Failed to get object model')
      throw error
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <ToastContainer position="top-right" autoClose={3000} />
      
      <header className="mb-8">
        <h1 className="text-3xl font-bold">OPC Client Explorer</h1>
        <p className="text-slate-600 mt-2">
          Browse and connect to OPC servers to view their object models
        </p>
      </header>

      <div className="mb-8">
        <Button onClick={() => setIsFormOpen(true)}>
          Add OPC Server Connection
        </Button>
        
        <ServerConnectionForm
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          onSubmit={handleAddServer}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">Server Connections</h2>
          
          {servers.length === 0 ? (
            <div className="bg-slate-50 p-8 text-center rounded-lg border">
              <p className="text-slate-500">No server connections added yet</p>
              <Button 
                onClick={() => setIsFormOpen(true)}
                className="mt-4"
                variant="outline"
              >
                Add your first OPC server
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {servers.map((server) => (
                <ServerCard
                  key={server.id}
                  server={server}
                  onViewObjectModel={handleViewObjectModel}
                  onRemove={handleRemoveServer}
                />
              ))}
            </div>
          )}
        </div>
        
        <div>
          {selectedModel ? (
            <ObjectModelTree
              nodes={selectedModel.rootNodes}
              serverName={selectedModel.serverName}
            />
          ) : (
            <div className="h-full bg-slate-50 p-8 text-center rounded-lg border">
              <p className="text-slate-500">
                Select a server and click "View Object Model" to see the OPC server's objects
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

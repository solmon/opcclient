'use client'

import React, { useState, useEffect } from 'react'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

import { Server, ServerObjectModel } from '@/types/server'
import { OPCServerManager } from '@/lib/opc-server-manager'
import { ServerConnectionForm } from '@/components/server-connection-form'
import { SimpleConnectionForm } from '@/components/simple-connection-form'
import { DirectConnectionForm } from '@/components/direct-connection-form'
import { ServerCard } from '@/components/server-card'
import { ObjectModelTree } from '@/components/object-model-tree'
import { ThemeToggle } from '@/components/theme-toggle'
import { Button } from '@/components/ui/button'
import { useEventDebugger } from '@/lib/use-event-debugger'

export default function Home() {
  const [servers, setServers] = useState<Server[]>([])
  const [selectedModel, setSelectedModel] = useState<ServerObjectModel | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [opcServerManager] = useState(() => new OPCServerManager())
  
  // Try using a ref to track the dialog state
  const formOpenRef = React.useRef(false)
  
  const openForm = () => {
    console.log('openForm called, current state:', isFormOpen)
    formOpenRef.current = true
    // Force a delay before changing state to ensure React processes the click event
    setTimeout(() => {
      setIsFormOpen(true)
      console.log('State updated to:', true)
    }, 10)
  }
  
  const closeForm = () => {
    console.log('closeForm called')
    formOpenRef.current = false
    setIsFormOpen(false)
  }

  // Debug logging for form open state
  useEffect(() => {
    console.log('isFormOpen state changed:', isFormOpen)
  }, [isFormOpen])
  
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
    console.log('handleAddServer called with data:', data)
    try {
      const newServer: Server = {
        ...data,
        id: crypto.randomUUID(),
      }
      
      console.log('Attempting to connect to server:', newServer.name)
      // Test connection to server
      await opcServerManager.connectToServer(newServer)
      
      // If connection successful, add server to list
      setServers((prev) => [...prev, newServer])
      toast.success(`Connected to ${newServer.name}`)
      
      return newServer
    } catch (error: any) {
      console.error('Error connecting to server:', error)
      const errorMessage = error?.message || 'Unknown error occurred'
      toast.error(`Failed to connect to OPC server: ${errorMessage}`)
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
      <ToastContainer 
        position="top-right" 
        autoClose={3000} 
        theme="dark" 
      />
      
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold dark:text-white">OPC Client Explorer</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            Browse and connect to OPC servers to view their object models
          </p>
        </div>
        <div className="flex items-center">
          {/* Import the ThemeToggle component */}
          <ThemeToggle />
        </div>
      </header>

      <div className="mb-8">
        <details className="mb-4 p-4 border border-gray-200 dark:border-gray-700 rounded-md">
          <summary className="font-medium cursor-pointer">Troubleshooting Guide</summary>
          <div className="mt-2 text-sm">
            <p className="mb-2">If the OPC Server Connection buttons are not working:</p>
            <ol className="list-decimal list-inside pl-4 space-y-1">
              <li>Open your browser developer tools (F12 or right-click and select Inspect)</li>
              <li>Check the Console tab for any error messages</li>
              <li>Try the different button types below to see which one works</li>
              <li>The state of the form is: {isFormOpen ? 'OPEN' : 'CLOSED'}</li>
              <li>Verify that JavaScript is enabled in your browser</li>
            </ol>
          </div>
        </details>
        
        {/* Button options */}
        <div className="relative z-10 inline-block">
          <button
            ref={useEventDebugger(() => {
              console.log('Debug button event triggered')
              openForm()
            })}
            className="px-4 py-2 rounded bg-primary text-primary-foreground hover:bg-primary/90 font-medium mr-2"
          >
            Add OPC Server Connection (Debug)
          </button>
        </div>
        
        {/* Test with a plain HTML button */}
        <button
          onClick={() => {
            console.log('Plain HTML button clicked')
            openForm()
          }}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-2"
          type="button"
        >
          Add Server (Plain HTML)
        </button>
        
        {/* Direct state toggle button */}
        <button
          onClick={() => {
            console.log('Direct toggle clicked, current state:', isFormOpen)
            setIsFormOpen(!isFormOpen)
            console.log('State should be toggled to:', !isFormOpen)
          }}
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
          type="button"
        >
          Direct Toggle Form
        </button>
        
        {/* Debug display */}
        <div className="debug-state-display" style={{ fontSize: '10px', marginTop: '4px', marginBottom: '4px' }}>
          Form open state: {isFormOpen ? 'true' : 'false'}
        </div>
        
        {/* Use our direct connection form implementation for better debugging */}
        <DirectConnectionForm
          isOpen={isFormOpen}
          onClose={closeForm}
          onSubmit={handleAddServer}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">Server Connections</h2>
          
          {servers.length === 0 ? (
            <div className="bg-slate-50 dark:bg-slate-900 p-8 text-center rounded-lg border dark:border-slate-700">
              <p className="text-slate-500 dark:text-slate-400">No server connections added yet</p>
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
              serverId={selectedModel.serverId}
              opcServerManager={opcServerManager}
            />
          ) : (
            <div className="h-full bg-slate-50 dark:bg-slate-900 p-8 text-center rounded-lg border dark:border-slate-700">
              <p className="text-slate-500 dark:text-slate-400">
                Select a server and click "View Object Model" to see the OPC server's objects
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

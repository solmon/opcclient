import { useState } from 'react'
import { Server } from '@/types/server'
import { Button } from '@/components/ui/button'
import { toast } from 'react-toastify'
import { cn } from '@/lib/utils'

interface ServerCardProps {
  server: Server
  onViewObjectModel: (server: Server) => void
  onRemove: (id: string) => void
}

export function ServerCard({ server, onViewObjectModel, onRemove }: ServerCardProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleViewObjectModel = async () => {
    try {
      setIsLoading(true)
      await onViewObjectModel(server)
    } catch (error: any) {
      console.error('Error connecting to server:', error)
      
      // Show more detailed error message
      const errorMessage = error?.message || 'Unknown error';
      if (errorMessage.includes('Authentication failed')) {
        toast.error('Authentication failed. Check your credentials and try again.');
      } else if (errorMessage.includes('Connection refused')) {
        toast.error('Connection refused. The server may be offline or the URL may be incorrect.');
      } else {
        toast.error(`Failed to connect: ${errorMessage}`);
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col p-6 bg-white dark:bg-slate-800 shadow-md rounded-lg border dark:border-slate-700">
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-lg dark:text-white">{server.name}</h3>
            <span 
              className={`inline-flex items-center justify-center px-2 py-0.5 text-xs rounded-full ${
                isLoading 
                  ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' 
                  : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
              }`}
            >
              {isLoading ? 'Connecting...' : 'Ready to connect'}
            </span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{server.endpointUrl}</p>
          <div className="mt-2 flex items-center">
            <span className={`inline-block w-2 h-2 rounded-full mr-2 ${server.useAnonymous ? 'bg-blue-500' : 'bg-purple-500'}`}></span>
            <span className="text-xs text-gray-600 dark:text-gray-300">
              {server.useAnonymous 
                ? 'Anonymous authentication' 
                : `Authenticated as ${server.username || 'user'}`
              }
            </span>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => onRemove(server.id)}
          >
            Remove
          </Button>
        </div>
      </div>
      <div className="mt-auto pt-4 flex justify-end">
        <Button 
          onClick={handleViewObjectModel}
          disabled={isLoading}
        >
          {isLoading ? 'Loading...' : 'View Object Model'}
        </Button>
      </div>
    </div>
  )
}

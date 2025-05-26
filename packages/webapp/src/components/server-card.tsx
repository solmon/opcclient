import { useState } from 'react'
import { Server } from '@/types/server'
import { Button } from '@/components/ui/button'
import { toast } from 'react-toastify'

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
    } catch (error) {
      console.error('Error connecting to server:', error)
      toast.error('Failed to connect to server')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col p-6 bg-white shadow-md rounded-lg border">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-semibold text-lg">{server.name}</h3>
          <p className="text-sm text-gray-500 mt-1">{server.endpointUrl}</p>
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

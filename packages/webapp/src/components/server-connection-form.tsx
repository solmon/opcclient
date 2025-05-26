import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'react-toastify'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

const serverFormSchema = z.object({
  name: z.string().min(1, 'Server name is required'),
  endpointUrl: z.string().min(1, 'Endpoint URL is required'),
  username: z.string().optional(),
  password: z.string().optional(),
})

type ServerFormValues = z.infer<typeof serverFormSchema>

interface ServerConnectionFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: ServerFormValues) => void
}

export function ServerConnectionForm({
  isOpen,
  onClose,
  onSubmit,
}: ServerConnectionFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const form = useForm<ServerFormValues>({
    resolver: zodResolver(serverFormSchema),
    defaultValues: {
      name: '',
      endpointUrl: '',
      username: '',
      password: '',
    },
  })

  const handleSubmit = async (data: ServerFormValues) => {
    try {
      setIsSubmitting(true)
      await onSubmit(data)
      form.reset()
      onClose()
    } catch (error) {
      console.error('Error connecting to OPC server:', error)
      toast.error('Failed to connect to OPC server')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add OPC Server Connection</DialogTitle>
          <DialogDescription>
            Enter the details of your OPC UA server connection.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                placeholder="My OPC Server"
                className="col-span-3"
                {...form.register('name')}
              />
              {form.formState.errors.name && (
                <p className="col-span-4 col-start-2 text-sm text-red-500">
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="endpointUrl" className="text-right">
                Endpoint URL
              </Label>
              <Input
                id="endpointUrl"
                placeholder="opc.tcp://localhost:4840"
                className="col-span-3"
                {...form.register('endpointUrl')}
              />
              {form.formState.errors.endpointUrl && (
                <p className="col-span-4 col-start-2 text-sm text-red-500">
                  {form.formState.errors.endpointUrl.message}
                </p>
              )}
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="username" className="text-right">
                Username
              </Label>
              <Input
                id="username"
                placeholder="(Optional)"
                className="col-span-3"
                {...form.register('username')}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="password" className="text-right">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="(Optional)"
                className="col-span-3"
                {...form.register('password')}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button" 
              variant="outline" 
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Connecting...' : 'Connect'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

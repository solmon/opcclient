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
  useAnonymous: z.boolean().default(false),
  username: z.string().optional()
    .refine(val => val !== undefined && val.length > 0 || undefined, { 
      message: "Username is required when not using anonymous authentication" 
    }),
  password: z.string().optional()
    .refine(val => val !== undefined && val.length > 0 || undefined, { 
      message: "Password is required when not using anonymous authentication" 
    }),
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
  const [useAnonymous, setUseAnonymous] = useState(false)
  
  const form = useForm<ServerFormValues>({
    resolver: zodResolver(serverFormSchema),
    defaultValues: {
      name: '',
      endpointUrl: '',
      useAnonymous: false,
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
    } catch (error: any) {
      console.error('Error connecting to OPC server:', error)
      
      // Extract meaningful error message if available
      const errorMessage = error?.message || 'Failed to connect to OPC server';
      
      // Show more specific error message
      if (errorMessage.includes('Authentication failed')) {
        toast.error('Authentication failed: Invalid username or password');
      } else if (errorMessage.includes('Connection refused')) {
        toast.error(`Connection error: ${errorMessage}`);
      } else {
        toast.error(`Failed to connect: ${errorMessage}`);
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] dark:bg-slate-900 dark:border-slate-700">
        <DialogHeader>
          <DialogTitle className="dark:text-white">Add OPC Server Connection</DialogTitle>
          <DialogDescription className="dark:text-gray-400">
            Enter the details of your OPC UA server connection.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right dark:text-white">
                Name
              </Label>
              <Input
                id="name"
                placeholder="My OPC Server"
                className="col-span-3"
                {...form.register('name')}
              />
              {form.formState.errors.name && (
                <p className="col-span-4 col-start-2 text-sm text-red-500 dark:text-red-400">
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="endpointUrl" className="text-right dark:text-white">
                Endpoint URL
              </Label>
              <Input
                id="endpointUrl"
                placeholder="opc.tcp://localhost:4840"
                className="col-span-3"
                {...form.register('endpointUrl')}
              />
              {form.formState.errors.endpointUrl && (
                <p className="col-span-4 col-start-2 text-sm text-red-500 dark:text-red-400">
                  {form.formState.errors.endpointUrl.message}
                </p>
              )}
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <div className="text-right dark:text-white">
                Authentication
              </div>
              <div className="col-span-3 flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="useAnonymous"
                  className="h-4 w-4"
                  onChange={(e) => {
                    setUseAnonymous(e.target.checked);
                    form.setValue('useAnonymous', e.target.checked);
                  }}
                  checked={useAnonymous}
                />
                <Label htmlFor="useAnonymous" className="cursor-pointer dark:text-gray-300">
                  Use Anonymous Authentication
                </Label>
              </div>
            </div>
            
            {!useAnonymous && (
              <>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="username" className="text-right dark:text-white">
                    Username
                  </Label>
                  <Input
                    id="username"
                    placeholder="(Required)"
                    className="col-span-3"
                    disabled={useAnonymous}
                    {...form.register('username')}
                  />
                  {form.formState.errors.username && (
                    <p className="col-span-4 col-start-2 text-sm text-red-500 dark:text-red-400">
                      {form.formState.errors.username.message}
                    </p>
                  )}
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="password" className="text-right dark:text-white">
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="(Required)"
                    className="col-span-3"
                    disabled={useAnonymous}
                    {...form.register('password')}
                  />
                  {form.formState.errors.password && (
                    <p className="col-span-4 col-start-2 text-sm text-red-500 dark:text-red-400">
                      {form.formState.errors.password.message}
                    </p>
                  )}
                </div>
              </>
            )}
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

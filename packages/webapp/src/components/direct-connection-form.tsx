import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'react-toastify'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const serverFormSchema = z.object({
  name: z.string().min(1, 'Server name is required'),
  endpointUrl: z.string().min(1, 'Endpoint URL is required'),
  useAnonymous: z.boolean().default(false),
  username: z.string().optional(),
  password: z.string().optional(),
}).superRefine((data, ctx) => {
  if (!data.useAnonymous) {
    if (!data.username || data.username.length === 0) {
      ctx.addIssue({
        path: ['username'],
        code: z.ZodIssueCode.custom,
        message: "Username is required when not using anonymous authentication"
      });
    }
    if (!data.password || data.password.length === 0) {
      ctx.addIssue({
        path: ['password'],
        code: z.ZodIssueCode.custom,
        message: "Password is required when not using anonymous authentication"
      });
    }
  }
});

type ServerFormValues = z.infer<typeof serverFormSchema>

interface DirectConnectionFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: ServerFormValues) => void
}

export function DirectConnectionForm({
  isOpen,
  onClose,
  onSubmit,
}: DirectConnectionFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [useAnonymous, setUseAnonymous] = useState(false)
  
  // Debug logging for isOpen prop
  useEffect(() => {
    console.log('DirectConnectionForm isOpen prop:', isOpen)
  }, [isOpen])
  
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
  
  // Submit handler
  const handleFormSubmit = async (data: ServerFormValues) => {
    console.log('DirectConnectionForm submit handler called with data:', data);
    
    // When using anonymous auth, make sure credentials are not required
    const formData: ServerFormValues = {
      ...data,
      // Clear username and password if using anonymous authentication
      username: data.useAnonymous ? undefined : data.username,
      password: data.useAnonymous ? undefined : data.password,
    };
    
    // Only validate username/password when not using anonymous auth
    if (!data.useAnonymous) {
      if (!data.username || data.username.trim() === '') {
        form.setError('username', { 
          type: 'manual', 
          message: 'Username is required when not using anonymous authentication' 
        });
        return;
      }
      if (!data.password || data.password.trim() === '') {
        form.setError('password', { 
          type: 'manual', 
          message: 'Password is required when not using anonymous authentication' 
        });
        return;
      }
    }
    
    try {
      setIsSubmitting(true)
      console.log('Submitting form data to parent component...', formData);
      await onSubmit(formData)
      console.log('Form submission successful!');
      form.reset()
      onClose()
      toast.success('Server connection added successfully!');
    } catch (error: any) {
      console.error('Error connecting to OPC server:', error)
      
      // Extract meaningful error message
      const errorMessage = error?.message || 'Failed to connect to OPC server';
      
      // Show specific error message
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

  if (!isOpen) {
    return null;
  }

  // Log every render with form values
  console.log('DirectConnectionForm rendering', {
    formValues: form.getValues(),
    isOpen,
    isSubmitting
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg dark:bg-slate-900 dark:text-white">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Add OPC Server Connection</h2>
          <button 
            onClick={onClose}
            className="rounded-full p-1 hover:bg-gray-200 dark:hover:bg-slate-800"
            type="button"
          >
            ✕
          </button>
        </div>
        
        <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
          Enter the details of your OPC UA server connection.
        </p>
        
        <form onSubmit={form.handleSubmit(handleFormSubmit)}>
          <div className="space-y-4">
            {/* Server Name */}
            <div>
              <Label htmlFor="d-name">Server Name</Label>
              <Input
                id="d-name"
                placeholder="My OPC Server"
                {...form.register('name')}
              />
              {form.formState.errors.name && (
                <p className="mt-1 text-sm text-red-500">{form.formState.errors.name.message}</p>
              )}
            </div>
            
            {/* Endpoint URL */}
            <div>
              <Label htmlFor="d-endpointUrl">Endpoint URL</Label>
              <Input
                id="d-endpointUrl"
                placeholder="opc.tcp://localhost:4840"
                {...form.register('endpointUrl')}
              />
              {form.formState.errors.endpointUrl && (
                <p className="mt-1 text-sm text-red-500">{form.formState.errors.endpointUrl.message}</p>
              )}
            </div>
            
            {/* Authentication */}
            <div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="d-useAnonymous"
                  className="h-4 w-4"
                  onChange={(e) => {
                    setUseAnonymous(e.target.checked);
                    form.setValue('useAnonymous', e.target.checked);
                  }}
                  checked={useAnonymous}
                />
                <Label htmlFor="d-useAnonymous" className="cursor-pointer">
                  Use Anonymous Authentication
                </Label>
              </div>
            </div>
            
            {/* Credentials */}
            {!useAnonymous && (
              <>
                <div>
                  <Label htmlFor="d-username">Username</Label>
                  <Input
                    id="d-username"
                    placeholder="(Required)"
                    disabled={useAnonymous}
                    {...form.register('username')}
                  />
                  {form.formState.errors.username && (
                    <p className="mt-1 text-sm text-red-500">{form.formState.errors.username.message}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="d-password">Password</Label>
                  <Input
                    id="d-password"
                    type="password"
                    placeholder="(Required)"
                    disabled={useAnonymous}
                    {...form.register('password')}
                  />
                  {form.formState.errors.password && (
                    <p className="mt-1 text-sm text-red-500">{form.formState.errors.password.message}</p>
                  )}
                </div>
              </>
            )}
            
            {/* Form Submit Button */}
            <div className="mt-6 flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  console.log('Cancel button clicked');
                  onClose();
                }}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                onClick={(e) => {
                  console.log('Submit button clicked');
                  // If you need to bypass normal form submission:
                  // e.preventDefault();
                  // const formData = form.getValues();
                  // handleFormSubmit(formData);
                }}
              >
                {isSubmitting ? 'Connecting...' : 'Connect'}
              </Button>
            </div>
            
            {/* Debug button - direct submit bypassing form validation */}
            <div className="mt-2 border-t border-gray-200 pt-2 dark:border-gray-700">
              <p className="mb-2 text-xs text-gray-500">Troubleshooting</p>
              <button
                type="button"
                className="text-xs text-blue-600 hover:underline dark:text-blue-400"
                onClick={() => {
                  console.log('Direct submit button clicked');
                  const formData = form.getValues();
                  console.log('Form data:', formData);
                  handleFormSubmit(formData);
                }}
              >
                Debug: Direct Submit
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

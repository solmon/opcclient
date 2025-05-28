import { useEffect, useRef } from 'react'

export function useEventDebugger<T extends HTMLElement>(
  onEvent: () => void
) {
  const elementRef = useRef<T>(null)
  
  useEffect(() => {
    const element = elementRef.current
    if (!element) return
    
    // Add multiple event listeners to catch any possible event
    const handleEvent = () => {
      console.log('Event triggered on debug element')
      onEvent()
    }
    
    // Add various event types to ensure we catch all interactions
    element.addEventListener('click', handleEvent)
    element.addEventListener('mousedown', handleEvent)
    element.addEventListener('touchstart', handleEvent)
    element.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        handleEvent()
      }
    })
    
    return () => {
      element.removeEventListener('click', handleEvent)
      element.removeEventListener('mousedown', handleEvent)
      element.removeEventListener('touchstart', handleEvent)
      element.removeEventListener('keydown', handleEvent as any)
    }
  }, [onEvent])
  
  return elementRef
}

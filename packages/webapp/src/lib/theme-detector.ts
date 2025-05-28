/**
 * Theme detection and application for the OPC Client Explorer
 */

export function setupThemeDetection() {
  // Check if we're in a browser context
  if (typeof window === 'undefined') return
  
  // Function to set the theme based on user preference
  const setTheme = () => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    
    // Apply the appropriate class to the document
    if (prefersDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }
  
  // Set the theme initially
  setTheme()
  
  // Listen for changes to the user's color scheme preference
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  mediaQuery.addEventListener('change', setTheme)
  
  // Return a cleanup function
  return () => {
    mediaQuery.removeEventListener('change', setTheme)
  }
}

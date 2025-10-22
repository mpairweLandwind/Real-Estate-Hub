// Shared Google Maps API loader
let googleMapsPromise: Promise<void> | null = null
let isLoaded = false

export async function loadGoogleMapsAPI(): Promise<void> {
  // If already loaded, return immediately
  if (isLoaded && window.google?.maps) {
    return Promise.resolve()
  }

  // If loading is in progress, return the existing promise
  if (googleMapsPromise) {
    return googleMapsPromise
  }

  // Start loading
  googleMapsPromise = new Promise<void>((resolve, reject) => {
    // Check if script already exists
    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]')

    if (existingScript) {
      // Script exists, wait for it to load
      const checkInterval = setInterval(() => {
        if (window.google?.maps) {
          clearInterval(checkInterval)
          isLoaded = true
          resolve()
        }
      }, 100)

      // Timeout after 10 seconds
      setTimeout(() => {
        clearInterval(checkInterval)
        if (!window.google?.maps) {
          reject(new Error("Google Maps loading timeout"))
        }
      }, 10000)
    } else {
      // Create unique callback name using Date.now()
      const timestamp = Date.now().toString()
      const callbackName = "initGoogleMaps_" + timestamp

      // Define the callback function before creating the script
      const callbackFn = () => {
        isLoaded = true
        delete (window as any)[callbackName]
        resolve()
      }
      ;(window as any)[callbackName] = callbackFn

      // Create and load the script
      const script = document.createElement("script")
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
      script.src =
        "https://maps.googleapis.com/maps/api/js?key=" +
        apiKey +
        "&libraries=places&callback=" +
        callbackName
      script.async = true
      script.defer = true
      script.onerror = () => {
        delete (window as any)[callbackName]
        googleMapsPromise = null
        reject(new Error("Failed to load Google Maps"))
      }

      document.head.appendChild(script)
    }
  })

  return googleMapsPromise
}

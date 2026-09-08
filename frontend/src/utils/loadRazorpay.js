/**
 * Dynamically loads the Razorpay checkout script on demand.
 * Only loads once — subsequent calls return the cached promise.
 * This avoids loading the ~300 kB Razorpay script on every page.
 */
let razorpayPromise = null

export const loadRazorpay = () => {
  if (razorpayPromise) return razorpayPromise

  razorpayPromise = new Promise((resolve, reject) => {
    // If already loaded (e.g. from a previous session or manual inclusion)
    if (window.Razorpay) {
      resolve(window.Razorpay)
      return
    }

    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    script.onload = () => {
      if (window.Razorpay) {
        resolve(window.Razorpay)
      } else {
        reject(new Error('Razorpay SDK failed to load'))
      }
    }
    script.onerror = () => {
      razorpayPromise = null // Allow retry on failure
      reject(new Error('Failed to load Razorpay SDK'))
    }
    document.body.appendChild(script)
  })

  return razorpayPromise
}

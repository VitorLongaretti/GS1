// Placeholder file to match original HTML reference. The project originally referenced `scripts.js`.
// This file forwards to the real `script.js` if present.
try {
  // dynamically load script.js if it exists
  (function(){
    var s = document.createElement('script')
    s.src = 'script.js'
    s.async = true
    document.head.appendChild(s)
  })()
} catch (e) {
  console.error('Failed to load script.js fallback:', e)
}

import React, { useState, useRef, useEffect } from 'react'
import ReactDOM from 'react-dom'

const ImageCropperModal = ({ isOpen, imageFile, onClose, onCropComplete }) => {
  const [zoom, setZoom] = useState(1)
  const [offsetY, setOffsetY] = useState(0) // -100 to 100
  const [offsetX, setOffsetX] = useState(0) // -100 to 100
  const [imageObj, setImageObj] = useState(null)
  
  const canvasRef = useRef(null)

  // Load image object when imageFile changes
  useEffect(() => {
    if (!imageFile) return
    const src = typeof imageFile === 'string' ? imageFile : URL.createObjectURL(imageFile)
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      setImageObj(img)
      setZoom(1)
      setOffsetY(0)
      setOffsetX(0)
    }
    img.src = src
  }, [imageFile])

  // Draw crop preview onto Canvas whenever zoom or offsets change
  useEffect(() => {
    if (!imageObj || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const size = 320 // Output Canvas Resolution (320x320)
    canvas.width = size
    canvas.height = size

    // Clear Canvas
    ctx.clearRect(0, 0, size, size)

    // Calculate aspect ratio fill
    const scale = Math.max(size / imageObj.width, size / imageObj.height) * zoom
    const drawWidth = imageObj.width * scale
    const drawHeight = imageObj.height * scale

    const drawX = (size - drawWidth) / 2 + (offsetX * 1.5)
    const drawY = (size - drawHeight) / 2 + (offsetY * 1.5)

    // Draw Image
    ctx.drawImage(imageObj, drawX, drawY, drawWidth, drawHeight)

  }, [imageObj, zoom, offsetX, offsetY])

  const handleApplyCrop = () => {
    if (!canvasRef.current) return

    canvasRef.current.toBlob((blob) => {
      if (blob) {
        const croppedFile = new File([blob], 'cropped_avatar.jpg', { type: 'image/jpeg' })
        onCropComplete(croppedFile)
      }
    }, 'image/jpeg', 0.95)
  }

  if (!isOpen || !imageFile) return null

  // Render modal directly onto document.body using Portal so it covers 100% of viewport
  return ReactDOM.createPortal(
    <div className="fixed inset-0 top-0 left-0 right-0 bottom-0 w-screen h-screen bg-slate-900/50 backdrop-blur-xs z-[99999] flex items-center justify-center p-3 sm:p-4 animate-fadeIn overflow-y-auto">
      <div className="bg-white rounded-3xl p-5 sm:p-7 max-w-md w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-purple-100 space-y-4 sm:space-y-5 relative my-auto">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center text-lg sm:text-xl shadow-inner border border-purple-100 shrink-0">
              ✂️
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-gray-800 tracking-tight">Crop & Adjust Profile Photo</h3>
              <p className="text-[10px] sm:text-[11px] text-gray-500 font-medium">Zoom and position your picture for the best profile frame</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-gray-500 flex items-center justify-center transition text-xs font-bold shrink-0 cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Viewport Canvas Frame - Responsive Scaling */}
        <div className="relative w-48 h-48 sm:w-60 sm:h-60 mx-auto rounded-3xl overflow-hidden shadow-xl border-4 border-white ring-4 ring-purple-100 bg-slate-900 flex items-center justify-center shrink-0">
          <canvas ref={canvasRef} className="w-full h-full object-cover" />
          
          {/* Subtle Crop Grid Frame Overlay */}
          <div className="absolute inset-0 border-2 border-purple-400/30 rounded-3xl pointer-events-none" />
        </div>

        {/* Adjustments Panel */}
        <div className="space-y-3 sm:space-y-3.5 bg-slate-50 p-3.5 sm:p-4 rounded-2xl border border-slate-200/70">
          
          {/* Zoom Level Slider */}
          <div className="space-y-1 sm:space-y-1.5">
            <div className="flex justify-between items-center text-xs font-bold text-gray-700">
              <span className="flex items-center gap-1">🔍 Zoom Level</span>
              <span className="text-purple-700 font-mono bg-purple-50 px-2 py-0.5 rounded-md border border-purple-100 text-[11px]">{zoom.toFixed(1)}x</span>
            </div>
            <input
              type="range"
              min="1"
              max="3"
              step="0.1"
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="w-full accent-purple-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
            />
          </div>

          {/* Vertical Height Offset Slider */}
          <div className="space-y-1 sm:space-y-1.5">
            <div className="flex justify-between items-center text-xs font-bold text-gray-700">
              <span className="flex items-center gap-1">↕️ Height Position</span>
              <span className="text-purple-700 font-mono bg-purple-50 px-2 py-0.5 rounded-md border border-purple-100 text-[11px]">{offsetY > 0 ? `+${offsetY}` : offsetY}px</span>
            </div>
            <input
              type="range"
              min="-100"
              max="100"
              step="5"
              value={offsetY}
              onChange={(e) => setOffsetY(parseInt(e.target.value))}
              className="w-full accent-purple-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
            />
          </div>

          {/* Quick Presets Grid */}
          <div className="grid grid-cols-3 gap-1.5 sm:gap-2 pt-1">
            <button
              onClick={() => { setOffsetY(35); setZoom(1.2); }}
              className="py-1.5 px-1.5 sm:px-2 bg-white border border-slate-200 hover:border-purple-300 rounded-xl text-[10px] sm:text-[11px] font-bold text-gray-700 hover:text-purple-700 transition text-center shadow-2xs cursor-pointer"
            >
              👤 Face Focus
            </button>
            <button
              onClick={() => { setOffsetY(0); setOffsetX(0); setZoom(1); }}
              className="py-1.5 px-1.5 sm:px-2 bg-white border border-slate-200 hover:border-purple-300 rounded-xl text-[10px] sm:text-[11px] font-bold text-gray-700 hover:text-purple-700 transition text-center shadow-2xs cursor-pointer"
            >
              🎯 Center
            </button>
            <button
              onClick={() => { setZoom(1); setOffsetY(0); setOffsetX(0); }}
              className="py-1.5 px-1.5 sm:px-2 bg-slate-200 text-gray-600 hover:bg-slate-300 rounded-xl text-[10px] sm:text-[11px] font-bold transition text-center cursor-pointer"
            >
              🔄 Reset
            </button>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3 pt-1 border-t border-slate-100">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-gray-600 hover:bg-slate-100 transition cursor-pointer text-center"
          >
            Cancel
          </button>
          <button
            onClick={handleApplyCrop}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-purple-600 text-white text-xs font-extrabold hover:bg-purple-700 shadow-md hover:shadow-lg transition cursor-pointer text-center"
          >
            Apply & Save Crop
          </button>
        </div>

      </div>
    </div>,
    document.body
  )
}

export default ImageCropperModal

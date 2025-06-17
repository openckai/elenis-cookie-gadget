import * as React from "react"
import { useState, useRef, useCallback, useEffect } from "react"
import "./cookie-customizer.css"
import { generateCookiePreviewImage, generateMaskedCookieImageForShape, downloadImage } from "./imageGenerator"

type CookieShape = "circle" | "square" | "rect"
type QuantityOption = 24 | 48 | 72 | "MORE"
type DragMode = "image" | "text" | null

interface DragState {
  readonly isDragging: boolean
  readonly isResizing: boolean
  readonly startX: number
  readonly startY: number
  readonly startScale: number
  readonly startPosition: { readonly x: number; readonly y: number }
  readonly resizeHandle: string | null
  readonly dragMode: DragMode
}

interface ImageSize {
  readonly width: number
  readonly height: number
}

interface Position {
  readonly x: number
  readonly y: number
}

export default function CookieCustomizer() {
  const [selectedShape, setSelectedShape] = React.useState<CookieShape>("circle")
  const [uploadedImage, setUploadedImage] = React.useState<string | null>(null)
  const [customText, setCustomText] = React.useState("")
  const [additionalText, setAdditionalText] = React.useState("")
  const [selectedFont, setSelectedFont] = React.useState("")
  const [fontColor, setFontColor] = React.useState("#000000")
  const [quantity, setQuantity] = React.useState<QuantityOption>(48)
  const [customQuantity, setCustomQuantity] = React.useState<number>(100)
  const [showCustomQuantity, setShowCustomQuantity] = React.useState(false)
  const [imageScale, setImageScale] = React.useState(1)
  const [imagePosition, setImagePosition] = React.useState<Position>({ x: 0, y: 0 })
  const [textPosition, setTextPosition] = React.useState<Position>({ x: 0, y: 0 }) // New state for text position
  const [showImageControls, setShowImageControls] = React.useState(false)
  const [showTextControls, setShowTextControls] = React.useState(false) // New state for text controls
  const [imageSize, setImageSize] = React.useState<ImageSize>({ width: 85, height: 85 }) // Larger initial size
  const [dragState, setDragState] = React.useState<DragState>({
    isDragging: false,
    isResizing: false,
    startX: 0,
    startY: 0,
    startScale: 1,
    startPosition: { x: 0, y: 0 },
    resizeHandle: null,
    dragMode: null,
  })

  const [showColorModal, setShowColorModal] = React.useState(false)
  const [tempColor, setTempColor] = React.useState("#000000")

  // New state for adjustment modal
  const [showAdjustmentModal, setShowAdjustmentModal] = React.useState(false)

  // New state to track if image is confirmed on mobile
  const [imageConfirmedOnMobile, setImageConfirmedOnMobile] = React.useState(false)

  // State to track if we're on mobile
  const [isMobile, setIsMobile] = React.useState(false)

  // Add loading state for checkout
  const [isGeneratingImage, setIsGeneratingImage] = React.useState(false)

  // Refs for scroll detection
  const customizerRef = React.useRef<HTMLDivElement>(null)
  const previewRef = React.useRef<HTMLDivElement>(null)

  // Add refs for mobile and desktop preview elements
  const mobilePreviewRef = React.useRef<HTMLDivElement>(null)
  const desktopPreviewRef = React.useRef<HTMLDivElement>(null)

  // Check if we're on mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)

    return () => {
      window.removeEventListener("resize", checkMobile)
    }
  }, [])

  const imageRef = React.useRef<HTMLDivElement>(null)
  const containerRef = React.useRef<HTMLDivElement>(null)

  // Predefined color swatches
  const colorSwatches = [
    "#000000", // Black
    "#FFFFFF", // White
    "#D53E6C", // Pink
    "#FF0000", // Red
    "#00FF00", // Green
    "#0000FF", // Blue
    "#FFFF00", // Yellow
    "#FF8C00", // Orange
    "#800080", // Purple
    "#8B4513", // Brown
    "#FFB6C1", // Light Pink
    "#87CEEB", // Sky Blue
  ]

  // Font options
  const fontOptions = [
    { value: "", label: "Select Font", family: "inherit" },
    { value: "Arial", label: "Arial", family: "Arial, sans-serif" },
    { value: "Helvetica", label: "Helvetica", family: "Helvetica, sans-serif" },
    { value: "Times New Roman", label: "Times New Roman", family: "'Times New Roman', serif" },
    { value: "Georgia", label: "Georgia", family: "Georgia, serif" },
    { value: "Verdana", label: "Verdana", family: "Verdana, sans-serif" },
    { value: "Trebuchet MS", label: "Trebuchet MS", family: "'Trebuchet MS', sans-serif" },
    { value: "Impact", label: "Impact", family: "Impact, sans-serif" },
    { value: "Comic Sans MS", label: "Comic Sans MS", family: "'Comic Sans MS', cursive" },
    { value: "Courier New", label: "Courier New", family: "'Courier New', monospace" },
    { value: "Palatino", label: "Palatino", family: "Palatino, serif" },
    { value: "Garamond", label: "Garamond", family: "Garamond, serif" },
    { value: "Bookman", label: "Bookman", family: "Bookman, serif" },
    { value: "Avant Garde", label: "Avant Garde", family: "'Avant Garde', sans-serif" },
    { value: "Brush Script MT", label: "Brush Script", family: "'Brush Script MT', cursive" },
  ]

  // Price calculation
  const basePrice = 1.25 // Base price per cookie
  const getCurrentQuantity = () => {
    if (quantity === "MORE") return customQuantity
    return quantity as number
  }

  const getTotalPrice = () => {
    const qty = getCurrentQuantity()
    return (qty * basePrice).toFixed(2)
  }

  // Set initial image size when component mounts
  useEffect(() => {
    // Set size to fill most of the cookie area
    setImageSize({ width: 85, height: 85 })
  }, [])

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const result = event.target?.result as string
        setUploadedImage(result)

        // Only show adjustment modal on mobile
        if (isMobile) {
          setShowAdjustmentModal(true)
          setImageConfirmedOnMobile(false)
        } else {
          // For desktop, show image controls directly
          setShowImageControls(true)
          setShowTextControls(false)
        }

        setImageScale(1)
        setImagePosition({ x: 0, y: 0 })
        setImageSize({ width: 85, height: 85 })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleUploadClick = () => {
    // Fallback to demo image if no file is selected
    setUploadedImage("/assets/cover-prot.jpg")

    // Only show adjustment modal on mobile
    if (isMobile) {
      setShowAdjustmentModal(true)
      setImageConfirmedOnMobile(false)
    } else {
      // For desktop, show image controls directly
      setShowImageControls(true)
      setShowTextControls(false)
    }

    setImageScale(1)
    setImagePosition({ x: 0, y: 0 })
    setImageSize({ width: 85, height: 85 })
  }

  const handleLooksGood = () => {
    setShowAdjustmentModal(false)

    // For mobile, mark the image as confirmed
    if (isMobile) {
      setImageConfirmedOnMobile(true)
    } else {
      // For desktop, show the transform controls as before
      setShowImageControls(true)
      setShowTextControls(false)
    }
  }

  const handleChangePhoto = () => {
    // Trigger file input click
    const fileInput = document.getElementById(
      isMobile ? "image-upload-mobile" : "image-upload-desktop",
    ) as HTMLInputElement
    if (fileInput) {
      fileInput.click()
    }
  }

  const handleEditClick = () => {
    if (uploadedImage) {
      setShowAdjustmentModal(true)
    }
  }

  const handleQuantitySelect = (qty: QuantityOption) => {
    if (qty === "MORE") {
      setShowCustomQuantity(true)
    } else {
      setShowCustomQuantity(false)
    }
    setQuantity(qty)
  }

  const handleColorSwatchClick = (color: string) => {
    setFontColor(color)
  }

  const handleColorPickerClick = () => {
    setTempColor(fontColor)
    setShowColorModal(true)
  }

  const handleColorConfirm = () => {
    setFontColor(tempColor)
    setShowColorModal(false)
  }

  const handleColorCancel = () => {
    setShowColorModal(false)
  }

  // Checkout handler with image generation
  const handleCheckout = async () => {
    setIsGeneratingImage(true)

    try {
      let imageDataUrl: string

      // If we have an uploaded image, use the masked cookie image generation method
      if (uploadedImage && (imageConfirmedOnMobile || !isMobile)) {
        console.log('Generating with uploaded image:', {
          uploadedImage,
          selectedShape,
          imagePosition,
          imageScale,
          imageSize,
          customText,
          fontColor,
          selectedFont
        })

        const cookieShape = cookieShapes.find(shape => shape.id === selectedShape)
        if (cookieShape) {
          // Calculate the overlay transform based on current state
          const baseSize = 600 // Base canvas size
          const overlayWidthPx = (imageSize.width / 100) * baseSize * imageScale
          const overlayHeightPx = (imageSize.height / 100) * baseSize * imageScale

          // Calculate position - convert from percentage offset to pixel position
          const centerX = baseSize / 2
          const centerY = baseSize / 2
          const overlayX = centerX + (imagePosition.x * 0.5) - (overlayWidthPx / 2)
          const overlayY = centerY + (imagePosition.y * 0.5) - (overlayHeightPx / 2)

          console.log('Overlay transform:', {
            x: overlayX,
            y: overlayY,
            width: overlayWidthPx,
            height: overlayHeightPx
          })

          try {
            imageDataUrl = await generateMaskedCookieImageForShape({
              baseImageUrl: cookieShape.prototypeImage,
              overlayImageUrl: uploadedImage,
              shape: selectedShape,
              overlayTransform: {
                x: overlayX,
                y: overlayY,
                width: overlayWidthPx,
                height: overlayHeightPx,
              },
              width: baseSize,
              height: baseSize,
              text: customText,
              textColor: fontColor,
              textFont: selectedFont || 'sans-serif',
              textPosition: textPosition,
              textSize: 32,
            })
            console.log('Successfully generated masked image')
          } catch (maskError) {
            console.error('Masked generation failed, falling back to DOM capture:', maskError)
            // Fallback to DOM capture if mask generation fails
            const currentPreviewRef = isMobile ? mobilePreviewRef : desktopPreviewRef
            if (!currentPreviewRef.current) {
              throw new Error('Preview element not found')
            }
            imageDataUrl = await generateCookiePreviewImage(currentPreviewRef, {
              backgroundColor: '#f8bbd9',
              useCORS: true,
              scale: 2,
            })
          }
        } else {
          throw new Error('Cookie shape not found')
        }
      } else {
        console.log('No uploaded image, using DOM capture')
        // Fallback to DOM capture method only if no uploaded image
        const currentPreviewRef = isMobile ? mobilePreviewRef : desktopPreviewRef

        if (!currentPreviewRef.current) {
          throw new Error('Preview element not found')
        }

        // Generate image from the current preview
        imageDataUrl = await generateCookiePreviewImage(currentPreviewRef, {
          backgroundColor: '#f8bbd9',
          useCORS: true,
          scale: 2,
        })
      }

      // Download the generated image
      downloadImage(imageDataUrl, `cookie-design-${selectedShape}-${Date.now()}.png`)

      // Here you would typically proceed with the actual checkout process
      console.log('Generated image for checkout:', imageDataUrl.substring(0, 50) + '...')

      // You can add your checkout logic here, for example:
      // - Send image to your backend
      // - Redirect to payment page
      // - Show checkout modal

    } catch (error) {
      console.error('Error generating preview image:', error)
      alert('Error generating preview image. Please try again.')
    } finally {
      setIsGeneratingImage(false)
    }
  }

  // Memoize text dimensions calculation
  const textDimensions = React.useMemo(() => {
    const textLength = customText.length
    // Adjust character width to match text size more precisely
    const estimatedCharWidth = 3.0 // Increased for larger clickable area
    const estimatedLineHeight = 8 // Increased for larger clickable area
    const padding = 2 // Increased padding for better interaction

    const baseWidth = Math.min(Math.max(textLength * estimatedCharWidth, 30), 90) // Adjusted min/max
    const baseHeight = estimatedLineHeight

    return {
      width: baseWidth + (padding * 2),
      height: baseHeight + (padding * 2)
    }
  }, [customText])

  // Calculate transform box style for text - match exactly the text boundaries
  const getTextTransformBoxStyle = useCallback(() => {
    const baseLeft = 50 // Center horizontally
    const baseTop = 75 // Bottom area

    const pixelToPercentX = 0.1
    const pixelToPercentY = 0.1

    const finalLeft = baseLeft + textPosition.x * pixelToPercentX
    const finalTop = baseTop + textPosition.y * pixelToPercentY

    return {
      left: `${finalLeft - textDimensions.width / 2}%`,
      top: `${finalTop - textDimensions.height / 2}%`,
      width: `${textDimensions.width}%`,
      height: `${textDimensions.height}%`,
      transform: "none",
      border: "2px solid rgba(213, 62, 108, 0.7)",
      borderRadius: "2px",
      pointerEvents: "all" as const,
      cursor: dragState.isDragging && dragState.dragMode === "text" ? "grabbing" : "grab",
      backgroundColor: showTextControls ? "rgba(213, 62, 108, 0.1)" : "transparent" // Highlight when selected
    }
  }, [textPosition, textDimensions, dragState.isDragging, dragState.dragMode, showTextControls])

  const handleCookieContainerClick = React.useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (dragState.isDragging || dragState.isResizing) return;

      // Get the click coordinates relative to the container
      const container = event.currentTarget
      const rect = container.getBoundingClientRect()
      const x = event.clientX - rect.left
      const y = event.clientY - rect.top

      // Convert coordinates to percentages
      const clickX = (x / rect.width) * 100
      const clickY = (y / rect.height) * 100

      // Check if click is within text boundaries
      const textLeft = 50 + textPosition.x * 0.1 - textDimensions.width / 2
      const textRight = textLeft + textDimensions.width
      const textTop = 75 + textPosition.y * 0.1 - textDimensions.height / 2
      const textBottom = textTop + textDimensions.height

      const isWithinTextBounds =
        clickX >= textLeft &&
        clickX <= textRight &&
        clickY >= textTop &&
        clickY <= textBottom

      if (isWithinTextBounds && customText) {
        setShowTextControls(true)
        setShowImageControls(false)
      } else {
        setShowImageControls(true)
        setShowTextControls(false)
      }
    },
    [textPosition, textDimensions, customText, dragState.isDragging, dragState.isResizing, setShowTextControls, setShowImageControls]
  )

  const handleImageDragStart = React.useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault()
      event.stopPropagation()

      setDragState({
        isDragging: true,
        isResizing: false,
        startX: event.clientX,
        startY: event.clientY,
        startScale: imageScale,
        startPosition: { ...imagePosition },
        resizeHandle: null,
        dragMode: "image",
      })

      setShowImageControls(true)
      setShowTextControls(false)
    },
    [imageScale, imagePosition],
  )

  // Text drag start handler
  const handleTextDragStart = React.useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault()
      event.stopPropagation()

      // Set dragging state
      setDragState({
        isDragging: true,
        isResizing: false,
        startX: event.clientX,
        startY: event.clientY,
        startScale: 1,
        startPosition: { ...textPosition },
        resizeHandle: null,
        dragMode: "text",
      })

      // Update controls visibility
      setShowTextControls(true)
      setShowImageControls(false)
    },
    [textPosition],
  )

  // Safe resize handler
  const handleResizeStart = React.useCallback(
    (event: React.MouseEvent, handle: string) => {
      event.preventDefault()
      event.stopPropagation()

      setDragState({
        isDragging: false,
        isResizing: true,
        startX: event.clientX,
        startY: event.clientY,
        startScale: imageScale,
        startPosition: { ...imagePosition },
        resizeHandle: handle,
        dragMode: "image",
      })
    },
    [imageScale, imagePosition],
  )

  const handleMouseMove = React.useCallback(
    (event: MouseEvent) => {
      if (!dragState.isDragging && !dragState.isResizing) return

      const deltaX = event.clientX - dragState.startX
      const deltaY = event.clientY - dragState.startY

      if (dragState.isDragging) {
        if (dragState.dragMode === "image") {
          // Existing image dragging code...
          const maxOffset = 100
          const newX = Math.max(-maxOffset, Math.min(maxOffset, dragState.startPosition.x + deltaX * 0.5))
          const newY = Math.max(-maxOffset, Math.min(maxOffset, dragState.startPosition.y + deltaY * 0.5))

          setImagePosition({
            x: newX,
            y: newY,
          })
        } else if (dragState.dragMode === "text") {
          // Updated text dragging logic with better sensitivity
          const maxOffset = 200
          const sensitivity = 0.5 // Reduced sensitivity for more precise control

          // Calculate new position based on the drag delta
          const newX = Math.max(-maxOffset, Math.min(maxOffset, dragState.startPosition.x + deltaX * sensitivity))
          const newY = Math.max(-maxOffset, Math.min(maxOffset, dragState.startPosition.y + deltaY * sensitivity))

          setTextPosition({
            x: newX,
            y: newY,
          })
        }
      } else if (dragState.isResizing && dragState.dragMode === "image") {
        // Resizing with corner handles (only for images)
        let scaleFactor = 1

        switch (dragState.resizeHandle) {
          case "top-left":
            scaleFactor = 1 - (deltaX + deltaY) * 0.002
            break
          case "top-right":
            scaleFactor = 1 + (deltaX - deltaY) * 0.002
            break
          case "bottom-left":
            scaleFactor = 1 + (-deltaX + deltaY) * 0.002
            break
          case "bottom-right":
            scaleFactor = 1 + (deltaX + deltaY) * 0.002
            break
          default:
            scaleFactor = 1 + (deltaX + deltaY) * 0.002
        }

        const newScale = Math.max(0.3, Math.min(3, dragState.startScale * scaleFactor))
        setImageScale(newScale)
      }
    },
    [dragState, setImagePosition, setTextPosition],
  )

  const handleMouseUp = React.useCallback(() => {
    setDragState({
      isDragging: false,
      isResizing: false,
      startX: 0,
      startY: 0,
      startScale: 1,
      startPosition: { x: 0, y: 0 },
      resizeHandle: null,
      dragMode: null,
    })
  }, [])

  // Add global mouse event listeners
  useEffect(() => {
    if (dragState.isDragging || dragState.isResizing) {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
      return () => {
        document.removeEventListener("mousemove", handleMouseMove)
        document.removeEventListener("mouseup", handleMouseUp)
      }
    }
  }, [dragState.isDragging, dragState.isResizing, handleMouseMove, handleMouseUp])

  const cookieShapes = [
    {
      id: "circle",
      image: "/assets/cookie-circle.png",
      prototypeImage: "/assets/cookie-circle-prot.png",
      alt: "Round cookie",
    },
    {
      id: "square",
      image: "/assets/cookie-square.png",
      prototypeImage: "/assets/cookie-square-prot.png",
      alt: "Square cookie",
    },
    {
      id: "rect",
      image: "/assets/cookie-rect.png",
      prototypeImage: "/assets/cookie-rect-prot.png",
      alt: "Rect cookie",
    },
  ]

  // Get the image style - this is the source of truth for image positioning
  const getImageStyle = () => {
    return {
      objectFit: "cover" as const,
      transform: `translate(${imagePosition.x}px, ${imagePosition.y}px) scale(${imageScale})`,
      width: `${imageSize.width}%`,
      height: `${imageSize.height}%`,
      left: `${(100 - imageSize.width) / 2}%`,
      top: `${(100 - imageSize.height) / 2}%`,
      position: "absolute" as const,
      cursor: dragState.isDragging && dragState.dragMode === "image" ? "grabbing" : "grab",
      transformOrigin: "center center",
    }
  }

  // Calculate transform box style to EXACTLY match the image position
  const getImageTransformBoxStyle = () => {
    const scaleValue = imageScale
    const translateX = imagePosition.x
    const translateY = imagePosition.y

    const finalWidth = imageSize.width * scaleValue
    const finalHeight = imageSize.height * scaleValue

    const baseLeft = (100 - imageSize.width) / 2
    const baseTop = (100 - imageSize.height) / 2

    const pixelToPercentX = 0.1
    const pixelToPercentY = 0.1

    const finalLeft = baseLeft + translateX * pixelToPercentX - (finalWidth - imageSize.width) / 2
    const finalTop = baseTop + translateY * pixelToPercentY - (finalHeight - imageSize.height) / 2

    return {
      left: `${finalLeft}%`,
      top: `${finalTop}%`,
      width: `${finalWidth}%`,
      height: `${finalHeight}%`,
      transform: "none",
    }
  }

  // Update the text rendering style to match the dragging position exactly
  const getTextStyle = useCallback(() => {
    return {
      pointerEvents: "all" as const,
      zIndex: 12,
      position: "absolute" as const,
      left: `${50 + textPosition.x * 0.1}%`,
      top: `${75 + textPosition.y * 0.1}%`,
      transform: "translate(-50%, -50%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "transparent",
      border: "2px solid transparent",
      borderRadius: "4px",
      cursor: dragState.isDragging && dragState.dragMode === "text" ? "grabbing" : "grab",
      width: `${textDimensions.width}%`,
      height: `${textDimensions.height}%`,
      padding: "2px 4px",
      userSelect: "none" as const,
      WebkitUserSelect: "none" as const,
      msUserSelect: "none" as const,
      touchAction: "none" as const, // Prevent touch events from interfering
    }
  }, [textPosition, dragState.isDragging, dragState.dragMode, textDimensions])

  // Update text element rendering for both mobile and desktop
  const renderTextElement = (className: string) => (
    <div
      className={className}
      onMouseDown={(e) => {
        e.preventDefault() // Prevent text selection
        e.stopPropagation()
        handleTextDragStart(e)
      }}
      style={getTextStyle()}
    >
      <p
        style={{
          color: fontColor,
          fontFamily: selectedFont || "sans-serif",
          margin: 0,
          userSelect: "none",
          WebkitUserSelect: "none",
          msUserSelect: "none",
          pointerEvents: "none", // Prevent text from interfering with drag
        }}
      >
        {customText.toUpperCase()}
      </p>
    </div>
  )

  return (
    <div className="cookie-customizer-root">
      <div className="main-container">
        <div className=" max-width-container">
          <div className="customizer-container">
            {/* Mobile Layout */}
            <div className="mobile-layout">
              <div className="mobile-content">
                {/* Mobile Cookie Preview */}
                <div
                  className="mobile-cookie-preview"
                  ref={mobilePreviewRef}
                  style={{
                    background: "#f8bbd9",
                    backgroundImage: 'url("/assets/elenis-pattern.png")',
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "repeat",
                  }}
                >
                  <div className={`cookie-circle ${selectedShape}`}>
                    <div className="cookie-inner" ref={containerRef} onClick={handleCookieContainerClick}>
                      {/* Background Layer - Cookie Prototype (always visible) */}
                      <div className="cookie-prototype-layer">
                        <img
                          src={
                            cookieShapes.find((shape) => shape.id === selectedShape)?.prototypeImage ||
                            "/assets/cookie-circle-prot.png"
                          }
                          alt={`${selectedShape} cookie prototype`}
                          style={{ objectFit: "cover", width: "100%" }}
                        />
                      </div>

                      {/* Foreground Layer - User's uploaded image (masked to inner cookie area) */}
                      {uploadedImage && imageConfirmedOnMobile && (
                        <div className="cookie-uploaded-layer">
                          <div className="cookie-inner-mask">
                            <div
                              className="transform-container"
                              onMouseDown={handleImageDragStart}
                              style={{
                                pointerEvents: "all",
                                zIndex: 8,
                              }}
                            >
                              <img
                                src={uploadedImage || "/placeholder.svg"}
                                alt="Uploaded cookie design"
                                width={500}
                                height={500}
                                style={getImageStyle()}
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Text Layer (draggable) */}
                      {customText && renderTextElement("cookie-text")}
                    </div>
                  </div>

                  {/* Edit Button */}
                  {uploadedImage && imageConfirmedOnMobile && (
                    <button className="mobile-edit-button" onClick={handleEditClick}>
                      EDIT
                    </button>
                  )}
                </div>

                {/* Cookie Shape Selection */}
                <div className="section">
                  <h2 className="section-title">SELECT COOKIE SHAPE</h2>
                  <div className="shape-selector">
                    {cookieShapes.map((shape) => (
                      <button
                        key={shape.id}
                        onClick={() => setSelectedShape(shape.id as CookieShape)}
                        className={`shape-button ${selectedShape === shape.id ? "selected" : ""}`}
                      >
                        <div className="shape-image-container">
                          <img
                            src={shape.image || "/assets/placeholder.svg"}
                            alt={shape.alt}
                            style={{ objectFit: "contain", width: "100%", height: "100%" }}
                          />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="section dashed-border">
                  <h2 className="section-title">UPLOAD YOUR IMAGE</h2>
                  <label htmlFor="image-upload-mobile" className="upload-label">
                    <button className="upload-button" onClick={handleUploadClick}>
                      UPLOAD
                    </button>
                    <input
                      id="image-upload-mobile"
                      type="file"
                      accept="image/*"
                      className="file-input"
                      onChange={handleImageUpload}
                    />
                  </label>
                </div>

                <div className="section dashed-border">
                  <div className="section-header">
                    <h2 className="section-title">ADD A MESSAGE</h2>
                    <span className="optional-label">OPTIONAL</span>
                  </div>
                  <div className="text-inputs">
                    <textarea
                      placeholder="Add text"
                      className="text-area-main"
                      value={customText}
                      onChange={(e) => setCustomText(e.target.value)}
                      rows={2}
                    />
                    <textarea
                      placeholder="Add more text"
                      className="text-area"
                      value={additionalText}
                      onChange={(e) => setAdditionalText(e.target.value)}
                      rows={2}
                    />
                  </div>
                </div>

                <div className="customise-section">
                  <h2 className="customise-title">CUSTOMISE</h2>

                  <div className="customise-subsection">
                    <h3 className="customise-subsection-title">CHOOSE YOUR FONT</h3>
                    <select className="font-select" value={selectedFont} onChange={(e) => setSelectedFont(e.target.value)}>
                      {fontOptions.map((font) => (
                        <option key={font.value} value={font.value} style={{ fontFamily: font.family }}>
                          {font.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="customise-subsection">
                    <h3 className="customise-subsection-title">FONT COLOUR</h3>
                    <div className="color-picker-container">
                      <div className="color-display" onClick={handleColorPickerClick}>
                        <div className="color-preview" style={{ backgroundColor: fontColor }}></div>
                        <span className="color-label">Choose color</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="section dashed-border">
                  <h2 className="section-title">SELECT QUANTITY</h2>
                  <div className="quantity-grid">
                    {[24, 48, 72, "MORE"].map((qty) => (
                      <button
                        key={qty}
                        onClick={() => handleQuantitySelect(qty as QuantityOption)}
                        className={`quantity-button ${quantity === qty ? "selected" : ""} ${qty === "MORE" ? "more-button" : ""}`}
                      >
                        {qty}
                      </button>
                    ))}
                  </div>
                  <div className="quantity-input-field">
                    <input
                      type="text"
                      placeholder="How many cookies? (min. 12)"
                      value={showCustomQuantity ? customQuantity : ""}
                      onChange={(e) => {
                        const value = Number.parseInt(e.target.value) || 0
                        setCustomQuantity(value)
                        if (value >= 12) {
                          setQuantity("MORE")
                          setShowCustomQuantity(true)
                        }
                      }}
                      className="quantity-text-input"
                    />
                  </div>
                </div>

                <div className="section dashed-border">
                  <div className="price-section">
                    <div className="price">${getTotalPrice()}</div>
                    <div className="quantity-display">{getCurrentQuantity()}x cookies</div>
                  </div>
                  <div className="delivery-info">3-day delivery</div>
                  <button
                    className="checkout-button"
                    onClick={handleCheckout}
                    disabled={isGeneratingImage}
                  >
                    {isGeneratingImage ? 'GENERATING...' : 'CHECKOUT'}
                  </button>
                </div>
              </div>
            </div>

            {/* Desktop Layout */}
            <div className="desktop-layout">
              <div className="desktop-container">
                <div className="desktop-grid">
                  {/* Left Panel */}
                  <div className="left-panel">
                    <div className="panel-section">
                      <h2 className="section-title">SELECT COOKIE SHAPE</h2>
                      <div className="desktop-shape-selector">
                        {cookieShapes.map((shape) => (
                          <button
                            key={shape.id}
                            onClick={() => setSelectedShape(shape.id as CookieShape)}
                            className={`desktop-shape-button ${selectedShape === shape.id ? "selected" : ""}`}
                          >
                            <div className="desktop-shape-image-container">
                              <img
                                src={shape.image || "/placeholder.svg"}
                                alt={shape.alt}
                                style={{ objectFit: "contain", width: "100%", height: "100%" }}
                              />
                            </div>
                          </button>
                        ))}
                      </div>

                    </div>

                    <div className="panel-section desktop-dashed-border">
                      <h2 className="section-title">UPLOAD YOUR IMAGE</h2>
                      <label htmlFor="image-upload-desktop" className="desktop-upload-label">
                        <button className="desktop-upload-button" onClick={handleUploadClick}>
                          UPLOAD
                        </button>
                        <input
                          id="image-upload-desktop"
                          type="file"
                          accept="image/*"
                          className="file-input"
                          onChange={handleImageUpload}
                        />
                      </label>
                    </div>

                    {showImageControls && uploadedImage && !showAdjustmentModal && (
                      <div className="panel-section desktop-dashed-border">
                        <h2 className="section-title">IMAGE CONTROLS</h2>
                        <div className="desktop-control-instructions">
                          <p>• Drag image to reposition</p>
                          <p>• Drag corners to resize</p>
                          <p>Scale: {Math.round(imageScale * 100)}%</p>
                        </div>
                      </div>
                    )}

                    {showTextControls && customText && (
                      <div className="panel-section desktop-dashed-border">
                        <h2 className="section-title">TEXT CONTROLS</h2>
                        <div className="desktop-control-instructions">
                          <p>• Drag text to reposition</p>
                          <p>• Click image area to edit image</p>
                        </div>
                      </div>
                    )}
                    <div className="section-header">
                      <h2 className="section-title">ADD A MESSAGE</h2>
                      <span className="optional-label">OPTIONAL</span>
                    </div>
                    <textarea
                      placeholder="Enter your text here (will appear in uppercase)"
                      className="desktop-text-area"
                      value={customText}
                      onChange={(e) => setCustomText(e.target.value)}
                      rows={3}
                    />
                  </div>

                  {/* Center - Cookie Preview */}
                  <div className="center-panel">
                    <div className={`desktop-cookie-circle ${selectedShape}`} ref={desktopPreviewRef}>
                      <div className="desktop-cookie-inner" onClick={handleCookieContainerClick}>
                        {/* Background Layer - Cookie Prototype (always visible) */}
                        <div className="desktop-cookie-prototype-layer">
                          <img
                            src={
                              cookieShapes.find((shape) => shape.id === selectedShape)?.prototypeImage ||
                              "/assets/cookie-circle-prot.png"
                            }
                            alt={`${selectedShape} cookie prototype`}
                            style={{ objectFit: "cover", width: "100%", height: "100%" }}
                          />
                        </div>

                        {/* Foreground Layer - User's uploaded image (masked to inner cookie area) */}
                        {uploadedImage && (
                          <div className="desktop-cookie-uploaded-layer">
                            <div className="desktop-cookie-inner-mask">
                              <div
                                className="desktop-transform-container"
                                onMouseDown={handleImageDragStart}
                                style={{
                                  pointerEvents: "all",
                                  zIndex: 8,
                                }}
                              >
                                <img
                                  src={uploadedImage || "/placeholder.svg"}
                                  alt="Uploaded cookie design"
                                  width={500}
                                  height={500}
                                  style={getImageStyle()}
                                />
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Text Layer (draggable) */}
                        {customText && renderTextElement("desktop-cookie-text")}

                        {/* Image Transform Bounding Box */}
                        {showImageControls && uploadedImage && !showAdjustmentModal && (
                          <div
                            className="desktop-transform-box-overlay"
                            style={{
                              ...getImageTransformBoxStyle(),
                              zIndex: 15,
                            }}
                          >
                            <div className="desktop-transform-outline" />

                            {/* Corner Handles */}
                            <div
                              className="desktop-transform-handle corner-tl"
                              onMouseDown={(e) => handleResizeStart(e, "top-left")}
                            />
                            <div
                              className="desktop-transform-handle corner-tr"
                              onMouseDown={(e) => handleResizeStart(e, "top-right")}
                            />
                            <div
                              className="desktop-transform-handle corner-bl"
                              onMouseDown={(e) => handleResizeStart(e, "bottom-left")}
                            />
                            <div
                              className="desktop-transform-handle corner-br"
                              onMouseDown={(e) => handleResizeStart(e, "bottom-right")}
                            />
                          </div>
                        )}

                        {/* Text Transform Bounding Box */}
                        {showTextControls && customText && (
                          <div
                            className="desktop-transform-box-overlay"
                            style={{
                              ...getTextTransformBoxStyle(),
                              zIndex: 15,
                            }}
                          >
                            <div className="desktop-transform-outline" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Panel */}
                  <div className="right-panel">
                    <div className="section-header">
                      <h2 className="section-title">CUSTOMISE</h2>
                    </div>

                    <div className="panel-section">
                      <h2 className="section-title">CHOOSE YOUR FONT</h2>
                      <select
                        className="desktop-font-select"
                        value={selectedFont}
                        onChange={(e) => setSelectedFont(e.target.value)}
                      >
                        {fontOptions.map((font) => (
                          <option key={font.value} value={font.value} style={{ fontFamily: font.family }}>
                            {font.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="panel-section">
                      <h2 className="section-title">FONT COLOUR</h2>
                      <div className="desktop-color-picker-container">
                        <div className="desktop-color-display" onClick={handleColorPickerClick}>
                          <div className="desktop-color-preview" style={{ backgroundColor: fontColor }}></div>
                          <span className="desktop-color-label">Choose color</span>
                        </div>
                      </div>
                    </div>

                    <div className="panel-section">
                      <h2 className="section-title">SELECT QUANTITY</h2>
                      <div className="desktop-quantity-grid">
                        {[24, 48, 72, "MORE"].map((qty) => (
                          <button
                            key={qty}
                            onClick={() => handleQuantitySelect(qty as QuantityOption)}
                            className={`desktop-quantity-button ${quantity === qty ? "selected" : ""} ${qty === "MORE" ? "more-button" : ""}`}
                          >
                            {qty}
                          </button>
                        ))}
                      </div>
                      <div className="desktop-quantity-input-field">
                        <input
                          type="text"
                          placeholder="How many cookies? (min. 12)"
                          value={showCustomQuantity ? customQuantity : ""}
                          onChange={(e) => {
                            const value = Number.parseInt(e.target.value) || 0
                            setCustomQuantity(value)
                            if (value >= 12) {
                              setQuantity("MORE")
                              setShowCustomQuantity(true)
                            }
                          }}
                          className="desktop-quantity-text-input"
                        />
                      </div>
                    </div>

                    <div className="panel-section">
                      <div className="desktop-price-section">
                        <div className="desktop-price">${getTotalPrice()}</div>
                        <div className="desktop-quantity-display">{getCurrentQuantity()}x cookies</div>
                      </div>
                      <div className="desktop-delivery-info">ships in 3 business days</div>
                      <button
                        className="desktop-checkout-button"
                        onClick={handleCheckout}
                        disabled={isGeneratingImage}
                      >
                        {isGeneratingImage ? 'GENERATING...' : 'CHECKOUT'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Adjustment Modal */}
            {showAdjustmentModal && uploadedImage && (
              <div className="adjustment-modal-overlay">
                <div className="adjustment-modal">
                  <div className="adjustment-modal-header">
                    <button className="adjustment-modal-close" onClick={() => setShowAdjustmentModal(false)}>
                      CLOSE
                    </button>
                  </div>
                  <div className="adjustment-modal-content">
                    <div className="adjustment-cookie-preview">
                      <div className={`adjustment-cookie ${selectedShape}`}>
                        <div className="adjustment-cookie-inner">
                          {/* Background Layer */}
                          <div className="adjustment-cookie-prototype-layer">
                            <img
                              src={
                                cookieShapes.find((shape) => shape.id === selectedShape)?.prototypeImage ||
                                "/assets/cookie-circle-prot.png"
                              }
                              alt={`${selectedShape} cookie prototype`}
                              style={{ objectFit: "cover", width: "100%" }}
                            />
                          </div>

                          {/* Foreground Layer */}
                          <div className="adjustment-cookie-uploaded-layer">
                            <div className="adjustment-cookie-inner-mask">
                              <div
                                className="adjustment-transform-container"
                                onMouseDown={handleImageDragStart}
                                style={{
                                  pointerEvents: "all",
                                  zIndex: 10,
                                }}
                              >
                                <img
                                  src={uploadedImage || "/placeholder.svg"}
                                  alt="Uploaded cookie design"
                                  width={500}
                                  height={500}
                                  style={getImageStyle()}
                                />
                              </div>
                            </div>
                          </div>

                          {/* Transform Controls in Modal */}
                          <div
                            className="adjustment-transform-box-overlay"
                            style={{
                              ...getImageTransformBoxStyle(),
                              zIndex: 15,
                            }}
                          >
                            <div className="adjustment-transform-outline" />

                            {/* Corner Handles */}
                            <div
                              className="adjustment-transform-handle corner-tl"
                              onMouseDown={(e) => handleResizeStart(e, "top-left")}
                            />
                            <div
                              className="adjustment-transform-handle corner-tr"
                              onMouseDown={(e) => handleResizeStart(e, "top-right")}
                            />
                            <div
                              className="adjustment-transform-handle corner-bl"
                              onMouseDown={(e) => handleResizeStart(e, "bottom-left")}
                            />
                            <div
                              className="adjustment-transform-handle corner-br"
                              onMouseDown={(e) => handleResizeStart(e, "bottom-right")}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <h2 className="adjustment-title">ADJUST PHOTO</h2>

                    <div className="adjustment-controls-info">
                      <p>• Drag the image to reposition</p>
                      <p>• Drag corner handles to resize</p>
                      <p>Scale: {Math.round(imageScale * 100)}%</p>
                    </div>

                    <button className="looks-good-button" onClick={handleLooksGood}>
                      LOOKS GOOD
                    </button>

                    <button className="change-photo-button" onClick={handleChangePhoto}>
                      CHANGE PHOTO
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Color Picker Modal */}
            {showColorModal && (
              <div className="color-modal-overlay" onClick={handleColorCancel}>
                <div className="color-modal" onClick={(e) => e.stopPropagation()}>
                  <div className="color-modal-header">
                    <h3>Choose Color</h3>
                    <button className="color-modal-close" onClick={handleColorCancel}>
                      ×
                    </button>
                  </div>

                  <div className="color-modal-content">
                    {/* Color Wheel/Picker */}
                    <div className="color-picker-section">
                      <input
                        type="color"
                        value={tempColor}
                        onChange={(e) => setTempColor(e.target.value)}
                        className="color-wheel-picker"
                      />
                    </div>

                    {/* Color Swatches */}
                    <div className="color-swatches-section">
                      <h4>Quick Colors</h4>
                      <div className="modal-color-swatches">
                        {colorSwatches.map((color) => (
                          <button
                            key={color}
                            className={`modal-color-swatch ${tempColor === color ? "selected" : ""}`}
                            style={{ backgroundColor: color }}
                            onClick={() => setTempColor(color)}
                            aria-label={`Select ${color} color`}
                          />
                        ))}
                      </div>
                    </div>

                    {/* RGB Input */}
                    <div className="rgb-input-section">
                      <h4>RGB Values</h4>
                      <div className="rgb-inputs">
                        <input
                          type="text"
                          placeholder="Hex"
                          value={tempColor}
                          onChange={(e) => setTempColor(e.target.value)}
                          className="hex-input"
                        />
                      </div>
                    </div>

                    {/* Preview */}
                    <div className="color-preview-section">
                      <h4>Preview</h4>
                      <div className="color-preview-large" style={{ backgroundColor: tempColor }}>
                        <span style={{ color: tempColor === "#FFFFFF" ? "#000000" : "#FFFFFF" }}>Sample Text</span>
                      </div>
                    </div>
                  </div>

                  <div className="color-modal-footer">
                    <button className="color-cancel-btn" onClick={handleColorCancel}>
                      Cancel
                    </button>
                    <button className="color-confirm-btn" onClick={handleColorConfirm}>
                      Apply Color
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

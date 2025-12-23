'use client'

import React, { useEffect, useRef, useState } from 'react'
import { useScroll, useTransform, motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'
import { Database } from '@/types/supabase'
import { Button } from '@/components/ui/Button'

type HeroService = Database['public']['Tables']['hero_services']['Row']

const FRAME_COUNT = 60 // Assumed standard frame count
const SCROLL_HEIGHT = 3000 // Height of the scrollable area in pixels

export default function CinematicHero() {
    const [services, setServices] = useState<HeroService[]>([])
    const [currentIndex, setCurrentIndex] = useState(0)
    const [loading, setLoading] = useState(true)
    const [images, setImages] = useState<HTMLImageElement[]>([])
    const [isStatic, setIsStatic] = useState(false)

    const containerRef = useRef<HTMLDivElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"]
    })

    // Transform scrollYProgress (0 -> 1) to frame index (0 -> FRAME_COUNT - 1)
    const frameIndex = useTransform(scrollYProgress, [0, 1], [0, FRAME_COUNT - 1])

    useEffect(() => {
        fetchServices()
    }, [])

    useEffect(() => {
        let cleanup: (() => void) | undefined
        // Reset static state when index changes
        setIsStatic(false)
        if (services.length > 0) {
            setLoading(true)
            cleanup = preloadImages(services[currentIndex].image_folder_url)
        }
        return () => {
            if (cleanup) cleanup()
        }
    }, [currentIndex, services])

    // ... (keep useEffect for render loop)

    useEffect(() => {
        // Render loop responding to scroll
        const unsubscribe = frameIndex.on('change', (latest) => {
            const index = Math.min(Math.max(Math.floor(latest), 0), FRAME_COUNT - 1)
            renderFrame(index)
        })
        return () => unsubscribe()
    }, [images]) // Re-bind when images change

    const fetchServices = async () => {
        try {
            setLoading(true)
            const { data, error } = await supabase
                .from('hero_services')
                .select('*')
                .eq('active', true)
                .order('sort_order')

            if (error) throw error
            if (data && data.length > 0) {
                setServices(data)
                // effect will trigger loading=true
            } else {
                setLoading(false)
            }
        } catch (err) {
            console.error('Error fetching hero services:', err)
            setLoading(false)
        } finally {
            // Nothing needed content-wise
        }
    }

    const renderFallback = () => {
        const canvas = canvasRef.current
        const ctx = canvas?.getContext('2d')
        if (!canvas || !ctx) return

        // Clear
        ctx.clearRect(0, 0, canvas.width, canvas.height)

        // Draw a nice gradient placeholder
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
        gradient.addColorStop(0, '#1a1a1a')
        gradient.addColorStop(0.5, '#2d2d2d')
        gradient.addColorStop(1, '#1a1a1a')

        ctx.fillStyle = gradient
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        // Add a grid pattern
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)'
        ctx.lineWidth = 1
        const gridSize = 50

        for (let x = 0; x < canvas.width; x += gridSize) {
            ctx.beginPath()
            ctx.moveTo(x, 0)
            ctx.lineTo(x, canvas.height)
            ctx.stroke()
        }
        for (let y = 0; y < canvas.height; y += gridSize) {
            ctx.beginPath()
            ctx.moveTo(0, y)
            ctx.lineTo(canvas.width, y)
            ctx.stroke()
        }

        // Add "Asset Missing" text safely in corner
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)'
        ctx.font = '10px monospace'
        ctx.fillText('ASSET SEQUENCE MISSING: ' + (services[currentIndex]?.image_folder_url || 'Unknown'), 20, canvas.height - 20)
    }

    const renderFrame = (index: number) => {
        const canvas = canvasRef.current
        const ctx = canvas?.getContext('2d')
        if (!canvas || !ctx) return

        // If we have no valid images, but we know we are done loading (and failed), render fallback
        if (images.length === 0 || images.every(img => !img.complete || img.naturalWidth === 0)) {
            // renderFallback() // Avoid recursion if called from fallback
            return
        }

        // Clear
        ctx.clearRect(0, 0, canvas.width, canvas.height)

        // If specific frame is missing/error, try to find nearest valid frame
        let img = images[index]
        if (!img || !img.complete || img.naturalWidth === 0) {
            // Find first valid
            img = images.find(i => i.complete && i.naturalWidth > 0) as HTMLImageElement
        }

        if (!img) {
            // renderFallback()
            return
        }

        // Draw
        // Calculate aspect fill
        const hRatio = canvas.width / img.width
        const vRatio = canvas.height / img.height
        const ratio = Math.max(hRatio, vRatio)

        const centerShift_x = (canvas.width - img.width * ratio) / 2
        const centerShift_y = (canvas.height - img.height * ratio) / 2

        ctx.drawImage(img, 0, 0, img.width, img.height,
            centerShift_x, centerShift_y, img.width * ratio, img.height * ratio)
    }

    const preloadImages = (folderUrl: string) => {
        if (!folderUrl) {
            console.warn('No folder URL provided for hero service')
            setLoading(false)
            return () => { }
        }

        let isCancelled = false

        // Support static single images
        const isStaticUrl = folderUrl.match(/\.(jpeg|jpg|png|webp|gif)(\?.*)?$/i)

        if (isStaticUrl) {
            console.log(`Detected static/animated image source: ${folderUrl}`)
            // For static/animated files, we don't need to preload into Canvas
            // We just verify it loads to remove "Loading..." state
            const img = new Image()
            img.src = folderUrl
            img.onload = () => {
                if (!isCancelled) {
                    setIsStatic(true)
                    setLoading(false)
                }
            }
            img.onerror = () => {
                if (!isCancelled) {
                    console.error('Failed to load image source')
                    setLoading(false)
                    // We'll let the fallback render via canvas or UI
                }
            }
            return () => { isCancelled = true }
        }

        // ... (Sequence Logic)
        setIsStatic(false)
        // ...
        let loadedImages: HTMLImageElement[] = new Array(FRAME_COUNT)
        let loadedCount = 0
        let errorCount = 0

        const timeoutId = setTimeout(() => {
            if (!isCancelled && loading) {
                console.warn('Image loading timed out. Forcing render.')
                setLoading(false)
            }
        }, 5000)

        for (let i = 0; i < FRAME_COUNT; i++) {
            const img = new Image()
            const toggle = i.toString().padStart(3, '0')
            img.src = `${folderUrl}/frame_${toggle}.webp`

            const onFinish = () => {
                if (isCancelled) return

                loadedCount++
                if (loadedCount === FRAME_COUNT) {
                    clearTimeout(timeoutId)
                    console.log(`Loading complete. Errors: ${errorCount}/${FRAME_COUNT}`)
                    setImages(loadedImages)
                    setLoading(false)

                    if (errorCount === FRAME_COUNT) {
                        console.error('All frames failed to load.')
                        renderFallback()
                    } else if (loadedImages[0]?.complete) {
                        requestAnimationFrame(() => renderFrame(0))
                    }
                }
            }

            img.onload = onFinish
            img.onerror = () => {
                errorCount++
                onFinish()
            }

            loadedImages[i] = img
        }

        return () => {
            isCancelled = true
            clearTimeout(timeoutId)
        }
    }

    useEffect(() => {
        const handleResize = () => {
            if (canvasRef.current) {
                canvasRef.current.width = window.innerWidth
                canvasRef.current.height = window.innerHeight
                // Safely update frame if images exist
                if (images.length > 0) {
                    renderFrame(Math.floor(frameIndex.get()))
                }
            }
        }
        window.addEventListener('resize', handleResize)
        handleResize() // Initial sizing
        return () => window.removeEventListener('resize', handleResize)
    }, [images])

    const activeService = services[currentIndex]

    return (
        <div ref={containerRef} className="relative w-full h-[300vh] bg-black">
            {loading ? (
                <div className="sticky top-0 h-screen w-full flex items-center justify-center text-white z-50 bg-black">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                        <p>Loading Experience...</p>
                    </div>
                </div>
            ) : services.length === 0 ? (
                <div className="sticky top-0 h-screen w-full flex items-center justify-center text-white">
                    No active hero services.
                </div>
            ) : (
                <div className="sticky top-0 h-screen w-full overflow-hidden">
                    {/* Background Layer */}
                    {isStatic ? (
                        <img
                            src={activeService.image_folder_url}
                            alt={activeService.title}
                            className="absolute inset-0 w-full h-full object-cover"
                        />
                    ) : (
                        <canvas
                            ref={canvasRef}
                            className="absolute inset-0 w-full h-full object-cover"
                        />
                    )}

                    {/* Overlay Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

                    {/* Content Layer */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-10 pointer-events-none">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeService.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.5 }}
                                className="max-w-4xl space-y-6"
                            >
                                <span className="inline-block px-4 py-1.5 rounded-full border border-white/20 bg-white/5 backdrop-blur-sm text-sm font-medium text-white/90">
                                    {activeService.subtitle}
                                </span>
                                <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tight leading-tight">
                                    {activeService.title}
                                </h1>
                                <p className="text-xl md:text-2xl text-white/80 max-w-2xl mx-auto leading-relaxed">
                                    {activeService.description}
                                </p>
                                <div className="pointer-events-auto pt-8 flex items-center justify-center gap-4">
                                    <Button
                                        variant="primary"
                                        size="lg"
                                        className="h-14 px-8 text-lg bg-white text-black hover:bg-white/90"
                                        asChild
                                    >
                                        <a href={activeService.cta_link ?? undefined}>{activeService.cta_text}</a>
                                    </Button>
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Navigation */}
                    <div className="absolute bottom-12 left-0 right-0 z-20 flex justify-between items-center px-12 pointer-events-auto">
                        <button
                            onClick={() => setCurrentIndex((prev) => (prev - 1 + services.length) % services.length)}
                            className="p-4 rounded-full bg-white/5 backdrop-blur-md border border-white/10 text-white hover:bg-white/10 transition-colors group"
                            aria-label="Previous Service"
                        >
                            <ChevronLeft className="w-6 h-6 group-hover:-translate-x-0.5 transition-transform" />
                        </button>

                        <div className="flex gap-3">
                            {services.map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setCurrentIndex(idx)}
                                    className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentIndex ? 'w-8 bg-white' : 'w-1.5 bg-white/30 hover:bg-white/50'
                                        }`}
                                    aria-label={`Go to slide ${idx + 1}`}
                                />
                            ))}
                        </div>

                        <button
                            onClick={() => setCurrentIndex((prev) => (prev + 1) % services.length)}
                            className="p-4 rounded-full bg-white/5 backdrop-blur-md border border-white/10 text-white hover:bg-white/10 transition-colors group"
                            aria-label="Next Service"
                        >
                            <ChevronRight className="w-6 h-6 group-hover:translate-x-0.5 transition-transform" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

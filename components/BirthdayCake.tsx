'use client'

import { useEffect, useRef, useState } from 'react'
import { FaceMesh } from '@mediapipe/face_mesh'
import { Camera } from '@mediapipe/camera_utils'
import confetti from 'canvas-confetti'

interface CandleData {
  id: number
  x: number
  y: number
  lit: boolean
  flameIntensity: number
}

// Pixelated Candle Component
const Candle = ({ x, y, lit, intensity }: { x: number; y: number; lit: boolean; intensity: number }) => {
  return (
    <div
      className="absolute flex flex-col items-center"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        transform: 'translate(-50%, -100%)',
        zIndex: 20,
      }}
    >
      {/* Flame */}
      <div className="relative w-8 h-12 flex justify-center items-end mb-1">
        {lit && (
          <div className="animate-flicker origin-bottom relative">
            <div className="w-6 h-8 bg-orange-500 rounded-full blur-[1px] absolute bottom-0 left-1/2 -translate-x-1/2 shadow-[0_0_10px_orange]" />
            <div className="w-4 h-6 bg-yellow-400 rounded-full absolute bottom-1 left-1/2 -translate-x-1/2 shadow-[0_0_5px_yellow]" />
            <div className="w-2 h-3 bg-white rounded-full absolute bottom-2 left-1/2 -translate-x-1/2 blur-[1px]" />
          </div>
        )}
      </div>

      {/* Candle Body */}
      <div className="relative">
        <div className="w-1 h-2 bg-black mx-auto" />
        <div className="w-4 h-12 bg-gradient-to-r from-cyan-200 to-blue-300 border-2 border-black shadow-pixel-sm" />
        <div className="absolute top-3 w-full h-1 bg-pink-500/50" />
        <div className="absolute top-6 w-full h-1 bg-pink-500/50" />
        <div className="absolute top-9 w-full h-1 bg-pink-500/50" />
      </div>
    </div>
  )
}

export default function BirthdayCake() {
  const [name, setName] = useState('')
  const [gameState, setGameState] = useState<'input' | 'cake'>('input')
  const [candles, setCandles] = useState<CandleData[]>([
    { id: 1, x: 20, y: 10, lit: true, flameIntensity: 1 },
    { id: 2, x: 40, y: 5, lit: true, flameIntensity: 1 },
    { id: 3, x: 60, y: 5, lit: true, flameIntensity: 1 },
    { id: 4, x: 80, y: 10, lit: true, flameIntensity: 1 },
    { id: 5, x: 50, y: 15, lit: true, flameIntensity: 1 },
  ])
  const [allBlownOut, setAllBlownOut] = useState(false)
  const [showMessage, setShowMessage] = useState(false)
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const cakeRef = useRef<HTMLDivElement>(null)
  const faceMeshRef = useRef<FaceMesh | null>(null)
  const cameraRef = useRef<Camera | null>(null)
  const lastBlowTimeRef = useRef<number>(0)
  const mouthOpenHistoryRef = useRef<number[]>([])
  const blowThreshold = 0.02

  useEffect(() => {
    if (gameState !== 'cake' || !videoRef.current) return

    const faceMesh = new FaceMesh({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
    })

    faceMesh.setOptions({
      maxNumFaces: 1,
      refineLandmarks: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    })

    faceMesh.onResults((results) => {
      if (results.multiFaceLandmarks?.[0]) {
        const landmarks = results.multiFaceLandmarks[0]
        const topLip = landmarks[13]
        const bottomLip = landmarks[14]
        const leftMouth = landmarks[61]
        const rightMouth = landmarks[291]
        
        if (topLip && bottomLip && leftMouth && rightMouth) {
          const mouthOpen = Math.abs(topLip.y - bottomLip.y)
          const mouthWidth = Math.abs(leftMouth.x - rightMouth.x)
          
          mouthOpenHistoryRef.current.push(mouthOpen)
          if (mouthOpenHistoryRef.current.length > 15) mouthOpenHistoryRef.current.shift()
          
          const avgOpen = mouthOpenHistoryRef.current.length > 5
            ? mouthOpenHistoryRef.current.slice(-5).reduce((a, b) => a + b, 0) / 5
            : mouthOpen
          
          const isBlowing = mouthOpen > avgOpen * 1.3 && 
                           mouthOpen > blowThreshold && 
                           mouthWidth > 0.025
          
          if (isBlowing && Date.now() - lastBlowTimeRef.current > 300) {
            lastBlowTimeRef.current = Date.now()
            blowOutCandles()
          }
        }
      }
    })

    const camera = new Camera(videoRef.current, {
      onFrame: async () => {
        if (videoRef.current) {
          await faceMesh.send({ image: videoRef.current })
        }
      },
      width: 640,
      height: 480,
    })
    camera.start()

    faceMeshRef.current = faceMesh
    cameraRef.current = camera

    return () => {
      camera.stop()
      faceMesh.close()
    }
  }, [gameState])

  const blowOutCandles = () => {
    setCandles((prev) => {
      const newCandles = prev.map((c) => ({ ...c, lit: false }))
      checkAllOut(newCandles)
      return newCandles
    })
  }

  const checkAllOut = (currentCandles: CandleData[]) => {
    const allOut = currentCandles.every((c) => !c.lit)
    if (allOut && !allBlownOut) {
      setAllBlownOut(true)
      // Trigger confetti - reduced amount and duration
      const duration = 1000
      const end = Date.now() + duration
      let lastConfettiTime = 0
      const confettiInterval = 200 // Fire confetti every 200ms instead of every frame

      const frame = () => {
        const now = Date.now()
        if (now - lastConfettiTime >= confettiInterval) {
          confetti({
            particleCount: 3,
            angle: 60,
            spread: 45,
            origin: { x: 0 },
            colors: ['#ff00de', '#00ffff', '#ffd700']
          })
          confetti({
            particleCount: 3,
            angle: 120,
            spread: 45,
            origin: { x: 1 },
            colors: ['#ff00de', '#00ffff', '#ffd700']
          })
          lastConfettiTime = now
        }

        if (Date.now() < end) {
          requestAnimationFrame(frame)
        }
      }
      frame()
      
      setTimeout(() => setShowMessage(true), 500)
    }
  }

  const resetCandles = () => {
    setCandles((prev) => prev.map((c) => ({ ...c, lit: true })))
    setAllBlownOut(false)
    setShowMessage(false)
  }

  if (gameState === 'input') {
    return (
      <div className="w-full h-full flex flex-col justify-center items-center bg-black crt font-retro text-white p-4">
        <div className="border-4 border-pink-500 p-8 rounded-lg shadow-[0_0_20px_#ec4899] bg-gray-900 max-w-md w-full text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.05)_25%,rgba(255,255,255,0.05)_50%,transparent_50%,transparent_75%,rgba(255,255,255,0.05)_75%,rgba(255,255,255,0.05)_100%)] bg-[length:20px_20px] opacity-20 pointer-events-none" />
          
          <h1 className="text-3xl md:text-4xl mb-8 text-yellow-400 text-shadow-retro animate-float">
            BIRTHDAY<br/>BOY/GIRL?
          </h1>
          
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="ENTER NAME..."
            className="w-full bg-black border-2 border-cyan-400 p-4 text-center text-cyan-400 outline-none focus:border-pink-500 focus:shadow-[0_0_15px_#ec4899] transition-all font-retro mb-8 uppercase placeholder-gray-600"
            style={{ fontSize: '16px' }}
            maxLength={15}
          />

          <button
            onClick={() => name.trim() && setGameState('cake')}
            disabled={!name.trim()}
            className="px-8 py-3 bg-pink-600 text-white border-b-4 border-r-4 border-pink-800 active:border-0 active:translate-y-1 hover:bg-pink-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-bold text-lg shadow-pixel"
          >
            START PARTY! 🎂
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full h-full flex flex-col justify-center items-center overflow-hidden bg-gray-900 crt">
      {/* Dynamic Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,#1a1a2e,#16213e)]" />
      <div className="absolute inset-0 opacity-20" 
           style={{ 
             backgroundImage: `
               linear-gradient(#ff00de 1px, transparent 1px), 
               linear-gradient(90deg, #ff00de 1px, transparent 1px)
             `,
             backgroundSize: '50px 50px',
             transform: 'perspective(500px) rotateX(60deg) translateY(-100px) scale(2)'
           }} 
      />

      <video
        ref={videoRef}
        className="absolute top-4 right-4 object-contain rounded-lg border-2 border-cyan-400 opacity-40 z-0 mix-blend-screen pointer-events-none"
        playsInline
        muted
        style={{ width: '96px', height: '72px', touchAction: 'none' }}
      />

      <div className="z-10 relative flex flex-col items-center w-full max-w-4xl">
        {/* Message Area */}
        <div className={`mb-4 h-32 transition-all duration-1000 flex flex-col items-center justify-center ${showMessage ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}>
           <h1 className="text-4xl md:text-6xl font-retro text-yellow-300 text-center leading-tight text-shadow-neon animate-float">
             HAPPY BIRTHDAY<br/>
             <span className="text-pink-500 mt-2 block">{name.toUpperCase()}!</span>
             <span className="text-cyan-400 text-xl md:text-2xl mt-4 block font-retro-sm opacity-80 animate-pulse">
               FROM YOUNUS
             </span>
           </h1>
           {showMessage && (
             <>
               <div className="absolute top-0 left-10 animate-sparkle text-4xl">✨</div>
               <div className="absolute top-20 right-20 animate-sparkle delay-100 text-5xl">🎉</div>
               <div className="absolute bottom-10 left-1/4 animate-sparkle delay-200 text-4xl">🎈</div>
             </>
           )}
        </div>

        {/* The Cake */}
        <div ref={cakeRef} className="relative w-72 md:w-96 h-72 mt-8 transition-transform hover:scale-105 duration-300">
          <div className="absolute inset-0 z-20 pointer-events-none">
            {candles.map((candle) => (
              <Candle key={candle.id} {...candle} intensity={candle.flameIntensity} />
            ))}
          </div>

          <div className="absolute bottom-0 w-full flex flex-col items-center filter drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)]">
            {/* Top Tier */}
            <div className="w-48 h-24 bg-pink-400 relative border-4 border-black shadow-[inset_-5px_-5px_0_rgba(0,0,0,0.2)] rounded-sm">
               <div className="absolute -top-2 left-0 w-full h-4 bg-white border-b-4 border-black flex">
                 {[...Array(6)].map((_, i) => (
                   <div key={i} className="flex-1 h-6 bg-white border-b-4 border-r-4 border-l-4 border-black rounded-b-lg mx-1 relative top-2 shadow-sm" />
                 ))}
               </div>
               {/* Pixel Sprinkles */}
               {[...Array(12)].map((_, i) => (
                 <div 
                   key={i}
                   className="absolute w-2 h-2 border border-black"
                   style={{
                     backgroundColor: ['#ffd700', '#00ffff', '#ff00de'][i % 3],
                     top: `${25 + Math.random() * 60}%`,
                     left: `${10 + Math.random() * 80}%`,
                   }}
                 />
               ))}
            </div>

            {/* Bottom Tier */}
            <div className="w-64 h-32 bg-purple-600 relative -mt-1 border-4 border-black shadow-[inset_-5px_-5px_0_rgba(0,0,0,0.2)] rounded-sm z-10">
               <div className="absolute top-4 w-full h-4 bg-pink-500 border-t-4 border-b-4 border-black" />
               <div className="absolute bottom-0 w-full h-full opacity-10 bg-[radial-gradient(circle_at_center,transparent_0%,#000_100%)]" />
            </div>

            {/* Plate */}
            <div className="w-80 h-4 bg-gray-300 border-4 border-black rounded-full mt-1 shadow-[0_10px_20px_rgba(0,0,0,0.5)]" />
          </div>
        </div>

        {/* Controls */}
        <div className="mt-12 text-center p-4 bg-black/60 backdrop-blur-sm rounded-xl border-2 border-pink-500/50 shadow-[0_0_15px_rgba(236,72,153,0.3)]">
          <p className="text-cyan-300 font-retro text-sm mb-2 animate-pulse">
            👄 BLOW to extinguish candles
          </p>
          {allBlownOut && (
            <div className="flex gap-4 justify-center">
              <button
                onClick={resetCandles}
                className="mt-2 px-6 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-bold font-retro border-b-4 border-r-4 border-yellow-700 active:border-0 active:translate-y-1 transition-all"
              >
                AGAIN 🔄
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

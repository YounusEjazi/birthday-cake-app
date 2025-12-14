'use client'

import { useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'

const BirthdayCake = dynamic(() => import('@/components/BirthdayCake'), {
  ssr: false,
})

export default function Home() {
  return (
    <main style={{ width: '100%', height: '100vh', position: 'relative' }}>
      <BirthdayCake />
    </main>
  )
}


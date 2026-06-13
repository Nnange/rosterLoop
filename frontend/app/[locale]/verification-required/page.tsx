'use client'

import { Suspense } from 'react'
import VerificationRequiredContent from './VerificationRequiredContent'

export default function VerificationRequiredPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerificationRequiredContent />
    </Suspense>
  )
}

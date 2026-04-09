'use client'

import React, { Suspense } from 'react'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import SignupForm from './SignupForm'

export default function SignupPage() {
  return (
    <div className="flex flex-col min-h-screen items-center justify-center pt-8">
      <Header />
      <Suspense fallback={<div>Loading...</div>}>
        <SignupForm />
      </Suspense>
      <Footer />
    </div>
  )
}

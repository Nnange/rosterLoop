'use client'

import React, { Suspense } from 'react'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import LoginForm from './LoginForm'

export default function LoginPage() {
  return (
    <div className="flex flex-col min-h-screen items-center justify-center pt-8 px-4">
      <Header />
      <Suspense fallback={<div>Loading...</div>}>
        <LoginForm />
      </Suspense>
      <Footer />
    </div>
  )
}

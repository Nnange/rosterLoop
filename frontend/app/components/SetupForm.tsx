"use client"

import React, { useState } from 'react'
interface SetupFormProps {
  onComplete: (names: string[]) => void
}
export function SetupForm() {
  const [step, setStep] = useState(1)
  const [count, setCount] = useState<number>(2)
  const [names, setNames] = useState<string[]>([])
  const [error, setError] = useState<string>('')
  const handleCountSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (count < 1) {
      setError('Please enter at least 1 person')
      return
    }
    setNames(Array(count).fill(''))
    setStep(2)
    setError('')
  }
  const handleNameChange = (index: number, value: string) => {
    const newNames = [...names]
    newNames[index] = value
    setNames(newNames)
  }
  const handleNamesSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Check if all names are filled
    if (names.some((name) => !name.trim())) {
      setError('Please enter all names')
      return
    }
    // Check for duplicate names
    const uniqueNames = new Set(names.map((n) => n.trim().toLowerCase()))
    if (uniqueNames.size !== names.length) {
      setError('Each person must have a unique name')
      return
    }
    // onComplete(names)
  }
  return (
    <div className="bg-white p-6 rounded-lg shadow-md m-6 min-w-[70%]">
      {step === 1 && (
        <div>
          <h2 className="text-xl font-semibold mb-4 text-center">
            How many people live in your household?
          </h2>
          <form onSubmit={handleCountSubmit}>
            <div className="mb-4">
              <input
                type="number"
                min="1"
                value={count}
                onChange={(e) => setCount(parseInt(e.target.value) || 0)}
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            {error && <p className="text-red-500 mb-4">{error}</p>}
            <button
              type="submit"
              className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 transition-colors"
            >
              Next
            </button>
          </form>
        </div>
      )}
      {step === 2 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Enter everyone's names</h2>
          <form onSubmit={handleNamesSubmit}>
            {names.map((name, index) => (
              <div key={index} className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Person {index + 1}
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => handleNameChange(index, e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter name"
                />
              </div>
            ))}
            {error && <p className="text-red-500 mb-4">{error}</p>}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 bg-gray-200 text-gray-800 py-2 rounded hover:bg-gray-300 transition-colors"
              >
                Back
              </button>
              <button
                type="submit"
                className="flex-1 bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 transition-colors"
              >
                Create Roster
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}

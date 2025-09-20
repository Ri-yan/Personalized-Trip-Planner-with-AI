import React from 'react'
import { auth, provider, signInWithPopup, signOut } from '../utils/firebase'

export default function Navbar({ user, setUser }) {

  async function handleLogin() {
    try {
      const result = await signInWithPopup(auth, provider)
      const loggedUser = {
        name: result.user.displayName,
        email: result.user.email,
        uid: result.user.uid,
      }
      setUser(loggedUser)
    } catch (err) {
      console.error("Login failed", err)
    }
  }

  async function handleLogout() {
    await signOut(auth)
    setUser(null)
  }

  return (
    <header className='bg-white shadow-sm'>
      <div className='max-w-6xl mx-auto flex items-center justify-between p-4'>
        <div className='flex items-center gap-3'>
          <div className='w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold'>AI</div>
          <div>
            <div className='font-semibold text-gray-800'>AI Trip Planner</div>
            <div className='text-xs text-gray-500'>Personalized • Adaptive </div>
          </div>
        </div>
        <div className='flex items-center gap-3'>
          {user ? (
            <>
              <div className='text-sm text-gray-700'>Hi, <span className='font-medium'>{user.name}</span></div>
              <button onClick={handleLogout} className='px-3 py-1 bg-red-500 text-white rounded-md'>Sign out</button>
            </>
          ) : (
            <button onClick={handleLogin} className='px-3 py-1 bg-blue-600 text-white rounded-md'>Sign in</button>
          )}
        </div>
      </div>
    </header>
  )
}

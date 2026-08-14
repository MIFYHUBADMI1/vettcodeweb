/**
 * Toast Provider
 * Provides toast notifications throughout the app
 */

'use client'

import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

export default function ToastProvider() {
  return (
    <ToastContainer
      position="top-right"
      autoClose={5000}
      hideProgressBar={false}
      newestOnTop
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme="dark"
      toastClassName="bg-gray-900 border border-gray-700"
      bodyClassName="text-white"
      progressClassName="bg-gradient-to-r from-purple-600 to-green-600"
    />
  )
}

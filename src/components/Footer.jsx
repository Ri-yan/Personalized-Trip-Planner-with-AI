import React from 'react'
export default function Footer(){ return (
  <footer className="mt-12 border-t bg-white dark:bg-gray-900">
  <div className="max-w-6xl mx-auto px-4 py-6 flex flex-col md:flex-row items-center justify-between text-sm text-gray-500 dark:text-gray-400">
    <div>© 2025 AI Trip Planner</div>
    <div className="mt-2 md:mt-0">
    Brought to life by {" "}

      <a
        href="https://mriyan.in"
        target="_blank"
        rel="noopener noreferrer"
        className="text-indigo-600 dark:text-indigo-400 hover:underline"
      >
        Mohd. Riyan
      </a>
    </div>
  </div>
</footer>
)}

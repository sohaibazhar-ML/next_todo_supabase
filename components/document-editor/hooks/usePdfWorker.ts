/**
 * Hook for initializing PDF.js worker
 * 
 * This hook handles the initialization of the PDF.js worker, including
 * fallback logic if the primary worker path fails to load.
 * 
 * Usage:
 *   const { workerReady } = usePdfWorker()
 */

import { useState, useEffect } from 'react'
import { pdfjs } from 'react-pdf'
import { PDF_WORKER_PATHS, CONSOLE_MESSAGES } from '@/constants'

/**
 * Hook return type
 */
interface UsePdfWorkerReturn {
  /**
   * Whether the PDF.js worker is ready to use
   */
  workerReady: boolean
}

/**
 * Hook for managing PDF.js worker initialization
 * 
 * Attempts to load the worker from the primary path (.mjs),
 * and falls back to the secondary path (.js) if the primary fails.
 * 
 * @returns Object containing workerReady status
 */
export function usePdfWorker(): UsePdfWorkerReturn {
  const [workerReady, setWorkerReady] = useState(false)

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') {
      return
    }

    /**
     * Initialize PDF.js worker with primary path (.mjs)
     */
    const initializeWorker = async () => {
      const workerPath = PDF_WORKER_PATHS.MJS
      pdfjs.GlobalWorkerOptions.workerSrc = workerPath

      try {
        // Attempt to fetch the worker file to verify it exists
        await fetch(workerPath)
        console.log(CONSOLE_MESSAGES.PDF_WORKER_LOADED, workerPath)
        setWorkerReady(true)
      } catch (err) {
        // Primary path failed, try fallback
        console.error(
          CONSOLE_MESSAGES.PDF_WORKER_FAILED,
          workerPath,
          'trying .js:',
          err
        )

        // Try fallback path (.js)
        const jsWorkerPath = PDF_WORKER_PATHS.JS
        pdfjs.GlobalWorkerOptions.workerSrc = jsWorkerPath

        try {
          await fetch(jsWorkerPath)
          console.log(CONSOLE_MESSAGES.PDF_WORKER_LOADED_JS, jsWorkerPath)
          setWorkerReady(true)
        } catch (jsErr) {
          // Both paths failed, but set ready anyway to allow graceful degradation
          console.error(CONSOLE_MESSAGES.PDF_WORKER_FAILED_JS, jsErr)
          setWorkerReady(true)
        }
      }
    }

    initializeWorker()
  }, [])

  return { workerReady }
}


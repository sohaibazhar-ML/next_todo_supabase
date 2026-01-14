/**
 * Hook for managing PDF annotations
 */

import { useState } from 'react'

export interface PDFAnnotation {
  id: string
  page: number
  type: 'highlight' | 'text' | 'drawing' | 'sticky'
  x: number // X coordinate (0-1 normalized)
  y: number // Y coordinate (0-1 normalized)
  width?: number // Width for highlights/drawings
  height?: number // Height for highlights/drawings
  text?: string // Text content for text/sticky notes
  color?: string // Color for highlights/drawings
  points?: Array<{ x: number; y: number }> // For drawings
  createdAt: string
}

interface UsePdfAnnotationsProps {
  initialAnnotations?: PDFAnnotation[]
}

export function usePdfAnnotations({ initialAnnotations = [] }: UsePdfAnnotationsProps = {}) {
  const [annotations, setAnnotations] = useState<PDFAnnotation[]>(initialAnnotations)
  const [activeTool, setActiveTool] = useState<'select' | 'highlight' | 'text' | 'sticky' | null>(null)
  const [selectedAnnotation, setSelectedAnnotation] = useState<string | null>(null)

  const addAnnotation = (annotation: PDFAnnotation) => {
    setAnnotations(prev => [...prev, annotation])
  }

  const deleteAnnotation = (id: string) => {
    setAnnotations(prev => prev.filter(ann => ann.id !== id))
    setSelectedAnnotation(null)
  }

  const clearAllAnnotations = () => {
    setAnnotations([])
    setSelectedAnnotation(null)
  }

  const updateAnnotation = (id: string, updates: Partial<PDFAnnotation>) => {
    setAnnotations(prev => 
      prev.map(ann => ann.id === id ? { ...ann, ...updates } : ann)
    )
  }

  return {
    annotations,
    setAnnotations,
    activeTool,
    setActiveTool,
    selectedAnnotation,
    setSelectedAnnotation,
    addAnnotation,
    deleteAnnotation,
    clearAllAnnotations,
    updateAnnotation,
  }
}


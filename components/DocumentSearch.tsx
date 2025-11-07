'use client'

import { useState, useEffect } from 'react'
import type { DocumentSearchFilters, DocumentFileType } from '@/types/document'

interface DocumentSearchProps {
  filters: DocumentSearchFilters
  onFilterChange: (filters: DocumentSearchFilters) => void
  categories: string[]
  fileTypes: string[]
  tags: string[]
}

export default function DocumentSearch({
  filters,
  onFilterChange,
  categories,
  fileTypes,
  tags,
}: DocumentSearchProps) {
  const [searchQuery, setSearchQuery] = useState(filters.searchQuery || '')
  const [localCategory, setLocalCategory] = useState(filters.category || '')
  const [localFileType, setLocalFileType] = useState(filters.fileType || '')
  const [selectedTags, setSelectedTags] = useState<string[]>(filters.tags || [])
  const [featuredOnly, setFeaturedOnly] = useState(filters.featuredOnly || false)

  // Sync selectedTags when filters prop changes
  useEffect(() => {
    setSelectedTags(filters.tags || [])
  }, [filters.tags])

  const handleTagToggle = (tag: string) => {
    const newTags = selectedTags.includes(tag)
      ? selectedTags.filter(t => t !== tag)
      : [...selectedTags, tag]
    
    setSelectedTags(newTags)
    
    // Apply filter immediately when tag is toggled
    onFilterChange({
      ...filters,
      tags: newTags.length > 0 ? newTags : undefined,
    })
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    onFilterChange({
      ...filters,
      searchQuery: searchQuery.trim() || undefined,
      category: localCategory || undefined,
      fileType: (localFileType as DocumentFileType) || undefined,
      tags: selectedTags.length > 0 ? selectedTags : undefined,
      featuredOnly: featuredOnly || undefined,
    })
  }

  const handleReset = () => {
    setSearchQuery('')
    setLocalCategory('')
    setLocalFileType('')
    setSelectedTags([])
    setFeaturedOnly(false)
    onFilterChange({})
  }

  return (
    <form onSubmit={handleSearch} className="space-y-4">
      {/* Search Bar */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg
              className="h-5 w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search documents by title, description, or content..."
            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder:text-gray-400"
          />
        </div>
        <button
          type="submit"
          className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg font-medium"
        >
          Search
        </button>
        {(searchQuery || localCategory || localFileType || selectedTags.length > 0 || featuredOnly) && (
          <button
            type="button"
            onClick={handleReset}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all duration-200 font-medium"
          >
            Reset
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Category Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
          <select
            value={localCategory}
            onChange={(e) => setLocalCategory(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        {/* File Type Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">File Type</label>
          <select
            value={localFileType}
            onChange={(e) => setLocalFileType(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
          >
            <option value="">All Types</option>
            {fileTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        {/* Featured Only */}
        <div className="flex items-end">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={featuredOnly}
              onChange={(e) => setFeaturedOnly(e.target.checked)}
              className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
            />
            <span className="text-sm font-medium text-gray-700">Featured Only</span>
          </label>
        </div>
      </div>

      {/* Tags Filter */}
      {tags.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => handleTagToggle(tag)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  selectedTags.includes(tag)
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
          {selectedTags.length > 0 && (
            <p className="mt-2 text-xs text-gray-500">
              {selectedTags.length} tag{selectedTags.length !== 1 ? 's' : ''} selected
            </p>
          )}
        </div>
      )}
    </form>
  )
}


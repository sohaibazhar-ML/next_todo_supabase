'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'

interface Todo {
  id: string
  title: string
  description: string | null
  completed: boolean
  created_at: string
  updated_at: string
}

interface TodoListProps {
  initialTodos: Todo[]
  user: User
}

export default function TodoList({ initialTodos, user }: TodoListProps) {
  const [todos, setTodos] = useState<Todo[]>(initialTodos)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    setLoading(true)
    const { data, error } = await supabase
      .from('todos')
      .insert([
        {
          title: title.trim(),
          description: description.trim() || null,
          user_id: user.id,
          completed: false,
        },
      ])
      .select()
      .single()

    setLoading(false)

    if (error) {
      console.error('Error creating todo:', error)
      alert('Error creating todo: ' + error.message)
      return
    }

    setTodos([data, ...todos])
    setTitle('')
    setDescription('')
  }

  const handleUpdate = async (id: string) => {
    if (!editTitle.trim()) return

    setLoading(true)
    const { data, error } = await supabase
      .from('todos')
      .update({
        title: editTitle.trim(),
        description: editDescription.trim() || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    setLoading(false)

    if (error) {
      console.error('Error updating todo:', error)
      alert('Error updating todo: ' + error.message)
      return
    }

    setTodos(todos.map((todo) => (todo.id === id ? data : todo)))
    setEditingId(null)
    setEditTitle('')
    setEditDescription('')
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this todo?')) return

    setLoading(true)
    const { error } = await supabase.from('todos').delete().eq('id', id)

    setLoading(false)

    if (error) {
      console.error('Error deleting todo:', error)
      alert('Error deleting todo: ' + error.message)
      return
    }

    setTodos(todos.filter((todo) => todo.id !== id))
  }

  const handleToggleComplete = async (id: string, completed: boolean) => {
    setLoading(true)
    const { data, error } = await supabase
      .from('todos')
      .update({ completed: !completed, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    setLoading(false)

    if (error) {
      console.error('Error toggling todo:', error)
      return
    }

    setTodos(todos.map((todo) => (todo.id === id ? data : todo)))
  }

  const startEdit = (todo: Todo) => {
    setEditingId(todo.id)
    setEditTitle(todo.title)
    setEditDescription(todo.description || '')
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditTitle('')
    setEditDescription('')
  }

  return (
    <div className="space-y-6">
      {/* Create Todo Form */}
      <form onSubmit={handleCreate} className="bg-white rounded-2xl shadow-xl p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
            <svg
              className="h-5 w-5 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Create New Todo</h2>
        </div>
        <div className="space-y-5">
          <div>
            <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-2">
              Title
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
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
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <input
                id="title"
                type="text"
                placeholder="Enter todo title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 text-gray-900 placeholder:text-gray-400"
                required
                disabled={loading}
              />
            </div>
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-2">
              Description (optional)
            </label>
            <div className="relative">
              <div className="absolute top-3 left-0 pl-4 pointer-events-none">
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
                    d="M4 6h16M4 12h16M4 18h7"
                  />
                </svg>
              </div>
              <textarea
                id="description"
                placeholder="Enter todo description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 text-gray-900 placeholder:text-gray-400 resize-none"
                rows={3}
                disabled={loading}
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98] font-semibold"
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Adding...
              </>
            ) : (
              <>
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Add Todo
              </>
            )}
          </button>
        </div>
      </form>

      {/* Todos List */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
            <svg
              className="h-5 w-5 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">
            Your Todos <span className="text-lg font-normal text-gray-500">({todos.length})</span>
          </h2>
        </div>
        {todos.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            <div className="mx-auto h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <svg
                className="h-8 w-8 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <p className="text-gray-600 font-medium">No todos yet</p>
            <p className="text-gray-400 text-sm mt-1">Create your first todo above!</p>
          </div>
        ) : (
          todos.map((todo) => (
            <div
              key={todo.id}
              className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-200 hover:scale-[1.01]"
            >
              {editingId === todo.id ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Title</label>
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition text-gray-900"
                      disabled={loading}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition text-gray-900 resize-none"
                      rows={3}
                      disabled={loading}
                    />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => handleUpdate(todo.id)}
                      disabled={loading}
                      className="flex-1 px-4 py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 disabled:opacity-50 shadow-md hover:shadow-lg font-semibold"
                    >
                      {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                      onClick={cancelEdit}
                      disabled={loading}
                      className="px-6 py-2.5 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all duration-200 disabled:opacity-50 font-semibold"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 pt-1">
                    <input
                      type="checkbox"
                      checked={todo.completed}
                      onChange={() => handleToggleComplete(todo.id, todo.completed)}
                      className="w-6 h-6 text-indigo-600 rounded-lg focus:ring-indigo-500 focus:ring-2 cursor-pointer disabled:opacity-50"
                      disabled={loading}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3
                          className={`text-lg font-bold mb-1 ${
                            todo.completed
                              ? 'line-through text-gray-400'
                              : 'text-gray-900'
                          }`}
                        >
                          {todo.title}
                        </h3>
                        {todo.description && (
                          <p className={`text-gray-600 mb-2 ${todo.completed ? 'line-through text-gray-400' : ''}`}>
                            {todo.description}
                          </p>
                        )}
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                          <svg
                            className="h-4 w-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          <span>{new Date(todo.created_at).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric' 
                          })}</span>
                        </div>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <button
                          onClick={() => startEdit(todo)}
                          disabled={loading}
                          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-200 disabled:opacity-50 shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95 font-medium text-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(todo.id)}
                          disabled={loading}
                          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-200 disabled:opacity-50 shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95 font-medium text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
'use client'

/**
 * Callback form for the dark gray footer
 * Two fields top row (name + time), one field bottom (phone), circular red submit button
 * White input fields on dark background
 */

import { useState } from 'react'
import { useTranslations } from 'next-intl'

export default function CallbackForm() {
  const t = useTranslations('landing.callback')
  const [name, setName] = useState('')
  const [time, setTime] = useState('')
  const [phone, setPhone] = useState('')
  const [sent, setSent] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !phone.trim()) return
    setSent(true)
    setTimeout(() => setSent(false), 3000)
    setName('')
    setTime('')
    setPhone('')
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-start sm:items-end gap-3">
      <div className="flex-1 w-full space-y-2">
        {/* Top Row: Name + Time */}
        <div className="flex gap-2">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t('namePlaceholder')}
            className="flex-1 px-3 py-2.5 text-[13px] text-[#333] bg-white border border-[#ccc] rounded-sm focus:outline-none focus:ring-1 focus:ring-[#e62e2d] placeholder-[#aaa]"
            required
          />
          <input
            type="text"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            placeholder={t('timePlaceholder')}
            className="w-[140px] px-3 py-2.5 text-[13px] text-[#333] bg-white border border-[#ccc] rounded-sm focus:outline-none focus:ring-1 focus:ring-[#e62e2d] placeholder-[#aaa]"
          />
        </div>
        {/* Bottom Row: Phone */}
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder={t('phonePlaceholder')}
          className="w-full sm:w-[60%] px-3 py-2.5 text-[13px] text-[#333] bg-white border border-[#ccc] rounded-sm focus:outline-none focus:ring-1 focus:ring-[#e62e2d] placeholder-[#aaa]"
          required
        />
      </div>

      {/* Circular Red Submit Button */}
      <button
        type="submit"
        className="w-[80px] h-[80px] rounded-full text-white text-[12px] font-bold leading-tight flex-shrink-0 transition-all duration-200 hover:scale-105 shadow-md"
        style={{ backgroundColor: '#e62e2d' }}
        disabled={sent}
      >
        {sent ? t('sent') : t('submit')}
      </button>
    </form>
  )
}

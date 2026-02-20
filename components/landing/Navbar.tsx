'use client'

/**
 * Navbar — sticky header composing sub-components
 * Background: #f5f5f5 (same as hero section — seamless blend)
 */

import { useState } from 'react'
import Link from 'next/link'
import Logo from './Logo'
import NavLinks from './NavLinks'
import NavActions from './NavActions'
import MobileMenu from './MobileMenu'
import IconHamburger from '@/components/ui/icons/IconHamburger'
import IconClose from '@/components/ui/icons/IconClose'

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-[#f5f5f5]">
      <div className="max-w-[1200px] mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-[80px]">
          <Link href="/" aria-label="Home" className="flex-shrink-0">
            <Logo />
          </Link>

          <NavLinks />
          <NavActions />

          {/* Mobile Hamburger */}
          <button
            className="lg:hidden p-2 rounded-lg hover:bg-gray-200/60 transition"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <IconClose size={24} /> : <IconHamburger size={24} />}
          </button>
        </div>
      </div>

      {mobileOpen && <MobileMenu onClose={() => setMobileOpen(false)} />}
    </header>
  )
}

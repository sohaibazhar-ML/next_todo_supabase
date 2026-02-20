/**
 * Landing page — composes all landing sections
 * Server Component (default) — only client sub-components handle interactivity
 */

import {
  Navbar,
  HeroSection,
  InfoBar,
  HowItWorks,
  MyDocuments,
  AllDocuments,
  Footer,
} from '@/components/landing'

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <InfoBar />
        <HowItWorks />
        <MyDocuments />
        <AllDocuments />
      </main>
      <Footer />
    </div>
  )
}

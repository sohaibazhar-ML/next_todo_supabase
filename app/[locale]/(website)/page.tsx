import { Header, Hero, Footer } from '@/website/organisms';

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <Header />
      <Hero />
      <div className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Experience Excellence</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Our commitment to quality ensures that every aspect of your Swiss move is handled with precision.
          </p>
        </div>
      </div>
      <Footer />
    </main>
  )
}


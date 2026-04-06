import { Header, Hero, HowItWorks, MyDocuments, DocumentsOverview, Footer } from '@/website/organisms';
import { TrustBar } from '@/website/molecules';
import { Text } from '@/website/atoms';

export default function Home() {
  return (
    <main className="min-h-[2330px] bg-background-neutral flex flex-col items-center">
      <Header />

      {/* Landing Page Content */}
      <div className="w-full flex flex-col items-center pt-[100px]">
        <Hero />
        <TrustBar />
        <HowItWorks />
        <MyDocuments />
        <DocumentsOverview />
        <Footer />
      </div>
    </main>
  )
}


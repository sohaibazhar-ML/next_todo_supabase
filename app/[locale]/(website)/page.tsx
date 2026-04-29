import { Header, Hero, HowItWorks, MyDocuments, DocumentsOverview, Footer } from '@/website/organisms';
import { TrustBar } from '@/website/molecules';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  const translations: Record<string, string> = {
    en: "Document Portal",
    de: "Dokumentenportal",
    fr: "Portail de documents",
    it: "Portale dei documenti"
  };

  return {
    title: {
      absolute: "MySwissMove"
    },
    description: "Download all necessary documents for your move to Switzerland. Fast, secure and organized.",
  };
}

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


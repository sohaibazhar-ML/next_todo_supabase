import { Header, LoginForm, Footer } from '@/website/organisms';

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-background-neutral flex flex-col items-center">
      <Header />
      
      {/* Login Page Content */}
      <div className="w-full flex-grow flex flex-col items-center pt-[100px] md:pt-[120px] pb-24">
        <div className="max-w-(--container-width-desktop) w-full px-(--spacing-container-padding)">
          <LoginForm />
        </div>
      </div>

      <Footer />
    </main>
  );
}

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Heart, Search, UserPlus, Activity, Droplet } from "lucide-react"
import BloodCellsAnimation from "@/components/BloodCellsAnimation"
import Footer from "@/components/Footer"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-red-600 via-red-700 to-red-900 text-white py-32 lg:py-48 overflow-hidden">
        <BloodCellsAnimation />
        <div className="container relative z-10 mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-in-up">
            Donate Blood, Save Lives
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto opacity-90">
            Your contribution can make a difference. Join our community of heroes today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto font-semibold text-red-700">
                Register as Donor
              </Button>
            </Link>
            <Link href="/search">
              <Button size="lg" variant="outline" className="w-full sm:w-auto bg-transparent border-white text-white hover:bg-white hover:text-red-700">
                Check Availability
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Impact Stats Section */}
      <section className="py-16 bg-red-600 text-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="space-y-2">
              <div className="text-4xl md:text-5xl font-bold">10k+</div>
              <div className="text-red-100">Donors Registered</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl md:text-5xl font-bold">5k+</div>
              <div className="text-red-100">Lives Saved</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl md:text-5xl font-bold">120+</div>
              <div className="text-red-100">Blood Camps</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl md:text-5xl font-bold">24/7</div>
              <div className="text-red-100">Support Available</div>
            </div>
          </div>
        </div>
      </section>

      {/* Donation Process */}
      <section className="py-20 bg-white dark:bg-zinc-950">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-16">Donation Process</h2>
          <div className="grid md:grid-cols-4 gap-8 relative">
            {/* Connecting Line (Desktop) */}
            <div className="hidden md:block absolute top-12 left-0 right-0 h-0.5 bg-gray-200 -z-10 mx-16" />

            {[
              { title: "Registration", desc: "Register yourself as a donor on our platform.", icon: "📝" },
              { title: "Screening", desc: "A quick medical checkup to ensure eligibility.", icon: "🩺" },
              { title: "Donation", desc: "Safe and hygienic blood donation process.", icon: "🩸" },
              { title: "Refreshment", desc: "Rest and refreshments after donation.", icon: "🥤" },
            ].map((step, i) => (
              <div key={i} className="text-center bg-white dark:bg-zinc-900 p-6 rounded-lg md:bg-transparent">
                <div className="w-24 h-24 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center text-4xl mx-auto mb-6 shadow-sm border border-red-100 dark:border-red-900/50">
                  {step.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50 dark:bg-zinc-900">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Our Services</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-none shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
              <CardHeader className="text-center">
                <div className="mx-auto bg-red-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-4 text-red-600">
                  <Search className="w-8 h-8" />
                </div>
                <CardTitle className="text-xl">Find Blood</CardTitle>
              </CardHeader>
              <CardContent className="text-center text-gray-600 dark:text-gray-300">
                Check real-time blood stock availability in our blood bank and request what you need instantly.
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
              <CardHeader className="text-center">
                <div className="mx-auto bg-red-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-4 text-red-600">
                  <UserPlus className="w-8 h-8" />
                </div>
                <CardTitle className="text-xl">Become a Donor</CardTitle>
              </CardHeader>
              <CardContent className="text-center text-gray-600 dark:text-gray-300">
                Register yourself as a donor. We will check your eligibility and add you to our hero list.
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
              <CardHeader className="text-center">
                <div className="mx-auto bg-red-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-4 text-red-600">
                  <Activity className="w-8 h-8" />
                </div>
                <CardTitle className="text-xl">Save Lives</CardTitle>
              </CardHeader>
              <CardContent className="text-center text-gray-600 dark:text-gray-300">
                Your donation helps patients in need during surgeries, accidents, and treatments.
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 bg-white dark:bg-black overflow-hidden relative">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold">Why Donate Blood?</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
              Blood is the most precious gift that anyone can give to another person – the gift of life. A decision to donate your blood can save a life, or even several if your blood is separated into its components – red cells, platelets and plasma.
            </p>
            <ul className="space-y-4">
              {[
                "One donation can save up to 3 lives",
                "Stimulates blood cell production",
                "Reduces risk of heart disease and cancer",
                "Free health screening"
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-xs">✓</div>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="flex-1 relative">
            <div className="relative z-10 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-zinc-800 dark:to-zinc-900 rounded-2xl p-8 shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-500">
              <div className="text-center space-y-4">
                <Heart className="w-24 h-24 text-red-600 mx-auto animate-pulse" fill="currentColor" />
                <h3 className="text-2xl font-bold">Be a Hero</h3>
                <p className="text-gray-500">Your simple act of kindness gives someone another sunrise.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Hero CTA Section */}
      <section className="py-20 bg-gray-900 text-white text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        <div className="container mx-auto px-4 relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to make an impact?</h2>
          <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">Join thousands of donors who are making a difference every day.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="bg-red-600 hover:bg-red-700 text-white min-w-[200px] h-14 text-lg">
                Join Now to Save Lives
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

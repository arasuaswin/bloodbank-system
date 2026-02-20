import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Heart, Search, UserPlus, Activity, Droplet, Phone, MapPin, CheckCircle, AlertTriangle } from "lucide-react"
import BloodCellsAnimation from "@/components/BloodCellsAnimation"
import Footer from "@/components/Footer"

const bloodCompatibility = [
  { group: "A+", donateTo: ["A+", "AB+"], receiveFrom: ["A+", "A-", "O+", "O-"] },
  { group: "A-", donateTo: ["A+", "A-", "AB+", "AB-"], receiveFrom: ["A-", "O-"] },
  { group: "B+", donateTo: ["B+", "AB+"], receiveFrom: ["B+", "B-", "O+", "O-"] },
  { group: "B-", donateTo: ["B+", "B-", "AB+", "AB-"], receiveFrom: ["B-", "O-"] },
  { group: "AB+", donateTo: ["AB+"], receiveFrom: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"] },
  { group: "AB-", donateTo: ["AB+", "AB-"], receiveFrom: ["A-", "B-", "AB-", "O-"] },
  { group: "O+", donateTo: ["A+", "B+", "AB+", "O+"], receiveFrom: ["O+", "O-"] },
  { group: "O-", donateTo: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"], receiveFrom: ["O-"] },
]

const testimonials = [
  {
    name: "Rajan Pillai",
    city: "Chennai, Tamil Nadu",
    text: "I have donated blood 12 times over the last 6 years. The team here is professional and the process is smooth. Donating blood is one of the most meaningful things I do.",
    group: "O+",
    donations: 12,
  },
  {
    name: "Priya Nambiar",
    city: "Kozhikode, Kerala",
    text: "My mother needed blood urgently during surgery. Because of donors registered here, we got O- within hours. I am now a regular donor myself.",
    group: "AB-",
    donations: 5,
  },
  {
    name: "Amit Mehra",
    city: "Pune, Maharashtra",
    text: "The eligibility checker helped me understand I was ready to donate again. The 90-day gap guideline is very helpful. Proud to be a blood hero!",
    group: "B+",
    donations: 8,
  },
]

const indianCities = [
  { city: "Chennai", state: "Tamil Nadu", hospital: "Government Stanley Hospital", phone: "044-2528 1001" },
  { city: "Mumbai", state: "Maharashtra", hospital: "KEM Hospital Blood Bank", phone: "022-2413 6051" },
  { city: "New Delhi", state: "Delhi", hospital: "AIIMS Blood Bank", phone: "011-2658 8500" },
  { city: "Bengaluru", state: "Karnataka", hospital: "Victoria Hospital", phone: "080-2670 1150" },
  { city: "Hyderabad", state: "Telangana", hospital: "Osmania General Hospital", phone: "040-2461 8000" },
  { city: "Kolkata", state: "West Bengal", hospital: "SSKM Medical College", phone: "033-2223 5262" },
]

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-red-600 via-red-700 to-red-900 text-white py-32 lg:py-48 overflow-hidden">
        <BloodCellsAnimation />
        <div className="container relative z-10 mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur border border-white/20 rounded-full px-4 py-1.5 text-sm mb-6">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            NBTC Compliant Blood Bank Management System
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            रक्त दान, महादान
          </h1>
          <p className="text-lg md:text-xl mb-3 max-w-2xl mx-auto opacity-70 italic">
            ("Blood Donation, the Greatest Gift")
          </p>
          <p className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto opacity-90">
            India needs <strong>1.4 crore units</strong> of blood annually. Only 1 crore units are collected.
            Be the change. Donate today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto font-semibold text-red-700">
                Register as Donor
              </Button>
            </Link>
            <Link href="/eligibility">
              <Button size="lg" variant="outline" className="w-full sm:w-auto bg-transparent border-white text-white hover:bg-white hover:text-red-700">
                Check Eligibility
              </Button>
            </Link>
            <Link href="/search">
              <Button size="lg" variant="outline" className="w-full sm:w-auto bg-transparent border-white/50 text-white/90 hover:bg-white hover:text-red-700">
                Find Blood
              </Button>
            </Link>
          </div>
          <div className="mt-8 text-white/70 text-sm">
            🚨 National Blood Helpline: <a href="tel:104" className="underline font-semibold text-white">104</a>&nbsp;|&nbsp;
            <a href="tel:18001801104" className="underline font-semibold text-white">1800-180-1104</a> (Toll-Free)
          </div>
        </div>
      </section>

      {/* Impact Stats Section */}
      <section className="py-16 bg-red-600 text-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="space-y-2">
              <div className="text-4xl md:text-5xl font-bold">1.4 Cr+</div>
              <div className="text-red-100">Donors Registered</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl md:text-5xl font-bold">12.5 L+</div>
              <div className="text-red-100">Lives Saved</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl md:text-5xl font-bold">850+</div>
              <div className="text-red-100">Blood Camps Organised</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl md:text-5xl font-bold">104</div>
              <div className="text-red-100">National Helpline</div>
            </div>
          </div>
        </div>
      </section>

      {/* Donation Process */}
      <section className="py-20 bg-white dark:bg-zinc-950">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4">Donation Process</h2>
          <p className="text-center text-gray-500 mb-16 max-w-xl mx-auto">As per NBTC (National Blood Transfusion Council) guidelines, whole blood donation takes only 8–10 minutes.</p>
          <div className="grid md:grid-cols-4 gap-8 relative">
            <div className="hidden md:block absolute top-12 left-0 right-0 h-0.5 bg-gray-200 -z-10 mx-16" />
            {[
              { title: "Registration", desc: "Fill OPD form with Aadhaar / Voter ID for identity. Free of cost at all government blood banks.", icon: "📝" },
              { title: "Medical Screening", desc: "Haemoglobin, BP, pulse & weight check. Hb ≥ 12.5 g/dL required. Takes 5 minutes.", icon: "🩺" },
              { title: "Donation", desc: "Safe & hygienic whole blood collection (350–450 ml). Takes 8–10 minutes under qualified staff.", icon: "🩸" },
              { title: "Rest & Refreshment", desc: "15 min rest with juice/biscuits provided. Avoid riding two-wheelers for 2 hours post-donation.", icon: "🥤" },
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

      {/* Blood Compatibility Section */}
      <section className="py-20 bg-gray-50 dark:bg-zinc-900">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4">Blood Group Compatibility</h2>
          <p className="text-center text-gray-500 mb-12 max-w-xl mx-auto">
            Know who you can help. Universal donor is O-, universal recipient is AB+. Check your compatibility below.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {bloodCompatibility.map((bg) => (
              <Card key={bg.group} className="border-t-4 border-t-red-500 hover:shadow-lg transition-all hover:-translate-y-1">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-2xl font-bold text-red-600">{bg.group}</CardTitle>
                    <Droplet className="h-5 w-5 text-red-400" fill="currentColor" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Can Donate To</p>
                    <div className="flex flex-wrap gap-1">
                      {bg.donateTo.map(g => (
                        <span key={g} className="px-1.5 py-0.5 bg-green-100 text-green-800 rounded text-xs font-medium">{g}</span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Can Receive From</p>
                    <div className="flex flex-wrap gap-1">
                      {bg.receiveFrom.map(g => (
                        <span key={g} className="px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded text-xs font-medium">{g}</span>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="flex flex-wrap justify-center gap-4 mt-8 text-sm text-gray-600">
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-green-200 inline-block" /> Can donate to</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-blue-200 inline-block" /> Can receive from</span>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-white dark:bg-zinc-950">
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
                Check real-time blood stock availability. All 8 blood groups tracked 24/7. Request blood for surgeries, accidents, thalassemia, and maternity instantly.
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
                Register as a voluntary blood donor. Eligible if 18–65 years old, weight ≥ 45 kg, Hb ≥ 12.5 g/dL. Repeat donations allowed every 90 days (ICMR guidelines).
              </CardContent>
            </Card>
            <Card className="border-none shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
              <CardHeader className="text-center">
                <div className="mx-auto bg-red-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-4 text-red-600">
                  <Activity className="w-8 h-8" />
                </div>
                <CardTitle className="text-xl">Check Eligibility</CardTitle>
              </CardHeader>
              <CardContent className="text-center text-gray-600 dark:text-gray-300 space-y-3">
                Not sure if you can donate? Use our free NBTC-based eligibility checker. Get an instant result based on your age, health, and last donation date.
                <Link href="/eligibility" className="block">
                  <Button size="sm" variant="outline" className="border-red-300 text-red-600 hover:bg-red-50">
                    Check Now →
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Why Donate Section */}
      <section className="py-20 bg-gray-50 dark:bg-zinc-900 overflow-hidden relative">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 space-y-6">
            <div className="inline-block bg-red-100 text-red-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
              Ministry of Health Approved
            </div>
            <h2 className="text-3xl md:text-4xl font-bold">Why Donate Blood in India?</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
              India faces a chronic blood shortage. Every 2 seconds, someone in India needs blood. Road accidents, surgeries, thalassemia, sickle cell disease, and childbirth complications — all require timely blood transfusions. Your single donation can save up to 3 lives.
            </p>
            <ul className="space-y-4">
              {[
                "One donation saves up to 3 lives — red cells, platelets & plasma separated",
                "Free health check-up: BP, Hb, blood sugar at every donation",
                "Reduces risk of haemochromatosis (iron overload)",
                "NBTC certified: safe, sterile & voluntary — never sold",
                "Donation certificate issued — useful for NCC & college records",
                "World Blood Donor Day celebrated on June 14 every year",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
                  <span className="text-gray-700 dark:text-gray-300 text-sm">{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex-1 relative">
            <div className="relative z-10 bg-gradient-to-br from-red-50 to-red-100 dark:from-zinc-800 dark:to-zinc-900 rounded-2xl p-8 shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-500">
              <div className="text-center space-y-4">
                <Heart className="w-24 h-24 text-red-600 mx-auto animate-pulse" fill="currentColor" />
                <h3 className="text-2xl font-bold">रक्तवीर बनें</h3>
                <p className="text-gray-500 italic text-sm">"Be a Blood Hero"</p>
                <p className="text-gray-600 dark:text-gray-300">Your 30-minute act of courage gives someone another sunrise. India salutes every voluntary blood donor.</p>
                <div className="pt-2 border-t border-red-200">
                  <p className="text-xs text-gray-400">Recognized by NBTC / MoHFW, Govt. of India</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white dark:bg-zinc-950">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4">Stories from Our Donors</h2>
          <p className="text-center text-gray-500 mb-12">Real people, real impact across India</p>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((t) => (
              <Card key={t.name} className="border-none shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 bg-gradient-to-br from-white to-red-50 dark:from-zinc-900 dark:to-zinc-800">
                <CardContent className="pt-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center text-white font-bold text-lg">
                      {t.name[0]}
                    </div>
                    <div>
                      <p className="font-semibold">{t.name}</p>
                      <p className="text-xs text-gray-500 flex items-center gap-1"><MapPin className="w-3 h-3" />{t.city}</p>
                    </div>
                    <div className="ml-auto">
                      <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded-full">{t.group}</span>
                    </div>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 text-sm italic">"{t.text}"</p>
                  <div className="flex items-center gap-2 text-xs text-gray-400 border-t pt-3">
                    <Droplet className="w-3 h-3 text-red-400" />
                    {t.donations} donations | Blood Hero 🏅
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Indian Cities / Partner Banks */}
      <section className="py-20 bg-gray-50 dark:bg-zinc-900">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4">Partner Blood Banks Across India</h2>
          <p className="text-center text-gray-500 mb-12">Government licensed blood banks in major Indian cities</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {indianCities.map((loc) => (
              <Card key={loc.city} className="hover:shadow-lg transition-all">
                <CardContent className="pt-6 space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 shrink-0">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-lg">{loc.city}</p>
                      <p className="text-sm text-gray-500">{loc.state}</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 pl-13">{loc.hospital}</p>
                  <div className="flex items-center gap-2 text-sm text-red-600 pl-1">
                    <Phone className="w-4 h-4" />
                    <a href={`tel:${loc.phone.replace(/-/g, '')}`} className="hover:underline font-medium">{loc.phone}</a>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <p className="text-center text-gray-400 text-xs mt-8">
            All blood banks listed are licensed by State Drug Authorities under the Drugs & Cosmetics Act, 1940 (Schedule F).
          </p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-900 text-white text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        <div className="container mx-auto px-4 relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to be India's next Blood Hero?</h2>
          <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
            Join lakhs of voluntary donors making a difference every day. Registration is free, quick, and saves lives.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="bg-red-600 hover:bg-red-700 text-white min-w-[200px] h-14 text-lg">
                Register Now — It's Free
              </Button>
            </Link>
            <Link href="/eligibility">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-gray-900 min-w-[200px] h-14 text-lg">
                Check Eligibility First
              </Button>
            </Link>
          </div>
          <p className="mt-6 text-gray-500 text-sm flex items-center justify-center gap-2">
            <AlertTriangle className="w-4 h-4 text-yellow-500" />
            Emergency? Call <strong className="text-white">104</strong> (NBTC National Helpline, Toll-Free, 24x7)
          </p>
        </div>
      </section>

      <Footer />
    </div>
  )
}

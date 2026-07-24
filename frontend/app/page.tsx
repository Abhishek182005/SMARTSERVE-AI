import Link from "next/link";
import { ChefHat, ArrowRight, BarChart3, Users, Package, UtensilsCrossed, Bot, Shield, Star } from "lucide-react";

const features = [
  { icon: UtensilsCrossed, title: "Menu & POS", desc: "Complete point-of-sale system with menu management, categories, and real-time order processing.", color: "blue" },
  { icon: ChefHat, title: "Kitchen Display", desc: "Real-time Kitchen Display System with Socket.IO so chefs see orders the moment they're placed.", color: "orange" },
  { icon: BarChart3, title: "Analytics & Reports", desc: "Rich dashboards with revenue charts, employee performance, and downloadable reports.", color: "green" },
  { icon: Bot, title: "AI Business Advisor", desc: "Ask questions in plain English. Get data-backed answers about sales, inventory, and more.", color: "purple" },
  { icon: Package, title: "Inventory Control", desc: "Track raw materials, get low-stock alerts, manage suppliers, and automate purchase orders.", color: "amber" },
  { icon: Shield, title: "Role-Based Access", desc: "9 roles: Admin, Owner, Manager, Cashier, Waiter, Chef, Kitchen Staff, Delivery, Customer.", color: "red" },
];

const stats = [
  { value: "19", label: "Modules" },
  { value: "9", label: "User Roles" },
  { value: "25+", label: "API Endpoints" },
  { value: "AI ✨", label: "Powered" },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-950 text-white overflow-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 glass-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-600 rounded-lg">
              <ChefHat className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold">SmartServe AI</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-gray-300 hover:text-white px-4 py-2 transition-colors">Sign In</Link>
            <Link href="/register" className="btn-primary text-sm">Get Started <ArrowRight className="h-4 w-4" /></Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-4 text-center relative">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
          <div className="absolute top-40 right-1/4 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600/10 border border-blue-600/20 rounded-full text-blue-400 text-sm font-medium mb-8">
            <Star className="h-4 w-4" /> AI-Powered Restaurant Management
          </div>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6">
            Run Your Restaurant<br />
            <span className="gradient-text">Smarter with AI</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10">
            The complete ERP and POS platform that handles everything — orders, inventory, staff, customers, and AI-driven insights — all in one place.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register" className="inline-flex items-center justify-center gap-2 px-8 py-4 gradient-primary rounded-xl text-white font-bold text-lg hover:opacity-90 transition-opacity shadow-lg shadow-blue-600/25">
              Start Free Today <ArrowRight className="h-5 w-5" />
            </Link>
            <Link href="/login" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/5 border border-white/10 rounded-xl text-white font-bold text-lg hover:bg-white/10 transition-colors">
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="py-8 border-y border-white/5 bg-white/2">
        <div className="max-w-4xl mx-auto px-4 grid grid-cols-2 sm:grid-cols-4 gap-8">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl font-black gradient-text mb-1">{stat.value}</div>
              <div className="text-sm text-gray-400">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Everything You Need</h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">From table management to AI-driven sales forecasting — SmartServe covers all 19 operational phases.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <div key={feature.title} className="glass rounded-2xl p-6 hover:border-blue-500/30 transition-all duration-300 group">
                <div className={`inline-flex p-3 rounded-xl bg-${feature.color}-600/10 mb-4`}>
                  <feature.icon className={`h-6 w-6 text-${feature.color}-400`} />
                </div>
                <h3 className="text-lg font-bold mb-2 group-hover:text-blue-400 transition-colors">{feature.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto text-center glass rounded-3xl p-12 border border-blue-500/20">
          <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Restaurant?</h2>
          <p className="text-gray-400 mb-8">Join the future of restaurant management. Setup takes under 5 minutes.</p>
          <Link href="/register" className="inline-flex items-center gap-2 px-8 py-4 gradient-primary rounded-xl text-white font-bold text-lg hover:opacity-90 transition-opacity">
            Get Started Free <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 px-4 text-center text-gray-500 text-sm">
        <div className="flex items-center justify-center gap-2 mb-2">
          <ChefHat className="h-4 w-4 text-blue-500" />
          <span className="font-semibold text-white">SmartServe AI</span>
        </div>
        <p>© 2025 SmartServe AI. All rights reserved.</p>
      </footer>
    </div>
  );
}

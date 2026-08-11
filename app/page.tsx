'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
  ArrowRight, 
  Sparkles, 
  Terminal, 
  Shield, 
  Cloud,
  Globe,
  Zap,
  Code,
  CheckCircle,
  ChevronRight
} from 'lucide-react'

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-950 text-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-gray-950/80 backdrop-blur-xl border-b border-gray-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-green-400 bg-clip-text text-transparent">
                VettCode
              </Link>
              <div className="hidden md:flex items-center gap-6">
                <Link href="/products" className="text-gray-300 hover:text-white transition">Products</Link>
                <Link href="/solutions" className="text-gray-300 hover:text-white transition">Solutions</Link>
                <Link href="/developers" className="text-gray-300 hover:text-white transition">Developers</Link>
                <Link href="/pricing" className="text-gray-300 hover:text-white transition">Pricing</Link>
                <Link href="/docs" className="text-gray-300 hover:text-white transition">Docs</Link>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/signin" className="text-gray-300 hover:text-white transition">
                Sign In
              </Link>
              <Link 
                href="/start" 
                className="px-6 py-2 bg-gradient-to-r from-purple-600 to-green-600 hover:from-purple-700 hover:to-green-700 rounded-lg font-semibold transition"
              >
                Start Building
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 relative overflow-hidden">
        {/* Background Grid */}
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/10 to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
        
        <div className="container mx-auto relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-900/30 border border-purple-500/30 rounded-full mb-8">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span className="text-sm text-purple-300">One Ecosystem. One Workflow.</span>
            </div>
            
            <h1 className="text-6xl md:text-7xl font-bold mb-6 leading-tight">
              Build. <span className="text-purple-400">Secure.</span> Ship.
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-300 mb-6">
              One ecosystem for turning ideas into real software.
            </p>
            
            <p className="text-lg text-gray-400 mb-12 max-w-2xl mx-auto">
              From your first prompt to production, VettCode gives you the tools to create, code, test, secure, and deploy applications in one connected ecosystem.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <Link 
                href="/start" 
                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-green-600 hover:from-purple-700 hover:to-green-700 rounded-lg font-semibold text-lg flex items-center gap-2 transition"
              >
                Start Building <ArrowRight className="w-5 h-5" />
              </Link>
              <Link 
                href="/explore" 
                className="px-8 py-4 bg-gray-800 hover:bg-gray-700 rounded-lg font-semibold text-lg transition"
              >
                Explore VettCode
              </Link>
            </div>
            
            <div className="text-sm text-gray-500">
              Create → Code → Secure → Deploy
            </div>
          </div>
        </div>
      </section>

      {/* Ecosystem Visualization */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Vibe Card */}
            <div className="bg-gradient-to-br from-purple-900/30 to-purple-800/10 border border-purple-500/30 rounded-2xl p-6 hover:border-purple-500/50 transition group">
              <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:bg-purple-500/30 transition">
                <Sparkles className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-xl font-bold mb-2">VettCode Vibe</h3>
              <p className="text-gray-400 mb-4">Turn ideas into applications.</p>
              <p className="text-sm text-gray-500 mb-6">
                Describe what you want to build and work with AI to create websites, applications, and digital products.
              </p>
              <Link href="/vibe" className="text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-1">
                Explore Vibe <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Vibe CLI Card */}
            <div className="bg-gradient-to-br from-green-900/30 to-green-800/10 border border-green-500/30 rounded-2xl p-6 hover:border-green-500/50 transition group">
              <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:bg-green-500/30 transition">
                <Terminal className="w-6 h-6 text-green-400" />
              </div>
              <h3 className="text-xl font-bold mb-2">VettCode Vibe CLI</h3>
              <p className="text-gray-400 mb-4">Your AI coding agent in the terminal.</p>
              <p className="text-sm text-gray-500 mb-6">
                Build directly inside your development environment. Let VettCode understand your project and help turn ideas into working software.
              </p>
              <Link href="/vibe-cli" className="text-green-400 hover:text-green-300 font-semibold flex items-center gap-1">
                Explore Vibe CLI <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {/* CLI Card */}
            <div className="bg-gradient-to-br from-blue-900/30 to-blue-800/10 border border-blue-500/30 rounded-2xl p-6 hover:border-blue-500/50 transition group">
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-500/30 transition">
                <Shield className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-xl font-bold mb-2">VettCode CLI</h3>
              <p className="text-gray-400 mb-4">Don't just build it. Know it's safe.</p>
              <p className="text-sm text-gray-500 mb-6">
                Scan your projects for security vulnerabilities, exposed secrets, dependency risks, and other problems.
              </p>
              <Link href="/cli" className="text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1">
                Explore VettCode CLI <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Web Host Card */}
            <div className="bg-gradient-to-br from-cyan-900/30 to-cyan-800/10 border border-cyan-500/30 rounded-2xl p-6 hover:border-cyan-500/50 transition group">
              <div className="w-12 h-12 bg-cyan-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:bg-cyan-500/30 transition">
                <Cloud className="w-6 h-6 text-cyan-400" />
              </div>
              <h3 className="text-xl font-bold mb-2">VettCode Web Host</h3>
              <p className="text-gray-400 mb-4">Take your creation to the world.</p>
              <p className="text-sm text-gray-500 mb-6">
                Build with VettCode Vibe or Vibe CLI, test with VettCode CLI, and deploy your application through the VettCode ecosystem.
              </p>
              <Link href="/hosting" className="text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1">
                Explore Web Host <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-transparent to-gray-900/50">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">One ecosystem. One workflow.</h2>
            <p className="text-xl text-gray-400">From idea to production in connected steps</p>
          </div>
          
          <div className="max-w-3xl mx-auto space-y-8">
            {/* IDEA */}
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center border border-purple-500/30">
                <Sparkles className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-2">IDEA</h3>
                <p className="text-gray-400">Have something you want to create.</p>
              </div>
            </div>
            
            <div className="flex justify-center">
              <div className="w-1 h-12 bg-gradient-to-b from-purple-500/50 to-green-500/50" />
            </div>

            {/* CREATE */}
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center border border-purple-500/30">
                <Code className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-2">CREATE</h3>
                <p className="text-gray-400">Use VettCode Vibe to turn your idea into software.</p>
              </div>
            </div>
            
            <div className="flex justify-center">
              <div className="w-1 h-12 bg-gradient-to-b from-green-500/50 to-green-600/50" />
            </div>

            {/* CODE */}
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center border border-green-500/30">
                <Terminal className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-2">CODE</h3>
                <p className="text-gray-400">Use VettCode Vibe CLI to build and refine it.</p>
              </div>
            </div>
            
            <div className="flex justify-center">
              <div className="w-1 h-12 bg-gradient-to-b from-green-500/50 to-blue-500/50" />
            </div>

            {/* SECURE */}
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center border border-blue-500/30">
                <Shield className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-2">SECURE</h3>
                <p className="text-gray-400">Use VettCode CLI to test and understand your code.</p>
              </div>
            </div>
            
            <div className="flex justify-center">
              <div className="w-1 h-12 bg-gradient-to-b from-blue-500/50 to-cyan-500/50" />
            </div>

            {/* DEPLOY */}
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-cyan-500/20 rounded-full flex items-center justify-center border border-cyan-500/30">
                <Cloud className="w-6 h-6 text-cyan-400" />
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-2">DEPLOY</h3>
                <p className="text-gray-400">Use VettCode Web Host to put it online.</p>
              </div>
            </div>
            
            <div className="flex justify-center">
              <div className="w-1 h-12 bg-gradient-to-b from-cyan-500/50 to-purple-500/50" />
            </div>

            {/* GROW */}
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center border border-purple-500/30">
                <Zap className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-2">GROW</h3>
                <p className="text-gray-400">Improve it, ship again, and build what's next.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Global Accessibility Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <Globe className="w-16 h-16 text-green-400 mx-auto mb-6" />
              <h2 className="text-4xl md:text-5xl font-bold mb-6">Software creation shouldn't have borders.</h2>
              <p className="text-xl text-gray-400 mb-8">
                Millions of people have ideas, skills, curiosity, and the desire to build — but the tools, infrastructure, payments, and platforms available to them don't always reflect their reality.
              </p>
              <p className="text-xl text-gray-300 font-semibold mb-8">
                We're changing that.
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-green-900/30 to-blue-900/30 border border-green-500/30 rounded-2xl p-8 mb-8">
              <p className="text-lg text-gray-300 mb-6">
                VettCode starts in Uganda, but the vision goes far beyond Uganda.
              </p>
              <p className="text-lg text-gray-300 mb-6">
                We're building an ecosystem designed to support:
              </p>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-1" />
                  <span className="text-gray-300">Local currencies and mobile money</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-1" />
                  <span className="text-gray-300">Accessible payment methods</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-1" />
                  <span className="text-gray-300">Emerging markets</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-1" />
                  <span className="text-gray-300">Developers and students globally</span>
                </li>
              </ul>
              <div className="inline-block px-4 py-2 bg-green-500/20 border border-green-500/30 rounded-lg">
                <p className="text-sm text-green-300">Coming to VettCode</p>
              </div>
            </div>
            
            <div className="text-center">
              <p className="text-2xl font-semibold text-transparent bg-gradient-to-r from-purple-400 to-green-400 bg-clip-text">
                A world where your location doesn't decide whether you can create.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Beginner/Creator Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-gray-900/50 to-transparent">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-8">
              You don't need to have everything figured out to start building.
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6 mb-12 text-left">
              <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
                <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4">
                  <Sparkles className="w-5 h-5 text-purple-400" />
                </div>
                <h3 className="text-xl font-bold mb-2">Have an idea?</h3>
                <p className="text-gray-400">→ Build it.</p>
              </div>
              
              <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="w-5 h-5 text-blue-400" />
                </div>
                <h3 className="text-xl font-bold mb-2">Don't understand security?</h3>
                <p className="text-gray-400">→ VettCode explains it.</p>
              </div>
              
              <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
                <div className="w-10 h-10 bg-cyan-500/20 rounded-lg flex items-center justify-center mb-4">
                  <Cloud className="w-5 h-5 text-cyan-400" />
                </div>
                <h3 className="text-xl font-bold mb-2">Don't know how to deploy?</h3>
                <p className="text-gray-400">→ VettCode helps you ship it.</p>
              </div>
              
              <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
                <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center mb-4">
                  <Globe className="w-5 h-5 text-green-400" />
                </div>
                <h3 className="text-xl font-bold mb-2">Don't have an international payment card?</h3>
                <p className="text-gray-400">→ VettCode is being designed around more accessible payment methods.</p>
              </div>
            </div>
            
            <p className="text-3xl font-bold mb-8 text-transparent bg-gradient-to-r from-purple-400 to-green-400 bg-clip-text">
              Your idea is enough to start.
            </p>
            
            <Link 
              href="/start" 
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-green-600 hover:from-purple-700 hover:to-green-700 rounded-lg font-semibold text-lg transition"
            >
              Start Building <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-6xl font-bold mb-8">
              Your next idea could become something real.
            </h2>
            
            <div className="bg-gradient-to-br from-purple-900/30 to-green-900/30 border border-purple-500/30 rounded-2xl p-8 md:p-12 mb-8">
              <p className="text-xl text-gray-300 mb-6">
                You don't need a perfect plan. You don't need to know every programming language. You don't need to understand every security concept. You don't need to have everything figured out.
              </p>
              <p className="text-xl text-gray-300 mb-6">
                You just need an idea and somewhere to start.
              </p>
              <p className="text-2xl font-bold text-transparent bg-gradient-to-r from-purple-400 to-green-400 bg-clip-text">
                VettCode is building that place.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link 
                href="/start" 
                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-green-600 hover:from-purple-700 hover:to-green-700 rounded-lg font-semibold text-lg flex items-center gap-2 transition"
              >
                Start Building <ArrowRight className="w-5 h-5" />
              </Link>
              <Link 
                href="/explore" 
                className="px-8 py-4 bg-gray-800 hover:bg-gray-700 rounded-lg font-semibold text-lg transition"
              >
                Explore the Ecosystem
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 border-t border-gray-800 py-12 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-green-400 bg-clip-text text-transparent">
                VettCode
              </h3>
              <p className="text-gray-400 text-sm">
                Build. Secure. Ship.<br />
                One ecosystem for turning ideas into real software.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Products</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/vibe" className="hover:text-white transition">VettCode Vibe</Link></li>
                <li><Link href="/vibe-cli" className="hover:text-white transition">VettCode Vibe CLI</Link></li>
                <li><Link href="/cli" className="hover:text-white transition">VettCode CLI</Link></li>
                <li><Link href="/hosting" className="hover:text-white transition">VettCode Web Host</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/docs" className="hover:text-white transition">Documentation</Link></li>
                <li><Link href="/guides" className="hover:text-white transition">Guides</Link></li>
                <li><Link href="/api" className="hover:text-white transition">API Reference</Link></li>
                <li><Link href="/community" className="hover:text-white transition">Community</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/about" className="hover:text-white transition">About</Link></li>
                <li><Link href="/blog" className="hover:text-white transition">Blog</Link></li>
                <li><Link href="/careers" className="hover:text-white transition">Careers</Link></li>
                <li><Link href="/contact" className="hover:text-white transition">Contact</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-500">
            <p>© 2024 VettCode. Global in ambition. Starting where others overlook it.</p>
          </div>
        </div>
      </footer>
    </main>
  )
}

'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import {
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Cloud,
  Globe,
  Layers,
  Cpu,
  Database,
  Network,
  Boxes,
  Code,
  Workflow,
  Building2,
  Rocket,
  ExternalLink,
  Menu,
  X,
  ChevronDown,
  Terminal,
  Package,
  Mail,
  CheckCircle2,
  GitBranch,
  Server
} from 'lucide-react'

const MIRRORSITE_URL = 'https://mirrorsite.atai.ink/'

interface ProductLink {
  name: string
  layer: string
  description: string
  href: string
  external?: boolean
}

const PRODUCTS: ProductLink[] = [
  {
    name: 'MirrorSite AI',
    layer: 'Build',
    description: 'Turn ideas into working applications with AI.',
    href: MIRRORSITE_URL,
    external: true,
  },
  {
    name: 'VettCode',
    layer: 'Secure',
    description: 'Developer security tooling for vetting code before it reaches production.',
    href: '/docs',
  },
  {
    name: 'Future Infrastructure',
    layer: 'Ship',
    description: 'The future ATAI infrastructure layer — deployment, hosting, and databases.',
    href: '#ship',
  },
]

export default function Home() {
  const [productsOpen, setProductsOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const productsRef = useRef<HTMLDivElement>(null)

  // Close the Explore Products dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (productsRef.current && !productsRef.current.contains(event.target as Node)) {
        setProductsOpen(false)
      }
    }
    if (productsOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [productsOpen])

  // Close the mobile menu on Escape
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setProductsOpen(false)
        setMobileMenuOpen(false)
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [])

  const navLinks = [
    { label: 'About', href: '#about' },
    { label: 'Technology', href: '#technology' },
    { label: 'Products', href: '#products' },
    { label: 'Vision', href: '#vision' },
    { label: 'Contact', href: '#contact' },
  ]

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      {/* ===================== Navigation ===================== */}
      <nav className="fixed top-0 w-full z-50 bg-gray-950/80 backdrop-blur-xl border-b border-gray-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <Link
                href="/"
                className="flex items-baseline gap-2 group"
                aria-label="ATAI home"
              >
                <span className="text-2xl font-bold bg-gradient-to-r from-sky-400 via-indigo-400 to-violet-400 bg-clip-text text-transparent group-hover:opacity-80 transition-opacity">
                  ATAI
                </span>
                <span className="hidden sm:inline text-[10px] font-semibold text-gray-500 uppercase tracking-[0.18em]">
                  Enterprises
                </span>
              </Link>
              <div className="hidden lg:flex items-center gap-6">
                {navLinks.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="text-gray-300 hover:text-white transition"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Explore Products Dropdown */}
              <div className="hidden md:block relative" ref={productsRef}>
                <button
                  onClick={() => setProductsOpen(!productsOpen)}
                  className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-indigo-600 via-sky-600 to-cyan-600 hover:from-indigo-700 hover:via-sky-700 hover:to-cyan-700 rounded-lg font-semibold text-sm transition focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-gray-950"
                  aria-expanded={productsOpen}
                  aria-haspopup="true"
                  aria-controls="products-dropdown"
                >
                  Explore Products
                  <ChevronDown className={`w-4 h-4 transition-transform ${productsOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
                </button>

                {productsOpen && (
                  <div
                    id="products-dropdown"
                    className="absolute right-0 mt-2 w-80 py-2 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl"
                    role="menu"
                    aria-label="Explore ATAI products"
                  >
                    {PRODUCTS.map((product) => (
                      <a
                        key={product.name}
                        href={product.href}
                        {...(product.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                        onClick={() => setProductsOpen(false)}
                        className="block px-4 py-3 hover:bg-gray-800 transition"
                        role="menuitem"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-sm flex items-center gap-1.5">
                            {product.name}
                            {product.external && <ExternalLink className="w-3 h-3 text-gray-500" aria-hidden="true" />}
                          </span>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
                            {product.layer}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 leading-relaxed">{product.description}</p>
                      </a>
                    ))}
                    <div className="mt-2 px-4 pt-3 border-t border-gray-800">
                      <Link
                        href="/docs"
                        onClick={() => setProductsOpen(false)}
                        className="text-xs text-gray-400 hover:text-white transition"
                      >
                        VettCode documentation →
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              <Link href="/signin" className="hidden md:block text-gray-300 hover:text-white transition text-sm">
                Sign In
              </Link>

              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg text-gray-300 hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500"
                aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={mobileMenuOpen}
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-gray-950/95 backdrop-blur-xl border-b border-gray-800">
            <div className="container mx-auto px-4 py-4 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2.5 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition"
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-2 mt-2 border-t border-gray-800">
                <p className="px-3 pb-2 text-[10px] font-bold text-gray-500 uppercase tracking-[0.1em]">
                  Products
                </p>
                {PRODUCTS.map((product) => (
                  <a
                    key={product.name}
                    href={product.href}
                    {...(product.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2.5 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition"
                  >
                    <span className="font-semibold">{product.name}</span>
                    <span className="text-xs text-gray-500 ml-2 uppercase tracking-wider">{product.layer}</span>
                  </a>
                ))}
              </div>
              <Link
                href="/signin"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2.5 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition"
              >
                Sign In
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* ===================== Hero ===================== */}
      <section className="pt-32 md:pt-40 pb-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-900/20 via-transparent to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
        <div className="absolute top-1/3 -left-32 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 -right-32 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="container mx-auto relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-900/30 border border-indigo-500/30 rounded-full mb-8">
              <Layers className="w-4 h-4 text-sky-400" />
              <span className="text-sm text-sky-300">Advanced Technologies and AI Enterprises</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Building the AI infrastructure behind the{' '}
              <span className="bg-gradient-to-r from-sky-400 via-indigo-400 to-violet-400 bg-clip-text text-transparent">
                next generation of applications.
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto">
              ATAI builds AI-powered applications, developer technologies, security tools, and
              intelligent infrastructure designed to make modern software faster, safer, and more
              accessible.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <Link
                href="#about"
                className="px-8 py-4 bg-gradient-to-r from-indigo-600 via-sky-600 to-cyan-600 hover:from-indigo-700 hover:via-sky-700 hover:to-cyan-700 rounded-lg font-semibold text-lg flex items-center gap-2 transition"
              >
                Explore ATAI <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="#products"
                className="px-8 py-4 bg-gray-800 hover:bg-gray-700 rounded-lg font-semibold text-lg transition"
              >
                Explore Our Products
              </Link>
            </div>

            <div className="flex items-center justify-center gap-3 text-sm text-gray-500">
              <span className="font-semibold text-violet-400">BUILD</span>
              <span className="w-8 h-px bg-gray-700" />
              <span className="font-semibold text-sky-400">SECURE</span>
              <span className="w-8 h-px bg-gray-700" />
              <span className="font-semibold text-cyan-400">SHIP</span>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== About / Introduce ATAI ===================== */}
      <section id="about" className="py-24 px-4">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                One ecosystem. Multiple layers of technology.
              </h2>
              <p className="text-xl text-gray-400 leading-relaxed mb-6">
                ATAI is building an ecosystem of AI-powered technologies that connects application
                development, developer security, and intelligent infrastructure.
              </p>
              <p className="text-lg text-gray-400 leading-relaxed mb-6">
                From turning ideas into working applications to helping developers identify security
                vulnerabilities, ATAI is developing technologies that simplify the modern software
                lifecycle.
              </p>
              <p className="text-lg text-gray-400 leading-relaxed">
                The long-term vision is to connect these capabilities through intelligent AI systems,
                infrastructure, databases, and automated pipelines.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-violet-900/30 to-violet-800/10 border border-violet-500/30 rounded-2xl p-6 hover:border-violet-500/50 transition">
                <div className="w-12 h-12 bg-violet-500/20 rounded-xl flex items-center justify-center mb-4">
                  <Sparkles className="w-6 h-6 text-violet-400" />
                </div>
                <h3 className="text-xl font-bold mb-2">AI-Powered Applications</h3>
                <p className="text-gray-400 text-sm">
                  Products that turn ideas and prompts into functional applications and full-stack MVPs.
                </p>
              </div>

              <div className="bg-gradient-to-br from-sky-900/30 to-sky-800/10 border border-sky-500/30 rounded-2xl p-6 hover:border-sky-500/50 transition">
                <div className="w-12 h-12 bg-sky-500/20 rounded-xl flex items-center justify-center mb-4">
                  <ShieldCheck className="w-6 h-6 text-sky-400" />
                </div>
                <h3 className="text-xl font-bold mb-2">Developer Security</h3>
                <p className="text-gray-400 text-sm">
                  Security technologies that help developers vet code and identify vulnerabilities before they ship.
                </p>
              </div>

              <div className="bg-gradient-to-br from-cyan-900/30 to-cyan-800/10 border border-cyan-500/30 rounded-2xl p-6 hover:border-cyan-500/50 transition">
                <div className="w-12 h-12 bg-cyan-500/20 rounded-xl flex items-center justify-center mb-4">
                  <Boxes className="w-6 h-6 text-cyan-400" />
                </div>
                <h3 className="text-xl font-bold mb-2">Intelligent Infrastructure</h3>
                <p className="text-gray-400 text-sm">
                  The infrastructure layer — AI pipelines, data, databases, and environments — that powers it all.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== Product Ecosystem ===================== */}
      <section id="products" className="py-24 px-4 bg-gradient-to-b from-transparent to-gray-900/50">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">The ATAI Ecosystem</h2>
            <p className="text-xl text-gray-400">From Build to Secure to Ship — one connected technology vision.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {/* BUILD */}
            <div className="bg-gradient-to-br from-violet-900/30 to-violet-800/10 border border-violet-500/30 rounded-2xl p-8 hover:border-violet-500/50 hover:-translate-y-1 transition group flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 bg-violet-500/20 rounded-xl flex items-center justify-center group-hover:bg-violet-500/30 transition">
                  <Rocket className="w-6 h-6 text-violet-400" />
                </div>
                <span className="text-xs font-bold text-violet-300 bg-violet-500/10 border border-violet-500/30 rounded-full px-3 py-1 uppercase tracking-wider">
                  Build
                </span>
              </div>
              <h3 className="text-2xl font-bold mb-1">MirrorSite AI</h3>
              <p className="text-gray-300 mb-4">Turn ideas into working applications.</p>
              <p className="text-gray-400 text-sm leading-relaxed mb-6 flex-grow">
                MirrorSite AI is ATAI&apos;s AI-powered application-building platform, designed to
                transform ideas and prompts into functional applications and full-stack MVPs.
              </p>
              <div className="mb-6">
                <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                  An ATAI product
                </span>
              </div>
              <a
                href={MIRRORSITE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-violet-400 hover:text-violet-300 font-semibold transition"
              >
                Explore MirrorSite AI <ExternalLink className="w-4 h-4" />
              </a>
            </div>

            {/* SECURE */}
            <div className="bg-gradient-to-br from-sky-900/30 to-sky-800/10 border border-sky-500/30 rounded-2xl p-8 hover:border-sky-500/50 hover:-translate-y-1 transition group flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 bg-sky-500/20 rounded-xl flex items-center justify-center group-hover:bg-sky-500/30 transition">
                  <ShieldCheck className="w-6 h-6 text-sky-400" />
                </div>
                <span className="text-xs font-bold text-sky-300 bg-sky-500/10 border border-sky-500/30 rounded-full px-3 py-1 uppercase tracking-wider">
                  Secure
                </span>
              </div>
              <h3 className="text-2xl font-bold mb-1">VettCode</h3>
              <p className="text-gray-300 mb-4">Vet your code before it reaches production.</p>
              <p className="text-gray-400 text-sm leading-relaxed mb-6 flex-grow">
                VettCode is ATAI&apos;s developer security technology for identifying security
                vulnerabilities and helping developers vet their applications through an AI-assisted
                security workflow.
              </p>
              <div className="mb-6">
                <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                  An ATAI technology
                </span>
              </div>
              <Link
                href="/docs"
                className="inline-flex items-center gap-2 text-sky-400 hover:text-sky-300 font-semibold transition"
              >
                Explore VettCode <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* SHIP */}
            <div className="bg-gradient-to-br from-cyan-900/30 to-cyan-800/10 border border-cyan-500/30 rounded-2xl p-8 hover:border-cyan-500/50 hover:-translate-y-1 transition group flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 bg-cyan-500/20 rounded-xl flex items-center justify-center group-hover:bg-cyan-500/30 transition">
                  <Cloud className="w-6 h-6 text-cyan-400" />
                </div>
                <span className="text-xs font-bold text-cyan-300 bg-cyan-500/10 border border-cyan-500/30 rounded-full px-3 py-1 uppercase tracking-wider">
                  Ship
                </span>
              </div>
              <h3 className="text-2xl font-bold mb-1">Coming Next</h3>
              <p className="text-gray-300 mb-4">From working application to production infrastructure.</p>
              <p className="text-gray-400 text-sm leading-relaxed mb-6 flex-grow">
                ATAI&apos;s future infrastructure layer is intended to extend the ecosystem into
                deployment, hosting, database infrastructure, and intelligent production environments.
              </p>
              <div className="mb-6">
                <span className="text-[11px] font-semibold text-cyan-300/80 bg-cyan-500/10 border border-cyan-500/30 rounded-full px-3 py-1 uppercase tracking-wider">
                  Coming in a future phase
                </span>
              </div>
              <Link
                href="#vision"
                className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 font-semibold transition"
              >
                See the vision <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== MirrorSite AI Connection ===================== */}
      <section id="build" className="py-24 px-4">
        <div className="container mx-auto">
          <div className="max-w-6xl mx-auto bg-gradient-to-br from-violet-900/30 via-gray-900/50 to-sky-900/30 border border-violet-500/30 rounded-3xl p-8 md:p-12 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-72 h-72 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />
            <div className="grid md:grid-cols-2 gap-10 items-center relative">
              <div>
                <span className="inline-flex items-center gap-2 text-xs font-bold text-violet-300 bg-violet-500/10 border border-violet-500/30 rounded-full px-3 py-1 uppercase tracking-wider mb-6">
                  The Build layer of ATAI
                </span>
                <h2 className="text-4xl font-bold mb-4">MirrorSite AI</h2>
                <p className="text-xl text-gray-300 mb-4">Go from an idea to a working application with AI.</p>
                <p className="text-gray-400 leading-relaxed mb-8">
                  MirrorSite AI is ATAI&apos;s AI-powered application-building platform — describe what
                  you want to build and move from idea to functional application and full-stack MVP,
                  faster.
                </p>
                <a
                  href={MIRRORSITE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 rounded-lg font-semibold transition"
                >
                  Visit MirrorSite AI <ExternalLink className="w-5 h-5" />
                </a>
              </div>
              <div className="space-y-3">
                {[
                  { icon: Sparkles, text: 'Turn prompts and ideas into applications' },
                  { icon: Code, text: 'Build full-stack MVPs without starting from scratch' },
                  { icon: Workflow, text: 'Move through the build workflow with AI assistance' },
                ].map((item) => (
                  <div
                    key={item.text}
                    className="flex items-center gap-3 bg-gray-900/60 border border-gray-800 rounded-xl px-4 py-3"
                  >
                    <item.icon className="w-5 h-5 text-violet-400 flex-shrink-0" />
                    <span className="text-sm text-gray-300">{item.text}</span>
                  </div>
                ))}
                <p className="text-xs text-gray-500 pt-2">
                  MirrorSite AI remains an independent product experience — ATAI is its parent.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== VettCode Connection ===================== */}
      <section id="secure" className="py-24 px-4">
        <div className="container mx-auto">
          <div className="max-w-6xl mx-auto bg-gradient-to-br from-sky-900/30 via-gray-900/50 to-cyan-900/30 border border-sky-500/30 rounded-3xl p-8 md:p-12 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-72 h-72 bg-sky-600/10 rounded-full blur-3xl pointer-events-none" />
            <div className="grid md:grid-cols-2 gap-10 items-center relative">
              <div>
                <span className="inline-flex items-center gap-2 text-xs font-bold text-sky-300 bg-sky-500/10 border border-sky-500/30 rounded-full px-3 py-1 uppercase tracking-wider mb-6">
                  The Secure layer of ATAI
                </span>
                <h2 className="text-4xl font-bold mb-4">VettCode</h2>
                <p className="text-xl text-gray-300 mb-4">
                  Developer-focused security tooling for vetting applications and identifying
                  vulnerabilities.
                </p>
                <p className="text-gray-400 leading-relaxed mb-8">
                  VettCode is an active ATAI technology. Its CLI scans applications for security
                  vulnerabilities, exposed secrets, dependency risks, and other problems directly
                  from the developer workflow — with AI-assisted explanations.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link
                    href="/docs"
                    className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-sky-600 to-cyan-600 hover:from-sky-700 hover:to-cyan-700 rounded-lg font-semibold transition"
                  >
                    Explore VettCode <ArrowRight className="w-5 h-5" />
                  </Link>
                  <a
                    href="/docs/cli/installation"
                    className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gray-800 hover:bg-gray-700 rounded-lg font-semibold transition"
                  >
                    <Terminal className="w-5 h-5" /> Installation Guide
                  </a>
                </div>
              </div>
              <div>
                <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-5 mb-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Package className="w-4 h-4 text-sky-400" />
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Install from npm
                    </span>
                  </div>
                  <code className="block bg-gray-950 border border-gray-800 rounded-lg px-4 py-3 text-sm text-sky-300 overflow-x-auto">
                    npm install -g vettcode
                  </code>
                </div>
                <div className="space-y-3">
                  {[
                    { icon: ShieldCheck, text: 'Scan projects for security vulnerabilities' },
                    { icon: GitBranch, text: 'Vet code directly from the developer workflow' },
                    { icon: Sparkles, text: 'AI-assisted explanations for every finding' },
                  ].map((item) => (
                    <div
                      key={item.text}
                      className="flex items-center gap-3 bg-gray-900/60 border border-gray-800 rounded-xl px-4 py-3"
                    >
                      <item.icon className="w-5 h-5 text-sky-400 flex-shrink-0" />
                      <span className="text-sm text-gray-300">{item.text}</span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-4">
                  VettCode by ATAI — developer security as part of the ATAI ecosystem.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== AI Infrastructure ===================== */}
      <section id="technology" className="py-24 px-4 bg-gradient-to-b from-gray-900/50 to-transparent">
        <div className="container mx-auto">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">AI everywhere. Infrastructure underneath.</h2>
              <div className="max-w-3xl mx-auto space-y-4">
                <p className="text-xl text-gray-400">
                  The applications are only the visible layer.
                </p>
                <p className="text-gray-400 leading-relaxed">
                  Underneath them is the infrastructure that makes intelligent software possible — AI
                  models, automated pipelines, application environments, databases, APIs, security
                  systems, and infrastructure services.
                </p>
                <p className="text-gray-400 leading-relaxed">
                  ATAI is building these layers to work together as one evolving technology ecosystem.
                </p>
              </div>
            </div>

            {/* Layered stack */}
            <div className="grid lg:grid-cols-2 gap-10 items-center">
              <div className="space-y-3 max-w-md mx-auto lg:mx-0 w-full">
                {[
                  { icon: Sparkles, label: 'Applications', color: 'text-violet-400', border: 'border-violet-500/30', bg: 'bg-violet-900/20' },
                  { icon: Boxes, label: 'AI Products', color: 'text-indigo-400', border: 'border-indigo-500/30', bg: 'bg-indigo-900/20' },
                  { icon: Workflow, label: 'AI Pipelines', color: 'text-sky-400', border: 'border-sky-500/30', bg: 'bg-sky-900/20' },
                  { icon: ShieldCheck, label: 'Developer & Security Systems', color: 'text-cyan-400', border: 'border-cyan-500/30', bg: 'bg-cyan-900/20' },
                  { icon: Database, label: 'Databases & Data', color: 'text-blue-400', border: 'border-blue-500/30', bg: 'bg-blue-900/20' },
                  { icon: Server, label: 'Infrastructure', color: 'text-gray-300', border: 'border-gray-700', bg: 'bg-gray-800/40' },
                ].map((layer, index) => (
                  <div key={layer.label}>
                    <div className={`flex items-center justify-between ${layer.bg} ${layer.border} rounded-xl px-5 py-4 border`}>
                      <div className="flex items-center gap-3">
                        <layer.icon className={`w-5 h-5 ${layer.color}`} />
                        <span className="font-semibold">{layer.label}</span>
                      </div>
                      {index < 5 && (
                        <ChevronDown className="w-4 h-4 text-gray-600 rotate-180" aria-hidden="true" />
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div>
                <h3 className="text-3xl font-bold mb-6">Built as layers, designed as one system.</h3>
                <ul className="space-y-4">
                  {[
                    'AI technologies embedded across the entire stack',
                    'Intelligent pipelines connecting products to infrastructure',
                    'Data and databases designed to power AI-driven systems',
                    'Security systems integrated into the developer workflow',
                    'Infrastructure services engineered to evolve with the ecosystem',
                  ].map((point) => (
                    <li key={point} className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-sky-400 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-300">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== Africa Positioning ===================== */}
      <section className="py-24 px-4">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <Globe className="w-16 h-16 text-sky-400 mx-auto mb-6" />
              <h2 className="text-4xl md:text-5xl font-bold mb-6">Building for Africa. Building for everywhere.</h2>
              <p className="text-xl text-gray-400 leading-relaxed mb-6">
                ATAI is focused on building practical AI technologies for Africa and beyond.
              </p>
              <p className="text-lg text-gray-400 leading-relaxed mb-6">
                The goal is to make increasingly powerful software capabilities more accessible to
                developers, businesses, and organizations while building technology that can operate
                within the realities of emerging markets.
              </p>
              <p className="text-lg text-gray-300 font-semibold mb-8">
                Starting in Africa does not mean thinking small. It means building from a market with
                enormous technological opportunity and creating systems that can scale beyond it.
              </p>
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              {[
                { icon: Code, text: 'Practical AI tools for developers' },
                { icon: Building2, text: 'Technology built for emerging markets' },
                { icon: Globe, text: 'Systems designed to scale globally' },
              ].map((item) => (
                <div
                  key={item.text}
                  className="flex flex-col items-center gap-3 bg-gray-900/50 border border-gray-800 rounded-2xl p-6 text-center"
                >
                  <item.icon className="w-6 h-6 text-sky-400" />
                  <span className="text-sm text-gray-300">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===================== Build / Secure / Ship Roadmap ===================== */}
      <section id="ship" className="py-24 px-4 bg-gradient-to-b from-transparent to-gray-900/50">
        <div className="container mx-auto">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <span className="inline-flex items-center gap-2 text-xs font-bold text-gray-400 bg-gray-800 border border-gray-700 rounded-full px-3 py-1 uppercase tracking-wider mb-6">
                ATAI&apos;s evolving technology roadmap
              </span>
              <h2 className="text-4xl md:text-6xl font-bold mb-6">
                Build. <span className="text-sky-400">Secure.</span> Ship.
              </h2>
              <p className="text-xl text-gray-400">
                The technology journey behind the ATAI ecosystem.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="relative bg-gradient-to-br from-violet-900/30 to-violet-800/10 border border-violet-500/30 rounded-2xl p-8">
                <div className="w-12 h-12 bg-violet-500/20 rounded-xl flex items-center justify-center mb-4">
                  <Rocket className="w-6 h-6 text-violet-400" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Build</h3>
                <p className="text-gray-400">Create applications from ideas.</p>
              </div>

              <div className="relative bg-gradient-to-br from-sky-900/30 to-sky-800/10 border border-sky-500/30 rounded-2xl p-8">
                <div className="w-12 h-12 bg-sky-500/20 rounded-xl flex items-center justify-center mb-4">
                  <ShieldCheck className="w-6 h-6 text-sky-400" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Secure</h3>
                <p className="text-gray-400">Understand and protect the code powering them.</p>
              </div>

              <div className="relative bg-gradient-to-br from-cyan-900/30 to-cyan-800/10 border border-cyan-500/30 rounded-2xl p-8">
                <div className="w-12 h-12 bg-cyan-500/20 rounded-xl flex items-center justify-center mb-4">
                  <Cloud className="w-6 h-6 text-cyan-400" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Ship</h3>
                <p className="text-gray-400">Eventually move those applications into production infrastructure.</p>
              </div>
            </div>

            <p className="text-center text-sm text-gray-500 mt-8">
              ATAI&apos;s roadmap: not every layer is available today — but the direction is one ecosystem.
            </p>
          </div>
        </div>
      </section>

      {/* ===================== Future Vision ===================== */}
      <section id="vision" className="py-24 px-4">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">Where ATAI is going</h2>
              <p className="text-xl text-gray-400 leading-relaxed">
                The ATAI ecosystem is intended to evolve toward a deeper integration between AI,
                applications, security, databases, infrastructure, developer tooling, and automated
                pipelines.
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-3 mb-12">
              {['AI', 'Applications', 'Security', 'Databases', 'Infrastructure', 'Developer Tooling', 'Automated Pipelines'].map((item) => (
                <span
                  key={item}
                  className="px-4 py-2 bg-gray-900 border border-gray-700 rounded-full text-sm text-gray-300"
                >
                  {item}
                </span>
              ))}
            </div>

            <div className="bg-gradient-to-br from-indigo-900/30 to-cyan-900/30 border border-indigo-500/30 rounded-2xl p-8 md:p-12">
              <p className="text-lg text-gray-300 leading-relaxed mb-6">
                The long-term direction is infrastructure that understands the applications running on
                it — environments, databases, and pipelines that work together with the AI systems
                that build and secure those applications.
              </p>
              <div className="flex flex-wrap gap-2 mb-8">
                <span className="text-xs font-semibold text-indigo-300 bg-indigo-500/10 border border-indigo-500/30 rounded-full px-3 py-1 uppercase tracking-wider">Future</span>
                <span className="text-xs font-semibold text-sky-300 bg-sky-500/10 border border-sky-500/30 rounded-full px-3 py-1 uppercase tracking-wider">In development</span>
                <span className="text-xs font-semibold text-cyan-300 bg-cyan-500/10 border border-cyan-500/30 rounded-full px-3 py-1 uppercase tracking-wider">Long-term direction</span>
              </div>
              <p className="text-sm text-gray-500">
                No launch dates are being promised. What exists today — MirrorSite AI for building and
                VettCode for security — is real, and the infrastructure layer is being built toward.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== Contact ===================== */}
      <section id="contact" className="py-24 px-4 bg-gradient-to-b from-gray-900/50 to-transparent">
        <div className="container mx-auto">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-500/20 rounded-2xl mb-6">
              <Mail className="w-8 h-8 text-indigo-400" />
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Talk to ATAI</h2>
            <p className="text-xl text-gray-400 mb-10">
              Interested in ATAI&apos;s products, infrastructure, or building with our technologies?
              Get in touch.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="mailto:hello@atai.ink"
                className="px-8 py-4 bg-gradient-to-r from-indigo-600 via-sky-600 to-cyan-600 hover:from-indigo-700 hover:via-sky-700 hover:to-cyan-700 rounded-lg font-semibold text-lg flex items-center gap-2 transition"
              >
                Contact ATAI <ArrowRight className="w-5 h-5" />
              </a>
              <Link
                href="/docs"
                className="px-8 py-4 bg-gray-800 hover:bg-gray-700 rounded-lg font-semibold text-lg transition"
              >
                VettCode Documentation
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== Footer ===================== */}
      <footer className="bg-gray-900 border-t border-gray-800 py-12 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-xl font-bold mb-2 bg-gradient-to-r from-sky-400 via-indigo-400 to-violet-400 bg-clip-text text-transparent">
                ATAI
              </h3>
              <p className="text-sm text-gray-500 mb-4">Advanced Technologies and AI Enterprises</p>
              <p className="text-gray-400 text-sm mb-4">
                Building AI-powered applications, developer technologies, security systems, and
                intelligent infrastructure.
              </p>
              <a
                href="https://atai.ink"
                className="text-sm text-sky-400 hover:text-sky-300 transition"
              >
                atai.ink
              </a>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Products</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <a href={MIRRORSITE_URL} target="_blank" rel="noopener noreferrer" className="hover:text-white transition">
                    MirrorSite AI <ExternalLink className="w-3 h-3 inline" aria-hidden="true" />
                  </a>
                </li>
                <li><Link href="/docs" className="hover:text-white transition">VettCode</Link></li>
                <li><Link href="#ship" className="hover:text-white transition">Future Infrastructure</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="#about" className="hover:text-white transition">About</Link></li>
                <li><Link href="#technology" className="hover:text-white transition">Technology</Link></li>
                <li><Link href="#vision" className="hover:text-white transition">Vision</Link></li>
                <li><Link href="#contact" className="hover:text-white transition">Contact</Link></li>
                <li><Link href="/privacy" className="hover:text-white transition">Privacy</Link></li>
                <li><Link href="/terms" className="hover:text-white transition">Terms</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Ecosystem</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-violet-400" />
                  <span><span className="text-gray-300 font-medium">Build</span> — MirrorSite AI</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-sky-400" />
                  <span><span className="text-gray-300 font-medium">Secure</span> — VettCode</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-400" />
                  <span><span className="text-gray-300 font-medium">Ship</span> — Future infrastructure</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-500">
            <p>© 2026 ATAI. All rights reserved.</p>
            <p className="mt-1 text-gray-600">Advanced Technologies and AI Enterprises · atai.ink</p>
          </div>
        </div>
      </footer>
    </main>
  )
}
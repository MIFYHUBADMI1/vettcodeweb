import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Privacy Policy | ATAI',
  description: 'Privacy policy for ATAI — Advanced Technologies and AI Enterprises.',
  robots: {
    index: true,
    follow: true,
  },
}

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <nav className="fixed top-0 w-full z-50 bg-gray-950/80 backdrop-blur-xl border-b border-gray-800">
        <div className="container mx-auto px-4 py-4">
          <Link href="/" className="inline-flex items-baseline gap-2 group" aria-label="ATAI home">
            <span className="text-2xl font-bold bg-gradient-to-r from-sky-400 via-indigo-400 to-violet-400 bg-clip-text text-transparent group-hover:opacity-80 transition-opacity">
              ATAI
            </span>
            <span className="hidden sm:inline text-[10px] font-semibold text-gray-500 uppercase tracking-[0.18em]">
              Enterprises
            </span>
          </Link>
        </div>
      </nav>

      <div className="container mx-auto px-4 pt-28 pb-20">
        <div className="max-w-3xl mx-auto">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition mb-8">
            <ArrowLeft className="w-4 h-4" /> Back to ATAI
          </Link>

          <h1 className="text-4xl md:text-5xl font-bold mb-4">Privacy Policy</h1>
          <p className="text-gray-500 mb-12">
            ATAI — Advanced Technologies and AI Enterprises · Last updated 2026
          </p>

          <div className="space-y-8 text-gray-400 leading-relaxed">
            <section>
              <h2 className="text-2xl font-bold text-white mb-3">Overview</h2>
              <p>
                ATAI builds AI-powered applications, developer technologies, security tools, and
                intelligent infrastructure. This policy explains how the products in the ATAI
                ecosystem handle your information. Individual ATAI products — such as VettCode and
                MirrorSite AI — may provide additional, product-specific privacy details where they
                apply.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-3">Information We Collect</h2>
              <p>We collect information needed to operate and improve our products, including:</p>
              <ul className="list-disc pl-6 space-y-2 mt-3">
                <li>Account information you provide when you sign up, such as your name and email address.</li>
                <li>Content you upload or submit through our products, such as code and scan results.</li>
                <li>Usage information such as pages visited and features used, collected to improve the products.</li>
                <li>Technical information such as device type and browser, where needed to keep services working.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-3">How We Use Information</h2>
              <p>We use the information we collect to:</p>
              <ul className="list-disc pl-6 space-y-2 mt-3">
                <li>Provide, maintain, and improve ATAI products and services.</li>
                <li>Authenticate you and keep your account secure.</li>
                <li>Process and analyze security scans and AI-powered explanations.</li>
                <li>Communicate with you about the products you use.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-3">Data Sharing</h2>
              <p>
                We do not sell your personal information. We may share data with service providers
                who help operate our products (such as cloud storage and AI processing providers),
                only to the extent needed to provide the services, and where required by law.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-3">Security</h2>
              <p>
                We take reasonable measures to protect the information we hold, including
                authentication, access controls, and secure storage practices. No method of
                transmission or storage is completely secure, but we work to keep your data safe.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-3">Your Choices</h2>
              <p>
                You can access and update your account information through your dashboard settings.
                You can also contact us to request access to, correction of, or deletion of your
                personal information.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-3">Contact</h2>
              <p>
                Questions about this policy? Contact us at{' '}
                <a href="mailto:hello@atai.ink" className="text-sky-400 hover:text-sky-300 transition">
                  hello@atai.ink
                </a>
                .
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-3">Changes to This Policy</h2>
              <p>
                We may update this policy from time to time. When we make material changes, we will
                update the date above and, where appropriate, notify users of the affected products.
              </p>
            </section>
          </div>
        </div>
      </div>

      <footer className="bg-gray-900 border-t border-gray-800 py-8 px-4">
        <div className="container mx-auto text-center text-sm text-gray-500">
          <p>© 2026 ATAI. All rights reserved.</p>
        </div>
      </footer>
    </main>
  )
}
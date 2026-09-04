import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Terms of Service | ATAI',
  description: 'Terms of service for ATAI — Advanced Technologies and AI Enterprises.',
  robots: {
    index: true,
    follow: true,
  },
}

export default function TermsPage() {
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

          <h1 className="text-4xl md:text-5xl font-bold mb-4">Terms of Service</h1>
          <p className="text-gray-500 mb-12">
            ATAI — Advanced Technologies and AI Enterprises · Last updated 2026
          </p>

          <div className="space-y-8 text-gray-400 leading-relaxed">
            <section>
              <h2 className="text-2xl font-bold text-white mb-3">Agreement</h2>
              <p>
                These terms govern your use of the websites, products, and services operated by ATAI
                (&quot;ATAI&quot;, &quot;we&quot;, &quot;us&quot;), including VettCode and MirrorSite
                AI. By using our products, you agree to these terms. Individual products may provide
                additional terms where they apply.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-3">Use of Our Products</h2>
              <p>You may use our products only for lawful purposes and in accordance with these terms. You agree not to:</p>
              <ul className="list-disc pl-6 space-y-2 mt-3">
                <li>Use the products to violate any applicable law or regulation.</li>
                <li>Attempt to gain unauthorized access to our systems or other users&apos; accounts.</li>
                <li>Misuse, abuse, or interfere with the operation of the products.</li>
                <li>Upload content that is unlawful, harmful, or infringes the rights of others.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-3">Your Content</h2>
              <p>
                You retain ownership of the content you submit to our products, such as code, files,
                and scan results. You grant us the limited permission needed to operate and improve
                the products — for example, to store your uploads and process security scans. You are
                responsible for the content you submit.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-3">Accounts</h2>
              <p>
                Some products require an account. You are responsible for keeping your credentials
                secure and for activity that occurs under your account. You must provide accurate
                information when creating an account.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-3">Availability and Changes</h2>
              <p>
                Our products are evolving. Features, including planned infrastructure capabilities,
                may change, be delayed, or be discontinued. We do not promise specific launch dates
                or feature availability.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-3">Intellectual Property</h2>
              <p>
                The ATAI name, branding, website content, and software are owned by ATAI. You may not
                copy, modify, or distribute them without permission, except as explicitly permitted
                by open-source licenses that may apply to individual projects.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-3">Disclaimer and Limitation of Liability</h2>
              <p>
                Our products are provided &quot;as is&quot; without warranties of any kind. To the
                maximum extent permitted by law, ATAI is not liable for damages arising from your use
                of the products. Security scanning tools help identify potential issues but do not
                guarantee that software is free of vulnerabilities.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-3">Contact</h2>
              <p>
                Questions about these terms? Contact us at{' '}
                <a href="mailto:hello@atai.ink" className="text-sky-400 hover:text-sky-300 transition">
                  hello@atai.ink
                </a>
                .
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
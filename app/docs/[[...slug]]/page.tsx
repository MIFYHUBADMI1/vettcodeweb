import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import DocsLayout from '@/components/docs/DocsLayout'
import MarkdownRenderer from '@/components/docs/MarkdownRenderer'
import { 
  getDocBySlug, 
  getAllDocSlugs, 
  buildNavigationTree 
} from '@/lib/docs/file-system'

interface DocsPageProps {
  params: {
    slug?: string[]
  }
}

export async function generateStaticParams() {
  const slugs = getAllDocSlugs()
  
  return [
    { slug: [] }, // Root /docs page
    ...slugs.map(slug => ({ slug }))
  ]
}

export async function generateMetadata({ params }: DocsPageProps): Promise<Metadata> {
  const slug = params.slug || []
  const doc = getDocBySlug(slug)

  if (!doc) {
    return {
      title: 'Documentation Not Found - VettCode',
    }
  }

  return {
    title: `${doc.title} - VettCode Documentation`,
    description: doc.description || `${doc.title} documentation for VettCode`,
  }
}

export default function DocsPage({ params }: DocsPageProps) {
  const slug = params.slug || []
  const doc = getDocBySlug(slug)
  const navigation = buildNavigationTree()

  if (!doc) {
    notFound()
  }

  return (
    <DocsLayout navigation={navigation}>
      <article className="prose-docs">
        {doc.description && (
          <p className="text-xl text-gray-400 mb-8 border-b border-gray-800 pb-6">
            {doc.description}
          </p>
        )}
        <MarkdownRenderer content={doc.content} />
      </article>
    </DocsLayout>
  )
}

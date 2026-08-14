import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const docsDirectory = path.join(process.cwd(), 'docs')

export interface DocFrontmatter {
  title?: string
  description?: string
  order?: number
  [key: string]: any
}

export interface DocFile {
  slug: string[]
  title: string
  description?: string
  order: number
  content: string
  frontmatter: DocFrontmatter
}

export interface DocNavItem {
  title: string
  slug: string[]
  href: string
  order: number
  children?: DocNavItem[]
}

/**
 * Safely validate and normalize a slug path to prevent directory traversal
 */
export function validateSlug(slug: string[]): string[] {
  return slug
    .filter(Boolean) // Remove empty strings
    .map(s => s.replace(/[^a-zA-Z0-9_-]/g, '')) // Remove dangerous characters
    .filter(s => s !== '..' && s !== '.') // Remove path traversal attempts
}

/**
 * Convert filename to title
 * Example: "getting-started.md" -> "Getting Started"
 */
export function filenameToTitle(filename: string): string {
  return filename
    .replace(/\.(md|mdx|txt)$/, '') // Remove extension
    .replace(/[-_]/g, ' ') // Replace dashes and underscores with spaces
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

/**
 * Check if a file should be processed as documentation
 */
export function isDocumentationFile(filename: string): boolean {
  const ext = path.extname(filename).toLowerCase()
  return ['.md', '.mdx', '.txt'].includes(ext)
}

/**
 * Check if a path should be ignored
 */
export function shouldIgnorePath(pathName: string): boolean {
  const ignoredPatterns = [
    'node_modules',
    '.git',
    '.env',
    '.next',
    'dist',
    'build',
    '__pycache__',
  ]
  
  const basename = path.basename(pathName)
  
  // Ignore hidden files and folders
  if (basename.startsWith('.')) return true
  
  // Ignore specific patterns
  return ignoredPatterns.some(pattern => pathName.includes(pattern))
}

/**
 * Recursively get all documentation files
 */
export function getAllDocFiles(dir: string = docsDirectory, basePath: string[] = []): DocFile[] {
  if (!fs.existsSync(dir)) {
    return []
  }

  const files: DocFile[] = []
  const entries = fs.readdirSync(dir, { withFileTypes: true })

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    
    if (shouldIgnorePath(fullPath)) {
      continue
    }

    if (entry.isDirectory()) {
      // Recursively process subdirectories
      const subFiles = getAllDocFiles(fullPath, [...basePath, entry.name])
      files.push(...subFiles)
    } else if (entry.isFile() && isDocumentationFile(entry.name)) {
      // Process documentation file
      const fileContents = fs.readFileSync(fullPath, 'utf8')
      const { data, content } = matter(fileContents)
      
      const slug = [...basePath, entry.name.replace(/\.(md|mdx|txt)$/, '')]
      const title = data.title || filenameToTitle(entry.name)
      
      files.push({
        slug,
        title,
        description: data.description,
        order: data.order ?? 999,
        content,
        frontmatter: data as DocFrontmatter,
      })
    }
  }

  return files
}

/**
 * Get a specific documentation file by slug
 */
export function getDocBySlug(slug: string[]): DocFile | null {
  const validatedSlug = validateSlug(slug)
  
  if (validatedSlug.length === 0) {
    // Return index file for root
    return getDocBySlug(['index'])
  }

  const allFiles = getAllDocFiles()
  const file = allFiles.find(f => 
    f.slug.length === validatedSlug.length &&
    f.slug.every((s, i) => s === validatedSlug[i])
  )

  return file || null
}

/**
 * Build navigation tree from all documentation files
 */
export function buildNavigationTree(): DocNavItem[] {
  const allFiles = getAllDocFiles()
  const tree: DocNavItem[] = []

  // Group files by their path hierarchy
  const grouped = new Map<string, DocFile[]>()

  for (const file of allFiles) {
    if (file.slug.length === 1) {
      // Root level file
      tree.push({
        title: file.title,
        slug: file.slug,
        href: `/docs/${file.slug.join('/')}`,
        order: file.order,
      })
    } else {
      // Nested file - group by parent
      const parentKey = file.slug.slice(0, -1).join('/')
      if (!grouped.has(parentKey)) {
        grouped.set(parentKey, [])
      }
      grouped.get(parentKey)!.push(file)
    }
  }

  // Build nested structure
  const buildChildren = (parentSlug: string[]): DocNavItem[] => {
    const parentKey = parentSlug.join('/')
    const children = grouped.get(parentKey) || []
    
    return children
      .map(file => ({
        title: file.title,
        slug: file.slug,
        href: `/docs/${file.slug.join('/')}`,
        order: file.order,
        children: buildChildren(file.slug),
      }))
      .sort((a, b) => a.order - b.order)
  }

  // Add children to root items and find folders
  for (const [key, files] of grouped.entries()) {
    const parts = key.split('/')
    
    if (parts.length === 1) {
      // First level folder
      const folderTitle = filenameToTitle(parts[0])
      const existing = tree.find(item => item.slug.join('/') === key)
      
      if (!existing) {
        tree.push({
          title: folderTitle,
          slug: parts,
          href: `/docs/${key}`,
          order: 999,
          children: files
            .map(file => ({
              title: file.title,
              slug: file.slug,
              href: `/docs/${file.slug.join('/')}`,
              order: file.order,
              children: buildChildren(file.slug),
            }))
            .sort((a, b) => a.order - b.order),
        })
      }
    }
  }

  return tree.sort((a, b) => a.order - b.order)
}

/**
 * Get all slugs for static generation
 */
export function getAllDocSlugs(): string[][] {
  const allFiles = getAllDocFiles()
  return allFiles.map(f => f.slug)
}

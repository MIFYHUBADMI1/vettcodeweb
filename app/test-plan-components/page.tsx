/**
 * Test Page for Plan Components
 * Showcases all visual components with mock data
 */

'use client';

import { PlanProgressCircle } from '@/components/vibe/plan/PlanProgressCircle';
import { PlanReadinessSidebar } from '@/components/vibe/plan/PlanReadinessSidebar';
import { PlanSectionCard, PlanSectionCardSkeleton } from '@/components/vibe/plan/PlanSectionCard';
import { PlanChecklistItem } from '@/components/vibe/plan/PlanChecklistItem';
import { PlanPageItem } from '@/components/vibe/plan/PlanPageItem';
import { PlanTechStackCard } from '@/components/vibe/plan/PlanTechStackCard';
import { PlanGoalsSection } from '@/components/vibe/plan/PlanGoalsSection';
import { PlanFeaturesSection } from '@/components/vibe/plan/PlanFeaturesSection';
import { PlanArchitectureCard } from '@/components/vibe/plan/PlanArchitectureCard';
import { PlanOriginalIdeaCard } from '@/components/vibe/plan/PlanOriginalIdeaCard';
import { PlanSecurityCard } from '@/components/vibe/plan/PlanSecurityCard';
import { PlanTestingCard } from '@/components/vibe/plan/PlanTestingCard';
import { Target, Zap, FileText, Code2 } from 'lucide-react';

export default function TestPlanComponentsPage() {
  // Mock data
  const mockGoals = [
    {
      id: '1',
      title: 'Provide a seamless shopping experience for customers',
      description: 'Create an intuitive e-commerce platform with easy navigation',
      priority: 'high' as const,
    },
    {
      id: '2',
      title: 'Secure user authentication and profile management',
      description: 'Implement secure login and user account features',
      priority: 'high' as const,
    },
    {
      id: '3',
      title: 'Manage products, orders, and inventory efficiently',
      description: 'Admin dashboard for store management',
      priority: 'medium' as const,
    },
  ];

  const mockFeatures = [
    {
      id: '1',
      name: 'User authentication (signup, login, logout)',
      description: 'Secure authentication system with email/password',
      userStory: 'As a user, I can create an account and log in to access personalized features',
      priority: 'must-have' as const,
      estimatedComplexity: 'moderate' as const,
    },
    {
      id: '2',
      name: 'Product catalog with images and reviews',
      description: 'Display products with photos, descriptions, and customer reviews',
      priority: 'must-have' as const,
      estimatedComplexity: 'simple' as const,
    },
    {
      id: '3',
      name: 'Shopping cart and wishlist',
      description: 'Add items to cart and save favorites',
      priority: 'must-have' as const,
      estimatedComplexity: 'moderate' as const,
    },
  ];

  const mockSecurity = [
    {
      id: '1',
      title: 'Password hashing with bcrypt',
      description: 'Securely hash passwords before storing',
      category: 'authentication' as const,
      implemented: true,
    },
    {
      id: '2',
      title: 'JWT-based session management',
      category: 'authentication' as const,
      implemented: true,
    },
    {
      id: '3',
      title: 'Input validation with Zod',
      description: 'Validate all user inputs to prevent injection attacks',
      category: 'data-protection' as const,
      implemented: false,
    },
  ];

  const mockTesting = [
    {
      id: '1',
      title: 'Unit testing with Jest',
      description: 'Test individual functions and components',
      type: 'unit' as const,
      implemented: true,
    },
    {
      id: '2',
      title: 'Component testing with Testing Library',
      type: 'integration' as const,
      implemented: true,
    },
    {
      id: '3',
      title: 'E2E testing with Playwright',
      description: 'Test critical user flows end-to-end',
      type: 'e2e' as const,
      implemented: false,
    },
  ];

  const readinessItems = [
    { label: 'Project goals defined', completed: true },
    { label: 'Core features listed', completed: true },
    { label: 'Pages & screens defined', completed: true },
    { label: 'Technical stack selected', completed: true },
    { label: 'Data structure defined', completed: true },
    { label: 'Security considered', completed: true },
    { label: 'Testing strategy ready', completed: true },
    { label: 'Dependencies reviewed', completed: false, warning: true },
  ];

  const dataStructure = [
    { name: 'User', fields: 'id, name, email, password, role, createdAt, ...' },
    { name: 'Product', fields: 'id, name, description, price, images, stock, ...' },
    { name: 'Category', fields: 'id, name, slug, createdAt, updatedAt' },
    { name: 'Order', fields: 'id, userId, total, status, status, paymentId, crea...' },
    { name: 'OrderItem', fields: 'id, orderId, productId, quantity, price, crea...' },
  ];

  const techStack = {
    framework: {
      name: 'Next.js 14 (App Router)',
      why: 'Modern React framework with server components and excellent performance',
    },
    language: {
      name: 'TypeScript',
      why: 'Type safety and better developer experience',
    },
    styling: {
      name: 'Tailwind CSS',
      why: 'Utility-first CSS for rapid UI development',
    },
    uiComponents: {
      name: 'ShadcnUI',
      why: 'Beautiful, accessible components built on Radix UI',
    },
    database: {
      name: 'PostgreSQL',
      why: 'Robust relational database with excellent TypeScript support',
    },
    orm: {
      name: 'Prisma',
      why: 'Type-safe database client with great DX',
    },
    authentication: {
      name: 'NextAuth.js',
      why: 'Complete authentication solution for Next.js',
    },
    hosting: {
      name: 'Vercel',
      why: 'Zero-config deployment optimized for Next.js',
    },
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="border-b border-gray-800 bg-gray-900/50 sticky top-0 z-10 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            Plan Components Showcase
          </h1>
          <p className="text-gray-400 mt-2">Testing all visual components with mock data</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Content - 3 columns */}
          <div className="lg:col-span-3 space-y-8">
            {/* Original Idea Card */}
            <section>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                Original Idea
              </h2>
              <PlanOriginalIdeaCard
                description="Build a modern e-commerce platform similar to Amazon with product catalog, user authentication, shopping cart, payment processing, order management, admin dashboard, and responsive design."
                projectType="web"
                framework="Next.js"
                simpleExplanation="You want to create an online store where customers can browse products, add items to their cart, and make purchases securely. Store owners will have a dashboard to manage inventory and orders."
                onEdit={() => alert('Edit original idea')}
              />
            </section>

            {/* Goals Section */}
            <section>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                Goals Section
              </h2>
              <PlanGoalsSection
                goals={mockGoals}
                onToggle={(id) => alert(`Toggle goal ${id}`)}
                onEdit={(id) => alert(`Edit goal ${id}`)}
                onDelete={(id) => alert(`Delete goal ${id}`)}
                onAdd={() => alert('Add goal')}
              />
            </section>

            {/* Features Section */}
            <section>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-cyan-500"></div>
                Features Section
              </h2>
              <PlanFeaturesSection
                features={mockFeatures}
                onToggle={(id) => alert(`Toggle feature ${id}`)}
                onEdit={(id) => alert(`Edit feature ${id}`)}
                onDelete={(id) => alert(`Delete feature ${id}`)}
                onAdd={() => alert('Add feature')}
              />
            </section>

            {/* Architecture Card */}
            <section>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                Architecture Card
              </h2>
              <PlanArchitectureCard
                overview="The application follows a modern Next.js architecture with the App Router. Server components handle data fetching while client components manage interactivity. Authentication is managed with NextAuth.js and data is stored in PostgreSQL via Prisma ORM."
                pattern={{
                  name: 'Three-Tier Architecture',
                  reason: 'Separates presentation, business logic, and data storage for better maintainability and scalability',
                }}
                layers={[
                  'Presentation Layer (React Components)',
                  'Business Logic Layer (Server Actions & API Routes)',
                  'Data Access Layer (Prisma ORM)',
                  'Database Layer (PostgreSQL)',
                ]}
                keyDecisions={[
                  'Use Server Components by default for better performance',
                  'Implement API routes for external integrations',
                  'Use Prisma for type-safe database operations',
                  'Store sessions in database for scalability',
                ]}
                onViewDetails={() => alert('View architecture details')}
                onEdit={() => alert('Edit architecture')}
              />
            </section>

            {/* Security Card */}
            <section>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                Security Card
              </h2>
              <PlanSecurityCard
                considerations={mockSecurity}
                onToggle={(id) => alert(`Toggle security ${id}`)}
                onEdit={(id) => alert(`Edit security ${id}`)}
                onDelete={(id) => alert(`Delete security ${id}`)}
                onAdd={() => alert('Add security')}
              />
            </section>

            {/* Testing Card */}
            <section>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-teal-500"></div>
                Testing Card
              </h2>
              <PlanTestingCard
                strategies={mockTesting}
                coverageTarget={80}
                onToggle={(id) => alert(`Toggle test ${id}`)}
                onEdit={(id) => alert(`Edit test ${id}`)}
                onDelete={(id) => alert(`Delete test ${id}`)}
                onAdd={() => alert('Add test')}
              />
            </section>

            {/* Progress Circles */}
            <section>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                Progress Circles
              </h2>
              <div className="flex flex-wrap gap-8">
                <div>
                  <PlanProgressCircle progress={25} size={100} />
                  <p className="text-sm text-gray-400 mt-2 text-center">25%</p>
                </div>
                <div>
                  <PlanProgressCircle progress={50} size={100} />
                  <p className="text-sm text-gray-400 mt-2 text-center">50%</p>
                </div>
                <div>
                  <PlanProgressCircle progress={75} size={100} />
                  <p className="text-sm text-gray-400 mt-2 text-center">75%</p>
                </div>
                <div>
                  <PlanProgressCircle progress={92} size={100} />
                  <p className="text-sm text-gray-400 mt-2 text-center">92%</p>
                </div>
              </div>
            </section>

            {/* Checklist Items */}
            <section>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                Checklist Items
              </h2>
              <PlanSectionCard
                title="Project Goals"
                icon={<Target className="w-5 h-5" />}
                onAddItem={() => alert('Add goal')}
                addItemLabel="Add Goal"
              >
                <div className="space-y-3">
                  <PlanChecklistItem
                    checked
                    title="Provide a seamless shopping experience for customers"
                    description="Create an intuitive e-commerce platform"
                    priority="high"
                    onEdit={() => alert('Edit')}
                    onDelete={() => alert('Delete')}
                    isDraggable
                  />
                  <PlanChecklistItem
                    checked
                    title="Secure user authentication and profile management"
                    priority="high"
                    onEdit={() => alert('Edit')}
                    onDelete={() => alert('Delete')}
                    isDraggable
                  />
                  <PlanChecklistItem
                    title="Manage products, orders, and inventory efficiently"
                    description="Admin dashboard for store management"
                    priority="medium"
                    onEdit={() => alert('Edit')}
                    onDelete={() => alert('Delete')}
                    isDraggable
                  />
                  <PlanChecklistItem
                    title="Deliver responsive design that works on all devices"
                    priority="medium"
                    onEdit={() => alert('Edit')}
                    onDelete={() => alert('Delete')}
                    isDraggable
                  />
                </div>
              </PlanSectionCard>
            </section>

            {/* Page Items */}
            <section>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                Page Items
              </h2>
              <PlanSectionCard
                title="Pages / Screens"
                icon={<FileText className="w-5 h-5" />}
                onAddItem={() => alert('Add page')}
                addItemLabel="Add Page"
              >
                <div className="space-y-3">
                  <PlanPageItem
                    name="Home Page"
                    route="/"
                    description="Landing page with featured products and categories"
                    onEdit={() => alert('Edit')}
                    onDelete={() => alert('Delete')}
                  />
                  <PlanPageItem
                    name="Product Listing"
                    route="/products"
                    description="Browse all products with filtering and sorting"
                    onEdit={() => alert('Edit')}
                    onDelete={() => alert('Delete')}
                  />
                  <PlanPageItem
                    name="Product Details"
                    route="/products/[id]"
                    description="Individual product page with images, details, and reviews"
                    onEdit={() => alert('Edit')}
                    onDelete={() => alert('Delete')}
                  />
                  <PlanPageItem
                    name="Shopping Cart"
                    route="/cart"
                    description="View and manage items in cart"
                    onEdit={() => alert('Edit')}
                    onDelete={() => alert('Delete')}
                  />
                  <PlanPageItem
                    name="User Dashboard"
                    route="/dashboard"
                    description="User profile, orders, and settings"
                    requiresAuth
                    onEdit={() => alert('Edit')}
                    onDelete={() => alert('Delete')}
                  />
                  <PlanPageItem
                    name="Admin Dashboard"
                    route="/admin"
                    description="Manage products, orders, and users"
                    requiresAuth
                    onEdit={() => alert('Edit')}
                    onDelete={() => alert('Delete')}
                  />
                </div>
              </PlanSectionCard>
            </section>

            {/* Tech Stack */}
            <section>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-cyan-500"></div>
                Tech Stack Card
              </h2>
              <PlanTechStackCard
                techStack={techStack}
                onEdit={() => alert('Edit tech stack')}
              />
            </section>

            {/* Generating State */}
            <section>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                Loading States
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <PlanSectionCard
                  title="Core Features"
                  icon={<Zap className="w-5 h-5" />}
                  isGenerating
                >
                  <div className="space-y-3">
                    <div className="h-12 bg-gray-800/50 rounded-lg animate-pulse"></div>
                    <div className="h-12 bg-gray-800/50 rounded-lg animate-pulse"></div>
                    <div className="h-12 bg-gray-800/50 rounded-lg animate-pulse"></div>
                  </div>
                </PlanSectionCard>

                <PlanSectionCardSkeleton />
              </div>
            </section>
          </div>

          {/* Right Sidebar - 1 column */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                Sidebar
              </h2>
              <PlanReadinessSidebar
                progress={92}
                readinessItems={readinessItems}
                dataStructure={dataStructure}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

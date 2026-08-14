/**
 * Debug Route: AI Provider Status & Test
 * 
 * GET /api/debug/ai-providers
 * - Shows which providers are configured
 * - Tests API key validity
 * - Returns provider capabilities
 * 
 * GET /api/debug/ai-providers?test=true
 * - Actually calls each provider with a simple test
 * - Shows response time and success/failure
 */

import { NextRequest, NextResponse } from 'next/server'
import { AIProviderRegistry } from '@/lib/ai-providers'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const shouldTest = searchParams.get('test') === 'true'
  
  console.log('[DEBUG-API-PROVIDERS] Debug request received. Test mode:', shouldTest)
  
  const startTime = Date.now()
  
  // Check environment variables
  const envCheck = {
    OPENROUTER_API_KEY: !!process.env.OPENROUTER_API_KEY,
    GROQ_API_KEY: !!process.env.GROQ_API_KEY,
    MONGODB_URI: !!process.env.MONGODB_URI,
    NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
  }
  
  console.log('[DEBUG-API-PROVIDERS] Environment variables:', envCheck)
  
  // Initialize registry (this will log provider registration)
  const registry = new AIProviderRegistry()
  const availableProviders = registry.getAvailableProviders()
  
  console.log('[DEBUG-API-PROVIDERS] Available providers:', availableProviders.length)
  
  const providerStatus = availableProviders.map(provider => ({
    name: provider.name,
    available: provider.isAvailable(),
  }))
  
  // Basic response without testing
  if (!shouldTest) {
    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      duration: Date.now() - startTime,
      environment: {
        OPENROUTER_API_KEY: envCheck.OPENROUTER_API_KEY ? 'SET' : 'MISSING',
        GROQ_API_KEY: envCheck.GROQ_API_KEY ? 'SET' : 'MISSING',
        MONGODB_URI: envCheck.MONGODB_URI ? 'SET' : 'MISSING',
        NEXTAUTH_SECRET: envCheck.NEXTAUTH_SECRET ? 'SET' : 'MISSING',
      },
      providers: {
        totalAvailable: availableProviders.length,
        providers: providerStatus,
      },
      modelRegistry: await getModelRegistryInfo(),
      message: availableProviders.length > 0 
        ? '✅ AI providers are configured correctly'
        : '⚠️ No AI providers available - set OPENROUTER_API_KEY or GROQ_API_KEY',
      hint: 'Add ?test=true to actually test API calls to each provider',
    })
  }
  
  // Test mode - actually call each provider
  console.log('[DEBUG-API-PROVIDERS] Starting provider tests...')
  
  const testResults = []
  
  for (const provider of availableProviders) {
    const testStart = Date.now()
    console.log(`[DEBUG-API-PROVIDERS] Testing ${provider.name}...`)
    
    try {
      // Simple test message
      const testMessages = [
        { role: 'user', content: 'Say "Hello from VettCode!" in one sentence.' }
      ]
      
      // Get a test model for this provider
      const testModel = await getTestModel(provider.name)
      
      if (!testModel) {
        testResults.push({
          provider: provider.name,
          success: false,
          error: 'No test model available',
          duration: Date.now() - testStart,
        })
        continue
      }
      
      console.log(`[DEBUG-API-PROVIDERS] Using model: ${testModel}`)
      
      const response = await provider.generateChat(testMessages, testModel, 100)
      
      testResults.push({
        provider: provider.name,
        model: testModel,
        success: true,
        responseLength: response.length,
        responsePreview: response.substring(0, 100),
        duration: Date.now() - testStart,
      })
      
      console.log(`[DEBUG-API-PROVIDERS] ${provider.name} test successful (${Date.now() - testStart}ms)`)
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      
      testResults.push({
        provider: provider.name,
        success: false,
        error: errorMessage,
        duration: Date.now() - testStart,
      })
      
      console.error(`[DEBUG-API-PROVIDERS] ${provider.name} test failed:`, errorMessage)
    }
  }
  
  const successCount = testResults.filter(r => r.success).length
  const failureCount = testResults.filter(r => !r.success).length
  
  console.log(`[DEBUG-API-PROVIDERS] Tests complete: ${successCount} passed, ${failureCount} failed`)
  
  return NextResponse.json({
    status: successCount > 0 ? 'ok' : 'error',
    timestamp: new Date().toISOString(),
    duration: Date.now() - startTime,
    environment: {
      OPENROUTER_API_KEY: envCheck.OPENROUTER_API_KEY ? 'SET ✓' : 'MISSING ✗',
      GROQ_API_KEY: envCheck.GROQ_API_KEY ? 'SET ✓' : 'MISSING ✗',
      MONGODB_URI: envCheck.MONGODB_URI ? 'SET ✓' : 'MISSING ✗',
      NEXTAUTH_SECRET: envCheck.NEXTAUTH_SECRET ? 'SET ✓' : 'MISSING ✗',
    },
    summary: {
      totalProviders: availableProviders.length,
      testsRun: testResults.length,
      passed: successCount,
      failed: failureCount,
    },
    testResults,
    modelRegistry: await getModelRegistryInfo(),
    message: successCount > 0
      ? `✅ ${successCount} provider(s) working correctly`
      : failureCount > 0
      ? `❌ All ${failureCount} provider(s) failed - check API keys`
      : '⚠️ No providers to test - set OPENROUTER_API_KEY or GROQ_API_KEY',
  })
}

/**
 * Get test model for a provider
 */
async function getTestModel(providerName: string): Promise<string | null> {
  const { MODEL_REGISTRY } = await import('@/lib/model-registry')
  
  // Find a free model for this provider (for safe testing)
  const freeModel = MODEL_REGISTRY.find(
    m => m.provider === providerName && m.costClass === 'free' && m.enabled
  )
  
  if (freeModel) return freeModel.id
  
  // Fallback to any model for this provider
  const anyModel = MODEL_REGISTRY.find(
    m => m.provider === providerName && m.enabled
  )
  
  return anyModel ? anyModel.id : null
}

/**
 * Get model registry information
 */
async function getModelRegistryInfo() {
  const { MODEL_REGISTRY, getModelsByTier } = await import('@/lib/model-registry')
  
  const totalModels = MODEL_REGISTRY.filter(m => m.enabled).length
  const freeModels = MODEL_REGISTRY.filter(m => m.enabled && m.costClass === 'free').length
  const openrouterModels = MODEL_REGISTRY.filter(m => m.enabled && m.provider === 'openrouter').length
  const groqModels = MODEL_REGISTRY.filter(m => m.enabled && m.provider === 'groq').length
  
  return {
    totalModels,
    byTier: {
      tier1: getModelsByTier(1).length,
      tier2: getModelsByTier(2).length,
      tier3: getModelsByTier(3).length,
      tier4: getModelsByTier(4).length,
    },
    byCost: {
      free: freeModels,
      paid: totalModels - freeModels,
    },
    byProvider: {
      openrouter: openrouterModels,
      groq: groqModels,
    },
  }
}

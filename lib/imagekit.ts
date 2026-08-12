/**
 * ImageKit Integration
 * Used for storing scan result JSONs in the cloud
 */

import ImageKit from 'imagekit'

let imagekitInstance: ImageKit | null = null

/**
 * Get or initialize ImageKit client
 */
function getImageKit(): ImageKit {
  if (!imagekitInstance) {
    const publicKey = process.env.IMAGEKIT_PUBLIC_KEY
    const privateKey = process.env.IMAGEKIT_PRIVATE_KEY
    const urlEndpoint = process.env.IMAGEKIT_URL_ENDPOINT
    
    if (!publicKey || !privateKey || !urlEndpoint) {
      throw new Error('ImageKit credentials not configured. Please set IMAGEKIT_PUBLIC_KEY, IMAGEKIT_PRIVATE_KEY, and IMAGEKIT_URL_ENDPOINT environment variables.')
    }
    
    imagekitInstance = new ImageKit({
      publicKey,
      privateKey,
      urlEndpoint,
    })
  }
  
  return imagekitInstance
}

/**
 * Upload scan result JSON to ImageKit
 */
export async function uploadScanResult(jsonData: any): Promise<string> {
  try {
    const imagekit = getImageKit()
    const fileName = `scan-${Date.now()}.json`
    const fileContent = JSON.stringify(jsonData, null, 2)
    
    console.log('[ImageKit] Starting upload, filename:', fileName)
    console.log('[ImageKit] File size:', fileContent.length, 'bytes')
    
    const result = await imagekit.upload({
      file: Buffer.from(fileContent).toString('base64'),
      fileName: fileName,
      folder: '/vettcode-scans',
      tags: ['vettcode', 'scan', 'security'],
    })
    
    console.log('[ImageKit] Upload successful, URL:', result.url)
    return result.url
  } catch (error: any) {
    console.error('[ImageKit] Upload error:', error)
    console.error('[ImageKit] Error name:', error?.name)
    console.error('[ImageKit] Error message:', error?.message)
    console.error('[ImageKit] Error response:', error?.response?.data || error?.response)
    throw new Error(`ImageKit upload error: ${error.message}`)
  }
}

/**
 * Retrieve scan result from ImageKit URL
 */
export async function getScanResult(url: string): Promise<any> {
  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error('Failed to fetch scan result')
    }
    return await response.json()
  } catch (error) {
    console.error('ImageKit download error:', error)
    throw new Error('Failed to retrieve scan result')
  }
}

/**
 * List all scans for a user/project
 */
export async function listScans(limit: number = 20): Promise<any[]> {
  try {
    const imagekit = getImageKit()
    const result = await imagekit.listFiles({
      path: '/vettcode-scans',
      limit: limit,
      sort: 'DESC_CREATED',
    })
    
    return result
  } catch (error) {
    console.error('ImageKit list error:', error)
    return []
  }
}

/**
 * Delete old scans (cleanup)
 */
export async function deleteScan(fileId: string): Promise<boolean> {
  try {
    const imagekit = getImageKit()
    await imagekit.deleteFile(fileId)
    return true
  } catch (error) {
    console.error('ImageKit delete error:', error)
    return false
  }
}

export default getImageKit

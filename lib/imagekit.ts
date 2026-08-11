/**
 * ImageKit Integration
 * Used for storing scan result JSONs in the cloud
 */

import ImageKit from 'imagekit'

// Initialize ImageKit client
const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY || '',
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY || '',
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT || '',
})

/**
 * Upload scan result JSON to ImageKit
 */
export async function uploadScanResult(jsonData: any): Promise<string> {
  try {
    const fileName = `scan-${Date.now()}.json`
    const fileContent = JSON.stringify(jsonData, null, 2)
    
    const result = await imagekit.upload({
      file: Buffer.from(fileContent).toString('base64'),
      fileName: fileName,
      folder: '/vettcode-scans',
      tags: ['vettcode', 'scan', 'security'],
    })
    
    return result.url
  } catch (error) {
    console.error('ImageKit upload error:', error)
    throw new Error('Failed to upload scan result')
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
    await imagekit.deleteFile(fileId)
    return true
  } catch (error) {
    console.error('ImageKit delete error:', error)
    return false
  }
}

export default imagekit

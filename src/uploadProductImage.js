/** Supabase Storage bucket — create + policies in `supabase/storage-product-images.sql`. */
export const PRODUCT_IMAGES_BUCKET = 'product-images'

const MAX_BYTES = 5 * 1024 * 1024

function extensionForFile(file) {
  const raw = (file.name.split('.').pop() || '').toLowerCase().replace(/[^a-z0-9]/g, '')
  const allowed = new Set(['jpg', 'jpeg', 'png', 'webp', 'gif'])
  if (raw === 'jpeg' || raw === 'jpg') return 'jpg'
  if (allowed.has(raw)) return raw
  const t = file.type || ''
  if (t.includes('png')) return 'png'
  if (t.includes('webp')) return 'webp'
  if (t.includes('gif')) return 'gif'
  return 'jpg'
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} supabaseClient
 * @param {File} file
 * @returns {Promise<{ publicUrl: string | null, error: Error | null }>}
 */
export async function uploadProductImage(supabaseClient, file) {
  if (!file || !file.type.startsWith('image/')) {
    return { publicUrl: null, error: new Error('Choose an image file (JPEG, PNG, WebP, or GIF).') }
  }
  if (file.size > MAX_BYTES) {
    return { publicUrl: null, error: new Error('Image must be 5 MB or smaller.') }
  }

  const ext = extensionForFile(file)
  const path = `products/${crypto.randomUUID()}.${ext}`

  const { error: uploadError } = await supabaseClient.storage.from(PRODUCT_IMAGES_BUCKET).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
    contentType: file.type || 'image/jpeg',
  })

  if (uploadError) {
    return { publicUrl: null, error: uploadError }
  }

  const { data } = supabaseClient.storage.from(PRODUCT_IMAGES_BUCKET).getPublicUrl(path)
  const publicUrl = data?.publicUrl ?? null
  if (!publicUrl) {
    return { publicUrl: null, error: new Error('Could not get public URL for uploaded image.') }
  }
  return { publicUrl, error: null }
}

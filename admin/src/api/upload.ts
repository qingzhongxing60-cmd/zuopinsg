import request from '@/utils/http'

/**
 * 上传文件到服务器
 * @param file 文件对象
 * @param type 文件类型（如 'avatar'、'cover' 等）
 * @returns 上传后的文件URL
 */
export async function uploadFile(file: File, type: string = 'common'): Promise<string> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('type', type)

  const { data } = await request.post<{ url: string }>({
    url: '/admin/space/info/upload',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })

  return data.url
}

/**
 * 上传图片并返回URL
 * 自动验证图片格式和大小
 * @param file 文件对象
 * @param maxSize 最大文件大小（字节），默认5MB
 * @returns 上传后的图片URL
 */
export async function uploadImage(file: File, maxSize: number = 5 * 1024 * 1024): Promise<string> {
  // 验证文件类型
  if (!file.type.startsWith('image/')) {
    throw new Error('仅支持图片格式')
  }

  // 验证文件大小
  if (file.size > maxSize) {
    throw new Error(`图片大小不能超过 ${Math.round(maxSize / 1024 / 1024)}MB`)
  }

  return uploadFile(file, 'image')
}

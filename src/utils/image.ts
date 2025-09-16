import Taro from '@tarojs/taro'

/**
 * 图片工具函数
 */

// 图片格式映射
const IMAGE_FORMATS = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  gif: 'image/gif',
  webp: 'image/webp',
} as const

/**
 * 将图片文件转换为Base64
 * @param filePath 文件路径
 * @param format 图片格式
 * @returns Base64字符串
 */
export const imageToBase64 = async (
  filePath: string,
  format: keyof typeof IMAGE_FORMATS = 'jpeg'
): Promise<string> => {
  try {
    const fileManager = Taro.getFileSystemManager()
    const base64Data = fileManager.readFileSync(filePath, 'base64')
    const mimeType = IMAGE_FORMATS[format] || IMAGE_FORMATS.jpeg
    return `data:${mimeType};base64,${base64Data}`
  } catch (error) {
    console.error('图片转Base64失败:', error)
    throw new Error('图片文件转换失败')
  }
}

/**
 * 将Base64转换为临时文件
 * @param base64 Base64字符串
 * @param fileName 文件名
 * @returns 临时文件路径
 */
export const base64ToImageFile = async (
  base64: string,
  fileName: string = `image_${Date.now()}.jpg`
): Promise<string> => {
  try {
    // 移除data URL前缀
    const base64Data = base64.replace(/^data:image\/\w+;base64,/, '')

    // 写入临时文件
    const fileManager = Taro.getFileSystemManager()
    const tempFilePath = `${Taro.env.USER_DATA_PATH}/${fileName}`

    fileManager.writeFileSync(tempFilePath, base64Data, 'base64')

    return tempFilePath
  } catch (error) {
    console.error('Base64转图片文件失败:', error)
    throw new Error('图片文件保存失败')
  }
}

/**
 * 压缩图片
 * @param filePath 图片路径
 * @param quality 压缩质量 (0-100)
 * @returns 压缩后的图片路径
 */
export const compressImage = async (
  filePath: string,
  quality: number = 80
): Promise<string> => {
  try {
    const result = await Taro.compressImage({
      src: filePath,
      quality: Math.min(100, Math.max(0, quality)),
    })

    return result.tempFilePath
  } catch (error) {
    console.error('图片压缩失败:', error)
    // 压缩失败时返回原图
    return filePath
  }
}

/**
 * 获取图片信息
 * @param filePath 图片路径
 * @returns 图片信息
 */
export const getImageInfo = async (
  filePath: string
): Promise<{
  width: number
  height: number
  type: string
  orientation: string
  path: string
}> => {
  try {
    const info = await Taro.getImageInfo({
      src: filePath,
    })

    return {
      width: info.width,
      height: info.height,
      type: info.type,
      orientation: info.orientation || 'up',
      path: info.path,
    }
  } catch (error) {
    console.error('获取图片信息失败:', error)
    throw new Error('无法获取图片信息')
  }
}

/**
 * 调整图片尺寸
 * @param filePath 图片路径
 * @param maxWidth 最大宽度
 * @param maxHeight 最大高度
 * @returns 调整后的图片路径
 */
export const resizeImage = async (
  filePath: string,
  maxWidth: number = 1024,
  maxHeight: number = 1024
): Promise<string> => {
  try {
    // 获取图片信息
    const info = await getImageInfo(filePath)

    // 计算缩放比例
    const widthRatio = info.width > maxWidth ? maxWidth / info.width : 1
    const heightRatio = info.height > maxHeight ? maxHeight / info.height : 1
    const scale = Math.min(widthRatio, heightRatio)

    // 如果不需要缩放，返回原图
    if (scale >= 1) {
      return filePath
    }

    // 使用canvas进行缩放
    const canvas = Taro.createCanvasContext('imageCanvas')
    const newWidth = Math.floor(info.width * scale)
    const newHeight = Math.floor(info.height * scale)

    canvas.drawImage(filePath, 0, 0, newWidth, newHeight)

    return new Promise((resolve, reject) => {
      canvas.draw(false, () => {
        Taro.canvasToTempFilePath({
          canvasId: 'imageCanvas',
          width: newWidth,
          height: newHeight,
          destWidth: newWidth,
          destHeight: newHeight,
          fileType: 'jpg',
          quality: 0.9,
          success: res => resolve(res.tempFilePath),
          fail: reject,
        })
      })
    })
  } catch (error) {
    console.error('调整图片尺寸失败:', error)
    // 调整失败时返回原图
    return filePath
  }
}

/**
 * 选择图片
 * @param options 选择选项
 * @returns 选择的图片路径数组
 */
export const chooseImage = async (
  options: {
    count?: number
    sourceType?: ('album' | 'camera')[]
    compress?: boolean
    maxSize?: number
  } = {}
): Promise<string[]> => {
  try {
    const result = await Taro.chooseImage({
      count: options.count || 1,
      sizeType: options.compress ? ['compressed'] : ['original'],
      sourceType: options.sourceType || ['album', 'camera'],
    })

    const imagePaths = result.tempFilePaths

    // 如果设置了最大尺寸，进行调整
    if (options.maxSize) {
      const resizedPaths = await Promise.all(
        imagePaths.map(path =>
          resizeImage(path, options.maxSize, options.maxSize)
        )
      )
      return resizedPaths
    }

    return imagePaths
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error)
    if (errorMsg.includes('cancel')) {
      throw new Error('用户取消选择')
    }
    console.error('选择图片失败:', error)
    throw new Error('选择图片失败')
  }
}

/**
 * 预览图片
 * @param options 预览选项
 */
export const previewImage = async (options: {
  urls: string[]
  current?: string
}): Promise<void> => {
  try {
    await Taro.previewImage({
      urls: options.urls,
      current: options.current || options.urls[0],
    })
  } catch (error) {
    console.error('预览图片失败:', error)
    throw new Error('预览图片失败')
  }
}

/**
 * 保存图片到相册
 * @param filePath 图片路径
 * @returns 是否保存成功
 */
export const saveImageToAlbum = async (filePath: string): Promise<boolean> => {
  try {
    // 检查权限
    const { authSetting } = await Taro.getSetting()

    if (!authSetting['scope.writePhotosAlbum']) {
      const { errMsg } = await Taro.authorize({
        scope: 'scope.writePhotosAlbum',
      })
      if (errMsg !== 'authorize:ok') {
        throw new Error('未获得保存图片权限')
      }
    }

    // 保存图片
    await Taro.saveImageToPhotosAlbum({
      filePath,
    })

    Taro.showToast({
      title: '保存成功',
      icon: 'success',
    })

    return true
  } catch (error) {
    console.error('保存图片失败:', error)
    const errorMessage = error instanceof Error ? error.message : String(error)

    if (errorMessage.includes('权限')) {
      Taro.showModal({
        title: '需要相册权限',
        content: '请在设置中开启相册权限，以保存图片',
        confirmText: '去设置',
        success: res => {
          if (res.confirm) {
            Taro.openSetting()
          }
        },
      })
    } else {
      Taro.showToast({
        title: '保存失败',
        icon: 'error',
      })
    }

    return false
  }
}

/**
 * 获取图片文件大小
 * @param filePath 文件路径
 * @returns 文件大小（字节）
 */
export const getImageFileSize = async (filePath: string): Promise<number> => {
  try {
    const fileManager = Taro.getFileSystemManager()
    const stats = fileManager.statSync(filePath)
    return stats.size
  } catch (error) {
    console.error('获取图片文件大小失败:', error)
    return 0
  }
}

/**
 * 格式化文件大小
 * @param bytes 字节数
 * @returns 格式化的文件大小字符串
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'

  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`
}

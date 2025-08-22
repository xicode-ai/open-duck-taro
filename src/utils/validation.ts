/**
 * 验证相关工具函数
 */

/**
 * 验证邮箱格式
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * 验证手机号格式（中国大陆）
 */
export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^1[3-9]\d{9}$/
  return phoneRegex.test(phone)
}

/**
 * 验证身份证号格式
 */
export const isValidIdCard = (idCard: string): boolean => {
  const idCardRegex = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/
  return idCardRegex.test(idCard)
}

/**
 * 验证密码强度
 */
export const validatePassword = (
  password: string
): {
  isValid: boolean
  strength: 'weak' | 'medium' | 'strong'
  errors: string[]
} => {
  const errors: string[] = []
  let score = 0

  // 长度检查
  if (password.length < 6) {
    errors.push('密码长度至少6位')
  } else if (password.length >= 8) {
    score += 1
  }

  // 包含数字
  if (/\d/.test(password)) {
    score += 1
  } else {
    errors.push('密码需包含数字')
  }

  // 包含小写字母
  if (/[a-z]/.test(password)) {
    score += 1
  } else {
    errors.push('密码需包含小写字母')
  }

  // 包含大写字母
  if (/[A-Z]/.test(password)) {
    score += 1
  }

  // 包含特殊字符
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    score += 1
  }

  // 判断强度
  let strength: 'weak' | 'medium' | 'strong' = 'weak'
  if (score >= 4) {
    strength = 'strong'
  } else if (score >= 2) {
    strength = 'medium'
  }

  return {
    isValid: errors.length === 0,
    strength,
    errors,
  }
}

/**
 * 验证URL格式
 */
export const isValidUrl = (url: string): boolean => {
  try {
    new window.URL(url)
    return true
  } catch {
    return false
  }
}

/**
 * 验证是否为纯数字
 */
export const isNumeric = (value: string): boolean => {
  return !isNaN(Number(value)) && !isNaN(parseFloat(value))
}

/**
 * 验证是否为整数
 */
export const isInteger = (value: string): boolean => {
  return Number.isInteger(Number(value))
}

/**
 * 验证数值范围
 */
export const isInRange = (value: number, min: number, max: number): boolean => {
  return value >= min && value <= max
}

/**
 * 验证字符串长度
 */
export const isValidLength = (
  str: string,
  min: number,
  max?: number
): boolean => {
  if (str.length < min) return false
  if (max !== undefined && str.length > max) return false
  return true
}

/**
 * 验证是否只包含中文
 */
export const isChineseOnly = (str: string): boolean => {
  const chineseRegex = /^[\u4e00-\u9fa5]+$/
  return chineseRegex.test(str)
}

/**
 * 验证是否只包含字母
 */
export const isAlphaOnly = (str: string): boolean => {
  const alphaRegex = /^[a-zA-Z]+$/
  return alphaRegex.test(str)
}

/**
 * 验证是否只包含字母和数字
 */
export const isAlphaNumeric = (str: string): boolean => {
  const alphaNumRegex = /^[a-zA-Z0-9]+$/
  return alphaNumRegex.test(str)
}

/**
 * 验证是否为有效的年龄
 */
export const isValidAge = (age: number): boolean => {
  return age >= 0 && age <= 150
}

/**
 * 验证是否为有效的用户名
 */
export const isValidUsername = (
  username: string
): {
  isValid: boolean
  errors: string[]
} => {
  const errors: string[] = []

  // 长度检查
  if (username.length < 3 || username.length > 20) {
    errors.push('用户名长度需在3-20个字符之间')
  }

  // 字符检查（只允许字母、数字、下划线）
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    errors.push('用户名只能包含字母、数字和下划线')
  }

  // 不能以数字开头
  if (/^\d/.test(username)) {
    errors.push('用户名不能以数字开头')
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

/**
 * 验证文件类型
 */
export const isValidFileType = (
  fileName: string,
  allowedTypes: string[]
): boolean => {
  const extension = fileName.split('.').pop()?.toLowerCase()
  return extension ? allowedTypes.includes(extension) : false
}

/**
 * 验证文件大小
 */
export const isValidFileSize = (
  fileSize: number,
  maxSizeInMB: number
): boolean => {
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024
  return fileSize <= maxSizeInBytes
}

/**
 * 验证学习时间格式（HH:mm）
 */
export const isValidTime = (time: string): boolean => {
  const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/
  return timeRegex.test(time)
}

/**
 * 验证学习级别
 */
export const isValidLevel = (level: string): boolean => {
  const validLevels = [
    'preschool',
    'elementary',
    'middle',
    'high',
    'university',
    'master',
  ]
  return validLevels.includes(level)
}

/**
 * 通用表单验证器
 */
export class FormValidator {
  private rules: Record<string, Array<(value: unknown) => string | null>> = {}

  addRule(field: string, validator: (value: unknown) => string | null) {
    if (!this.rules[field]) {
      this.rules[field] = []
    }
    this.rules[field].push(validator)
    return this
  }

  required(field: string, message = '此字段为必填项') {
    return this.addRule(field, value => {
      if (value === null || value === undefined || value === '') {
        return message
      }
      return null
    })
  }

  email(field: string, message = '请输入有效的邮箱地址') {
    return this.addRule(field, value => {
      if (value && typeof value === 'string' && !isValidEmail(value)) {
        return message
      }
      return null
    })
  }

  phone(field: string, message = '请输入有效的手机号') {
    return this.addRule(field, value => {
      if (value && typeof value === 'string' && !isValidPhone(value)) {
        return message
      }
      return null
    })
  }

  minLength(field: string, min: number, message?: string) {
    return this.addRule(field, value => {
      if (value && typeof value === 'string' && value.length < min) {
        return message || `最少需要${min}个字符`
      }
      return null
    })
  }

  maxLength(field: string, max: number, message?: string) {
    return this.addRule(field, value => {
      if (value && typeof value === 'string' && value.length > max) {
        return message || `最多允许${max}个字符`
      }
      return null
    })
  }

  validate(data: Record<string, unknown>): Record<string, string> {
    const errors: Record<string, string> = {}

    for (const [field, validators] of Object.entries(this.rules)) {
      const value = data[field]

      for (const validator of validators) {
        const error = validator(value)
        if (error) {
          errors[field] = error
          break // 遇到第一个错误就停止验证该字段
        }
      }
    }

    return errors
  }

  isValid(data: Record<string, unknown>): boolean {
    const errors = this.validate(data)
    return Object.keys(errors).length === 0
  }
}

// 导出验证工具对象
export const validationUtils = {
  isValidEmail,
  isValidPhone,
  isValidIdCard,
  validatePassword,
  isValidUrl,
  isNumeric,
  isInteger,
  isInRange,
  isValidLength,
  isChineseOnly,
  isAlphaOnly,
  isAlphaNumeric,
  isValidAge,
  isValidUsername,
  isValidFileType,
  isValidFileSize,
  isValidTime,
  isValidLevel,
  FormValidator,
}

module.exports = {
  '*.{ts,tsx,js,jsx}': [
    'eslint --fix',
    'prettier --write'
  ],
  '*.{css,scss,sass}': [
    'stylelint --fix',
    'prettier --write'
  ],
  '*.{json,md}': [
    'prettier --write'
  ],
  // 忽略配置文件，避免循环检查
  '*.{config.js,config.ts,config.cjs}': [
    'prettier --write'
  ]
}

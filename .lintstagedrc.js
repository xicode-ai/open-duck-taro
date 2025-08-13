export default {
  '*.{ts,tsx,js,jsx}': ['eslint --fix', 'prettier --write'],
  '*.{css,scss,sass}': ['stylelint --fix', 'prettier --write'],
  '*.{json,md}': ['prettier --write'],
}

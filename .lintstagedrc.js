module.exports = {
  '*.{js,jsx,ts,tsx}': [
    'eslint --fix',
    'prettier --write'
  ],
  '*.{css,scss,sass}': [
    'stylelint --fix',
    'prettier --write'
  ],
  '*.{json,md}': [
    'prettier --write'
  ]
};

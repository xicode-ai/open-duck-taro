module.exports = {
  extends: [],
  customSyntax: 'postcss-scss',
  rules: {
    'selector-class-pattern': null,
    'selector-id-pattern': null,
    'no-descending-specificity': null,
    'declaration-block-no-duplicate-properties': true,
    'declaration-no-important': null,
    'font-family-no-missing-generic-family-keyword': null,
    'property-no-vendor-prefix': null,
    'value-no-vendor-prefix': null,
    'selector-no-vendor-prefix': null,
    'at-rule-no-vendor-prefix': null,
    'no-empty-source': null,
  },
  ignoreFiles: ['node_modules/**/*', 'dist/**/*', '**/*.min.css', 'build/**/*'],
};

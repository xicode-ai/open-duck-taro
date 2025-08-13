module.exports = {
  customSyntax: 'postcss-scss',
  rules: {
    'selector-class-pattern': null,
    'property-no-unknown': [
      true,
      {
        ignoreProperties: ['composes'],
      },
    ],
    'value-keyword-case': null,
    'function-name-case': null,
    'selector-pseudo-class-no-unknown': [
      true,
      {
        ignorePseudoClasses: ['global'],
      },
    ],
    'selector-type-no-unknown': [
      true,
      {
        ignoreTypes: ['page'],
      },
    ],
    'property-no-vendor-prefix': null,
    'value-no-vendor-prefix': null,
    'selector-no-vendor-prefix': null,
    'at-rule-no-vendor-prefix': null,
    'declaration-block-no-duplicate-properties': null,
    'length-zero-no-unit': null,

    // 禁用不兼容的规则
    'color-function-notation': null,
    'alpha-value-notation': null,
    'shorthand-property-no-redundant-values': null,
    'no-descending-specificity': null,
    'rule-empty-line-before': null,
    'no-invalid-double-slash-comments': null,
    'color-hex-length': null,
    'media-feature-range-notation': null,
    'selector-type-case': null,
    'keyframes-name-pattern': null,
    'import-notation': null,
  },
  ignoreFiles: ['dist/**/*', 'node_modules/**/*'],
}

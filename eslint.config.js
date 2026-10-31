/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-require-imports */

const js = require('@eslint/js')
const tsPlugin = require('@typescript-eslint/eslint-plugin')

module.exports = [
  {
    ignores: [
      'node_modules/',
      'dist/',
    ]
  },
  js.configs.recommended,
  ...tsPlugin.configs['flat/recommended'],
  {
    files: ['src/**/*.ts'],
    rules: {
      'comma-dangle': ['error', 'always-multiline'],
      'eol-last': ['error', 'always'],
      'lines-between-class-members': 'off',
      'max-len': 'off',
      'no-debugger': 'warn',
      'no-empty-function': 'off',
      'no-multiple-empty-lines': ['error', { max: 2, maxBOF: 0 }],
      'no-shadow': 'off',
      'no-unused-vars': 'off',
      'no-useless-constructor': 'off',
      'prefer-destructuring': 'off',
      quotes: ['error', 'single'],
      semi: ['error', 'never'],
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-shadow': 'error',
      '@typescript-eslint/no-unused-vars': 'error',
    },
  },
]

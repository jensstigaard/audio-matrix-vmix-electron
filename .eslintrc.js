module.exports = {
  root: true,

  env: {
    node: true,
  },

  extends: ['plugin:vue/essential', '@vue/prettier', '@vue/typescript'],

  rules: {
    'comma-dangle': ['off', 'off'],
    'no-console': process.env.NODE_ENV === 'production' ? 'off' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    semicolon: 'off',
    semi: [2, 'never'],
  },

  parserOptions: {
    parser: '@typescript-eslint/parser',
  },
}

import pluginNext from '@next/eslint-plugin-next';
import pluginImport from 'eslint-plugin-import';
import tseslint from 'typescript-eslint';

export default [
  ...tseslint.configs.recommended,
  {
    plugins: {
      import: pluginImport,
      '@next/next': pluginNext,
    },
    rules: {
      ...pluginNext.configs['core-web-vitals'].rules,
      '@typescript-eslint/naming-convention': [
        'error',
        { selector: 'default',
          format: ['camelCase', 'PascalCase'],
          leadingUnderscore: 'allow'
        },
        {
          selector: 'variable',
          modifiers: ['const', 'exported'],
          format: ['camelCase', 'PascalCase'],
        },
        {
          selector: 'variable',
          modifiers: ['const', 'global' ],
          format: ['camelCase', 'UPPER_CASE'],
        },
        {
          selector: ['function'],
          modifiers: ['exported',],
          format: ['PascalCase'],
        },
        {
          selector: ['function'],
          format: ['camelCase'],
        },
        { selector: 'typeLike', format: ['PascalCase'] },
        {
          selector: 'parameter',
          format: ['camelCase'],
          leadingUnderscore: 'allow',
        },{
          selector: 'property',
          format: ['camelCase', 'PascalCase', 'UPPER_CASE'],
        },
        // 10. Methods
        {
          selector: 'method',
          format: ['camelCase'],
        },
        // 11. Enum members (often PascalCase or UPPER_CASE)
        {
          selector: 'enumMember',
          format: ['PascalCase', 'UPPER_CASE'],
        },
      ],
      'no-console': 'warn',
      'import/order': [
        'error',
        {
          groups: ['builtin', 'external', 'internal'],
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],
    },
  },
];

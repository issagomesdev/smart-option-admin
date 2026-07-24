import nextCoreWebVitals from 'eslint-config-next/core-web-vitals'
import eslintConfigPrettier from 'eslint-config-prettier'
import eslintPluginPrettier from 'eslint-plugin-prettier'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  {
    ignores: ['.next/**', 'node_modules/**', 'playwright-report/**', 'test-results/**', 'coverage/**']
  },
  ...nextCoreWebVitals,
  ...tseslint.configs.recommended,
  {
    plugins: { prettier: eslintPluginPrettier },
    rules: {
      ...eslintConfigPrettier.rules,
      'prettier/prettier': 'warn',
      'react/display-name': 'off',
      '@next/next/no-img-element': 'off',
      'react/no-unescaped-entities': 'off',
      // Regras de type-safety religadas na Fase 1 (o template original as desligava
      // globalmente apesar de `strict: true` no tsconfig). Ficaram em "warn" enquanto
      // telas/services legados (Pages Router, `@core`) ainda existiam — a Fase 4 parte 4
      // removeu o último resquício desse código, então todas sobem para "error" agora
      // (mesmo critério de saída usado no backend). `react-hooks/set-state-in-effect` é
      // a única exceção: dispara em todo fetch-on-mount via `useEffect` deste painel
      // (padrão deliberado, não legado) — fica em "warn" até uma eventual adoção de
      // biblioteca de data-fetching (SWR/React Query) na Fase 5 resolver de raiz.
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/ban-ts-comment': 'error',
      '@typescript-eslint/no-non-null-assertion': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      'react/jsx-key': 'error',
      '@typescript-eslint/no-unused-expressions': 'error',
      'react-hooks/static-components': 'error',
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/immutability': 'error'
    }
  }
)

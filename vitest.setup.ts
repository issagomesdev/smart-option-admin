import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

// `globals: false` no vitest.config.ts (imports explícitos em vez de
// globais injetados) significa que o auto-cleanup do Testing Library não se
// registra sozinho — sem isso, o DOM de um teste vaza para o próximo dentro
// do mesmo arquivo, quebrando `getByRole`/`getByText` com "elemento
// encontrado mais de uma vez".
afterEach(() => {
  cleanup()
})

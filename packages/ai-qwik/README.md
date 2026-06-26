# TanStack AI Qwik

Qwik v2 integration for TanStack AI.

```tsx
import { component$ } from '@qwik.dev/core'
import { useChat } from '@tanstack/ai-qwik'

export default component$(() => {
  const chat = useChat({ api: '/api/chat' })

  return (
    <form
      preventdefault:submit
      onSubmit$={async () => {
        await chat.sendMessage('Test the Qwik chat adapter')
      }}
    >
      <button type="submit" disabled={chat.isLoading.value}>
        Send
      </button>
    </form>
  )
})
```

For client tools that capture browser-only APIs, create them inside a QRL with
`tools$`:

```tsx
import { $, component$ } from '@qwik.dev/core'
import { clientTools, useChat } from '@tanstack/ai-qwik'
import { savePreferenceTool } from './tools'

export default component$(() => {
  const tools$ = $(() =>
    clientTools(
      savePreferenceTool.client((input) => {
        localStorage.setItem('preference', input.preference)
        return { ok: true }
      }),
    ),
  )

  const chat = useChat({ api: '/api/chat', tools$ })

  return <button onClick$={() => chat.sendMessage('Recommend something')} />
})
```

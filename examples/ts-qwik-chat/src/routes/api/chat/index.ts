import type { RequestHandler } from '@qwik.dev/router'
import {
  chat,
  chatParamsFromRequestBody,
  maxIterations,
  mergeAgentTools,
  toServerSentEventsResponse,
} from '@tanstack/ai'
import { openaiText } from '@tanstack/ai-openai'

import {
  addToCartToolDef,
  addToWishListToolDef,
  calculateFinancing,
  compareGuitars,
  getGuitars,
  getPersonalGuitarPreferenceToolDef,
  recommendGuitarToolDef,
  searchGuitars,
} from '../../../lib/guitar-tools'

const OPENAI_MODEL = 'gpt-5.2'

const SYSTEM_PROMPT = `You are a friendly guitar store assistant.

CRITICAL: When a user asks for guitar recommendations, you MUST:
1. First call getGuitars to fetch available products
2. Based on the user's needs, select the best guitar
3. Call recommendGuitar with the guitar ID to display it properly
4. Then explain why you recommended it

NEVER recommend a guitar by just writing text - always use the recommendGuitar tool so the user sees the special product card.

You can also help users compare guitars, calculate financing, search inventory, and add items to their cart or wishlist. Cart and wishlist actions require user approval.`

const addToCartToolServer = addToCartToolDef.server((args, context) => {
  context?.emitCustomEvent('tool:progress', {
    tool: 'addToCart',
    message: `Adding guitar ${args.guitarId} to cart`,
  })

  return {
    success: true,
    cartId: `CART_${Date.now()}`,
    guitarId: args.guitarId,
    quantity: args.quantity,
    totalItems: args.quantity,
  }
})

const serverTools = [
  getGuitars,
  recommendGuitarToolDef,
  addToCartToolServer,
  addToWishListToolDef,
  getPersonalGuitarPreferenceToolDef,
  compareGuitars,
  calculateFinancing,
  searchGuitars,
]

export const onPost: RequestHandler = async ({ json, request, send }) => {
  if (!process.env.OPENAI_API_KEY) {
    json(500, {
      error:
        'OPENAI_API_KEY not configured. Please add it to .env or .env.local',
    })
    return
  }

  const requestSignal = request.signal
  if (requestSignal?.aborted) {
    send(new Response(null, { status: 499 }))
    return
  }

  const abortController = new AbortController()

  let params
  try {
    params = await chatParamsFromRequestBody(await request.json())
  } catch (error) {
    send(
      new Response(error instanceof Error ? error.message : 'Bad request', {
        status: 400,
      }),
    )
    return
  }

  try {
    const tools = mergeAgentTools(serverTools, params.tools)
    const stream = chat({
      adapter: openaiText(OPENAI_MODEL),
      systemPrompts: [SYSTEM_PROMPT],
      agentLoopStrategy: maxIterations(20),
      messages: params.messages,
      threadId: params.threadId,
      runId: params.runId,
      tools: Object.values(tools),
      abortController,
    })

    send(toServerSentEventsResponse(stream, { abortController }))
    return
  } catch (error) {
    if (
      error instanceof Error &&
      (error.name === 'AbortError' || abortController.signal.aborted)
    ) {
      send(new Response(null, { status: 499 }))
      return
    }

    json(500, {
      error: error instanceof Error ? error.message : 'An error occurred',
    })
  }
}

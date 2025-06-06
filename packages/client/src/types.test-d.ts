import type { ORPCError } from './error'
import type { Client, ClientContext } from './types'

describe('client', () => {
  const client: Client<{ cache?: boolean }, string, number, Error | ORPCError<'OVERRIDE', unknown>> = async (...args) => {
    const [input, options] = args

    expectTypeOf(input).toEqualTypeOf<string>()
    expectTypeOf(options).toMatchTypeOf<{ context?: { cache?: boolean }, signal?: AbortSignal } | undefined>()
    return 123
  }

  it('just a function', () => {
    expectTypeOf(client).toMatchTypeOf<(input: string, options: { context?: ClientContext, signal?: AbortSignal }) => Promise<number>>()
  })

  it('infer correct input', () => {
    client('123')
    // @ts-expect-error - invalid input
    client(undefined)
    // @ts-expect-error - missing input
    client()

    // @ts-expect-error - invalid input
    client(123)
    // @ts-expect-error - invalid input
    client({})
  })

  it('optional undefinedable input', () => {
    const client = {} as Client<ClientContext, { val: string } | undefined, { val: number }, Error>

    client({ val: '123' })
    client(undefined)
    client()
    // @ts-expect-error - invalid input
    client({ val: 123 })
  })

  it('accept signal', () => {
    client('123', { signal: new AbortSignal() })
    // @ts-expect-error - invalid signal
    client('123', { signal: 1234 })
  })

  describe('context', () => {
    it('can accept context', () => {
      const client = {} as Client<{ userId: string }, { val: string }, { val: number }, Error>

      client({ val: '123' }, { context: { userId: '123' } })
      // @ts-expect-error - invalid context
      client({ val: '123' }, { context: { userId: 123 } })
      // @ts-expect-error - context is required
      client({ val: '123' })
    })

    it('optional options when context is optional', () => {
      const client = {} as Client<{ userId?: string }, { val: string }, { val: number }, Error>

      client({ val: '123' })
      client({ val: '123' }, { context: { userId: '123' } })
    })

    it('can call without args when both input and context are optional', () => {
      const client = {} as Client<{ userId?: string }, undefined | { val: string }, { val: number }, Error>

      client()
      client({ val: 'string' })
      client({ val: 'string' }, { context: { userId: '123' } })
      // @ts-expect-error - input is invalid
      client({ val: 123 }, { context: { userId: '123' } })
      // @ts-expect-error - context is invalid
      client({ val: '123' }, { context: { userId: 123 } })
    })
  })

  it('infer correct output', async () => {
    expectTypeOf(await client('123')).toEqualTypeOf<number>()
  })

  it('can reverse infer', () => {
    expectTypeOf<
      typeof client extends Client<infer C, infer I, infer O, infer E> ? [C, I, O, E] : never
    >().toEqualTypeOf<[{ cache?: boolean }, string, number, Error | ORPCError<'OVERRIDE', unknown>]>()
  })
})

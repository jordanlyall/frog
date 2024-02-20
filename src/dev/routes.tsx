import { type Env, type Schema } from 'hono'
import { inspectRoutes } from 'hono/dev'
import { jsxRenderer } from 'hono/jsx-renderer'
import { validator } from 'hono/validator'

import type { FrogBase } from '../frog-base.js'
import { parsePath } from '../utils/parsePath.js'
import {
  Fonts,
  Preview,
  type PreviewProps,
  Scripts,
  Styles,
} from './components.js'
import {
  fetchFrame,
  getCodeHtml,
  getImageSize,
  getRoutes,
  htmlToFrame,
  htmlToState,
  validatePostBody,
} from './utils.js'

export function routes<
  state,
  env extends Env,
  schema extends Schema,
  basePath extends string,
>(app: FrogBase<state, env, schema, basePath>, path: string) {
  app.hono
    .use(`${parsePath(path)}/dev`, (c, next) =>
      jsxRenderer((props) => {
        const { children } = props
        const path = new URL(c.req.url).pathname.replace('/dev', '')
        return (
          <html lang="en">
            <head>
              <title>frame: {path || '/'}</title>
              <Fonts />
              <Styles />
              <Scripts />
            </head>
            <body>{children}</body>
          </html>
        )
      })(c, next),
    )
    .get(async (c) => {
      const baseUrl = c.req.url.replace('/dev', '')
      const t0 = performance.now()
      const response = await fetch(baseUrl)
      const t1 = performance.now()

      const speed = t1 - t0
      const response2 = response.clone()
      const htmlSize = await response2.blob().then((b) => b.size)
      const text = await response.text()

      const frame = htmlToFrame(text)
      const state = htmlToState(text)
      const contextHtml = await getCodeHtml(
        JSON.stringify(state.context, null, 2),
        'json',
      )
      const routes = getRoutes(baseUrl, inspectRoutes(app.hono))
      const imageSize = await getImageSize(frame.imageUrl)

      const props = {
        baseUrl,
        contextHtml,
        frame,
        request: {
          type: 'initial',
          method: 'get',
          metrics: {
            htmlSize,
            imageSize,
            speed,
          },
          response: {
            success: response.ok,
            status: response.status,
            statusText: response.statusText,
          },
          timestamp: Date.now(),
          url: baseUrl,
        },
        routes,
        state,
      } as const
      return c.render(<Preview {...props} />)
    })

  app.hono
    .get(`${parsePath(path)}/dev/frame`, async (c) => {
      const baseUrl = c.req.url.replace('/dev/frame', '')
      const t0 = performance.now()
      const response = await fetch(baseUrl)
      const t1 = performance.now()

      const speed = t1 - t0
      const response2 = response.clone()
      const htmlSize = await response2.blob().then((b) => b.size)
      const text = await response.text()

      const frame = htmlToFrame(text)
      const state = htmlToState(text)
      const contextHtml = await getCodeHtml(
        JSON.stringify(state.context, null, 2),
        'json',
      )
      const routes = getRoutes(baseUrl, inspectRoutes(app.hono))
      const imageSize = await getImageSize(frame.imageUrl)

      return c.json({
        baseUrl,
        contextHtml,
        frame,
        request: {
          type: 'initial',
          method: 'get',
          metrics: {
            htmlSize,
            imageSize,
            speed,
          },
          response: {
            success: response.ok,
            status: response.status,
            statusText: response.statusText,
          },
          timestamp: Date.now(),
          url: baseUrl,
        },
        routes,
        state,
      } satisfies PreviewProps)
    })
    .post(
      `${parsePath(path)}/dev/frame/action`,
      validator('json', validatePostBody),
      async (c) => {
        const baseUrl = c.req.url.replace('/dev/frame/action', '')
        const json = c.req.valid('json')
        const { buttonIndex, castId, fid, inputText, postUrl, state } = json

        const { response, speed } = await fetchFrame({
          baseUrl,
          buttonIndex,
          castId,
          fid,
          inputText,
          postUrl,
          state,
        })

        const response2 = response.clone()
        const htmlSize = await response2.blob().then((b) => b.size)
        const text = await response.text()
        const frame = htmlToFrame(text)
        const state_ = htmlToState(text)
        const contextHtml = await getCodeHtml(
          JSON.stringify(state_.context, null, 2),
          'json',
        )
        const routes = getRoutes(baseUrl, inspectRoutes(app.hono))
        const imageSize = await getImageSize(frame.imageUrl)

        return c.json({
          baseUrl,
          contextHtml,
          frame,
          request: {
            type: 'response',
            body: {
              ...json,
              castId: { ...json.castId, hash: json.castId.hash.toString() },
            },
            method: 'post',
            metrics: {
              htmlSize,
              imageSize,
              speed,
            },
            response: {
              success: response.ok,
              status: response.status,
              statusText: response.statusText,
            },
            timestamp: Date.now(),
            url: postUrl,
          },
          routes,
          state: state_,
        } satisfies PreviewProps)
      },
    )
    .post(
      `${parsePath(path)}/dev/frame/redirect`,
      validator('json', validatePostBody),
      async (c) => {
        const baseUrl = c.req.url.replace('/dev/frame/redirect', '')
        const json = c.req.valid('json')
        const { buttonIndex, castId, fid, inputText, postUrl, state } = json

        const { response, speed } = await fetchFrame({
          baseUrl,
          buttonIndex,
          castId,
          fid,
          inputText,
          postUrl,
          state,
        })

        return c.json({
          type: 'redirect',
          body: {
            ...json,
            castId: { ...json.castId, hash: json.castId.hash.toString() },
          },
          method: 'post',
          metrics: {
            speed,
          },
          response: {
            success: response.redirected,
            status: response.ok ? 302 : response.status,
            statusText: response.statusText,
            location: response.url,
          },
          timestamp: Date.now(),
          url: postUrl,
        } satisfies PreviewProps['request'])
      },
    )
}

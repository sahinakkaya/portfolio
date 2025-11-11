import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <script
          src="https://challenges.cloudflare.com/turnstile/v0/api.js"
          async
          defer
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
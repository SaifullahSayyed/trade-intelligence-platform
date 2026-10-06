import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en" className="scroll-smooth">
      <Head>
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        {/* Fonts are self-hosted via next/font in _app.tsx — no CDN links needed */}
      </Head>
      <body style={{ margin: 0, padding: 0, backgroundColor: "#000", color: "#fff" }}>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}

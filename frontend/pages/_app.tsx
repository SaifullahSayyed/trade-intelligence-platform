import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { Playfair_Display, Inter, JetBrains_Mono } from "next/font/google";

// Self-hosted via next/font — zero CDN, fonts bundled at build time
const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-ui",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <main className={`${playfair.variable} ${inter.variable} ${jetbrains.variable}`}>
      <Component {...pageProps} />
    </main>
  );
}

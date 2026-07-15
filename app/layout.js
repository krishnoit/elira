import './globals.css'
import { Providers } from './providers'
import Script from 'next/script'
import { Playfair_Display, Inter, Cormorant_Garamond } from 'next/font/google'

const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair', display: 'swap' })
const cormorant = Cormorant_Garamond({ subsets: ['latin'], weight: ['300','400','500','600','700'], variable: '--font-cormorant', display: 'swap' })
const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' })

export const metadata = {
  title: 'Elira Atelier — Tailored Elegance Redefined',
  description: 'Discover timeless fashion designed for every occasion. Elira Atelier crafts premium-quality clothing with attention to detail, elegant designs, and lasting comfort.',
  keywords: 'luxury fashion, atelier, bespoke clothing, tailored elegance, premium fashion, Elira Atelier',
  openGraph: { title: 'Elira Atelier — Tailored Elegance Redefined', description: 'Timeless luxury fashion for every occasion.', type: 'website' },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${playfair.variable} ${cormorant.variable} ${inter.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{__html:'window.addEventListener("error",function(e){if(e.error instanceof DOMException&&e.error.name==="DataCloneError"&&e.message&&e.message.includes("PerformanceServerTiming")){e.stopImmediatePropagation();e.preventDefault()}},true);'}} />
      </head>
      <body className="font-sans antialiased bg-[#faf7f2] text-[#1a1a1a]">
        <Providers>{children}</Providers>
        <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      </body>
    </html>
  )
}

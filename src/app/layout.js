import './globals.css'

export const metadata = {
  title: 'The Dukuh Retreat Yoga Booking',
  description: 'Yoga retreat booking system',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body suppressHydrationWarning={true}>
        {children}
      </body>
    </html>
  )
}
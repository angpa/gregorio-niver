import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "🤘 GREGÓRIO METAL BASH 2026 🤘",
  description:
    "Confirma sua presença para o aniversário do Gregório. Prepare-se para o Metal! 🤘⚡",
  openGraph: {
    title: "🤘 GREGÓRIO METAL BASH 2026 🤘",
    description:
      "Confirma sua presença para o aniversário do Gregório. Prepare-se para o Metal! 🤘⚡",
    url: "https://gregorio-niver.vercel.app",
    siteName: "Gregório Metal Bash",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Invitación Gregório Metal Bash",
      },
    ],
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "🤘 GREGÓRIO METAL BASH 2026 🤘",
    description: "Confirma sua presença para o aniversário do Gregório. 🤘",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        {/* Noto Serif Tibetan for Tibetan script rendering */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Metal+Mania&family=Nosifer&family=Inter:wght@100..900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased bg-black text-white">{children}</body>
    </html>
  );
}

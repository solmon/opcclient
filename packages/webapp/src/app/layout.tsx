import type { Metadata } from "next";
import "./globals.css";

// Using system fonts instead of Google Fonts to avoid SSL certificate issues

export const metadata: Metadata = {
  title: "OPC Client Explorer",
  description: "Browse and connect to OPC servers to view their object models",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark:bg-slate-950">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                if (prefersDark) {
                  document.documentElement.classList.add('dark');
                }
              })();
            `,
          }}
        />
      </head>
      <body
        className="antialiased dark:bg-slate-950 font-sans"
      >
        {children}
      </body>
    </html>
  );
}

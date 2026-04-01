import type { Metadata } from "next";
import { Poppins, Open_Sans } from "next/font/google";
import { Toaster } from "react-hot-toast";
import { ThemeProvider } from "@/components/providers/theme-provider";
import "./globals.css";

const poppins = Poppins({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-poppins',
});

const openSans = Open_Sans({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-open-sans',
});

export const metadata: Metadata = {
  title: "Epoch | Project Operations Platform",
  description: "Production-grade workspace for project, task, and team operations.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${openSans.className} ${openSans.variable} ${poppins.variable} bg-background text-foreground`}
      >
        <ThemeProvider 
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <a href="/login" className="skip-link">
            Skip to main content
          </a>
          <Toaster 
            position="bottom-right" 
            toastOptions={{
              className: '!bg-white/80 !backdrop-blur-md !border !border-white/20 !shadow-lg !text-slate-900',
              success: {
                iconTheme: {
                  primary: '#22C55E',
                  secondary: 'white',
                },
              },
            }}
          />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}

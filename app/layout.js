import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";
import Header from "@/components/header";
import { dark } from "@clerk/themes";
import { ThemeProvider } from "@/components/theme-provider";
import ChatWidget from "@/components/ChatWidgets";  //  import widget

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Doctors Appointment App",
  description: "Connect with doctors anytime, anywhere",
};

// ✅ Grab publishable key from environment
const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

export default function RootLayout({ children }) {
  return (
    <ClerkProvider
      publishableKey={publishableKey}
      appearance={{
        baseTheme: dark,
      }}
    >
      <html lang="en" suppressHydrationWarning>
        <head>
          <link rel="icon" href="/logo.png" sizes="any" />
        </head>
        <body className={`${inter.className}`}>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            <Header />

            <main className="min-h-screen">{children}</main>
            <Toaster richColors />

            <footer className="bg-muted/50 py-12">
              <div className="container mx-auto px-4 text-center text-gray-200">
                <p>Made by Team Agraja, Ankit & Pari</p>
              </div>
            </footer>

            {/*  Add chatbot widget here so it's on every page */}
            <ChatWidget />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}

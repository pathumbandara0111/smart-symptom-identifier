import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Toaster } from "sonner";
import { Providers } from "@/components/Providers";

export const metadata: Metadata = {
  title: "Smart Symptom Identifier — AI Health Assistant",
  description:
    "Identify possible illnesses from symptoms, get first-aid advice, find nearby doctors, and access emergency services instantly.",
  keywords: "symptom checker, first aid, doctor locator, medical AI, health assistant",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <Navbar />
          <main>{children}</main>
          <Toaster
            theme="dark"
            toastOptions={{
              style: {
                background: "rgba(5, 21, 37, 0.95)",
                border: "1px solid rgba(0, 180, 216, 0.2)",
                color: "#E0F7FF",
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}

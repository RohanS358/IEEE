import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Inter, Space_Grotesk, DM_Sans, Manrope, Geist_Mono } from "next/font/google";
import { getContent } from "@/lib/store";
import { themeCss } from "@/lib/theme";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({ variable: "--font-jakarta", subsets: ["latin"] });
// the other choices only download when the admin selects them
const inter = Inter({ variable: "--font-inter", subsets: ["latin"], preload: false });
const grotesk = Space_Grotesk({ variable: "--font-grotesk", subsets: ["latin"], preload: false });
const dmsans = DM_Sans({ variable: "--font-dmsans", subsets: ["latin"], preload: false });
const manrope = Manrope({ variable: "--font-manrope", subsets: ["latin"], preload: false });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export async function generateMetadata(): Promise<Metadata> {
  const { seo } = await getContent();
  return { title: seo.title, description: seo.description };
}

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const { theme } = await getContent();

  return (
    <html
      lang="en"
      className={`${jakarta.variable} ${inter.variable} ${grotesk.variable} ${dmsans.variable} ${manrope.variable} ${geistMono.variable} dark h-full antialiased`}
    >
      <head>
        <style>{themeCss(theme)}</style>
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}

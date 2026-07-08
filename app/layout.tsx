import type { Metadata } from "next";
import { Noto_Sans_Georgian, JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/ui/theme";
import "./globals.css";

const noto = Noto_Sans_Georgian({
  subsets: ["georgian", "latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-noto-georgian",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Sport Visa — ფეხბურთელებისა და კლუბების პლატფორმა",
  description: "დარეგისტრირდი, აჩვენე შენი ნიჭი და დაუკავშირდი კლუბებს სინჯებზე",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ka" className={`${noto.variable} ${jetbrains.variable}`}>
      <body className="font-sans">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}

'use client';

import { HeroUIProvider } from "@heroui/react";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <HeroUIProvider>
      <Header />
      <main>{children}</main>
      <Footer />
    </HeroUIProvider>
  );
}

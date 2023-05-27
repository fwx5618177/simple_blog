import { Suspense } from "react";
import "../styles/globals.css";
import { Inter } from "next/font/google";
import Loading from "./loading";
import SideBar from "@/layout/home/SideBar";
import MidSection from "@/components/MidSection";
import { Providers } from "./providers";
import RightBody from "@/layout/home/RightBody";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Blog",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        suppressHydrationWarning={true}
        className={inter.className}
        style={{
          position: "relative",
          display: "flex",
          height: "100vh",
          transition: "all .8s ease",
        }}
      >
        <Providers>
          <Suspense fallback={<Loading />}>
            <SideBar />
          </Suspense>
          <RightBody>
            <Suspense fallback={<Loading />}>
              <MidSection />
            </Suspense>
            <Suspense fallback={<Loading />}>
              <section className="w-full">{children}</section>
            </Suspense>
          </RightBody>
        </Providers>
      </body>
    </html>
  );
}

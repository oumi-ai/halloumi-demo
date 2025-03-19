import type { Metadata } from "next";
import ClaimVerifier from "./claimVerifier";

export const metadata: Metadata = {
  title: "Halloumi Demo",
  description: "Demo for Halloumi claim verification model",
};


export default async function Demo() {
  return (
    <main className="flex-1">
      <section className="w-full pt-[50px]">
        <ClaimVerifier />
      </section>
    </main>
  )
}

import type { Metadata } from "next";
import ClaimVerifier from "./claimVerifier";

export const metadata: Metadata = {
  title: "Model Playground",
  description: "Oumi AI",
};


export default async function Company() {
  return (
    <main className="flex-1">
      <section className="w-full pt-[50px]">
        <ClaimVerifier />
      </section>
    </main>
  )
}

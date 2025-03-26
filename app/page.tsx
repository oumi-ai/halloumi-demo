import { promises as fs } from 'fs';
import type { Metadata } from "next";

import ClaimVerifier from "./claimVerifier";
import type { ExampleTemplates, Model } from './types';

export const metadata: Metadata = {
  title: "HallOumi Demo",
  description: "Demo for the HallOumi claim verification model",
};


export default async function Page() {
  const file = await fs.readFile(process.cwd() + '/app/data.json', 'utf8');
  const data = JSON.parse(file);
  const models: Model[] = data.models;
  const examples: ExampleTemplates[] = data.examples;
  return (
    <main className="flex-1">
      <section className="w-full pt-[50px]">
        <ClaimVerifier models={models} examples={examples} />
      </section>
    </main>
  )
}

import type { Metadata } from "next";
import { RecommendClient } from "./recommend-client";

export const metadata: Metadata = { title: "Career Recommendation" };

export default function RecommendPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="font-display text-3xl font-semibold">Career Recommendation</h1>
      <p className="mt-2 text-navy-600">
        No account needed. Tell us a bit about yourself and we&rsquo;ll suggest careers from our database, grounded in
        available evidence — labeled clearly as an AI-assisted suggestion, not guaranteed advice.
      </p>
      <RecommendClient />
    </div>
  );
}

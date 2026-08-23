import Link from "next/link";
import { ArrowLeft, ArrowRight, CheckCircle2, Link2, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

const analysisAreas = [
  "Claim accuracy",
  "Supporting evidence",
  "Contradicting evidence",
  "Source reliability",
];

export default function AnalyzePage() {
  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6 lg:px-8">
        <Link
          href="/"
          className="text-2xl font-bold tracking-tight transition-opacity hover:opacity-80"
        >
          proofly<span className="text-violet-400">.</span>
        </Link>

        <Badge
          variant="outline"
          className="hidden border-violet-500/40 bg-violet-500/10 text-violet-300 sm:inline-flex"
        >
          AI-powered verification
        </Badge>
      </nav>

      <section className="relative overflow-hidden px-6 pb-16 pt-10 lg:px-8 lg:pb-24 lg:pt-16">
        <div className="absolute left-1/2 top-0 -z-0 h-80 w-80 -translate-x-1/2 rounded-full bg-violet-500/10 blur-3xl" />

        <div className="relative z-10 mx-auto max-w-3xl">
          <div className="text-center">
            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl border border-violet-500/20 bg-violet-500/10 text-violet-300">
              <Sparkles className="h-5 w-5" aria-hidden="true" />
            </div>

            <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl">
              What do you want to <span className="text-violet-400">verify?</span>
            </h1>

            <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-zinc-400 sm:text-lg">
              Paste a claim or URL and give Proofly any useful context. We’ll
              turn it into a clear, evidence-based analysis.
            </p>
          </div>

          <Card className="mt-10 border border-zinc-800 bg-zinc-900/80 shadow-2xl backdrop-blur">
            <CardHeader>
              <CardTitle className="text-xl text-white">Submit a claim</CardTitle>
              <CardDescription className="text-zinc-400">
                Start with a short statement, article link, or social post URL.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="claim" className="text-sm font-medium text-zinc-200">
                  Claim or URL
                </label>
                <div className="relative">
                  <Link2
                    className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500"
                    aria-hidden="true"
                  />
                  <Input
                    id="claim"
                    placeholder="e.g. This article says renewable energy is now the cheapest power source."
                    className="h-12 border-zinc-700 bg-zinc-950 pl-10 text-white placeholder:text-zinc-600 focus-visible:border-violet-400 focus-visible:ring-violet-400/30"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="context" className="text-sm font-medium text-zinc-200">
                  Additional context <span className="font-normal text-zinc-500">(optional)</span>
                </label>
                <Textarea
                  id="context"
                  placeholder="Add the original quote, where you saw it, or any details that could help with the analysis..."
                  className="min-h-32 resize-none border-zinc-700 bg-zinc-950 text-white placeholder:text-zinc-600 focus-visible:border-violet-400 focus-visible:ring-violet-400/30"
                />
              </div>

              <Button
                size="lg"
                className="h-12 w-full bg-violet-500 text-white hover:bg-violet-600"
              >
                Analyze Claim
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Button>

              <p className="text-center text-xs text-zinc-500">
                UI preview only — analysis will be available soon.
              </p>
            </CardContent>
          </Card>

          <section className="mt-8 rounded-xl border border-zinc-800 bg-zinc-900/40 p-5 sm:p-6" aria-labelledby="analysis-heading">
            <p className="text-sm font-semibold uppercase tracking-widest text-violet-400">
              What Proofly analyzes
            </p>
            <h2 id="analysis-heading" className="mt-2 text-xl font-semibold">
              A complete view of the claim
            </h2>
            <Separator className="my-5 bg-zinc-800" />
            <div className="grid gap-3 sm:grid-cols-2">
              {analysisAreas.map((area) => (
                <div key={area} className="flex items-center gap-3 text-sm text-zinc-300">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-violet-400" aria-hidden="true" />
                  {area}
                </div>
              ))}
            </div>
          </section>

          <div className="mt-8 text-center">
            <Link
              href="/"
              className="inline-flex h-9 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-zinc-400 transition-colors hover:bg-zinc-900 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Back to Home
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

export default function Home() {
  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      {/* ================= NAVBAR ================= */}
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-8">
        <div className="text-2xl font-bold tracking-tight">
          proofly<span className="text-violet-400">.</span>
        </div>

        <div className="hidden items-center gap-8 text-sm text-zinc-400 md:flex">
          <a href="#how-it-works" className="transition hover:text-white">
            How it works
          </a>

          <a href="#features" className="transition hover:text-white">
            Features
          </a>

          <a href="#about" className="transition hover:text-white">
            About
          </a>
        </div>

        <Button
          variant="outline"
          className="border-zinc-700 bg-transparent text-zinc-200 hover:bg-zinc-900"
        >
          Sign In
        </Button>
      </nav>

      {/* ================= HERO ================= */}
      <section className="mx-auto grid max-w-7xl items-center gap-16 px-6 py-20 lg:grid-cols-2 lg:px-8 lg:py-28">
        {/* Hero text */}
        <div>
          <Badge
            variant="outline"
            className="mb-6 border-violet-500/40 bg-violet-500/10 px-4 py-2 text-violet-300"
          >
            ✨ AI-powered truth verification
          </Badge>

          <h1 className="max-w-3xl text-5xl font-bold leading-tight tracking-tight sm:text-6xl lg:text-7xl">
            Don't just believe it.
            <br />
            <span className="text-violet-400">Proof it.</span>
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-8 text-zinc-400">
            Proofly uses AI to analyze claims, find supporting evidence,
            and help you understand what's true, misleading, or worth
            questioning.
          </p>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Button
              size="lg"
              className="bg-violet-500 px-8 text-white hover:bg-violet-600"
            >
              Start Verifying →
            </Button>

            <Button
              size="lg"
              variant="outline"
              className="border-zinc-700 bg-transparent px-8 text-zinc-200 hover:bg-zinc-900"
            >
              See How It Works
            </Button>
          </div>

          <div className="mt-8 flex items-center gap-3">
            <div className="flex -space-x-2">
              <Avatar className="h-8 w-8 border-2 border-zinc-950">
                <AvatarFallback>AR</AvatarFallback>
              </Avatar>

              <Avatar className="h-8 w-8 border-2 border-zinc-950">
                <AvatarFallback>SK</AvatarFallback>
              </Avatar>

              <Avatar className="h-8 w-8 border-2 border-zinc-950">
                <AvatarFallback>JM</AvatarFallback>
              </Avatar>
            </div>

            <p className="text-sm text-zinc-500">
              Built for people who question what they read.
            </p>
          </div>
        </div>

        {/* ================= DEMO CARD ================= */}
        <div className="relative">
          <div className="absolute -inset-10 rounded-full bg-violet-500/10 blur-3xl" />

          <Card className="relative border-zinc-800 bg-zinc-900/90 shadow-2xl backdrop-blur">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-widest text-zinc-500">
                    Proofly Analysis
                  </p>

                  <CardTitle className="mt-1 text-xl">
                    Verify a claim
                  </CardTitle>
                </div>

                <Badge className="bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/10">
                  Ready
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-5">
              <div>
                <p className="mb-2 text-sm font-medium text-zinc-300">
                  What do you want to verify?
                </p>

                <Input
                  placeholder="Paste a claim or URL..."
                  className="border-zinc-700 bg-zinc-950 text-white placeholder:text-zinc-600"
                />
              </div>

              <div className="relative">
                <div className="flex items-center gap-3">
                  <Separator className="flex-1 bg-zinc-800" />

                  <span className="text-xs text-zinc-600">OR</span>

                  <Separator className="flex-1 bg-zinc-800" />
                </div>
              </div>

              <div>
                <p className="mb-2 text-sm font-medium text-zinc-300">
                  Add more context
                </p>

                <Textarea
                  placeholder="Paste the article text, statement, or additional context..."
                  className="min-h-[100px] resize-none border-zinc-700 bg-zinc-950 text-white placeholder:text-zinc-600"
                />
              </div>

              {/* <Button render={<Link href="/analyze" />} >
                Analyze with Proofly
              </Button> */}
              <Link
                href="/analyze"
                className="w-full bg-violet-500 text-white hover:bg-violet-600">
                Analyze with Proofly
              </Link>

              {/* Example result */}
              <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-5">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">Example result</p>

                  <Badge className="bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/10">
                    Supported
                  </Badge>
                </div>

                <div className="mt-5">
                  <div className="mb-2 flex justify-between text-sm">
                    <span className="text-zinc-500">
                      Confidence score
                    </span>

                    <span className="font-semibold text-emerald-400">
                      94%
                    </span>
                  </div>

                  <Progress value={94} className="h-2 bg-zinc-800" />
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  <div className="rounded-lg border border-zinc-800 p-3">
                    <p className="text-xs text-zinc-500">
                      Sources found
                    </p>

                    <p className="mt-1 text-lg font-semibold">12</p>
                  </div>

                  <div className="rounded-lg border border-zinc-800 p-3">
                    <p className="text-xs text-zinc-500">
                      Evidence
                    </p>

                    <p className="mt-1 text-lg font-semibold">
                      Strong
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* ================= HOW IT WORKS ================= */}
      <section
        id="how-it-works"
        className="border-y border-zinc-900 bg-zinc-950/50"
      >
        <div className="mx-auto max-w-7xl px-6 py-24 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-violet-400">
              How it works
            </p>

            <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
              From claim to clarity.
            </h2>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-3">
            <Card className="border-zinc-800 bg-zinc-900/40">
              <CardHeader>
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-violet-500/10 text-violet-400">
                  01
                </div>

                <CardTitle>Submit</CardTitle>
              </CardHeader>

              <CardContent className="text-zinc-400">
                Enter a claim, article, statement, or URL that you want
                Proofly to investigate.
              </CardContent>
            </Card>

            <Card className="border-zinc-800 bg-zinc-900/40">
              <CardHeader>
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-violet-500/10 text-violet-400">
                  02
                </div>

                <CardTitle>Investigate</CardTitle>
              </CardHeader>

              <CardContent className="text-zinc-400">
                AI analyzes the claim and searches for relevant evidence
                and supporting sources.
              </CardContent>
            </Card>

            <Card className="border-zinc-800 bg-zinc-900/40">
              <CardHeader>
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-violet-500/10 text-violet-400">
                  03
                </div>

                <CardTitle>Understand</CardTitle>
              </CardHeader>

              <CardContent className="text-zinc-400">
                Get a clear verdict, confidence score, evidence strength,
                and explanation.
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* ================= FEATURES ================= */}
      <section
        id="features"
        className="mx-auto max-w-7xl px-6 py-24 lg:px-8"
      >
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-violet-400">
            Features
          </p>

          <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
            More than a yes or no.
          </h2>

          <p className="mt-4 text-zinc-400">
            Proofly gives you the reasoning behind the result.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          <Card className="border-zinc-800 bg-zinc-900/50">
            <CardHeader>
              <div className="mb-3 text-3xl">🔍</div>
              <CardTitle>Claim Analysis</CardTitle>
            </CardHeader>

            <CardContent className="text-zinc-400">
              Break complex statements into individual claims that can
              actually be verified.
            </CardContent>
          </Card>

          <Card className="border-zinc-800 bg-zinc-900/50">
            <CardHeader>
              <div className="mb-3 text-3xl">📚</div>
              <CardTitle>Evidence Discovery</CardTitle>
            </CardHeader>

            <CardContent className="text-zinc-400">
              Find relevant sources and see the evidence supporting or
              contradicting the claim.
            </CardContent>
          </Card>

          <Card className="border-zinc-800 bg-zinc-900/50">
            <CardHeader>
              <div className="mb-3 text-3xl">🧠</div>
              <CardTitle>AI Explanation</CardTitle>
            </CardHeader>

            <CardContent className="text-zinc-400">
              Understand why the claim received its verdict instead of
              blindly trusting a number.
            </CardContent>
          </Card>
        </div>
      </section>

      {/* ================= CTA ================= */}
      <section id="about" className="px-6 py-24">
        <Card className="mx-auto max-w-5xl border-violet-500/20 bg-violet-500/5">
          <CardContent className="flex flex-col items-center px-6 py-16 text-center">
            <h2 className="text-3xl font-bold sm:text-4xl">
              Question everything.
              <br />
              <span className="text-violet-400">Verify what matters.</span>
            </h2>

            <p className="mt-4 max-w-xl text-zinc-400">
              Make informed decisions with evidence instead of assumptions.
            </p>

            <Button
              size="lg"
              className="mt-8 bg-violet-500 px-8 hover:bg-violet-600"
            >
              Start Using Proofly →
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="border-t border-zinc-800 px-6 py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 text-sm text-zinc-500 sm:flex-row">
          <p>
            © 2026 Proofly. Verify before you amplify.
          </p>

          <p>Built with AI · Next.js · shadcn/ui</p>
        </div>
      </footer>
    </main>
  );
}
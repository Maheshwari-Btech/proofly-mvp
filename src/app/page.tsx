
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  FileText,
  GraduationCap,
  Lightbulb,
  Target,
  Users,
  Zap,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Home() {
  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      {/* NAVBAR */}
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-8">
        <Link href="/" className="text-2xl font-bold tracking-tight">
          proofly<span className="text-violet-400">.</span>
        </Link>

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

        <Link href="/analyze">
          <Button
            variant="outline"
            className="border-zinc-700 bg-transparent text-zinc-200 hover:bg-zinc-900"
          >
            Try Proofly
          </Button>
        </Link>
      </nav>

      {/* HERO */}
      <section className="mx-auto grid max-w-7xl items-center gap-16 px-6 py-20 lg:grid-cols-2 lg:px-8 lg:py-28">
        <div>
          <Badge
            variant="outline"
            className="mb-6 border-violet-500/40 bg-violet-500/10 px-4 py-2 text-violet-300"
          >
            <Zap className="mr-2 h-4 w-4" />
            AI-powered career readiness
          </Badge>

          <h1 className="max-w-3xl text-5xl font-bold leading-tight tracking-tight sm:text-6xl lg:text-7xl">
            Don't just claim you're ready.
            <br />
            <span className="text-violet-400">Prove it.</span>
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-8 text-zinc-400">
            Proofly compares the requirements of the opportunities you want
            with the evidence you've actually built — certificates, projects,
            and experience — to show how ready you really are.
          </p>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Link href="/analyze">
              <Button
                size="lg"
                className="w-full bg-violet-500 px-8 text-white hover:bg-violet-600 sm:w-auto"
              >
                Check My Readiness
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>

            <a href="#how-it-works">
              <Button
                size="lg"
                variant="outline"
                className="w-full border-zinc-700 bg-transparent px-8 text-zinc-200 hover:bg-zinc-900 sm:w-auto"
              >
                See How It Works
              </Button>
            </a>
          </div>

          <div className="mt-8 flex items-center gap-3 text-sm text-zinc-500">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-500/10">
              <GraduationCap className="h-5 w-5 text-violet-400" />
            </div>
            Built for students who want to become opportunity-ready.
          </div>
        </div>

        {/* PRODUCT PREVIEW */}
        <div className="relative">
          <div className="absolute -inset-10 rounded-full bg-violet-500/10 blur-3xl" />

          <Card className="relative border-zinc-800 bg-zinc-900/90 shadow-2xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-widest text-zinc-500">
                    Proofly Readiness
                  </p>
                  <CardTitle className="mt-1 text-xl">
                    Frontend Developer Intern
                  </CardTitle>
                </div>

                <Badge className="bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/10">
                  72% Ready
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-5">
              <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-5">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-zinc-400">
                    Evidence match
                  </span>
                  <span className="text-lg font-bold text-emerald-400">
                    7 / 10
                  </span>
                </div>

                <div className="mt-4 h-2 overflow-hidden rounded-full bg-zinc-800">
                  <div className="h-full w-[72%] rounded-full bg-violet-500" />
                </div>
              </div>

              <div>
                <p className="mb-3 text-sm font-medium text-zinc-300">
                  Requirements
                </p>

                <div className="space-y-3">
                  {[
                    ["JavaScript", true],
                    ["React", true],
                    ["Git", true],
                    ["CSS", true],
                    ["REST APIs", false],
                  ].map(([skill, matched]) => (
                    <div
                      key={skill as string}
                      className="flex items-center justify-between rounded-lg border border-zinc-800 p-3"
                    >
                      <span className="text-sm text-zinc-300">
                        {skill as string}
                      </span>

                      {matched ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                      ) : (
                        <span className="text-xs text-amber-400">
                          Skill gap
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
                <p className="text-xs uppercase tracking-wider text-amber-400">
                  Biggest gap
                </p>
                <p className="mt-1 font-semibold">REST APIs</p>
                <p className="mt-1 text-sm text-zinc-400">
                  Build one API-based project to strengthen your evidence.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section
        id="how-it-works"
        className="border-y border-zinc-900 bg-zinc-950/50"
      >
        <div className="mx-auto max-w-7xl px-6 py-24 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-violet-400">
              How Proofly works
            </p>

            <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
              From opportunity to readiness.
            </h2>

            <p className="mt-4 text-zinc-400">
              Proofly doesn't just tell you what you should learn. It shows
              you what you're missing and what to do next.
            </p>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-4">
            {[
              {
                number: "01",
                icon: FileText,
                title: "Add Opportunity",
                text: "Upload or paste the job or internship you want.",
              },
              {
                number: "02",
                icon: GraduationCap,
                title: "Add Evidence",
                text: "Show your certificates, projects, resume, and experience.",
              },
              {
                number: "03",
                icon: Target,
                title: "Get Your Readiness",
                text: "Proofly maps opportunity requirements against your evidence.",
              },
              {
                number: "04",
                icon: Lightbulb,
                title: "Take Action",
                text: "Get your biggest skill gap and the next step to close it.",
              },
            ].map((item) => {
              const Icon = item.icon;

              return (
                <Card
                  key={item.number}
                  className="border-zinc-800 bg-zinc-900/40"
                >
                  <CardHeader>
                    <div className="mb-4 flex items-center justify-between">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-500/10">
                        <Icon className="h-5 w-5 text-violet-400" />
                      </div>

                      <span className="text-sm text-zinc-600">
                        {item.number}
                      </span>
                    </div>

                    <CardTitle>{item.title}</CardTitle>
                  </CardHeader>

                  <CardContent className="text-sm leading-6 text-zinc-400">
                    {item.text}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section
        id="features"
        className="mx-auto max-w-7xl px-6 py-24 lg:px-8"
      >
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-violet-400">
            Why Proofly
          </p>

          <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
            Career readiness backed by evidence.
          </h2>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          <Card className="border-zinc-800 bg-zinc-900/50">
            <CardHeader>
              <Target className="mb-3 h-8 w-8 text-violet-400" />
              <CardTitle>Evidence-Based Matching</CardTitle>
            </CardHeader>

            <CardContent className="text-zinc-400">
              See which opportunity requirements are actually supported by
              your certificates, projects, and experience.
            </CardContent>
          </Card>

          <Card className="border-zinc-800 bg-zinc-900/50">
            <CardHeader>
              <Lightbulb className="mb-3 h-8 w-8 text-violet-400" />
              <CardTitle>Actionable Skill Gaps</CardTitle>
            </CardHeader>

            <CardContent className="text-zinc-400">
              Instead of a generic skill list, Proofly identifies your biggest
              gap and recommends what you should do next.
            </CardContent>
          </Card>

          <Card className="border-zinc-800 bg-zinc-900/50">
            <CardHeader>
              <Users className="mb-3 h-8 w-8 text-violet-400" />
              <CardTitle>SkillSwap</CardTitle>
            </CardHeader>

            <CardContent className="text-zinc-400">
              When you need help, connect with peers whose skills complement
              yours and build together.
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA */}
      <section id="about" className="px-6 py-24">
        <Card className="mx-auto max-w-5xl border-violet-500/20 bg-violet-500/5">
          <CardContent className="flex flex-col items-center px-6 py-16 text-center">
            <h2 className="text-3xl font-bold sm:text-4xl">
              The opportunity is already there.
              <br />
              <span className="text-violet-400">
                Now prove you're ready.
              </span>
            </h2>

            <p className="mt-4 max-w-xl text-zinc-400">
              Upload an opportunity and your evidence to discover where you
              stand and what you should do next.
            </p>

            <Link href="/analyze">
              <Button
                size="lg"
                className="mt-8 bg-violet-500 px-8 hover:bg-violet-600"
              >
                Check My Readiness
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-zinc-800 px-6 py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 text-sm text-zinc-500 sm:flex-row">
          <p>© 2026 Proofly. Turn ambition into evidence.</p>

          <p>Built with Next.js · shadcn/ui · AI</p>
        </div>
      </footer>
    </main>
  );
}


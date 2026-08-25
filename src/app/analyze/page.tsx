
"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  FileText,
  Lightbulb,
  Sparkles,
  Upload,
  XCircle,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";

export default function AnalyzePage() {
  const [analyzed, setAnalyzed] = useState(false);

  const handleAnalyze = () => {
    setAnalyzed(true);
  };

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      {/* NAVBAR */}
      <nav className="border-b border-zinc-900">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link href="/" className="text-2xl font-bold tracking-tight">
            proofly<span className="text-violet-400">.</span>
          </Link>

          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-zinc-400 transition hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
        </div>
      </nav>

      <div className="mx-auto max-w-6xl px-6 py-12">
        {/* HEADER */}
        <div className="mb-10">
          <Badge
            variant="outline"
            className="border-violet-500/30 bg-violet-500/10 text-violet-300"
          >
            <Sparkles className="mr-2 h-4 w-4" />
            AI Career Readiness
          </Badge>

          <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
            Are you ready for this opportunity?
          </h1>

          <p className="mt-4 max-w-2xl text-zinc-400">
            Give Proofly the opportunity you want and the evidence you've
            already built. We'll compare them and show you what to do next.
          </p>
        </div>

        {!analyzed ? (
          /* ================= INPUT STATE ================= */
          <div className="grid gap-6 lg:grid-cols-2">
            {/* OPPORTUNITY */}
            <Card className="border-zinc-800 bg-zinc-900/60">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-500/10 text-violet-400">
                    01
                  </div>

                  <div>
                    <CardTitle>Opportunity</CardTitle>
                    <p className="mt-1 text-sm text-zinc-500">
                      What are you applying for?
                    </p>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-medium text-zinc-300">
                    Opportunity title
                  </label>

                  <Input
                    defaultValue="Frontend Developer Intern"
                    className="border-zinc-700 bg-zinc-950 text-white"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-zinc-300">
                    Job / internship description
                  </label>

                  <Textarea
                    defaultValue={`We're looking for a Frontend Developer Intern.

Requirements:
• HTML & CSS
• JavaScript
• React
• Git & GitHub
• REST APIs
• Basic responsive design`}
                    className="min-h-[210px] resize-none border-zinc-700 bg-zinc-950 text-white"
                  />
                </div>

                <div className="rounded-lg border border-dashed border-zinc-700 p-5 text-center">
                  <Upload className="mx-auto h-7 w-7 text-zinc-500" />

                  <p className="mt-2 text-sm text-zinc-400">
                    Or upload the opportunity PDF
                  </p>

                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3 border-zinc-700"
                  >
                    Choose File
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* EVIDENCE */}
            <Card className="border-zinc-800 bg-zinc-900/60">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-500/10 text-violet-400">
                    02
                  </div>

                  <div>
                    <CardTitle>Your Evidence</CardTitle>
                    <p className="mt-1 text-sm text-zinc-500">
                      What proves what you can do?
                    </p>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
                  <div className="flex items-start gap-3">
                    <FileText className="mt-1 h-5 w-5 text-violet-400" />

                    <div className="flex-1">
                      <p className="font-medium">React Certificate</p>
                      <p className="mt-1 text-xs text-zinc-500">
                        Certificate · Added recently
                      </p>
                    </div>

                    <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                  </div>
                </div>

                <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
                  <div className="flex items-start gap-3">
                    <FileText className="mt-1 h-5 w-5 text-violet-400" />

                    <div className="flex-1">
                      <p className="font-medium">Portfolio Website</p>
                      <p className="mt-1 text-xs text-zinc-500">
                        Project · GitHub
                      </p>
                    </div>

                    <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                  </div>
                </div>

                <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
                  <div className="flex items-start gap-3">
                    <FileText className="mt-1 h-5 w-5 text-violet-400" />

                    <div className="flex-1">
                      <p className="font-medium">JavaScript Project</p>
                      <p className="mt-1 text-xs text-zinc-500">
                        Project · GitHub
                      </p>
                    </div>

                    <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                  </div>
                </div>

                <Button
                  variant="outline"
                  className="w-full border-zinc-700 bg-transparent"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Add Evidence
                </Button>
              </CardContent>
            </Card>

            {/* ANALYZE BUTTON */}
            <div className="lg:col-span-2">
              <Card className="border-violet-500/20 bg-violet-500/5">
                <CardContent className="flex flex-col items-center justify-between gap-5 p-6 sm:flex-row">
                  <div>
                    <p className="font-semibold">
                      Ready to see where you stand?
                    </p>
                    <p className="mt-1 text-sm text-zinc-400">
                      Proofly will compare the opportunity requirements with
                      your evidence.
                    </p>
                  </div>

                  <Button
                    onClick={handleAnalyze}
                    size="lg"
                    className="bg-violet-500 px-8 hover:bg-violet-600"
                  >
                    Analyze My Readiness
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          /* ================= RESULT STATE ================= */
          <div className="space-y-6">
            {/* SCORE */}
            <Card className="border-zinc-800 bg-zinc-900/60">
              <CardContent className="p-8">
                <div className="grid items-center gap-8 md:grid-cols-[auto_1fr]">
                  <div className="flex h-40 w-40 flex-col items-center justify-center rounded-full border-8 border-violet-500/30">
                    <span className="text-5xl font-bold">72%</span>
                    <span className="mt-1 text-xs uppercase tracking-wider text-zinc-500">
                      Ready
                    </span>
                  </div>

                  <div>
                    <Badge className="bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/10">
                      Good Match
                    </Badge>

                    <h2 className="mt-3 text-3xl font-bold">
                      You're on the right track.
                    </h2>

                    <p className="mt-3 max-w-2xl text-zinc-400">
                      Proofly found strong evidence for most of the important
                      requirements, but there is one major skill gap you should
                      address before applying.
                    </p>

                    <div className="mt-5">
                      <div className="mb-2 flex justify-between text-sm">
                        <span className="text-zinc-500">
                          Overall evidence match
                        </span>
                        <span className="font-semibold">72%</span>
                      </div>

                      <Progress value={72} className="h-2 bg-zinc-800" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* REQUIREMENTS */}
            <Card className="border-zinc-800 bg-zinc-900/60">
              <CardHeader>
                <CardTitle>Requirement vs Evidence</CardTitle>
                <p className="text-sm text-zinc-500">
                  What Proofly found in your evidence
                </p>
              </CardHeader>

              <CardContent className="space-y-3">
                {[
                  ["HTML & CSS", "Portfolio Website", true],
                  ["JavaScript", "JavaScript Project", true],
                  ["React", "React Certificate + Project", true],
                  ["Git & GitHub", "GitHub Projects", true],
                  ["Responsive Design", "Portfolio Website", true],
                  ["REST APIs", "No strong evidence found", false],
                ].map(([skill, evidence, matched]) => (
                  <div
                    key={skill as string}
                    className="flex flex-col gap-3 rounded-xl border border-zinc-800 bg-zinc-950 p-4 sm:flex-row sm:items-center"
                  >
                    <div className="flex flex-1 items-center gap-3">
                      {matched ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                      ) : (
                        <XCircle className="h-5 w-5 text-amber-400" />
                      )}

                      <span className="font-medium">{skill as string}</span>
                    </div>

                    <span className="text-sm text-zinc-500">
                      {evidence as string}
                    </span>

                    <Badge
                      variant="outline"
                      className={
                        matched
                          ? "border-emerald-500/20 text-emerald-400"
                          : "border-amber-500/20 text-amber-400"
                      }
                    >
                      {matched ? "Supported" : "Gap"}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* GAP */}
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="border-amber-500/20 bg-amber-500/5">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/10">
                      <Lightbulb className="h-5 w-5 text-amber-400" />
                    </div>

                    <div>
                      <p className="text-xs uppercase tracking-widest text-amber-400">
                        Biggest skill gap
                      </p>
                      <CardTitle className="mt-1">REST APIs</CardTitle>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="text-sm leading-6 text-zinc-400">
                  This opportunity specifically requires API integration, but
                  Proofly couldn't find strong evidence that you've built or
                  worked with REST APIs.
                </CardContent>
              </Card>

              <Card className="border-violet-500/20 bg-violet-500/5">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-500/10">
                      <Sparkles className="h-5 w-5 text-violet-400" />
                    </div>

                    <div>
                      <p className="text-xs uppercase tracking-widest text-violet-400">
                        Recommended next action
                      </p>
                      <CardTitle className="mt-1">
                        Build an API project
                      </CardTitle>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="text-sm leading-6 text-zinc-400">
                  Build a small project using a public REST API. Add it to your
                  portfolio and use it as evidence for future applications.
                </CardContent>
              </Card>
            </div>

            {/* SKILLSWAP */}
            <Card className="border-violet-500/20 bg-violet-500/5">
              <CardContent className="flex flex-col items-center justify-between gap-6 p-8 sm:flex-row">
                <div>
                  <Badge className="bg-violet-500/10 text-violet-300 hover:bg-violet-500/10">
                    SkillSwap
                  </Badge>

                  <h3 className="mt-3 text-2xl font-bold">
                    Need help closing the gap?
                  </h3>

                  <p className="mt-2 max-w-xl text-zinc-400">
                    Find a peer with complementary skills and build the missing
                    experience together.
                  </p>
                </div>

                <Link href="/skillswap">
                  <Button
                    size="lg"
                    className="bg-violet-500 px-7 hover:bg-violet-600"
                  >
                    Find a SkillSwap Peer
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                variant="outline"
                onClick={() => setAnalyzed(false)}
                className="border-zinc-700 bg-transparent"
              >
                Analyze Another Opportunity
              </Button>

              <Link href="/">
                <Button
                  variant="outline"
                  className="w-full border-zinc-700 bg-transparent sm:w-auto"
                >
                  Back to Proofly
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}


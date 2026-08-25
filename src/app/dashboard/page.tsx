
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  FileText,
  Lightbulb,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      {/* NAVBAR */}
      <nav className="border-b border-zinc-900">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link href="/" className="text-2xl font-bold tracking-tight">
            proofly<span className="text-violet-400">.</span>
          </Link>

          <div className="flex items-center gap-4">
            <Link
              href="/analyze"
              className="text-sm text-zinc-400 hover:text-white"
            >
              Analyze
            </Link>

            <Link href="/skillswap">
              <Button
                variant="outline"
                className="border-zinc-700 bg-transparent"
              >
                SkillSwap
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-7xl px-6 py-10">
        {/* HEADER */}
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm text-violet-400">Welcome back</p>

            <h1 className="mt-2 text-4xl font-bold tracking-tight">
               Your Readiness Hub
            </h1>

            <p className="mt-3 max-w-2xl text-zinc-400">
              Track your evidence, readiness, skill gaps, and progress toward
              the opportunities you want.
            </p>
          </div>

          <Link href="/analyze">
            <Button className="bg-violet-500 hover:bg-violet-600">
              Check a New Opportunity
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>

        {/* TOP STATS */}
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="border-zinc-800 bg-zinc-900/60">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <Target className="h-5 w-5 text-violet-400" />
                <span className="text-xs text-zinc-500">Current</span>
              </div>

              <p className="mt-5 text-3xl font-bold">72%</p>
              <p className="mt-1 text-sm text-zinc-500">
                Career readiness
              </p>
            </CardContent>
          </Card>

          <Card className="border-zinc-800 bg-zinc-900/60">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <FileText className="h-5 w-5 text-violet-400" />
                <span className="text-xs text-zinc-500">Verified</span>
              </div>

              <p className="mt-5 text-3xl font-bold">8</p>
              <p className="mt-1 text-sm text-zinc-500">
                Evidence items
              </p>
            </CardContent>
          </Card>

          <Card className="border-zinc-800 bg-zinc-900/60">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <TrendingUp className="h-5 w-5 text-emerald-400" />
                <span className="text-xs text-emerald-400">+12%</span>
              </div>

              <p className="mt-5 text-3xl font-bold">4</p>
              <p className="mt-1 text-sm text-zinc-500">
                Skills strengthened
              </p>
            </CardContent>
          </Card>

          <Card className="border-zinc-800 bg-zinc-900/60">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <Users className="h-5 w-5 text-violet-400" />
                <span className="text-xs text-zinc-500">Available</span>
              </div>

              <p className="mt-5 text-3xl font-bold">3</p>
              <p className="mt-1 text-sm text-zinc-500">
                SkillSwap matches
              </p>
            </CardContent>
          </Card>
        </div>

        {/* MAIN GRID */}
        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          {/* READINESS */}
          <Card className="border-zinc-800 bg-zinc-900/60 lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Current Opportunity</CardTitle>
                  <p className="mt-1 text-sm text-zinc-500">
                    Frontend Developer Intern
                  </p>
                </div>

                <Badge className="bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/10">
                  72% Ready
                </Badge>
              </div>
            </CardHeader>

            <CardContent>
              <div className="mb-3 flex justify-between text-sm">
                <span className="text-zinc-500">
                  Evidence match
                </span>

                <span className="font-semibold">72%</span>
              </div>

              <Progress value={72} className="h-2 bg-zinc-800" />

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
                  <p className="text-xs text-zinc-500">Supported</p>
                  <p className="mt-1 text-2xl font-bold text-emerald-400">
                    5
                  </p>
                  <p className="text-xs text-zinc-500">
                    requirements
                  </p>
                </div>

                <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
                  <p className="text-xs text-zinc-500">Skill gaps</p>
                  <p className="mt-1 text-2xl font-bold text-amber-400">
                    1
                  </p>
                  <p className="text-xs text-zinc-500">
                    priority gap
                  </p>
                </div>

                <div className="rounded-xl border border-violet-500/20 bg-violet-500/5 p-4">
                  <p className="text-xs text-zinc-500">Next action</p>
                  <p className="mt-1 text-lg font-bold">
                    Build
                  </p>
                  <p className="text-xs text-zinc-500">
                    API project
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* NEXT ACTION */}
          <Card className="border-violet-500/20 bg-violet-500/5">
            <CardHeader>
              <Lightbulb className="h-7 w-7 text-amber-400" />

              <CardTitle className="mt-3">
                Your next best action
              </CardTitle>
            </CardHeader>

            <CardContent>
              <h3 className="text-lg font-semibold">
                Build a REST API project
              </h3>

              <p className="mt-2 text-sm leading-6 text-zinc-400">
                This will strengthen the biggest missing requirement in your
                current opportunity.
              </p>

              <Button className="mt-5 w-full bg-violet-500 hover:bg-violet-600">
                Start Action
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* EVIDENCE */}
        <Card className="mt-6 border-zinc-800 bg-zinc-900/60">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Your Evidence</CardTitle>
                <p className="mt-1 text-sm text-zinc-500">
                  Evidence Proofly can use to evaluate your readiness
                </p>
              </div>

              <Button
                variant="outline"
                className="border-zinc-700 bg-transparent"
              >
                Add Evidence
              </Button>
            </div>
          </CardHeader>

          <CardContent>
            <div className="grid gap-3 md:grid-cols-3">
              {[
                "React Certificate",
                "Portfolio Website",
                "JavaScript Project",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-950 p-4"
                >
                  <CheckCircle2 className="h-5 w-5 text-emerald-400" />

                  <div>
                    <p className="text-sm font-medium">{item}</p>
                    <p className="text-xs text-zinc-500">
                      Evidence verified
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* SKILLSWAP */}
        <Card className="mt-6 border-violet-500/20 bg-violet-500/5">
          <CardContent className="flex flex-col justify-between gap-5 p-6 sm:flex-row sm:items-center">
            <div>
              <Badge className="bg-violet-500/10 text-violet-300 hover:bg-violet-500/10">
                SkillSwap
              </Badge>

              <h3 className="mt-3 text-xl font-bold">
                3 peers can help close your skill gap.
              </h3>

              <p className="mt-1 text-sm text-zinc-400">
                Find students with complementary backend and API skills.
              </p>
            </div>

            <Link href="/skillswap">
              <Button className="bg-violet-500 hover:bg-violet-600">
                Explore Matches
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}


import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Code2,
  Database,
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

const peers = [
  {
    name: "Aarav Sharma",
    initials: "AS",
    role: "Backend Developer",
    skills: ["Node.js", "REST APIs", "MongoDB"],
    match: 94,
    project: "API-based Student Management System",
  },
  {
    name: "Riya Patil",
    initials: "RP",
    role: "Full Stack Developer",
    skills: ["Node.js", "Express", "APIs"],
    match: 88,
    project: "College Event Platform",
  },
  {
    name: "Kabir Joshi",
    initials: "KJ",
    role: "Backend & Cloud",
    skills: ["Python", "FastAPI", "AWS"],
    match: 81,
    project: "Cloud-based REST API",
  },
];

export default function SkillSwapPage() {
  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      {/* NAVBAR */}
      <nav className="border-b border-zinc-900">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link href="/" className="text-2xl font-bold tracking-tight">
            proofly<span className="text-violet-400">.</span>
          </Link>

          <Link
            href="/analyze"
            className="flex items-center gap-2 text-sm text-zinc-400 transition hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Analysis
          </Link>
        </div>
      </nav>

      <div className="mx-auto max-w-6xl px-6 py-12">
        {/* HEADER */}
        <div className="text-center">
          <Badge
            variant="outline"
            className="border-violet-500/30 bg-violet-500/10 text-violet-300"
          >
            <Users className="mr-2 h-4 w-4" />
            SkillSwap
          </Badge>

          <h1 className="mt-5 text-4xl font-bold tracking-tight sm:text-5xl">
            Find the skill you&apos;re missing.
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-zinc-400">
            Proofly found a REST API gap in your profile. SkillSwap helps you
            find students with complementary skills so you can learn and
            build together.
          </p>
        </div>

        {/* YOUR GAP */}
        <Card className="mx-auto mt-10 max-w-3xl border-amber-500/20 bg-amber-500/5">
          <CardContent className="flex flex-col items-center gap-5 p-6 text-center sm:flex-row sm:text-left">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-amber-500/10">
              <Zap className="h-7 w-7 text-amber-400" />
            </div>

            <div className="flex-1">
              <p className="text-xs uppercase tracking-widest text-amber-400">
                Your current skill gap
              </p>

              <h2 className="mt-1 text-xl font-bold">REST APIs</h2>

              <p className="mt-1 text-sm text-zinc-400">
                You bring frontend skills. We&apos;ll help you find someone
                strong in backend/API development.
              </p>
            </div>

            <Badge className="bg-amber-500/10 text-amber-400 hover:bg-amber-500/10">
              High priority
            </Badge>
          </CardContent>
        </Card>

        {/* MATCHES */}
        <div className="mt-12">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">
                Your complementary matches
              </h2>

              <p className="mt-1 text-sm text-zinc-500">
                Ranked by skill compatibility
              </p>
            </div>

            <span className="hidden text-sm text-zinc-500 sm:block">
              3 matches found
            </span>
          </div>

          <div className="mt-6 grid gap-5">
            {peers.map((peer) => (
              <Card
                key={peer.name}
                className="border-zinc-800 bg-zinc-900/60 transition hover:border-violet-500/30"
              >
                <CardContent className="p-6">
                  <div className="flex flex-col gap-6 lg:flex-row lg:items-center">
                    {/* PROFILE */}
                    <div className="flex flex-1 items-start gap-4">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-violet-500/10 text-lg font-bold text-violet-300">
                        {peer.initials}
                      </div>

                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-lg font-semibold">
                            {peer.name}
                          </h3>

                          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                        </div>

                        <p className="mt-1 text-sm text-zinc-500">
                          {peer.role}
                        </p>

                        <div className="mt-3 flex flex-wrap gap-2">
                          {peer.skills.map((skill) => (
                            <Badge
                              key={skill}
                              variant="outline"
                              className="border-zinc-700 text-zinc-300"
                            >
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* MATCH */}
                    <div className="flex items-center gap-4 lg:w-48 lg:flex-col lg:items-center lg:justify-center">
                      <div className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-emerald-500/20">
                        <span className="text-lg font-bold text-emerald-400">
                          {peer.match}%
                        </span>
                      </div>

                      <div>
                        <p className="text-sm font-medium">Skill match</p>
                        <p className="text-xs text-zinc-500">
                          Complementary
                        </p>
                      </div>
                    </div>

                    {/* ACTION */}
                    <div className="lg:w-64">
                      <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-3">
                        <div className="flex items-center gap-2">
                          {peer.skills.some((skill) =>
                            skill.toLowerCase().includes("api")
                          ) ? (
                            <Code2 className="h-4 w-4 text-violet-400" />
                          ) : (
                            <Database className="h-4 w-4 text-violet-400" />
                          )}

                          <span className="text-xs uppercase tracking-wider text-zinc-500">
                            Can help you build
                          </span>
                        </div>

                        <p className="mt-2 text-sm font-medium">
                          {peer.project}
                        </p>
                      </div>

                      <Button className="mt-3 w-full bg-violet-500 hover:bg-violet-600">
                        Connect & Build Together
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* HOW IT WORKS */}
        <Card className="mt-12 border-zinc-800 bg-zinc-900/40">
          <CardHeader>
            <CardTitle>How SkillSwap works</CardTitle>
          </CardHeader>

          <CardContent>
            <div className="grid gap-6 md:grid-cols-3">
              <div>
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-violet-500/10 text-sm font-semibold text-violet-400">
                  01
                </div>

                <h3 className="font-semibold">Find your gap</h3>

                <p className="mt-2 text-sm leading-6 text-zinc-500">
                  Proofly identifies the skill you need for your target
                  opportunity.
                </p>
              </div>

              <div>
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-violet-500/10 text-sm font-semibold text-violet-400">
                  02
                </div>

                <h3 className="font-semibold">Find your match</h3>

                <p className="mt-2 text-sm leading-6 text-zinc-500">
                  SkillSwap finds students whose strengths complement yours.
                </p>
              </div>

              <div>
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-violet-500/10 text-sm font-semibold text-violet-400">
                  03
                </div>

                <h3 className="font-semibold">Build together</h3>

                <p className="mt-2 text-sm leading-6 text-zinc-500">
                  Learn from each other and create real evidence for your
                  future applications.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* FOOTER ACTION */}
        <div className="mt-10 flex flex-col items-center gap-4 text-center">
          <p className="text-sm text-zinc-500">
            Your goal isn't just to find an opportunity.
            <br />
            It's to become ready for it.
          </p>

          <Link href="/analyze">
            <Button
              variant="outline"
              className="border-zinc-700 bg-transparent"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Readiness Analysis
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}

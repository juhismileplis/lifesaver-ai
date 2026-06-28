"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";

const features = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" />
      </svg>
    ),
    title: "Smart Prioritization",
    description: "AI analyzes urgency and importance to rank your tasks automatically.",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: "Proactive Scheduling",
    description: "Gets optimal time slots for your tasks based on deadlines and energy levels.",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: "Goal Tracking",
    description: "Set meaningful goals and track progress with habit streaks and milestones.",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 9.75a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 01.778-.332 48.294 48.294 0 005.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
      </svg>
    ),
    title: "AI Companion Chat",
    description: "Chat with an AI that understands your workload and gives personalized advice.",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
      </svg>
    ),
    title: "Calendar Sync",
    description: "Integrates with Google Calendar to see all your commitments in one place.",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
      </svg>
    ),
    title: "Voice Commands",
    description: "Speak your tasks and get hands-free assistance with voice-enabled controls.",
  },
];

const demoSlides = [
  {
    title: "Add Tasks Effortlessly",
    description: "Quickly add tasks with priority, deadlines, and categories. LifeSaver AI automatically analyzes your workload.",
    image: (
      <div className="h-full flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl border border-surface-200 p-6 max-w-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white font-bold">
              LS
            </div>
            <div>
              <p className="font-semibold text-surface-900">New Task</p>
              <p className="text-xs text-surface-400">AI-powered prioritization</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="p-3 rounded-xl bg-surface-50 border border-surface-100">
              <p className="text-sm font-medium text-surface-900">Complete project proposal</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs px-2 py-0.5 rounded-full bg-danger-100 text-danger-700 font-medium">Critical</span>
                <span className="text-xs text-surface-400">Due: Tomorrow</span>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-surface-50 border border-surface-100">
              <p className="text-sm font-medium text-surface-900">Review team updates</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs px-2 py-0.5 rounded-full bg-warning-100 text-warning-700 font-medium">High</span>
                <span className="text-xs text-surface-400">Due: In 2 days</span>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-surface-50 border border-surface-100">
              <p className="text-sm font-medium text-surface-900">Weekly gym session</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs px-2 py-0.5 rounded-full bg-surface-200 text-surface-600 font-medium">Low</span>
                <span className="text-xs text-surface-400">Due: In 5 days</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: "AI-Powered Insights",
    description: "Get personalized productivity recommendations, deadline alerts, and smart scheduling suggestions from your AI companion.",
    image: (
      <div className="h-full flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl border border-surface-200 p-6 max-w-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-400 to-accent-600 flex items-center justify-center text-white font-bold">
              AI
            </div>
            <div>
              <p className="font-semibold text-surface-900">LifeSaver AI</p>
              <p className="text-xs text-surface-400">Analyzing your workload...</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-brand-50 border border-brand-200">
            <p className="text-sm text-brand-800">
              ⚠️ <strong>Heads up!</strong> Your &quot;Complete project proposal&quot; is due tomorrow and will take ~4 hours. I&apos;d suggest starting on it right away — blocking 2pm-6pm today.
            </p>
          </div>
          <div className="mt-3 p-3 rounded-xl bg-accent-50 border border-accent-200">
            <p className="text-sm text-accent-800">
              💡 Your productivity score is <strong>85%</strong> this week. Great momentum!
            </p>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: "Track Everything",
    description: "Monitor progress with an intuitive dashboard, calendar view, and habit tracking. Never lose sight of your goals.",
    image: (
      <div className="h-full flex items-center justify-center">
        <div className="grid grid-cols-2 gap-3 max-w-sm">
          <div className="bg-white rounded-2xl shadow-xl border border-surface-200 p-4">
            <p className="text-3xl font-bold text-surface-900">12</p>
            <p className="text-xs text-surface-400">Tasks Done</p>
          </div>
          <div className="bg-white rounded-2xl shadow-xl border border-surface-200 p-4">
            <p className="text-3xl font-bold text-accent-600">5</p>
            <p className="text-xs text-surface-400">Day Streak</p>
          </div>
          <div className="bg-white rounded-2xl shadow-xl border border-surface-200 p-4">
            <p className="text-3xl font-bold text-danger-600">2</p>
            <p className="text-xs text-surface-400">At Risk</p>
          </div>
          <div className="bg-white rounded-2xl shadow-xl border border-surface-200 p-4">
            <p className="text-3xl font-bold text-brand-600">92%</p>
            <p className="text-xs text-surface-400">On Track</p>
          </div>
        </div>
      </div>
    ),
  },
];

export default function LandingPage() {
  const [showDemo, setShowDemo] = useState(false);
  const [demoStep, setDemoStep] = useState(0);

  const openDemo = () => {
    setDemoStep(0);
    setShowDemo(true);
  };

  const closeDemo = () => {
    setShowDemo(false);
    setDemoStep(0);
  };

  const nextDemoStep = () => {
    if (demoStep < demoSlides.length - 1) {
      setDemoStep(demoStep + 1);
    }
  };

  const prevDemoStep = () => {
    if (demoStep > 0) {
      setDemoStep(demoStep - 1);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-surface-100">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-brand-200">
              LS
            </div>
            <span className="font-bold text-xl text-surface-900">
              LifeSaver <span className="text-brand-600">AI</span>
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/auth/signin"
              className="text-surface-500 hover:text-surface-700 text-sm font-medium transition-colors"
            >
              Log In
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden particles-bg">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-200/50 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-200/50 rounded-full blur-3xl" />
        </div>

        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-sm font-medium mb-8 animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
            AI-Powered Productivity Companion
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-surface-900 leading-tight mb-6 animate-slide-up">
            Never Miss a{" "}
            <span className="text-gradient">Deadline</span>{" "}
            Again
          </h1>

          <p className="text-xl text-surface-500 max-w-2xl mx-auto mb-10 animate-slide-up">
            LifeSaver AI proactively helps you plan, prioritize, and complete
            tasks before it&apos;s too late. Your personal AI companion that
            doesn&apos;t just remind you — it helps you get things done.
          </p>

          <div className="flex items-center justify-center gap-4 animate-slide-up">
            <Link href="/auth/signup">
              <Button size="lg">
                Create Free Account
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Button>
            </Link>
            <Button variant="outline" size="lg" onClick={openDemo}>
              <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Watch Demo
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-lg mx-auto mt-16">
            {[
              { value: "10x", label: "More Productive" },
              { value: "99%", label: "Deadline Success" },
              { value: "2hrs", label: "Daily Saved" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl font-bold text-surface-900">{stat.value}</p>
                <p className="text-sm text-surface-400">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-6 bg-white relative">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-surface-900 mb-4">
              Everything You Need to{" "}
              <span className="text-gradient">Stay Ahead</span>
            </h2>
            <p className="text-lg text-surface-500 max-w-2xl mx-auto">
              LifeSaver AI combines smart technology with proactive assistance to
              help you manage your time and tasks effectively.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <div
                key={feature.title}
                className="group p-6 rounded-2xl border border-surface-200 bg-surface-50 hover:bg-white hover:shadow-xl hover:-translate-y-1 transition-all duration-300 animate-fade-in"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-100 to-brand-50 flex items-center justify-center text-brand-600 mb-4 group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-surface-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-surface-500 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-6 bg-surface-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-surface-900 mb-4">
              How It <span className="text-gradient">Works</span>
            </h2>
            <p className="text-lg text-surface-500 max-w-2xl mx-auto">
              Get started in minutes and experience the power of AI-driven productivity.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Create Your Account",
                description: "Sign up in seconds and set up your profile. No credit card needed.",
                color: "from-brand-400 to-brand-600",
              },
              {
                step: "02",
                title: "Add Your Tasks",
                description: "Enter your tasks with deadlines and priorities. AI analyzes your workload instantly.",
                color: "from-accent-400 to-accent-600",
              },
              {
                step: "03",
                title: "Let AI Take Over",
                description: "Get smart prioritization, scheduling suggestions, and proactive deadline alerts.",
                color: "from-brand-500 to-accent-500",
              },
            ].map((item, i) => (
              <div key={item.step} className="text-center">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center mx-auto mb-6 shadow-lg`}>
                  <span className="text-2xl font-bold text-white">{item.step}</span>
                </div>
                <h3 className="text-xl font-semibold text-surface-900 mb-3">{item.title}</h3>
                <p className="text-surface-500 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final Section */}
      <section className="py-20 px-6 relative overflow-hidden animated-grid">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-brand-600 to-brand-800" />
        </div>
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Ready to Transform Your Productivity?
          </h2>
          <p className="text-lg text-brand-100 mb-10">
            Join thousands of students and professionals who never miss a
            deadline with LifeSaver AI.
          </p>
          <p className="text-white/40 text-sm">
            Start your journey today — create a free account above.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 bg-surface-900 text-surface-400">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white text-xs font-bold">
              LS
            </div>
            <span className="font-semibold text-white">LifeSaver AI</span>
          </div>
          <p className="text-sm">
            Smart productivity for ambitious people.
          </p>
        </div>
      </footer>

      {/* Demo Modal */}
      <Modal isOpen={showDemo} onClose={closeDemo} title="See LifeSaver AI in Action">
        <div className="space-y-6">
          <div className="relative rounded-2xl overflow-hidden bg-surface-900 aspect-video flex items-center justify-center">
            {/* Dark overlay for text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-surface-900/90 via-surface-900/40 to-surface-900/60" />
            {/* Animated feature showcases */}
            <div className="w-full h-full">
              <div className="absolute top-4 left-4 right-4 flex gap-2">
                {demoSlides.map((slide, i) => (
                  <button
                    key={i}
                    onClick={() => setDemoStep(i)}
                    className={`flex-1 h-2 rounded-full transition-all duration-500 ${
                      i === demoStep ? 'bg-white' : 'bg-white/30'
                    }`}
                  />
                ))}
              </div>
              
              <div className="absolute inset-0 flex items-center justify-center p-12">
                <div className="text-center animate-fade-in" key={demoStep}>
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-400 to-accent-400 flex items-center justify-center mx-auto mb-4 shadow-2xl">
                    <span className="text-2xl">{demoSlides[demoStep].title.includes('Tasks') ? '📝' : demoSlides[demoStep].title.includes('Insights') ? '🤖' : '📊'}</span>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">{demoSlides[demoStep].title}</h3>
                  <p className="text-white/80 max-w-md mx-auto">{demoSlides[demoStep].description}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Demo Controls */}
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={prevDemoStep}
              disabled={demoStep === 0}
            >
              ← Previous
            </Button>
            <span className="text-sm text-surface-400">
              {demoStep + 1} of {demoSlides.length}
            </span>
            {demoStep === demoSlides.length - 1 ? (
              <Button size="sm" onClick={closeDemo}>
                Got it!
              </Button>
            ) : (
              <Button size="sm" onClick={nextDemoStep}>
                Next →
              </Button>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
}

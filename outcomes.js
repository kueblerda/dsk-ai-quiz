const OUTCOMES = {

  1: {
    label: "Foundation First",
    headline: "You don't need AI right now — and that's perfectly okay.",
    diagnosis:
      "The most common mistake new businesses make is layering tools and automation on top " +
      "of a process that isn't solid yet. AI doesn't fix a shaky foundation — it builds on " +
      "it faster. Right now, your biggest win is getting clear on how you do your work, " +
      "job by job, before you automate any of it.",
    needsList: [
      "A written checklist for how a job flows from first call to final invoice",
      "Focus on landing clients and learning what your process looks like in practice",
      "Consistency before complexity",
    ],
    painCallouts: {},
    ctaType: "choice",
    choicePrompt:
      "One last question — would you like a hand finding some free resources " +
      "to help you build your foundation?",
    choiceYesLabel: "✅ Yes — please point me in the right direction",
    choiceNoLabel: "👍 No thanks — I'll find them on my own",
    choiceYesConfirm:
      "Done. David from DSK will reach out personally with some resources " +
      "for exactly where you are in your journey. Keep an eye on your inbox.",
    choiceNoConfirm:
      "Sounds good — best of luck building your foundation. " +
      "If you ever want a second opinion, you know where to find us.",
  },

  2: {
    label: "Clarity Before Tools",
    headline: "You're growing — but you need process clarity before AI can help.",
    diagnosis:
      "You're past the starting line, which is a big deal. But right now your processes " +
      "are either undocumented or inconsistent — and automating an unclear process just " +
      "makes the confusion happen faster. The good news: you're closer than you think. " +
      "Getting your workflow written down and a simple system in place could change " +
      "everything.",
    needsList: [
      "Their workflow written down and repeatable",
      "Possibly a simple CRM to start organizing leads and follow-ups — nothing custom, nothing complex",
      "Right-sized for where they are now",
    ],
    painCallouts: {},
    ctaBlurb:
      "Not sure whether a simple out-of-the-box solution fits right now, or if something " +
      "built around your specific workflow makes more sense? That's exactly the kind of " +
      "conversation we love — no pitch, just clarity.",
    ctaLabel: "Let's Figure It Out — Free 15 Min →",
    ctaUrl: CONFIG.outcome2CalendarUrl,
    secondaryLabel: "Not ready to book yet",
    secondaryConfirm:
      "No problem — your results are already on their way to your inbox. " +
      "Reach out whenever you're ready.",
  },

  3: {
    label: "AI Ready",
    headline: "Your business is ready for AI — and it can win back serious time.",
    diagnosis:
      "You have a clear process and an established business. What you don't have is relief " +
      "from the manual, repetitive work that's eating your time. That's exactly what AI is " +
      "built for — not replacing how you work, just handling the parts you're already " +
      "doing, automatically.",
    needsList: [],
    painCallouts: {
      "missing-after-hours-leads": "📞 You're losing leads after hours — AI can answer and qualify them while you're on a job.",
      "no-documented-process": "📋 Getting your process documented is the last step before automation becomes truly powerful.",
      "manual-data-entry": "⌨️ Manual data entry is costing you hours — that's one of the easiest and highest-impact things to automate.",
    },
    ctaBlurb:
      "Let's look at exactly where your time is going and map out what to automate first. " +
      "Free call. Specific agenda based on your results. No fluff.",
    ctaLabel: "Book Your Free AI Workflow Call →",
    ctaUrl: CONFIG.outcome3CalendarUrl,
    secondaryLabel: "Not ready to book yet",
    secondaryConfirm:
      "No problem — your results are already on their way to your inbox. " +
      "Reach out whenever you're ready.",
  },

  4: {
    label: "Needs Audit",
    headline: "You have the right problems — but adding more tools right now would make it worse.",
    diagnosis:
      "Your business has real potential for AI to make a major impact. But right now your " +
      "data is spread across multiple places, your tools aren't talking to each other, and " +
      "some of your processes may be solving the wrong problem entirely. Adding automation " +
      "on top of that won't fix it — it'll scale the chaos. What you need first is a clear " +
      "picture of what's working, what's broken, and how everything connects.",
    needsList: [],
    painCallouts: {
      "tool-sprawl": "🛠️ Four or more tools that don't talk to each other is a consolidation problem — adding a fifth won't solve it.",
      "manual-data-entry": "⌨️ Copy-pasting data between tools is one of the biggest time and accuracy drains we see in service businesses.",
      "constant-system-gaps": "🔁 Saying 'we need a system for this' multiple times a week means your current setup is already breaking under the weight of your growth.",
    },
    ctaBlurb:
      "We offer a structured AI Audit — we map your current workflows, identify what's " +
      "working, show you how to pull all your data into one clear source, and deliver a " +
      "written report with a prioritized action plan. Before we ever recommend a single tool.",
    ctaLabel: "Learn About the AI Audit →",
    ctaUrl: CONFIG.outcome4CalendarUrl,
    secondaryLabel: "Not ready to book yet",
    secondaryConfirm:
      "No problem — your results are already on their way to your inbox. " +
      "Reach out whenever you're ready.",
  },

};

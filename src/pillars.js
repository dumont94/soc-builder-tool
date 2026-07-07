/**
 * pillars.js — The five-pillar SOC maturity model.
 *
 * Everything the assessment shows and everything the posture read says
 * lives here. Each pillar has:
 *   - framing:    one-line thesis shown during the assessment
 *   - diagnosis:  per-level "where you stand" paragraph (levels 1–4)
 *   - questions:  single-select (options carry points 0–3 and an optional
 *                 `gap` string naming what's missing) or multi-select
 *                 (each option carries a `missingGap` used when NOT selected)
 *
 * Levels: 1 Ad Hoc · 2 Reactive · 3 Managed · 4 Optimized
 */

export const LEVEL_NAMES = { 1: "Ad Hoc", 2: "Reactive", 3: "Managed", 4: "Optimized" };

export const OVERALL_NARRATIVES = {
  1: "This SOC is a name, not yet a function. The good news: the first fixes are cheap and fast — turn the telemetry on, write down what exists, and momentum follows.",
  2: "This SOC reacts to whatever finds it. The pieces exist, but noise drives the work instead of risk. Fix the foundation first, then convert triage time into tuning time.",
  3: "A functioning SOC with real practices — the gaps left are specific, not structural. The read below names them; closing the top few moves you into optimized territory.",
  4: "Operating at the top of this model. The risk now is drift — validate the posture on a cadence (purple team, tabletop, coverage review) so this read stays true.",
};

export const PILLARS = [
  {
    id: "visibility",
    order: 1,
    name: "Visibility",
    framing: "The foundation. Coverage across endpoint, network, cloud, identity, and email — you can't tune what you can't see.",
    diagnosis: {
      1: "You're effectively blind. Whole classes of attack — a phished login, a C2 callback, a rogue admin action — can play out without generating a single reviewable event. Nothing else in this read matters until this is fixed.",
      2: "Partial coverage: some domains report in, others are dark. Attackers don't attack the telemetry you have — they find what you can't see. Close the named blind spots before investing anywhere else.",
      3: "Solid coverage with known edges. The remaining work is discipline: keep the coverage map current and treat every new system as un-onboarded until its logs flow.",
      4: "Full-spectrum visibility with gaps tracked as risk. This is the foundation the other four pillars stand on — protect it as systems change.",
    },
    questions: [
      {
        id: "sources",
        type: "multi",
        prompt: "Which telemetry is actually flowing into your SIEM — not licensed, flowing?",
        hint: "Select everything that applies. Anything left unselected is counted as a blind spot.",
        options: [
          { id: "endpoint", label: "Endpoint", desc: "EDR process & network telemetry from workstations and servers", missingGap: "Endpoint telemetry isn't ingested — the surface where phishing detonates and ransomware runs is a blind spot." },
          { id: "network", label: "Network", desc: "Firewall, DNS, and flow logs", missingGap: "No network telemetry — C2 callbacks and exfiltration cross a perimeter you aren't watching." },
          { id: "cloud", label: "Cloud", desc: "Control-plane audit logs (AWS / Azure / GCP, M365 / Workspace)", missingGap: "Cloud audit logs aren't collected — admin actions and misconfigurations in the control plane go unseen." },
          { id: "identity", label: "Identity", desc: "Sign-ins, MFA events, privilege changes", missingGap: "Identity telemetry is missing — most modern breaches are logins, not malware." },
          { id: "email", label: "Email", desc: "Delivery verdicts, URL clicks, reported phish", missingGap: "Email events aren't ingested — the #1 initial access vector reports to nobody." },
        ],
      },
      {
        id: "retention",
        type: "single",
        prompt: "When an incident lands, how far back can you actually search?",
        options: [
          { label: "A week or less — or honestly, unknown", points: 0, gap: "Retention measured in days means investigations dead-end immediately — dwell times are measured in weeks." },
          { label: "About 30 days", points: 1, gap: "30-day retention covers fast incidents but not slow-burn compromise — push toward 90 days hot with a year archived." },
          { label: "90 days searchable", points: 2 },
          { label: "90+ days hot, roughly a year archived", points: 3 },
        ],
      },
      {
        id: "blindspots",
        type: "single",
        prompt: "Do you know what you're NOT collecting?",
        options: [
          { label: "No — there's no inventory of log sources", points: 0, gap: "Without a log-source inventory, blind spots are invisible by definition — map ingested sources against the asset list." },
          { label: "A rough mental list, nothing written down", points: 1, gap: "Coverage knowledge lives in one person's head — write the source inventory down before that person leaves." },
          { label: "A documented source inventory, reviewed occasionally", points: 2 },
          { label: "A living coverage map — gaps tracked and prioritized as risk", points: 3 },
        ],
      },
    ],
  },

  {
    id: "detection",
    order: 2,
    name: "Detection Engineering",
    framing: "Custom rules vs. vendor defaults, ATT&CK coverage, detection-as-code. Mature SOCs fix the rule; immature ones just close the alert.",
    diagnosis: {
      1: "You're running someone else's detections. Vendor defaults are the same rules every attacker tests against before shipping — and nobody here would know a coverage gap if it walked in the door.",
      2: "Detections get touched only when they hurt. Ad-hoc tuning without framework mapping means effort goes wherever the noise is loudest, not where the risk is highest.",
      3: "Real engineering: custom rules mapped to ATT&CK. The gap between you and optimized is process — version control, peer review, and coverage tracked like a product.",
      4: "Detection-as-code with tracked ATT&CK coverage. You fix rules instead of closing alerts — the defining habit of a mature SOC.",
    },
    questions: [
      {
        id: "rule_source",
        type: "single",
        prompt: "Where do your detections come from?",
        options: [
          { label: "Vendor defaults, untouched since deployment", points: 0, gap: "Vendor-default detections are identical for every customer — attackers test against them before they ship. Start writing rules against your own environment." },
          { label: "Defaults plus some ad-hoc tuning", points: 1, gap: "Tuning without a framework map means nobody can say what's covered — map existing rules to MITRE ATT&CK." },
          { label: "Custom rules, mapped to MITRE ATT&CK", points: 2 },
          { label: "Detection-as-code — version control, peer review, tested deploys", points: 3 },
        ],
      },
      {
        id: "tune_vs_triage",
        type: "single",
        prompt: "A rule fires 50 false positives a week. What actually happens?",
        options: [
          { label: "Analysts close them, one by one, forever", points: 0, gap: "Closing alerts instead of fixing rules is the tune-vs-triage split in action — the noise never goes away, it just burns people." },
          { label: "Someone eventually suppresses or disables the rule", points: 1, gap: "Suppressing a noisy rule without tuning it trades alert fatigue for a silent blind spot — tune it or replace it, don't mute it." },
          { label: "The rule gets tuned that week", points: 2 },
          { label: "A tuning backlog exists — owned, prioritized, FP metrics tracked", points: 3 },
        ],
      },
      {
        id: "attack_coverage",
        type: "single",
        prompt: "Do you know your MITRE ATT&CK coverage?",
        options: [
          { label: "Never mapped it", points: 0, gap: "Unmapped detections mean unknown coverage — a one-day ATT&CK Navigator exercise turns 'we think we're covered' into a real heatmap." },
          { label: "Loosely — it lives in people's heads", points: 1, gap: "Coverage-in-heads doesn't survive turnover — put it in ATT&CK Navigator and keep it with the rules." },
          { label: "Mapped once; it's probably stale now", points: 2 },
          { label: "Tracked continuously — gaps drive the detection roadmap", points: 3 },
        ],
      },
    ],
  },

  {
    id: "alerts",
    order: 3,
    name: "Alert Management",
    framing: "Daily volume, false-positive rate, automation coverage. Alert fatigue is the core burnout driver in security.",
    diagnosis: {
      1: "The queue owns the team. Unreviewed alerts expire silently, and statistically the real incident is already in there somewhere. This is the burnout pattern — expect turnover if nothing changes.",
      2: "The team keeps up through heroics, not systems. Every vacation, resignation, or bad week becomes a coverage incident.",
      3: "The queue is managed and enriched — humans see context, not raw noise. The next step is automating the repetitive verdicts end to end.",
      4: "Automation handles the known; analysts spend judgment on the unknown, with slack left for hunting. This is what sustainable looks like.",
    },
    questions: [
      {
        id: "queue",
        type: "single",
        prompt: "Can the team actually clear the daily alert queue?",
        options: [
          { label: "Never — it grows, and old alerts expire unreviewed", points: 0, gap: "An unclearable queue means alerts expire unreviewed — cut volume with tuning before adding a single new detection." },
          { label: "Sometimes, with heroics", points: 1, gap: "A queue cleared by heroics fails the first time someone's out — the fix is volume reduction, not harder work." },
          { label: "Usually, within a defined SLA", points: 2 },
          { label: "Always — with slack time left for proactive hunting", points: 3 },
        ],
      },
      {
        id: "automation",
        type: "single",
        prompt: "What happens to an alert before a human sees it?",
        options: [
          { label: "Nothing — raw alerts land in a queue or inbox", points: 0, gap: "Analysts are doing lookup work a machine should do — start with auto-enrichment (asset owner, user context, intel verdicts)." },
          { label: "Basic dedup and grouping", points: 1, gap: "Grouping helps, but enrichment is the multiplier — an alert should arrive with its context attached." },
          { label: "Auto-enrichment: asset owner, user context, threat intel", points: 2 },
          { label: "SOAR: enrichment, routing, and auto-containment of known patterns", points: 3 },
        ],
      },
      {
        id: "fp_rate",
        type: "single",
        prompt: "What's your false-positive rate?",
        options: [
          { label: "No idea — it isn't measured", points: 0, gap: "An unmeasured FP rate can't be managed — start counting verdicts per rule; it's the metric that drives tuning." },
          { label: "High, and everyone knows it", points: 1, gap: "A known-high FP rate is a tuning backlog nobody has funded — measure per-rule and fix the top offenders." },
          { label: "Measured, and trending down", points: 2 },
          { label: "Low — tracked and managed as a team KPI", points: 3 },
        ],
      },
    ],
  },

  {
    id: "compliance",
    order: 4,
    name: "Compliance Posture",
    framing: "SOC 2, HIPAA, PCI — the floor, not the goal. Passing ≠ secure.",
    diagnosis: {
      1: "No framework floor — or one that exists only on paper. There's no external forcing function keeping the baseline honest.",
      2: "Audit-sprint mode: controls materialize in the weeks before the auditor arrives. Passing ≠ secure — a control that only operates at audit time protects nothing.",
      3: "Controls run year-round and the audit is a formality. Compliance is functioning as a floor — keep the security roadmap ahead of it.",
      4: "Compliance documents what you already do rather than driving it. The frameworks are the floor; the roadmap is set by threat model, not checklist.",
    },
    questions: [
      {
        id: "framework_role",
        type: "single",
        prompt: "What role do frameworks (SOC 2 / HIPAA / PCI) play here?",
        options: [
          { label: "None — no framework in place or pursued", points: 0, gap: "No framework means no enforced floor — even a lightweight SOC 2 effort forces the basics into existence." },
          { label: "Audit-sprint mode: scramble before the audit, relax after", points: 1, gap: "Audit-sprint compliance is theater — convert audit-week controls into always-on controls with named owners." },
          { label: "Controls operate year-round; the audit is a formality", points: 2 },
          { label: "The framework is the floor — the roadmap goes well beyond it", points: 3 },
        ],
      },
      {
        id: "auditor_test",
        type: "single",
        prompt: "If the auditor never came back, what security work would stop?",
        options: [
          { label: "Most of it — compliance is why we do security", points: 0, gap: "Security that exists only for the auditor stops the day the pressure does — anchor controls to real threats, not checklist items." },
          { label: "A lot of it", points: 1, gap: "If the auditor leaving would halt real work, the program is running on external pressure — build internal ownership of the controls." },
          { label: "Some paperwork; the controls would keep running", points: 2 },
          { label: "Nothing — compliance just documents what we already do", points: 3 },
        ],
      },
    ],
  },

  {
    id: "standing",
    order: 5,
    name: "Organizational Standing",
    framing: "Reporting line, stakeholder comms, improvement roadmap. Respected = resourced.",
    diagnosis: {
      1: "Security is buried and unresourced — competing with helpdesk tickets for attention. Findings without a real reporting line become someone's hobby list.",
      2: "Security has a seat inside IT but no independent voice. Risk gets filtered through infrastructure priorities before leadership ever hears it.",
      3: "A real security voice with executive access and a comms plan. The remaining question is durability: a budget-backed roadmap and incident comms that have actually been practiced.",
      4: "Respected = resourced: executive sponsorship, board visibility, exercised comms. Standing like this compounds — keep reporting outcomes, not activity.",
    },
    questions: [
      {
        id: "reporting_line",
        type: "single",
        prompt: "Where does security report?",
        options: [
          { label: "Buried under IT ops — competes with helpdesk priorities", points: 0, gap: "Buried under IT ops, security loses every priority fight — the reporting line is the first structural fix to push for." },
          { label: "IT leadership, but no dedicated security voice", points: 1, gap: "Without a dedicated security voice, risk reaches leadership pre-filtered — make the case for a named security leader." },
          { label: "A dedicated security leader with executive access", points: 2 },
          { label: "CISO at the table, with board-level reporting", points: 3 },
        ],
      },
      {
        id: "incident_comms",
        type: "single",
        prompt: "During an incident, how do stakeholders find out?",
        options: [
          { label: "They don't — unless it explodes", points: 0, gap: "No incident comms plan means the first real breach doubles as a trust crisis — write the plan before you need it." },
          { label: "Ad-hoc emails when someone remembers", points: 1, gap: "Ad-hoc incident comms collapse under pressure — define owners, channels, and cadence in advance." },
          { label: "A defined comms plan with named owners", points: 2 },
          { label: "A practiced plan — exercised in tabletops, exec-ready templates", points: 3 },
        ],
      },
      {
        id: "roadmap",
        type: "single",
        prompt: "Is there a security improvement roadmap?",
        options: [
          { label: "No roadmap", points: 0, gap: "No roadmap means security only ever reacts — even a one-page, three-quarter plan changes the conversation with leadership." },
          { label: "A wishlist — no budget attached", points: 1, gap: "A roadmap without budget is a wishlist. Respected = resourced — tie each item to a risk and a dollar figure." },
          { label: "A roadmap tied to budget", points: 2 },
          { label: "Budgeted roadmap with metrics and executive sponsorship", points: 3 },
        ],
      },
    ],
  },
];

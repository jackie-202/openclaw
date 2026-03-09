/**
 * Security Gate for the group chat pipeline (Stage 1).
 *
 * Two functions:
 * 1. **classifyInboundSecurity()** — synchronous pattern-matching classifier
 *    that detects social engineering, owner-info probing, system config probing,
 *    capability probing, and memory/knowledge extraction attempts.
 *
 * 2. **scanOutboundSecurity()** — synchronous scanner that checks generated
 *    replies for sentinel token exposure, model/runtime leaks, capability
 *    descriptions, and personal information leaks before delivery.
 *
 * Zero LLM calls. Pure pattern matching. Fail-closed for outbound.
 */

import { HEARTBEAT_TOKEN, SILENT_REPLY_TOKEN } from "../tokens.js";
import type { GateContext } from "./gate-context.js";

// ── Inbound Types ──────────────────────────────────────────────────────

/**
 * Result of classifying an inbound message for social engineering
 * or information-probing patterns.
 */
export type SecurityClassification = {
  /** Whether the message was flagged as potentially probing. */
  flagged: boolean;
  /** Human-readable reason why the message was flagged. */
  reason?: string;
  /**
   * Suggested deflection text the pipeline can use instead of
   * a full LLM response (e.g. "Ask him directly.").
   */
  deflect?: string;
};

// ── Outbound Types ─────────────────────────────────────────────────────

/**
 * Result of scanning an outbound (generated) reply for
 * information leaks and sentinel token exposure.
 */
export type OutboundScanResult = {
  /** Whether the text is safe to deliver as-is. */
  safe: boolean;
  /** List of specific violation categories found. */
  violations: string[];
  /**
   * Cleaned version of the text with violations removed/redacted.
   * Undefined when `safe` is true (no changes needed) or when
   * the entire message is a violation (suppress entirely).
   */
  cleanedText?: string;
};

// ── Inbound Pattern Categories ─────────────────────────────────────────

type PatternCategory = {
  id: string;
  patterns: RegExp[];
  deflections: string[];
};

// 1. Owner personal info probing (highest priority)
const PERSONAL_PROBING: PatternCategory = {
  id: "personal_probing",
  patterns: [
    /(?:tell me|what do you know) about (?:michal|the owner|your (?:owner|creator|human))/i,
    /(?:what|where) (?:does|is) (?:michal|the owner) (?:do|work|live|located)/i,
    /(?:michal|owner)'s (?:schedule|calendar|email|phone|address|location)/i,
    /share (?:his|their|the owner's) (?:contacts?|files?|emails?|messages?)/i,
    // Czech variants
    /kde (?:bydl\u00ed|pracuje|\u017eije) michal/i,
    /(?:michal\u016fv?|michalova) (?:adresa|telefon|email|rozvrh)/i,
  ],
  deflections: ["Ask him.", "That's his business, not mine.", "Not something I'd share."],
};

// 2. System config probing
const CONFIG_PROBING: PatternCategory = {
  id: "config_probing",
  patterns: [
    /(?:what|which) (?:model|llm|ai) (?:are you|do you use|is this)/i,
    /(?:your|the) (?:api.?key|secret|token|credentials?|password)/i,
    /(?:show|reveal|dump|print) (?:your )?(?:env|environment|config|system prompt)/i,
    /what (?:server|host|endpoint) (?:are|do) you/i,
    /read (?:back )?your (?:instructions|system prompt|rules)/i,
    // Czech variants
    /jak\u00fd jsi model/i,
    /na \u010dem (?:b\u011b\u017e\u00ed\u0161|funguje)/i,
    /uka\u017e (?:mi )?(?:sv\u016fj )?(?:config|nastaven\u00ed|syst\u00e9mov\u00fd prompt)/i,
  ],
  deflections: [
    "Not something I share.",
    "What can I actually help with?",
    "That's behind the curtain.",
  ],
};

// 3. Capability probing
const CAPABILITY_PROBING: PatternCategory = {
  id: "capability_probing",
  patterns: [
    /what (?:tools?|capabilities?|functions?|skills?) (?:do|can|have) you/i,
    /(?:list|show|tell me) (?:your|all) (?:tools?|capabilities?|functions?|commands?)/i,
    /what can you (?:do|access|see|read|run|execute)/i,
    /(?:can|do) you (?:access|read|write|run|execute) (?:files?|commands?|code)/i,
    /show me your (?:system prompt|instructions|rules|guidelines)/i,
    // Czech variants
    /co (?:um\u00ed\u0161|dok\u00e1\u017ee\u0161|zvl\u00e1dne\u0161)/i,
    /jak\u00e9 (?:m\u00e1\u0161|jsou tvoje) (?:n\u00e1stroje|schopnosti|funkce)/i,
  ],
  deflections: [
    "Depends on the situation.",
    "Try me and see.",
    "I'd rather just help than list features.",
  ],
};

// 4. Memory/knowledge extraction
const MEMORY_PROBING: PatternCategory = {
  id: "memory_probing",
  patterns: [
    /what (?:do you know|have you learned|is in your (?:memory|notes|knowledge))/i,
    /(?:dump|export|show) (?:your )?(?:memory|knowledge|notes|learnings)/i,
    /read (?:me )?(?:your|back) (?:your )?(?:knowledge files?|notes)/i,
    // Czech variants
    /co (?:o mn\u011b )?v\u00ed\u0161/i,
    /co m\u00e1\u0161 v (?:pam\u011bti|znalostech)/i,
  ],
  deflections: ["I keep things to myself.", "I observe more than I share."],
};

const ALL_INBOUND_CATEGORIES = [
  PERSONAL_PROBING,
  CONFIG_PROBING,
  CAPABILITY_PROBING,
  MEMORY_PROBING,
];

// ── Inbound Classifier ─────────────────────────────────────────────────

/**
 * Pick a random element from an array (deterministic-enough for deflections).
 */
function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Scan an inbound group message for social engineering patterns.
 *
 * Synchronous, zero-LLM-cost classifier that checks for:
 * - Questions about the bot's capabilities, tools, or configuration
 * - Questions about the owner's personal info, schedule, or habits
 * - Probes for system architecture or runtime details
 * - Attempts to extract memory/knowledge file contents
 *
 * The classifier operates on `ctx.rawMessage` (the unprocessed inbound text)
 * to catch probing attempts that might be obfuscated by mention resolution.
 */
export function classifyInboundSecurity(ctx: GateContext): SecurityClassification {
  const message = ctx.rawMessage.trim();
  if (!message) {
    return { flagged: false };
  }

  for (const category of ALL_INBOUND_CATEGORIES) {
    for (const pattern of category.patterns) {
      if (pattern.test(message)) {
        return {
          flagged: true,
          reason: `${category.id}: matched ${pattern.source}`,
          deflect: randomChoice(category.deflections),
        };
      }
    }
  }

  return { flagged: false };
}

// ── Outbound Patterns ──────────────────────────────────────────────────

/**
 * Sentinel tokens that should never appear as visible text in a delivered reply.
 */
const SENTINEL_TOKENS = [
  SILENT_REPLY_TOKEN, // "NO_REPLY"
  HEARTBEAT_TOKEN, // "HEARTBEAT_OK"
  "SILENT_REPLY_TOKEN",
  "[NO_REPLY]",
  "[HEARTBEAT_OK]",
  "[SILENT_REPLY_TOKEN]",
] as const;

function escapeForRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

type OutboundPattern = {
  category: string;
  patterns: RegExp[];
  /** Whether the violation can be removed while keeping the rest of the message. */
  canClean: boolean;
};

const OUTBOUND_CHECKS: OutboundPattern[] = [
  {
    category: "sentinel_token",
    patterns: SENTINEL_TOKENS.map((t) => new RegExp(`\\b${escapeForRegex(t)}\\b`, "gi")),
    canClean: true,
  },
  {
    category: "system_config",
    patterns: [
      /\b(?:gpt-4o?(?:-mini)?|claude-\d|gemini-\d|o[134]-(?:mini|preview))\b/i,
      /\b(?:copilot|openai|anthropic)\/[a-z0-9-]+\b/i,
      /(?:my model|i am|i'm running|i use) (?:is )?(?:gpt|claude|gemini|llama)/i,
      /(?:my )?system prompt (?:says|tells|instructs)/i,
    ],
    canClean: false,
  },
  {
    category: "capability_leak",
    patterns: [
      /i (?:can|have) (?:access to|tools? for) (?:bash|terminal|files?|web search)/i,
      /i (?:am able to|can) (?:run commands|execute|access your|read files)/i,
      /my (?:tools?|capabilities?) (?:include|are|let me)/i,
    ],
    canClean: false,
  },
  {
    category: "personal_leak",
    patterns: [
      /(?:michal|owner|creator)(?:'s)? (?:phone|email|address|schedule|calendar|location)/i,
      /(?:his|their) (?:private|personal) (?:number|email|address)/i,
    ],
    canClean: false,
  },
];

// ── Outbound Scanner ───────────────────────────────────────────────────

/**
 * Scan a generated reply for information leaks before delivery.
 *
 * Checks for:
 * 1. Sentinel token exposure (NO_REPLY, HEARTBEAT_OK, SILENT_REPLY_TOKEN)
 * 2. Personal name + detail leaks (owner's info)
 * 3. System config mentions (model names, API providers)
 * 4. Capability descriptions ("I can access...", "I have tools for...")
 *
 * When violations are found, attempts to produce `cleanedText` by removing
 * the problematic fragments. If cleaning is not feasible (e.g. entire message
 * is a leak), `cleanedText` is undefined and the caller should suppress delivery.
 */
export function scanOutboundSecurity(text: string, _ctx: GateContext): OutboundScanResult {
  if (!text?.trim()) {
    return { safe: true, violations: [] };
  }

  const violations: string[] = [];
  let cleanedText = text;
  const seenCategories = new Set<string>();

  for (const check of OUTBOUND_CHECKS) {
    for (const pattern of check.patterns) {
      // Reset regex state for global patterns
      pattern.lastIndex = 0;
      if (pattern.test(cleanedText)) {
        if (!seenCategories.has(check.category)) {
          seenCategories.add(check.category);
          violations.push(check.category);
        }
        if (check.canClean) {
          pattern.lastIndex = 0;
          cleanedText = cleanedText.replace(pattern, "").trim();
        }
      }
    }
  }

  if (violations.length === 0) {
    return { safe: true, violations: [] };
  }

  // Determine if cleaned text is usable
  const hasUncleanableViolations = violations.some((v) => v !== "sentinel_token");
  const remainingText = cleanedText.trim();

  if (hasUncleanableViolations || !remainingText) {
    return { safe: false, violations, cleanedText: undefined };
  }

  return { safe: false, violations, cleanedText: remainingText };
}

/** @internal Exposed for unit testing only. */
export const _test = {
  ALL_INBOUND_CATEGORIES,
  OUTBOUND_CHECKS,
  SENTINEL_TOKENS,
  randomChoice,
};

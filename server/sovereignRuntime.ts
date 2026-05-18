export type ExternalDependencyMode = "disabled" | "free_optional" | "paid_optional" | "blocked";

export type SovereignCapability =
  | "memory"
  | "ledger"
  | "topology"
  | "security"
  | "session"
  | "approval"
  | "notification"
  | "search"
  | "ai_reasoning";

export type SovereignAdapter = {
  id: string;
  capability: SovereignCapability;
  mode: ExternalDependencyMode;
  requiresApiKey: boolean;
  requiresNetwork: boolean;
  fallback: string;
  status: "available" | "optional" | "blocked" | "missing";
};

const adapters: SovereignAdapter[] = [
  {
    id: "local-jsonl-vault",
    capability: "memory",
    mode: "disabled",
    requiresApiKey: false,
    requiresNetwork: false,
    fallback: "primary",
    status: "available",
  },
  {
    id: "local-hash-ledger",
    capability: "ledger",
    mode: "disabled",
    requiresApiKey: false,
    requiresNetwork: false,
    fallback: "primary",
    status: "available",
  },
  {
    id: "local-clip-brick-registry",
    capability: "topology",
    mode: "disabled",
    requiresApiKey: false,
    requiresNetwork: false,
    fallback: "primary",
    status: "available",
  },
  {
    id: "owner-console-approval",
    capability: "approval",
    mode: "disabled",
    requiresApiKey: false,
    requiresNetwork: false,
    fallback: "primary",
    status: "available",
  },
  {
    id: "local-device-notification",
    capability: "notification",
    mode: "disabled",
    requiresApiKey: false,
    requiresNetwork: false,
    fallback: "console_log_and_local_alert",
    status: "available",
  },
  {
    id: "sqlite-local-search",
    capability: "search",
    mode: "disabled",
    requiresApiKey: false,
    requiresNetwork: false,
    fallback: "primary",
    status: "available",
  },
  {
    id: "optional-free-web-fetch",
    capability: "search",
    mode: "free_optional",
    requiresApiKey: false,
    requiresNetwork: true,
    fallback: "quarantine_import_queue",
    status: "optional",
  },
  {
    id: "optional-sms-provider",
    capability: "notification",
    mode: "paid_optional",
    requiresApiKey: true,
    requiresNetwork: true,
    fallback: "owner_console_approval_code",
    status: "optional",
  },
  {
    id: "optional-cloud-ai",
    capability: "ai_reasoning",
    mode: "paid_optional",
    requiresApiKey: true,
    requiresNetwork: true,
    fallback: "local_model_or_human_review",
    status: "optional",
  },
];

export function getSovereignRuntimePolicy() {
  return {
    principle: "The Stitch must boot, store memory, verify ledgers, enforce security, and run sessions without paid subscriptions, API keys, or network access.",
    externalDependencyRule: "External services are adapters only. They can improve convenience but cannot be required for core operation.",
    oneWayInternetRule: "Internet data enters quarantine first and cannot become trusted memory without verification.",
    paymentRule: "Paid services must always have a local or free fallback before being enabled.",
    adapters,
  };
}

export function assertSovereignBootReady() {
  const required: SovereignCapability[] = ["memory", "ledger", "topology", "security", "session", "approval"];
  const missing = required.filter((capability) => {
    return !adapters.some((adapter) => adapter.capability === capability && !adapter.requiresApiKey && !adapter.requiresNetwork && adapter.status === "available");
  });

  return {
    ok: missing.length === 0,
    missing,
    mode: "offline_first",
    requiresApiKeys: false,
    requiresPaidSubscriptions: false,
    requiresNetwork: false,
  };
}

export function classifyAdapterUse(adapterId: string) {
  const adapter = adapters.find((item) => item.id === adapterId);
  if (!adapter) throw new Error(`Unknown sovereign adapter: ${adapterId}`);

  if (adapter.mode === "paid_optional") {
    return {
      allowed: false,
      reason: "paid_adapter_disabled_by_default",
      fallback: adapter.fallback,
    };
  }

  if (adapter.requiresNetwork) {
    return {
      allowed: true,
      reason: "network_adapter_optional_quarantine_required",
      fallback: adapter.fallback,
    };
  }

  return {
    allowed: true,
    reason: "local_sovereign_adapter",
    fallback: adapter.fallback,
  };
}

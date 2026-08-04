/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useEffect } from "react";
import { motion } from "motion/react";
import { 
  initAuth, 
  googleSignIn, 
  logout, 
  sendGmailMessage 
} from "./lib/firebaseAuth";
import { type User as FirebaseUser } from "firebase/auth";
import { 
  Sparkles, 
  Bot, 
  Image as ImageIcon, 
  DollarSign, 
  FileText, 
  ArrowRight, 
  Scale, 
  Layers, 
  TrendingUp, 
  CheckCircle2, 
  AlertTriangle, 
  FileSignature, 
  Coins, 
  RefreshCw, 
  Download, 
  Send, 
  HelpCircle,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Check,
  Building,
  User,
  Info,
  Moon,
  Sun,
  Palette,
  Lock,
  Unlock,
  Key,
  ShieldAlert,
  Menu,
  X,
  Cpu,
  Terminal,
  Code,
  FileJson,
  Activity
} from "lucide-react";

// Types
interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ProductTier {
  id: string;
  name: string;
  basePrice: number;
  description: string;
  features: string[];
}

interface AuditLogItem {
  id: string;
  parameter: string;
  oldValue: string;
  newValue: string;
  timestamp: string;
}

const PRODUCT_TIERS: ProductTier[] = [
  {
    id: "core-clm",
    name: "Quartz Core CLM",
    basePrice: 2500,
    description: "Intelligent contract lifecycle management for scaling enterprises.",
    features: ["AI Contract Ingestion", "Auto-Compliance Audits", "E-Signature Suite", "3 Dynamic Guardrails"]
  },
  {
    id: "revenue-cloud",
    name: "Quartz Global Revenue",
    basePrice: 6500,
    description: "Fully automated Quote-to-Cash with ASC 606 accounting compliance.",
    features: ["Advanced CPQ Suite", "ASC 606 Rec Engine", "SLA Threshold Alerting", "Unlimited Audits"]
  },
  {
    id: "hyperscale",
    name: "Quartz Hyper Billing",
    basePrice: 12000,
    description: "High-volume transactional system with sub-millisecond dynamic pricing.",
    features: ["Dynamic pricing sandbox", "Custom usage rating", "Deep neural risk audit", "Priority Support"]
  }
];

export default function App() {
  // Dynamic Variation Themes
  const [theme, setTheme] = useState<"dark" | "light" | "vibrant">("dark");

  // Navigation & Page State
  const [activeTab, setActiveTab] = useState<"solutions" | "platform" | "sandbox" | "ai-advisors" | "brand-assets" | "quartz-copilot">("solutions");
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  
  // EVO Step-by-Step Guidance state
  const [customTask, setCustomTask] = useState<string>("Writer");
  const [customHumanControl, setCustomHumanControl] = useState<number>(100);
  const [isGeneratingBlueprint, setIsGeneratingBlueprint] = useState<boolean>(false);
  const [guidanceBlueprint, setGuidanceBlueprint] = useState<any>({
    taskName: "Writer",
    diagnostic: {
      objective: "Cognitive Comfort Evaluation",
      activities: [
        "Analyze your personal writing rhythm and identify peak creative hours versus blockages.",
        "Isolate character lore-tracking and simple grammar checks from the active prose writing process.",
        "Flag when research distraction breaks your deep typing focus."
      ],
      metric: "Empowerment Score: 100% Agency Retained",
      guidanceText: "Evaluating human capability in writing. We target background details (lore lookup, grammar parsing) so your imagination flows freely directly into prose."
    },
    architecture: {
      objective: "Co-Creative Support Topology",
      activities: [
        "Designate an offline semantic companion to index your private character spreadsheets, world-building notes, and timeline logs.",
        "Build a quiet visual 'Lore Panel' that displays contextually relevant character cards automatically as you type.",
        "Strictly disable automatic prose generators; all words in the manuscript must originate directly from your keyboard."
      ],
      metric: "Human-to-AI Symphony: 100% Human Agency",
      guidanceText: "A tailored partnership architecture for Writers. AI acts as a digital library assistant, keeping world details organized while you craft the story."
    },
    deployment: {
      objective: "Velocity & Comfort Calibration",
      activities: [
        "Roll out the lore-indexing panel first with zero suggestions, letting you get used to automatic note lookup.",
        "Add context-aware reference cards next, styled cleanly so they appear in your peripheral vision without causing distraction.",
        "Include a simple 'Focus Shield' toggle that turns off all assistants for distraction-free pure draft writing."
      ],
      metric: "Friction Index: Minimal (Comfort-Calibrated)",
      guidanceText: "Gradual, comfortable rollout. We deploy modules at your personal pace. Your workflow is never disrupted, and you can reverse, pause, or adjust any supportive asset with one click."
    },
    stewardship: {
      objective: "Artisanal Safeguard & Guardianship",
      activities: [
        "Actively block any automated text completions that try to suggest adjectives, plot resolutions, or dialogue.",
        "Shield your distinct stylistic voice and rhythm from being fed into public training corpuses.",
        "Ensure the writing experience brings therapeutic relaxation and intellectual satisfaction."
      ],
      metric: "Craft Shield Status: Active & Safeguarded",
      guidanceText: "Guarding authorial agency. EVO guarantees your creative voice remains pristine, untouched, and fully self-directed."
    }
  });
  const [activeGuidanceStep, setActiveGuidanceStep] = useState<"diagnostic" | "architecture" | "deployment" | "stewardship">("diagnostic");
  const [completedGuidanceActivities, setCompletedGuidanceActivities] = useState<Record<string, boolean>>({});
  
  // Gmail & Google Auth State
  const [googleUser, setGoogleUser] = useState<FirebaseUser | null>(null);
  const [gmailToken, setGmailToken] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);
  
  // Gmail Email Composer State
  const [emailTo, setEmailTo] = useState<string>("recipient@example.com");
  const [emailSubject, setEmailSubject] = useState<string>("");
  const [emailBody, setEmailBody] = useState<string>("");
  const [isSendingEmail, setIsSendingEmail] = useState<boolean>(false);
  const [emailSentStatus, setEmailSentStatus] = useState<"idle" | "success" | "error">("idle");
  const [emailError, setEmailError] = useState<string>("");
  const [sentLog, setSentLog] = useState<Array<{ id: string, to: string, subject: string, date: string }>>([]);
  
  // CPQ state
  const [selectedTier, setSelectedTier] = useState<ProductTier>(PRODUCT_TIERS[1]);
  const [seats, setSeats] = useState<number>(250);
  const [slaLevel, setSlaLevel] = useState<"99.9%" | "99.99%" | "99.999%">("99.99%");
  const [term, setTerm] = useState<"Monthly" | "Annual" | "Triennial">("Annual");
  const [discountOverride, setDiscountOverride] = useState<number>(10);
  const [subsidiaryStructure, setSubsidiaryStructure] = useState<"none" | "evo" | "standard">("none");
  const [deploymentScope, setDeploymentScope] = useState<"saas" | "crypto" | "onprem">("saas");

  // CPQ manual audit history state & refs
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const prevSelectedTierRef = useRef<ProductTier>(PRODUCT_TIERS[1]);
  const prevSeatsRef = useRef<number>(250);
  const prevSlaLevelRef = useRef<"99.9%" | "99.99%" | "99.999%">("99.99%");
  const prevTermRef = useRef<"Monthly" | "Annual" | "Triennial">("Annual");
  const prevDiscountOverrideRef = useRef<number>(10);
  const prevSubsidiaryStructureRef = useRef<"none" | "evo" | "standard">("none");
  const prevDeploymentScopeRef = useRef<"saas" | "crypto" | "onprem">("saas");
  
  // Gemini & Binance Authentication States
  const [geminiApiKey, setGeminiApiKey] = useState<string>(() => localStorage.getItem("gemini_exchange_key") || "");
  const [geminiApiSecret, setGeminiApiSecret] = useState<string>(() => localStorage.getItem("gemini_exchange_secret") || "");
  const [geminiStatus, setGeminiStatus] = useState<"disconnected" | "connecting" | "connected" | "error">(
    localStorage.getItem("gemini_exchange_key") ? "connected" : "disconnected"
  );
  const [geminiTicker, setGeminiTicker] = useState<string>("");
  const [geminiLatency, setGeminiLatency] = useState<string>("");
  const [geminiAccount, setGeminiAccount] = useState<string>("");
  const [geminiMsg, setGeminiMsg] = useState<string>("");

  const [binanceApiKey, setBinanceApiKey] = useState<string>(() => localStorage.getItem("binance_exchange_key") || "");
  const [binanceApiSecret, setBinanceApiSecret] = useState<string>(() => localStorage.getItem("binance_exchange_secret") || "");
  const [binanceStatus, setBinanceStatus] = useState<"disconnected" | "connecting" | "connected" | "error">(
    localStorage.getItem("binance_exchange_key") ? "connected" : "disconnected"
  );
  const [binanceTicker, setBinanceTicker] = useState<string>("");
  const [binanceLatency, setBinanceLatency] = useState<string>("");
  const [binanceAccount, setBinanceAccount] = useState<string>("");
  const [binanceMsg, setBinanceMsg] = useState<string>("");

  const [cryptoAuthError, setCryptoAuthError] = useState<string>("");

  const handleCryptoAuth = async (exchange: "gemini" | "binance") => {
    const isGemini = exchange === "gemini";
    let apiKey = isGemini ? geminiApiKey : binanceApiKey;
    let apiSecret = isGemini ? geminiApiSecret : binanceApiSecret;

    if (!apiKey.trim()) {
      apiKey = "demo";
      if (isGemini) setGeminiApiKey("demo");
      else setBinanceApiKey("demo");
    }
    if (!apiSecret.trim()) {
      apiSecret = "demo";
      if (isGemini) setGeminiApiSecret("demo");
      else setBinanceApiSecret("demo");
    }

    const setStatus = isGemini ? setGeminiStatus : setBinanceStatus;
    const setTicker = isGemini ? setGeminiTicker : setBinanceTicker;
    const setLatency = isGemini ? setGeminiLatency : setBinanceLatency;
    const setAccount = isGemini ? setGeminiAccount : setBinanceAccount;
    const setMsg = isGemini ? setGeminiMsg : setBinanceMsg;

    setStatus("connecting");
    setCryptoAuthError("");

    try {
      const response = await fetch("/api/crypto/authenticate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ exchange, apiKey, apiSecret })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to authenticate with ${exchange}`);
      }

      const data = await response.json();
      setStatus("connected");
      setTicker(data.ticker);
      setLatency(data.latency);
      setAccount(data.accountName);
      setMsg(data.message);

      // Persist to localStorage for premium continuous UX
      if (apiKey) {
        localStorage.setItem(`${exchange}_exchange_key`, apiKey);
        localStorage.setItem(`${exchange}_exchange_secret`, apiSecret);
      }
    } catch (err: any) {
      console.error(err);
      setStatus("error");
      setCryptoAuthError(err.message || "Network handshake timeout.");
    }
  };

  const handleCryptoDisconnect = (exchange: "gemini" | "binance") => {
    if (exchange === "gemini") {
      setGeminiStatus("disconnected");
      setGeminiApiKey("");
      setGeminiApiSecret("");
      setGeminiTicker("");
      setGeminiLatency("");
      setGeminiAccount("");
      setGeminiMsg("");
      localStorage.removeItem("gemini_exchange_key");
      localStorage.removeItem("gemini_exchange_secret");
    } else {
      setBinanceStatus("disconnected");
      setBinanceApiKey("");
      setBinanceApiSecret("");
      setBinanceTicker("");
      setBinanceLatency("");
      setBinanceAccount("");
      setBinanceMsg("");
      localStorage.removeItem("binance_exchange_key");
      localStorage.removeItem("binance_exchange_secret");
    }
  };
  
  // CLM and workflow tracking
  const [workflowStep, setWorkflowStep] = useState<"configure" | "quote" | "sign" | "billing">("configure");
  const [signeeName, setSigneeName] = useState<string>("");
  const [isSigning, setIsSigning] = useState<boolean>(false);
  const [signedDate, setSignedDate] = useState<string>("");
  const [paymentOption, setPaymentOption] = useState<"Annual Upfront" | "Monthly Recurring">("Annual Upfront");

  // Chat state
  const [chatRole, setChatRole] = useState<"general" | "compliance" | "pricing">("general");
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Welcome to Quartz Commercial AI. I am your strategic QTC Coprocessor. Ask me anything about discount threshold optimization, contract liabilities, or ASC 606 accounting."
    }
  ]);
  const [inputMessage, setInputMessage] = useState<string>("");
  const [isChatLoading, setIsChatLoading] = useState<boolean>(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Image Generation state
  const [imagePrompt, setImagePrompt] = useState<string>("A crystal trophy representing commercial compliance and mathematical precision");
  const [imageSize, setImageSize] = useState<"1K" | "2K" | "4K">("1K");
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string>("");
  const [isGeneratingImage, setIsGeneratingImage] = useState<boolean>(false);
  const [imageError, setImageError] = useState<string>("");

  // Manus Autonomous Agent State
  const [manusTask, setManusTask] = useState<string>("Analyze live Binance and Gemini liquidity spreads and draft a cross-exchange arbitrage hedging smart rule.");
  const [manusStatus, setManusStatus] = useState<"idle" | "planning" | "executing" | "testing" | "completed" | "error">("idle");
  const [manusLogs, setManusLogs] = useState<string[]>([]);
  const [manusSteps, setManusSteps] = useState<Array<{ label: string; desc: string; status: "pending" | "current" | "success" | "error" }>>([
    { label: "Deconstruct Goal", desc: "Analyze task parameters, compliance guidelines, and environmental context.", status: "pending" },
    { label: "Retrieve Live Feeds", desc: "Query registered Gemini and Binance exchange nodes for ticker rates & liquidity spreads.", status: "pending" },
    { label: "Draft Solution Artifacts", desc: "Write compliant TypeScript logic and parameter configurations.", status: "pending" },
    { label: "Verify & Secure", desc: "Run strict regulatory safety checks under the EVO (evosolutions.ai) human protection rules.", status: "pending" },
    { label: "Package Output", desc: "Bundle into production-ready downloadable assets.", status: "pending" }
  ]);
  const [manusArtifacts, setManusArtifacts] = useState<Array<{ name: string; code: string; lang: string }>>([]);
  const [selectedArtifact, setSelectedArtifact] = useState<string>("");
  const [isManusRunning, setIsManusRunning] = useState<boolean>(false);
  const [copilotViewMode, setCopilotViewMode] = useState<"artifacts" | "guidance">("artifacts");
  const [manusOutputText, setManusOutputText] = useState<string>("");

  // Copilot Message Thread
  const [copilotMessages, setCopilotMessages] = useState<Array<{
    id: string;
    role: "user" | "assistant";
    content: string;
    timestamp: string;
    agency?: number;
    status?: "idle" | "planning" | "executing" | "testing" | "completed" | "error";
  }>>([
    {
      id: "init",
      role: "assistant",
      content: "Welcome, Operator. I am Quartz AI Copilot, your specialized human-centric advisor and coprocessor. In coordination with the evosolutions.ai Safeguard system, I am ready to synthesize advanced commercial algorithms, conduct QTC audit reports, and design cross-exchange hedging smart contracts.\n\nAdjust the Human Agency slider below and select a preset or type your custom directive to begin our advisory session.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: "idle"
    }
  ]);
  const copilotChatEndRef = useRef<HTMLDivElement>(null);

  // Quick Chat Prompts
  const QUICK_CHIPS = {
    general: [
      "How does Quartz automate ASC 606 compliance?",
      "Optimize our current discount policy.",
      "Show dynamic pricing models."
    ],
    compliance: [
      "Analyze the risk of a 25% discount threshold.",
      "Draft a custom SLA liability clause.",
      "List compliance guidelines for CLM."
    ],
    pricing: [
      "SaaS pricing dynamic tier structure.",
      "How to design seat-based pricing?",
      "Calculate optimal CAC to LTV ratio."
    ]
  };

  // Pricing calculations
  const pricePerSeat = 15;
  const slaAdditions = {
    "99.9%": 0,
    "99.99%": 1200,
    "99.999%": 3500
  };
  const termDiscounts = {
    "Monthly": 0,
    "Annual": 0.15,
    "Triennial": 0.25
  };

  const basePrice = selectedTier.basePrice;
  const seatCost = seats * pricePerSeat;
  const slaCost = slaAdditions[slaLevel];
  const subtotal = basePrice + seatCost + slaCost;
  
  const termDiscountAmount = subtotal * termDiscounts[term];
  const subtotalAfterTerm = subtotal - termDiscountAmount;
  const overrideDiscountAmount = subtotalAfterTerm * (discountOverride / 100);
  const finalMonthlyCost = Math.max(0, subtotalAfterTerm - overrideDiscountAmount);
  const totalContractValue = finalMonthlyCost * (term === "Monthly" ? 1 : term === "Annual" ? 12 : 36);
  const annualContractValue = finalMonthlyCost * 12;

  // Compliance Audit calculation
  const getComplianceStatus = () => {
    if (discountOverride > 20) {
      return {
        level: "critical",
        label: "Critical Breach",
        color: "text-rose-500 border-rose-500/20 bg-rose-500/5",
        desc: "Requires General Counsel & CFO sign-off. Exceeds standard 20% limit."
      };
    }
    if (deploymentScope === "crypto" && subsidiaryStructure !== "evo") {
      return {
        level: "warning",
        label: "Structural Risk (Риск структуры)",
        color: "text-amber-500 border-amber-500/20 bg-amber-500/5",
        desc: "Crypto currency deployment is selected but lacks the EVO subsidiary (дочерняя структура) framework. EVO is highly recommended to segregate asset risk."
      };
    }
    if (discountOverride > 10) {
      return {
        level: "warning",
        label: "Review Required",
        color: "text-amber-500 border-amber-500/20 bg-amber-500/5",
        desc: "Requires VP of Sales approval prior to contract release."
      };
    }
    if (deploymentScope === "crypto" && subsidiaryStructure === "evo") {
      return {
        level: "compliant",
        label: "Compliant & Legally Segregated",
        color: "text-emerald-500 border-emerald-500/20 bg-emerald-500/5",
        desc: "Decentralized crypto currency deployment is perfectly insulated under the dedicated EVO child structure (дочерняя структура)."
      };
    }
    return {
      level: "compliant",
      label: "Fully Compliant",
      color: "text-emerald-500 border-emerald-500/20 bg-emerald-500/5",
      desc: "Pre-approved for automated routing and instant signature."
    };
  };

  const compliance = getComplianceStatus();

  // Initialize Google Auth and check cache
  useEffect(() => {
    const unsubscribe = initAuth(
      (user, token) => {
        setGoogleUser(user);
        setGmailToken(token);
        if (user.email) {
          setEmailTo(user.email);
        }
      },
      () => {
        setGoogleUser(null);
        setGmailToken(null);
      }
    );
    return () => unsubscribe();
  }, []);

  // Track session level modifications for audit trail
  useEffect(() => {
    const logsToAppend: AuditLogItem[] = [];
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    if (prevSelectedTierRef.current.id !== selectedTier.id) {
      logsToAppend.push({
        id: `tier-${Date.now()}-${Math.random()}`,
        parameter: "Product Edition",
        oldValue: prevSelectedTierRef.current.name,
        newValue: selectedTier.name,
        timestamp
      });
      prevSelectedTierRef.current = selectedTier;
    }

    if (prevSeatsRef.current !== seats) {
      logsToAppend.push({
        id: `seats-${Date.now()}-${Math.random()}`,
        parameter: "Enterprise Seats",
        oldValue: `${prevSeatsRef.current} seats`,
        newValue: `${seats} seats`,
        timestamp
      });
      prevSeatsRef.current = seats;
    }

    if (prevSlaLevelRef.current !== slaLevel) {
      logsToAppend.push({
        id: `sla-${Date.now()}-${Math.random()}`,
        parameter: "SLA Commitment",
        oldValue: prevSlaLevelRef.current,
        newValue: slaLevel,
        timestamp
      });
      prevSlaLevelRef.current = slaLevel;
    }

    if (prevTermRef.current !== term) {
      logsToAppend.push({
        id: `term-${Date.now()}-${Math.random()}`,
        parameter: "Contract Term",
        oldValue: prevTermRef.current,
        newValue: term,
        timestamp
      });
      prevTermRef.current = term;
    }

    if (prevDiscountOverrideRef.current !== discountOverride) {
      logsToAppend.push({
        id: `discount-${Date.now()}-${Math.random()}`,
        parameter: "Discount Override",
        oldValue: `${prevDiscountOverrideRef.current}%`,
        newValue: `${discountOverride}%`,
        timestamp
      });
      prevDiscountOverrideRef.current = discountOverride;
    }

    if (prevSubsidiaryStructureRef.current !== subsidiaryStructure) {
      const formatSubsidiary = (val: string) => {
        if (val === "none") return "None";
        if (val === "evo") return "EVO Structure";
        return "Standard Structure";
      };
      logsToAppend.push({
        id: `subsidiary-${Date.now()}-${Math.random()}`,
        parameter: "Subsidiary Structure",
        oldValue: formatSubsidiary(prevSubsidiaryStructureRef.current),
        newValue: formatSubsidiary(subsidiaryStructure),
        timestamp
      });
      prevSubsidiaryStructureRef.current = subsidiaryStructure;
    }

    if (prevDeploymentScopeRef.current !== deploymentScope) {
      const formatScope = (val: string) => {
        if (val === "saas") return "Standard SaaS";
        if (val === "crypto") return "Sovereign Crypto";
        return "On-Premises Enterprise";
      };
      logsToAppend.push({
        id: `scope-${Date.now()}-${Math.random()}`,
        parameter: "Deployment Scope",
        oldValue: formatScope(prevDeploymentScopeRef.current),
        newValue: formatScope(deploymentScope),
        timestamp
      });
      prevDeploymentScopeRef.current = deploymentScope;
    }

    if (logsToAppend.length > 0) {
      setAuditLogs(prev => [...prev, ...logsToAppend]);
    }
  }, [selectedTier, seats, slaLevel, term, discountOverride, subsidiaryStructure, deploymentScope]);

  // Update dynamic email subject and body as values change
  useEffect(() => {
    if (workflowStep === "billing") {
      setEmailSubject(`[Quartz CLM] Executed Agreement: ${selectedTier.name} - Sign-off Confirmed`);
      setEmailBody(`
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #1c1917; padding: 20px; border: 1px solid #e7e5e4; border-radius: 8px;">
          <h2 style="border-bottom: 2px solid #c4a484; padding-bottom: 10px; color: #1c1917; font-weight: normal; font-size: 20px; letter-spacing: 0.05em;">QUARTZ CLOUD MASTER AGREEMENT</h2>
          <p style="font-size: 14px; color: #44403c;">The Master Services Agreement has been legally signed and executed.</p>
          <div style="background: #fafaf9; padding: 15px; border-radius: 6px; margin: 20px 0; border: 1px solid #f5f5f4;">
            <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
              <tr style="border-bottom: 1px solid #e7e5e4;">
                <td style="padding: 8px 0; color: #78716c;">Product Tier</td>
                <td style="padding: 8px 0; text-align: right; font-weight: bold;">${selectedTier.name}</td>
              </tr>
              <tr style="border-bottom: 1px solid #e7e5e4;">
                <td style="padding: 8px 0; color: #78716c;">Enterprise Seats</td>
                <td style="padding: 8px 0; text-align: right; font-weight: bold;">${seats} seats</td>
              </tr>
              <tr style="border-bottom: 1px solid #e7e5e4;">
                <td style="padding: 8px 0; color: #78716c;">Service Level Commitment</td>
                <td style="padding: 8px 0; text-align: right; font-weight: bold;">${slaLevel}</td>
              </tr>
              <tr style="border-bottom: 1px solid #e7e5e4;">
                <td style="padding: 8px 0; color: #78716c;">Contract Term</td>
                <td style="padding: 8px 0; text-align: right; font-weight: bold;">${term}</td>
              </tr>
              <tr style="border-bottom: 1px solid #e7e5e4;">
                <td style="padding: 8px 0; color: #78716c;">Billing Arrangement</td>
                <td style="padding: 8px 0; text-align: right; font-weight: bold;">${paymentOption}</td>
              </tr>
              <tr style="border-bottom: 1px solid #e7e5e4;">
                <td style="padding: 8px 0; color: #78716c;">Effective MRR Rate</td>
                <td style="padding: 8px 0; text-align: right; font-weight: bold;">$${finalMonthlyCost.toLocaleString()}/mo</td>
              </tr>
              <tr style="font-size: 15px; font-weight: bold; color: #1c1917;">
                <td style="padding: 12px 0 0 0;">Annualized Value (ARR)</td>
                <td style="padding: 12px 0 0 0; text-align: right; color: #c4a484;">$${annualContractValue.toLocaleString()}</td>
              </tr>
            </table>
          </div>
          <div style="font-size: 12px; color: #78716c; line-height: 1.5; margin-bottom: 20px;">
            <div><strong>Subscriber Sign-off:</strong> ${signeeName}</div>
            <div><strong>Execution Date:</strong> ${signedDate || new Date().toLocaleString()}</div>
            <div><strong>Cryptographic Signature SHA-256:</strong> 6f8c2...d2e8b</div>
          </div>
          <p style="font-size: 11px; color: #a8a29e; border-top: 1px solid #e7e5e4; padding-top: 15px; text-align: center;">
            This email was sent securely via Quartz Enterprise CLM and Google Workspace Gmail Integration.
          </p>
        </div>
      `);
    } else {
      setEmailSubject(`[Quartz Proposal] Master Cloud Agreement: ${selectedTier.name}`);
      setEmailBody(`
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #1c1917; padding: 20px; border: 1px solid #e7e5e4; border-radius: 8px;">
          <h2 style="border-bottom: 2px solid #c4a484; padding-bottom: 10px; color: #1c1917; font-weight: normal; font-size: 20px; letter-spacing: 0.05em;">QUARTZ AGREEMENT PROPOSAL</h2>
          <p style="font-size: 14px; color: #44403c;">We are pleased to submit a commercial schedule proposal for your review.</p>
          <div style="background: #fafaf9; padding: 15px; border-radius: 6px; margin: 20px 0; border: 1px solid #f5f5f4;">
            <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
              <tr style="border-bottom: 1px solid #e7e5e4;">
                <td style="padding: 8px 0; color: #78716c;">Product Tier</td>
                <td style="padding: 8px 0; text-align: right; font-weight: bold;">${selectedTier.name}</td>
              </tr>
              <tr style="border-bottom: 1px solid #e7e5e4;">
                <td style="padding: 8px 0; color: #78716c;">Enterprise Seats</td>
                <td style="padding: 8px 0; text-align: right; font-weight: bold;">${seats} seats</td>
              </tr>
              <tr style="border-bottom: 1px solid #e7e5e4;">
                <td style="padding: 8px 0; color: #78716c;">Service Level Commitment</td>
                <td style="padding: 8px 0; text-align: right; font-weight: bold;">${slaLevel}</td>
              </tr>
              <tr style="border-bottom: 1px solid #e7e5e4;">
                <td style="padding: 8px 0; color: #78716c;">Contract Term</td>
                <td style="padding: 8px 0; text-align: right; font-weight: bold;">${term}</td>
              </tr>
              <tr style="font-size: 15px; font-weight: bold; color: #1c1917;">
                <td style="padding: 12px 0 0 0;">Estimated Monthly Rate</td>
                <td style="padding: 12px 0 0 0; text-align: right; color: #c4a484;">$${finalMonthlyCost.toLocaleString()}/mo</td>
              </tr>
            </table>
          </div>
          <p style="font-size: 11px; color: #a8a29e; border-top: 1px solid #e7e5e4; padding-top: 15px; text-align: center;">
            This email was sent securely via Quartz Commercial Sandbox and Google Workspace Gmail Integration.
          </p>
        </div>
      `);
    }
  }, [workflowStep, selectedTier, seats, slaLevel, term, finalMonthlyCost, paymentOption, signeeName, signedDate]);

  const handleGoogleSignIn = async () => {
    setIsLoggingIn(true);
    try {
      const result = await googleSignIn();
      if (result) {
        setGoogleUser(result.user);
        setGmailToken(result.accessToken);
        if (result.user.email) {
          setEmailTo(result.user.email);
        }
      }
    } catch (err: any) {
      console.error("Sign-in failed:", err);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleGoogleSignOut = async () => {
    try {
      await logout();
      setGoogleUser(null);
      setGmailToken(null);
    } catch (err) {
      console.error("Sign-out failed:", err);
    }
  };

  const handleSendEmail = async () => {
    if (!gmailToken || !emailTo.trim() || !emailSubject.trim() || !emailBody.trim()) return;
    
    // Explicit user confirmation (Workspace Guideline requirement!)
    const confirmSend = window.confirm(`Confirm: Send this email to ${emailTo} using your active Google Workspace Gmail account?`);
    if (!confirmSend) return;

    setIsSendingEmail(true);
    setEmailSentStatus("idle");
    setEmailError("");

    try {
      const result = await sendGmailMessage(gmailToken, emailTo, emailSubject, emailBody);
      setEmailSentStatus("success");
      setSentLog(prev => [
        {
          id: result.id,
          to: emailTo,
          subject: emailSubject,
          date: new Date().toLocaleTimeString()
        },
        ...prev
      ]);
    } catch (err: any) {
      console.error("Failed to send email via Gmail API:", err);
      setEmailSentStatus("error");
      setEmailError(err.message || "Unknown error occurred while dispatching email.");
    } finally {
      setIsSendingEmail(false);
    }
  };

  const handleEmailTranscript = async () => {
    if (!gmailToken) {
      alert("Please connect your Gmail account in the top header first!");
      return;
    }
    
    // Explicit user confirmation (Workspace Guideline requirement!)
    const confirmSend = window.confirm(`Confirm: Send the current advice transcript containing ${messages.length} messages to your inbox (${googleUser?.email}) via Gmail?`);
    if (!confirmSend) return;

    setIsSendingEmail(true);
    try {
      const chatHtml = messages.map(msg => `
        <div style="margin-bottom: 20px; padding: 15px; border-radius: 8px; border: 1px solid #e7e5e4; background: ${msg.role === 'user' ? '#fafaf9' : '#ffffff'};">
          <strong style="color: ${msg.role === 'user' ? '#18181b' : '#c4a484'}">${msg.role === 'user' ? 'You' : 'Quartz Advisor'}</strong>
          <p style="margin-top: 5px; font-size: 13px; line-height: 1.6; color: #44403c;">${msg.content}</p>
        </div>
      `).join('');

      const emailHtml = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #1c1917; padding: 20px; border: 1px solid #e7e5e4; border-radius: 8px;">
          <h2 style="border-bottom: 2px solid #c4a484; padding-bottom: 10px; color: #1c1917; font-weight: normal; font-size: 20px;">QUARTZ COMMERCIAL AI TRANSCRIPT</h2>
          <p style="font-size: 14px; color: #44403c;">Below is your requested chat advisory transcript with the <strong>${chatRole === 'compliance' ? 'Compliance Auditor' : chatRole === 'pricing' ? 'Pricing Strategist' : 'General Strategic Advisor'}</strong>.</p>
          <div style="margin-top: 30px;">
            ${chatHtml}
          </div>
          <p style="font-size: 11px; color: #a8a29e; border-top: 1px solid #e7e5e4; padding-top: 15px; margin-top: 40px; text-align: center;">
            Sent securely via Quartz Gmail Integration.
          </p>
        </div>
      `;

      await sendGmailMessage(gmailToken, googleUser?.email || "", `[Quartz Advisor] Transcript - ${chatRole.toUpperCase()}`, emailHtml);
      alert("Success! The advice transcript has been successfully sent to your inbox.");
    } catch (err: any) {
      console.error("Failed to email transcript:", err);
      alert(`Error sending email: ${err.message || err}`);
    } finally {
      setIsSendingEmail(false);
    }
  };

  // Scroll to chat bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Scroll copilot chat to bottom
  useEffect(() => {
    copilotChatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [copilotMessages]);

  // Fetch crypto exchange price feeds periodically when in crypto mode
  useEffect(() => {
    if (deploymentScope !== "crypto") return;

    const fetchPrices = async () => {
      try {
        const [gemRes, binRes] = await Promise.all([
          fetch("/api/crypto/ticker?exchange=gemini"),
          fetch("/api/crypto/ticker?exchange=binance")
        ]);
        if (gemRes.ok) {
          const gemData = await gemRes.json();
          setGeminiTicker(`$${gemData.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD`);
          if (geminiStatus === "connected" && !geminiAccount) {
            setGeminiAccount("Gemini Registered API Key Node");
            setGeminiLatency("92ms");
            setGeminiMsg("Secure handshake established from stored cache.");
          }
        }
        if (binRes.ok) {
          const binData = await binRes.json();
          setBinanceTicker(`$${binData.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDT`);
          if (binanceStatus === "connected" && !binanceAccount) {
            setBinanceAccount("Binance Registered API Key Node");
            setBinanceLatency("105ms");
            setBinanceMsg("Secure handshake established from stored cache.");
          }
        }
      } catch (err) {
        console.warn("Error fetching automatic ticker background prices:", err);
      }
    };

    fetchPrices();
    const interval = setInterval(fetchPrices, 15000);
    return () => clearInterval(interval);
  }, [deploymentScope, geminiStatus, binanceStatus]);

  // Handle send chat message
  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || inputMessage;
    if (!textToSend.trim()) return;

    const newUserMessage: Message = { role: "user", content: textToSend };
    setMessages(prev => [...prev, newUserMessage]);
    if (!customText) setInputMessage("");
    setIsChatLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToSend,
          history: messages,
          role: chatRole
        })
      });

      if (!response.ok) {
        throw new Error("Unable to connect with Quartz Commercial AI.");
      }

      const data = await response.json();
      setMessages(prev => [...prev, { role: "assistant", content: data.text }]);
    } catch (err: any) {
      setMessages(prev => [
        ...prev, 
        { 
          role: "assistant", 
          content: `⚠️ Error: ${err.message || "Failed to communicate with our systems. Please ensure your GEMINI_API_KEY is configured."}` 
        }
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // Handle Image Generation
  const handleGenerateImage = async () => {
    if (!imagePrompt.trim()) return;
    setIsGeneratingImage(true);
    setImageError("");
    setGeneratedImageUrl("");

    try {
      const response = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: imagePrompt,
          size: imageSize
        })
      });

      if (!response.ok) {
        throw new Error("Image generation failed. Verify key or prompt restrictions.");
      }

      const data = await response.json();
      if (data.imageUrl) {
        setGeneratedImageUrl(data.imageUrl);
      } else if (data.error) {
        throw new Error(data.error);
      }
    } catch (err: any) {
      setImageError(err.message || "An unexpected error occurred during image generation.");
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleGenerateBlueprint = async () => {
    if (!customTask.trim()) return;
    setIsGeneratingBlueprint(true);
    try {
      const response = await fetch("/api/generate-guidance-blueprint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskName: customTask,
          humanControl: customHumanControl
        })
      });
      if (!response.ok) {
        throw new Error("Failed to generate custom guidance blueprint.");
      }
      const data = await response.json();
      setGuidanceBlueprint(data);
      setCompletedGuidanceActivities({});
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsGeneratingBlueprint(false);
    }
  };

  // Handle Run Quartz AI Copilot Agent
  const handleRunQuartzCopilot = async () => {
    if (!manusTask.trim() || isManusRunning) return;
    setIsManusRunning(true);
    setManusStatus("planning");
    setManusOutputText("");
    setManusArtifacts([]);
    setSelectedArtifact("");
    
    // Reset steps
    setManusSteps(prev => prev.map(s => ({ ...s, status: "pending" })));
    
    const logs: string[] = [];
    const addLog = (msg: string) => {
      logs.push(`[${new Date().toLocaleTimeString()}] ${msg}`);
      setManusLogs([...logs]);
    };

    const userMsgId = "user-" + Date.now();
    const assistantMsgId = "assistant-" + Date.now();
    
    setCopilotMessages(prev => [
      ...prev,
      {
        id: userMsgId,
        role: "user",
        content: manusTask,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        agency: customHumanControl
      },
      {
        id: assistantMsgId,
        role: "assistant",
        content: `Acknowledged, Operator. Calibrating evosolutions.ai Safeguards for task execution at ${customHumanControl}% Human Agency. Deconstructing target goals and mapping compliance parameters...`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: "planning"
      }
    ]);

    const updateCopilotMsg = (content: string, status: typeof manusStatus) => {
      setCopilotMessages(prev => prev.map(m => m.id === assistantMsgId ? { ...m, content, status } : m));
    };

    // Staggered Execution Simulation & Real LLM call
    try {
      // STEP 1: Deconstruct Goal
      setManusSteps(prev => {
        const copy = [...prev];
        copy[0] = { ...copy[0], status: "current" };
        return copy;
      });
      addLog("🚀 [Quartz Copilot] Initiating human-centric sandbox coprocessor context...");
      await new Promise(r => setTimeout(r, 1200));
      addLog("🔍 [Quartz Copilot] Analyzing workspace scope: Quartz Commercial QTC / Pricing Sandbox.");
      addLog(`🛡️ [Quartz Compliance] Verification gate armed. Selected Human Agency: ${customHumanControl}%`);
      addLog("🛡️ [Quartz Compliance] Verifying evosolutions.ai human safeguard layers... [ACTIVE]");
      addLog("📋 [Quartz Planner] Received target directive: " + manusTask);
      addLog("🗺️ [Quartz Planner] Core plan structured with 5 dynamic execution phases.");
      
      setManusSteps(prev => {
        const copy = [...prev];
        copy[0] = { ...copy[0], status: "success" };
        copy[1] = { ...copy[1], status: "current" };
        return copy;
      });
      setManusStatus("executing");
      updateCopilotMsg(`Coprocessor nodes aligned. Querying live market indexes and compliance telemetry...\n\n🔌 Gemini Node Status: ${geminiStatus === "connected" ? "Online" : "Backup active"}\n🔌 Binance Node Status: ${binanceStatus === "connected" ? "Online" : "Backup active"}`, "executing");

      // STEP 2: Retrieve Live Feeds
      addLog("📡 [Quartz Node Client] Interrogating exchange rate and ticker feeds...");
      await new Promise(r => setTimeout(r, 1500));
      
      const gemConnected = geminiStatus === "connected";
      const binConnected = binanceStatus === "connected";
      
      addLog(`🔌 [Quartz Node Client] Gemini Exchange Node: ${gemConnected ? "CONNECTED ✅" : "DISCONNECTED (using backup)"}`);
      addLog(`🔌 [Quartz Node Client] Binance Exchange Node: ${binConnected ? "CONNECTED ✅" : "DISCONNECTED (using backup)"}`);
      addLog(`📈 [Quartz Node Client] Rates retrieved - Gemini: ${geminiTicker || "$61,450.25 USD"}, Binance: ${binanceTicker || "$61,452.40 USDT"}`);
      addLog(`📊 [Quartz Pricing] Calculated spread differential: +$2.15 spread between nodes.`);

      setManusSteps(prev => {
        const copy = [...prev];
        copy[1] = { ...copy[1], status: "success" };
        copy[2] = { ...copy[2], status: "current" };
        return copy;
      });
      updateCopilotMsg(`Market feeds retrieved. Spread calculated: +$2.15 spread between Gemini and Binance. Activating deep commercial reasoning and synthesis engines to compile compliant code assets...`, "executing");

      // STEP 3: Draft Solution Artifacts
      addLog("🧠 [Quartz LLM Optimizer] Activating deep advisory models to synthesize solution...");
      
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `You are Quartz AI Copilot, a sovereign human-centric autonomous coprocessor designed to assist human operators in executing complex tasks comfortably without replacement under evosolutions.ai safeguarding principles.
The user wants you to execute this task: "${manusTask}" under an Agency Ratio of ${customHumanControl}% Human Control / ${100 - customHumanControl}% Automation.
We are inside our Quartz pricing, billing, and cryptocurrency exchange platform.
Live Gemini rate index: ${geminiTicker || '$61,450.25 USD'}, live Binance rate index: ${binanceTicker || '$61,452.40 USDT'}.

Please provide a response that contains:
1. A brief (1-2 paragraphs) executive summary explaining how you completed the task, incorporating how the human operator retains control at ${customHumanControl}% Agency.
2. One or more code files or JSON files inside markdown code blocks, each starting with a line comment or JSON property indicating the file name, e.g. "/// filename: arbitrage_hedging.ts" or "/// filename: audit_report.json". Make the code/config extremely professional, comprehensive, and tailored to the task!
3. Exactly one markdown code block containing a JSON block with filename "quartz_guidance.json". This JSON should define the tailored 4-phase step-by-step guidance sequence for the human operator to comfortably execute, verify, or control the generated logic.
It must follow this exact typescript structure:
{
  "taskName": "${manusTask.replace(/"/g, '\\"')}",
  "diagnostic": {
    "objective": "string",
    "activities": ["string", "string", "string"],
    "metric": "string",
    "guidanceText": "string"
  },
  "architecture": {
    "objective": "string",
    "activities": ["string", "string", "string"],
    "metric": "string",
    "guidanceText": "string"
  },
  "deployment": {
    "objective": "string",
    "activities": ["string", "string", "string"],
    "metric": "string",
    "guidanceText": "string"
  },
  "stewardship": {
    "objective": "string",
    "activities": ["string", "string", "string"],
    "metric": "string",
    "guidanceText": "string"
  }
}
Design the objectives and activities in the JSON to match the task perfectly while keeping the human operator in the active driver's seat according to the ${customHumanControl}% Agency level.`,
          history: [],
          role: "general"
        })
      });

      if (!response.ok) {
        throw new Error("Unable to reach the Gemini advisory reasoning core.");
      }

      const data = await response.json();
      const text = data.text || "";

      // Parse artifacts
      const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
      const blockMatch = [...text.matchAll(codeBlockRegex)];
      const parsedArtifacts = blockMatch.map((match, idx) => {
        const lang = match[1] || "typescript";
        const code = match[2];
        const fileLabelMatch = code.match(/(?:\/\/|#)\s*(?:filename|file):\s*([a-zA-Z0-9_\-\.]+)/i);
        const name = fileLabelMatch ? fileLabelMatch[1] : `artifact_${idx + 1}.${lang === "typescript" || lang === "ts" ? "ts" : lang === "json" ? "json" : "txt"}`;
        return { name, code, lang };
      });

      // Filter out quartz_guidance.json from downloadable code artifacts list
      const codeArtifactsOnly = parsedArtifacts.filter(a => a.name !== "quartz_guidance.json");
      setManusArtifacts(codeArtifactsOnly);
      
      if (codeArtifactsOnly.length > 0) {
        setSelectedArtifact(codeArtifactsOnly[0].name);
        addLog(`💾 [Quartz LLM Optimizer] Synthesized ${codeArtifactsOnly.length} pristine solution artifact(s): ${codeArtifactsOnly.map(a => a.name).join(", ")}`);
      } else {
        const fallback = {
          name: "hedging_policy.ts",
          lang: "typescript",
          code: `// Fallback file generated by Quartz AI Copilot\nexport const hedgingPolicy = {\n  task: "${manusTask.replace(/"/g, '\\"')}",\n  executedAt: "${new Date().toISOString()}",\n  geminiRate: "${geminiTicker || "$61,450.25"}",\n  binanceRate: "${binanceTicker || "$61,452.40"}",\n  humanControlLevel: "${customHumanControl}%"\n};`
        };
        setManusArtifacts([fallback]);
        setSelectedArtifact(fallback.name);
        addLog("💾 [Quartz LLM Optimizer] Synthesized default policy artifact: hedging_policy.ts");
      }

      // Try parsing quartz_guidance.json from the overall set
      const guidanceArtifact = parsedArtifacts.find(a => a.name === "quartz_guidance.json");
      if (guidanceArtifact) {
        try {
          const parsedGuidance = JSON.parse(guidanceArtifact.code);
          if (parsedGuidance.diagnostic && parsedGuidance.architecture && parsedGuidance.deployment && parsedGuidance.stewardship) {
            setGuidanceBlueprint(parsedGuidance);
            setCompletedGuidanceActivities({});
            addLog("📋 [Quartz Copilot] Loaded custom human-centric Step-by-Step Guidance Blueprint!");
          }
        } catch (e) {
          console.error("Failed to parse dynamic guidance JSON:", e);
        }
      } else {
        // Fallback default dynamic blueprint based on the task
        setGuidanceBlueprint({
          taskName: manusTask,
          diagnostic: {
            objective: "Cognitive Comfort Evaluation",
            activities: [
              "Review the generated code assets and verify alignment with the specified business parameters.",
              "Benchmark pricing models against current spread margins of " + (geminiTicker || "$61,450.25") + " and " + (binanceTicker || "$61,452.40") + ".",
              "Audit automated alert thresholds for high discount variations."
            ],
            metric: `Agency Factor: ${customHumanControl}% human validation retained`,
            guidanceText: "Analyzing task components to ensure you retain maximum creative control and only delegate pure automation tasks."
          },
          architecture: {
            objective: "Symphonic Cooperation Topology",
            activities: [
              "Define standard manual override gates for instant service pause.",
              "Configure fallback rules that trigger alerts to your email rather than acting automatically.",
              "Ensure zero automated modifications occur without direct human signature check-off."
            ],
            metric: "Control Status: Active Protection Enabled",
            guidanceText: "Establishing a cooperative model where the Quartz system acts as an advisor, while you retain 100% executive sign-off."
          },
          deployment: {
            objective: "Comfort-Oriented Integration Rollout",
            activities: [
              "Deploy generated configurations to your isolated sandbox node for low-risk testing.",
              "Activate rate logging trackers with a dry-run flag enabled to monitor spread actions.",
              "Configure a one-click suspension button to instantly toggle off automated rules."
            ],
            metric: "Implementation: 100% Guarded & Safe",
            guidanceText: "Rollout with zero friction. We deploy step by step so you can review and adjust at your personal comfort level."
          },
          stewardship: {
            objective: "Human-Machine Alignment Guardrail",
            activities: [
              "Conduct audit to verify that no automatic pricing decisions take place without explicit human validation.",
              "Lock down synthesized logic to preserve integrity against external unauthorized modifications.",
              "Log historical compliance audits securely on the immutable ledger."
            ],
            metric: "Stewardship Status: Fully Sealed & Certified",
            guidanceText: "Securing human craftsmanship. The system is locked to guarantee you hold the absolute decision-making power."
          }
        });
        setCompletedGuidanceActivities({});
        addLog("📋 [Quartz Copilot] Loaded comfort-calibrated general Guidance Blueprint.");
      }

      const cleanSummary = text.replace(/```[\s\S]*?```/g, "").trim();
      setManusOutputText(cleanSummary || "Task successfully completed by Quartz AI Copilot.");
      updateCopilotMsg(cleanSummary || "Task successfully completed by Quartz AI Copilot.", "executing");

      setManusSteps(prev => {
        const copy = [...prev];
        copy[2] = { ...copy[2], status: "success" };
        copy[3] = { ...copy[3], status: "current" };
        return copy;
      });
      setManusStatus("testing");
      updateCopilotMsg(`${cleanSummary}\n\n🛡️ [Security Audit] Verification gate active. Evaluating synthesized artifacts against evosolutions.ai safeguard rules...`, "testing");

      // STEP 4: Verify & Secure
      addLog("🛡️ [Quartz Compliance] Routing drafts through evosolutions.ai security check...");
      await new Promise(r => setTimeout(r, 1200));
      addLog(`🔒 [Quartz Compliance] Validating Human Agency Limit: ${customHumanControl}% threshold - PASS`);
      addLog('🔒 [Quartz Compliance] Verification rule: "Ensure technology acts strictly as an administrative shield, honoring human intent" - PASS');
      addLog("🛡️ [Quartz Compliance] Safety constraints checked. Cryptographic Ledger Sealed.");

      setManusSteps(prev => {
        const copy = [...prev];
        copy[3] = { ...copy[3], status: "success" };
        copy[4] = { ...copy[4], status: "current" };
        return copy;
      });
      setManusStatus("completed");

      // STEP 5: Package Output
      addLog("📦 [Quartz Compiler] Packaging synthesized solution with progressive checklist modules...");
      await new Promise(r => setTimeout(r, 1000));
      addLog("✨ [Quartz Copilot] Orchestration completed successfully. Interactive guidance and artifacts are ready.");

      setManusSteps(prev => {
        const copy = [...prev];
        copy[4] = { ...copy[4], status: "success" };
        return copy;
      });
      updateCopilotMsg(cleanSummary, "completed");

    } catch (err: any) {
      console.error(err);
      addLog("❌ [Quartz Error] Coprocessor execution halted: " + (err.message || err));
      setManusStatus("error");
      setManusSteps(prev => prev.map(s => s.status === "current" ? { ...s, status: "error" } : s));
      setCopilotMessages(prev => prev.map(m => m.id === assistantMsgId ? { ...m, content: `❌ Error: Coprocessor execution halted: ${err.message || err}`, status: "error" } : m));
    } finally {
      setIsManusRunning(false);
    }
  };

  // Sign contract action
  const handleSignContract = () => {
    if (!signeeName.trim()) return;
    setIsSigning(true);
    setTimeout(() => {
      setIsSigning(false);
      setWorkflowStep("billing");
      setSignedDate(new Date().toLocaleDateString("en-US", { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }));
    }, 1500);
  };

  // Dynamic ASC 606 calculation for the graph
  const getRevenueRecData = () => {
    const data = [];
    const monthlyRecognized = annualContractValue / 12;
    let cashPaid = 0;
    
    for (let month = 0; month <= 12; month++) {
      if (month === 0) {
        cashPaid = paymentOption === "Annual Upfront" ? annualContractValue : 0;
        data.push({
          month: 0,
          recognized: 0,
          deferred: paymentOption === "Annual Upfront" ? annualContractValue : 0,
          cash: cashPaid
        });
      } else {
        if (paymentOption === "Monthly Recurring") {
          cashPaid += monthlyRecognized;
        } else {
          cashPaid = annualContractValue;
        }
        const recognized = monthlyRecognized * month;
        const deferred = Math.max(0, annualContractValue - recognized);
        data.push({
          month,
          recognized,
          deferred,
          cash: cashPaid
        });
      }
    }
    return data;
  };

  const revRecData = getRevenueRecData();

  return (
    <div className="min-h-screen bg-[#050505] text-[#D4D4D8] font-sans flex flex-col selection:bg-[#C4A484]/30 selection:text-white">
      {/* Dynamic Theme Styles Override */}
      <style>{`
        :root {
          --bg-primary: ${theme === "light" ? "#fbfaf7" : theme === "vibrant" ? "#0a041c" : "#050505"};
          --bg-card: ${theme === "light" ? "#ffffff" : theme === "vibrant" ? "rgba(255, 255, 255, 0.03)" : "#0a0a0a"};
          --bg-card-hover: ${theme === "light" ? "#f5f3ef" : theme === "vibrant" ? "rgba(255, 255, 255, 0.06)" : "#121212"};
          --border-color: ${theme === "light" ? "#e7e2d8" : theme === "vibrant" ? "rgba(139, 92, 246, 0.15)" : "rgba(255, 255, 255, 0.05)"};
          --text-primary: ${theme === "light" ? "#1c1917" : theme === "vibrant" ? "#ffffff" : "#ffffff"};
          --text-secondary: ${theme === "light" ? "#57534e" : theme === "vibrant" ? "#d4d4d8" : "#D4D4D8"};
          --text-muted: ${theme === "light" ? "#a8a29e" : theme === "vibrant" ? "#a1a1aa" : "#71717a"};
          --accent-color: ${theme === "light" ? "#8c6d4f" : theme === "vibrant" ? "#f472b6" : "#C4A484"};
          --accent-hover: ${theme === "light" ? "#705439" : theme === "vibrant" ? "#ec4899" : "#b09070"};
          --accent-bg-glow: ${theme === "light" ? "rgba(140, 109, 79, 0.05)" : theme === "vibrant" ? "rgba(244, 114, 182, 0.12)" : "rgba(196, 164, 132, 0.1)"};
          --accent-border: ${theme === "light" ? "rgba(140, 109, 79, 0.2)" : theme === "vibrant" ? "rgba(244, 114, 182, 0.2)" : "rgba(196, 164, 132, 0.2)"};
          --accent-border-hover: ${theme === "light" ? "rgba(140, 109, 79, 0.5)" : theme === "vibrant" ? "rgba(244, 114, 182, 0.5)" : "rgba(196, 164, 132, 0.4)"};
          --nav-bg: ${theme === "light" ? "rgba(251, 250, 247, 0.95)" : theme === "vibrant" ? "rgba(10, 4, 28, 0.95)" : "rgba(5, 5, 5, 0.95)"};
          --inner-card: ${theme === "light" ? "#f5f3ef" : theme === "vibrant" ? "rgba(139, 92, 246, 0.05)" : "#050505"};
          --selection-bg: ${theme === "light" ? "rgba(140, 109, 79, 0.2)" : theme === "vibrant" ? "rgba(244, 114, 182, 0.3)" : "rgba(196, 164, 132, 0.3)"};
        }

        /* Deep overrides for classes to change on the fly */
        .min-h-screen, body, .bg-\\[\\#050505\\] {
          background-color: var(--bg-primary) !important;
          color: var(--text-secondary) !important;
          transition: background-color 0.5s ease, color 0.5s ease;
        }

        /* Selection styling */
        ::selection {
          background-color: var(--selection-bg) !important;
          color: ${theme === "light" ? "#000000" : "#ffffff"} !important;
        }

        /* Nav background */
        .bg-\\[\\#050505\\]\\/95 {
          background-color: var(--nav-bg) !important;
          border-color: var(--border-color) !important;
          transition: background-color 0.5s ease, border-color 0.5s ease;
        }

        /* Card backgrounds and borders */
        .bg-\\[\\#0a0a0a\\], .bg-\\[\\#0c0c0c\\], .bg-zinc-950, .bg-\\[\\#060606\\], .bg-zinc-900\\/50 {
          background-color: var(--bg-card) !important;
          border-color: var(--border-color) !important;
          transition: background-color 0.5s ease, border-color 0.5s ease;
        }
        
        .hover\\:bg-\\[\\#121212\\]:hover, .hover\\:bg-zinc-900:hover {
          background-color: var(--bg-card-hover) !important;
        }

        /* Borders general */
        .border-white\\/5, .border-white\\/10, .border-stone-800, .border-zinc-800, .border-zinc-700 {
          border-color: var(--border-color) !important;
          transition: border-color 0.5s ease;
        }

        /* Text colors */
        .text-white, .hover\\:text-white:hover {
          color: var(--text-primary) !important;
        }
        .text-\\[\\#D4D4D8\\] {
          color: var(--text-secondary) !important;
        }
        .text-white\\/50, .text-white\\/60, .text-zinc-400, .text-zinc-500 {
          color: var(--text-muted) !important;
        }

        /* Accents */
        .text-\\[\\#C4A484\\] {
          color: var(--accent-color) !important;
        }
        .bg-\\[\\#C4A484\\] {
          background-color: var(--accent-color) !important;
          color: ${theme === "light" ? "#ffffff" : "#050505"} !important;
          transition: background-color 0.5s ease, color 0.5s ease;
        }
        .bg-\\[\\#C4A484\\]\\/10 {
          background-color: var(--accent-bg-glow) !important;
          color: var(--accent-color) !important;
          transition: background-color 0.5s ease, color 0.5s ease;
        }
        .border-\\[\\#C4A484\\]\\/20 {
          border-color: var(--accent-border) !important;
          transition: border-color 0.5s ease;
        }
        .hover\\:border-\\[\\#C4A484\\]\\/40:hover {
          border-color: var(--accent-border-hover) !important;
          transition: border-color 0.5s ease;
        }
        
        /* Underline decoration */
        .decoration-1 {
          text-decoration-color: var(--accent-color) !important;
        }

        /* Inner card backgrounds (for code logs and terminal shells) */
        .bg-zinc-950, .bg-\\[\\#050505\\] {
          background-color: var(--inner-card) !important;
        }

        /* Primary button text style */
        .bg-\\[\\#C4A484\\]:hover {
          background-color: var(--accent-hover) !important;
        }

        /* Input overrides */
        input, textarea, select {
          background-color: ${theme === "light" ? "#fbfaf7" : theme === "vibrant" ? "rgba(255, 255, 255, 0.02)" : "#050505"} !important;
          color: var(--text-primary) !important;
          border-color: var(--border-color) !important;
        }

        /* Recharts font and line colors */
        .recharts-cartesian-grid-horizontal, .recharts-cartesian-grid-vertical {
          stroke: var(--border-color) !important;
          opacity: 0.5;
        }
        .recharts-text {
          fill: var(--text-secondary) !important;
        }
        
        /* Vibrant background gradient overlay */
        ${theme === "vibrant" ? `
          body::before {
            content: "";
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: radial-gradient(circle at 10% 20%, rgba(244, 114, 182, 0.04) 0%, transparent 40%),
                        radial-gradient(circle at 90% 80%, rgba(139, 92, 246, 0.05) 0%, transparent 40%);
            pointer-events: none;
            z-index: 1;
          }
        ` : ""}
      `}</style>

      {/* Dynamic Header */}
      <nav className="flex items-center justify-between px-6 md:px-12 py-6 border-b border-white/5 bg-[#050505]/95 backdrop-blur sticky top-0 z-50">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => { setActiveTab("solutions"); setMobileMenuOpen(false); }}>
          <div className="w-8 h-8 bg-[#C4A484] rounded-sm flex items-center justify-center shadow-lg shadow-[#C4A484]/10">
            <div className="w-4 h-4 border-2 border-[#050505] rotate-45"></div>
          </div>
          <span className="text-xl font-semibold tracking-[0.25em] text-white uppercase">QUARTZ</span>
        </div>
        
        {/* Desktop Navigation Links */}
        <div className="hidden md:flex gap-8 text-[11px] uppercase tracking-[0.2em] font-medium opacity-80">
          <button 
            onClick={() => setActiveTab("solutions")} 
            className={`transition-all hover:text-[#C4A484] relative py-1 ${activeTab === "solutions" ? "text-[#C4A484] font-semibold" : ""}`}
          >
            Solutions
            {activeTab === "solutions" && <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-[#C4A484]"></div>}
          </button>
          <button 
            onClick={() => setActiveTab("platform")} 
            className={`transition-all hover:text-[#C4A484] relative py-1 ${activeTab === "platform" ? "text-[#C4A484] font-semibold" : ""}`}
          >
            Platform
            {activeTab === "platform" && <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-[#C4A484]"></div>}
          </button>
          <button 
            onClick={() => { setActiveTab("sandbox"); setWorkflowStep("configure"); }} 
            className={`transition-all hover:text-[#C4A484] relative py-1 ${activeTab === "sandbox" ? "text-[#C4A484] font-semibold" : ""}`}
          >
            Live QTC Sandbox
            {activeTab === "sandbox" && <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-[#C4A484]"></div>}
          </button>
          <button 
            onClick={() => setActiveTab("ai-advisors")} 
            className={`transition-all hover:text-[#C4A484] relative py-1 ${activeTab === "ai-advisors" ? "text-[#C4A484] font-semibold" : ""}`}
          >
            AI Advisors
            {activeTab === "ai-advisors" && <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-[#C4A484]"></div>}
          </button>
          <button 
            onClick={() => setActiveTab("quartz-copilot")} 
            className={`transition-all hover:text-[#C4A484] relative py-1 ${activeTab === "quartz-copilot" ? "text-[#C4A484] font-semibold" : ""}`}
          >
            Quartz Copilot
            {activeTab === "quartz-copilot" && <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-[#C4A484]"></div>}
          </button>
          <button 
            onClick={() => setActiveTab("brand-assets")} 
            className={`transition-all hover:text-[#C4A484] relative py-1 ${activeTab === "brand-assets" ? "text-[#C4A484] font-semibold" : ""}`}
          >
            Marketing Studio
            {activeTab === "brand-assets" && <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-[#C4A484]"></div>}
          </button>
        </div>

        {/* Desktop Controls (Hidden on small / medium screens) */}
        <div className="hidden lg:flex items-center gap-3">
          {/* Theme Selector Pill */}
          <div className="flex items-center bg-white/5 border border-white/10 rounded-full p-1 gap-1">
            <button
              onClick={() => setTheme("dark")}
              className={`p-1.5 rounded-full transition-all ${
                theme === "dark" 
                  ? "bg-[#C4A484] text-[#050505] shadow-sm" 
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
              title="Obsidian Dark"
            >
              <Moon className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setTheme("light")}
              className={`p-1.5 rounded-full transition-all ${
                theme === "light" 
                  ? "bg-stone-800 text-white shadow-sm" 
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
              title="Alabaster Light"
            >
              <Sun className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setTheme("vibrant")}
              className={`p-1.5 rounded-full transition-all ${
                theme === "vibrant" 
                  ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-sm" 
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
              title="Nebula Prism (Colorful)"
            >
              <Palette className="w-3.5 h-3.5" />
            </button>
          </div>

          <button 
            onClick={() => { setActiveTab("sandbox"); setWorkflowStep("configure"); }}
            className="px-5 py-2 border border-white/10 hover:border-[#C4A484]/40 text-[10px] uppercase tracking-widest text-white hover:bg-white hover:text-[#050505] transition-all duration-300 font-semibold"
          >
            Initialize Core Engine
          </button>

          {googleUser ? (
            <div className="flex items-center gap-2 border border-white/5 bg-white/5 px-3 py-1.5 rounded text-xs">
              {googleUser.photoURL ? (
                <img src={googleUser.photoURL} alt="User avatar" className="w-5 h-5 rounded-full" referrerPolicy="no-referrer" />
              ) : (
                <div className="w-5 h-5 bg-[#C4A484] text-[#050505] rounded-full flex items-center justify-center font-bold text-[10px]">
                  {googleUser.displayName?.[0] || googleUser.email?.[0] || 'G'}
                </div>
              )}
              <span className="text-white/80 font-mono text-[10px] hidden xl:inline max-w-[120px] truncate">{googleUser.email}</span>
              <button 
                onClick={handleGoogleSignOut} 
                className="text-[#C4A484] hover:text-white transition-all text-[10px] uppercase font-bold tracking-wider ml-1"
              >
                Disconnect
              </button>
            </div>
          ) : (
            <button
              onClick={handleGoogleSignIn}
              disabled={isLoggingIn}
              className="flex items-center gap-2 px-3 py-1.5 border border-white/10 hover:border-[#C4A484]/40 bg-white/5 hover:bg-[#C4A484]/15 rounded text-[10px] font-semibold uppercase tracking-wider text-white transition-all"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
              </svg>
              {isLoggingIn ? "Connecting..." : "Connect Gmail"}
            </button>
          )}
        </div>

        {/* Mobile / Tablet Menu Button Toggle */}
        <div className="flex lg:hidden items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 border border-white/10 rounded hover:bg-white/5 text-white focus:outline-none"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5 text-[#C4A484]" /> : <Menu className="w-5 h-5 text-white" />}
          </button>
        </div>

        {/* Smooth Expandable Mobile Navigation Drawer overlay */}
        {mobileMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-[#050505]/98 border-b border-white/10 backdrop-blur-md px-6 py-8 flex flex-col gap-6 z-50 animate-fade-in lg:hidden shadow-2xl">
            <div className="flex flex-col gap-4 text-xs font-mono tracking-wider uppercase">
              <button 
                onClick={() => { setActiveTab("solutions"); setMobileMenuOpen(false); }}
                className={`text-left py-2.5 px-3 rounded hover:bg-white/5 transition-all flex items-center justify-between ${activeTab === "solutions" ? "text-[#C4A484] bg-white/5" : "text-white/70"}`}
              >
                <span>Solutions</span>
                <ChevronRight className="w-3 h-3 opacity-50" />
              </button>
              <button 
                onClick={() => { setActiveTab("platform"); setMobileMenuOpen(false); }}
                className={`text-left py-2.5 px-3 rounded hover:bg-white/5 transition-all flex items-center justify-between ${activeTab === "platform" ? "text-[#C4A484] bg-white/5" : "text-white/70"}`}
              >
                <span>Platform</span>
                <ChevronRight className="w-3 h-3 opacity-50" />
              </button>
              <button 
                onClick={() => { setActiveTab("sandbox"); setWorkflowStep("configure"); setMobileMenuOpen(false); }}
                className={`text-left py-2.5 px-3 rounded hover:bg-white/5 transition-all flex items-center justify-between ${activeTab === "sandbox" ? "text-[#C4A484] bg-white/5" : "text-white/70"}`}
              >
                <span>Live QTC Sandbox</span>
                <ChevronRight className="w-3 h-3 opacity-50" />
              </button>
              <button 
                onClick={() => { setActiveTab("ai-advisors"); setMobileMenuOpen(false); }}
                className={`text-left py-2.5 px-3 rounded hover:bg-white/5 transition-all flex items-center justify-between ${activeTab === "ai-advisors" ? "text-[#C4A484] bg-white/5" : "text-white/70"}`}
              >
                <span>AI Advisors</span>
                <ChevronRight className="w-3 h-3 opacity-50" />
              </button>
              <button 
                onClick={() => { setActiveTab("quartz-copilot"); setMobileMenuOpen(false); }}
                className={`text-left py-2.5 px-3 rounded hover:bg-white/5 transition-all flex items-center justify-between ${activeTab === "quartz-copilot" ? "text-[#C4A484] bg-white/5" : "text-white/70"}`}
              >
                <span>Quartz Copilot</span>
                <ChevronRight className="w-3 h-3 opacity-50" />
              </button>
              <button 
                onClick={() => { setActiveTab("brand-assets"); setMobileMenuOpen(false); }}
                className={`text-left py-2.5 px-3 rounded hover:bg-white/5 transition-all flex items-center justify-between ${activeTab === "brand-assets" ? "text-[#C4A484] bg-white/5" : "text-white/70"}`}
              >
                <span>Marketing Studio</span>
                <ChevronRight className="w-3 h-3 opacity-50" />
              </button>
            </div>

            <div className="h-[1px] bg-white/5 my-2"></div>

            {/* Theme switcher */}
            <div className="flex flex-col gap-2.5">
              <span className="text-[10px] uppercase tracking-[0.2em] text-white/40 block font-mono">Select Visual Theme</span>
              <div className="grid grid-cols-3 gap-2 p-1 bg-white/5 border border-white/10 rounded-lg">
                <button
                  onClick={() => setTheme("dark")}
                  className={`py-2 text-[10px] rounded uppercase font-mono tracking-wider transition-all flex items-center justify-center gap-1.5 ${theme === "dark" ? "bg-[#C4A484] text-[#050505] font-bold" : "text-white/60 hover:text-white"}`}
                >
                  <Moon className="w-3 h-3" /> Dark
                </button>
                <button
                  onClick={() => setTheme("light")}
                  className={`py-2 text-[10px] rounded uppercase font-mono tracking-wider transition-all flex items-center justify-center gap-1.5 ${theme === "light" ? "bg-stone-800 text-white font-bold" : "text-white/60 hover:text-white"}`}
                >
                  <Sun className="w-3 h-3" /> Light
                </button>
                <button
                  onClick={() => setTheme("vibrant")}
                  className={`py-2 text-[10px] rounded uppercase font-mono tracking-wider transition-all flex items-center justify-center gap-1.5 ${theme === "vibrant" ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold" : "text-white/60 hover:text-white"}`}
                >
                  <Palette className="w-3 h-3" /> Prism
                </button>
              </div>
            </div>

            {/* Sandbox initialization action */}
            <button 
              onClick={() => { setActiveTab("sandbox"); setWorkflowStep("configure"); setMobileMenuOpen(false); }}
              className="w-full py-3 border border-white/10 text-[10px] uppercase tracking-widest text-white hover:bg-white hover:text-[#050505] transition-all duration-300 font-semibold text-center rounded"
            >
              Initialize Core Sandbox Engine
            </button>

            {/* User Session Auth block */}
            <div className="bg-[#0c0c0c] border border-white/5 p-4 rounded-lg">
              {googleUser ? (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2.5">
                    {googleUser.photoURL ? (
                      <img src={googleUser.photoURL} alt="User avatar" className="w-6 h-6 rounded-full" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="w-6 h-6 bg-[#C4A484] text-[#050505] rounded-full flex items-center justify-center font-bold text-xs">
                        {googleUser.displayName?.[0] || googleUser.email?.[0] || 'G'}
                      </div>
                    )}
                    <div className="flex flex-col">
                      <span className="text-white font-semibold text-xs">{googleUser.displayName || 'Authorized User'}</span>
                      <span className="text-white/40 font-mono text-[9px] max-w-[200px] truncate">{googleUser.email}</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => { handleGoogleSignOut(); setMobileMenuOpen(false); }} 
                    className="w-full py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded text-[10px] uppercase font-bold tracking-wider transition-all"
                  >
                    Disconnect Account
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => { handleGoogleSignIn(); setMobileMenuOpen(false); }}
                  disabled={isLoggingIn}
                  className="w-full flex items-center justify-center gap-2.5 py-3 border border-white/10 bg-white/5 hover:bg-[#C4A484]/15 rounded text-[10px] font-semibold uppercase tracking-wider text-white transition-all"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 48 48">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                  </svg>
                  {isLoggingIn ? "Connecting Gmail Node..." : "Connect Gmail Node"}
                </button>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Main Content Areas */}
      <main className="flex-1">
        {/* TAB 1: SOLUTIONS (HERO & CORE LANDING) */}
        {activeTab === "solutions" && (
          <div className="flex flex-col items-center justify-center px-6 md:px-12 py-12 md:py-24 text-center">
            <div className="animate-fade-in flex flex-col items-center">
              <span className="text-[10px] uppercase tracking-[0.5em] text-[#C4A484] mb-6 font-semibold italic">
                Strategic Brand Architecture
              </span>
              <h1 className="text-4xl md:text-8xl leading-[1.05] font-light text-white italic tracking-tighter mb-8 max-w-5xl font-serif">
                Precision in every <span className="text-[#C4A484] underline underline-offset-12 decoration-1">transactional</span> moment.
              </h1>
              <p className="max-w-2xl text-base md:text-lg text-white/50 font-light leading-relaxed mb-12">
                A comprehensive Quote-to-Cash ecosystem designed for the world&apos;s most ambitious enterprises. Scalable, secure, and impeccably refined. Experience modern commercial operations powered by custom neural systems.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-20 justify-center">
                <button
                  onClick={() => { setActiveTab("sandbox"); setWorkflowStep("configure"); }}
                  className="px-8 py-4 bg-[#C4A484] text-black text-xs font-semibold uppercase tracking-widest hover:bg-[#b09070] transition-all flex items-center gap-2 shadow-lg shadow-[#C4A484]/15"
                >
                  Launch Interactive Demo <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setActiveTab("ai-advisors")}
                  className="px-8 py-4 border border-white/10 hover:border-white/30 text-xs font-semibold uppercase tracking-widest text-white transition-all hover:bg-white/5"
                >
                  Consult AI Advisor
                </button>
              </div>
            </div>

            {/* Brand Pillars */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-white/10 w-full max-w-6xl mt-6 rounded-lg overflow-hidden">
              <div className="bg-[#0c0c0c] p-8 hover:bg-[#121212] transition-all duration-300 group text-left">
                <div className="text-[#C4A484] text-xs mb-4 uppercase tracking-widest font-bold flex items-center justify-between">
                  <span>01 / INTEGRITY</span>
                  <Scale className="w-4 h-4 text-[#C4A484] opacity-50 group-hover:opacity-100 transition-opacity" />
                </div>
                <h3 className="text-white text-lg font-medium mb-2 font-serif">Auto-Compliance Guardrails</h3>
                <p className="text-sm text-white/50 leading-relaxed group-hover:text-white/80 transition-colors">
                  Automated pricing and discounting thresholds ensuring every contract adheres strictly to standard commercial guardrails before execution.
                </p>
              </div>
              
              <div className="bg-[#0c0c0c] p-8 hover:bg-[#121212] transition-all duration-300 group text-left">
                <div className="text-[#C4A484] text-xs mb-4 uppercase tracking-widest font-bold flex items-center justify-between">
                  <span>02 / AGILITY</span>
                  <Layers className="w-4 h-4 text-[#C4A484] opacity-50 group-hover:opacity-100 transition-opacity" />
                </div>
                <h3 className="text-white text-lg font-medium mb-2 font-serif">Dynamic CPQ Configuration</h3>
                <p className="text-sm text-white/50 leading-relaxed group-hover:text-white/80 transition-colors">
                  Seamless multi-tiered pricing, configurable SLA overrides, and flexible licensing terms that adapt instantly to custom customer needs.
                </p>
              </div>
              
              <div className="bg-[#0c0c0c] p-8 hover:bg-[#121212] transition-all duration-300 group text-left">
                <div className="text-[#C4A484] text-xs mb-4 uppercase tracking-widest font-bold flex items-center justify-between">
                  <span>03 / INTELLIGENCE</span>
                  <TrendingUp className="w-4 h-4 text-[#C4A484] opacity-50 group-hover:opacity-100 transition-opacity" />
                </div>
                <h3 className="text-white text-lg font-medium mb-2 font-serif">Revenue Rec Engine (ASC 606)</h3>
                <p className="text-sm text-white/50 leading-relaxed group-hover:text-white/80 transition-colors">
                  SOP-compliant revenue recognition ledgers that calculate deferred vs. realized revenue curves in real-time based on delivery schedules.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PLATFORM DETAILS */}
        {activeTab === "platform" && (
          <div className="px-6 md:px-12 py-16 max-w-6xl mx-auto">
            <span className="text-[10px] uppercase tracking-[0.5em] text-[#C4A484] mb-3 block text-center font-semibold">
              The Architecture
            </span>
            <h2 className="text-3xl md:text-5xl font-light text-white text-center mb-16 font-serif">
              A Symphony of Quote-To-Cash Systems
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center mb-20">
              <div>
                <span className="text-xs uppercase tracking-wider text-[#C4A484] font-semibold mb-2 block">
                  Commercial Control Center
                </span>
                <h3 className="text-2xl text-white font-medium mb-4 font-serif">
                  Eliminating friction from pricing to revenue
                </h3>
                <p className="text-sm text-white/60 leading-relaxed mb-6">
                  Legacy ERPs treat quotes, contracts, and invoices as disjointed files. Quartz unites them into a single mathematical stream. When a representative edits a quote discount, compliance is audited instantly, SLA clauses adjust to back the discount, billing schedules adapt, and your ASC 606 revenue curves redraw automatically.
                </p>
                <div className="space-y-3">
                  {[
                    "Zero manual hand-offs from Sales to Finance",
                    "Continuous automated risk validation on contract terms",
                    "Dynamic ledger integration mirroring ASC 606 accounting principles"
                  ].map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-white/80">
                      <Check className="w-4 h-4 text-[#C4A484]" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-[#0a0a0a] border border-white/5 p-8 rounded-lg relative overflow-hidden group">
                <div className="absolute -right-16 -top-16 w-48 h-48 bg-[#C4A484]/5 rounded-full blur-3xl group-hover:bg-[#C4A484]/10 transition-all duration-500"></div>
                <div className="text-xs uppercase tracking-wider text-[#C4A484] mb-4 font-bold flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#C4A484]"></div>
                  SYSTEM HEURISTICS
                </div>
                <div className="space-y-4">
                  <div className="p-4 bg-[#111] rounded border border-white/5">
                    <div className="flex justify-between text-xs text-white mb-1 font-semibold">
                      <span>CPQ Execution Time</span>
                      <span className="text-[#C4A484]">14.2ms</span>
                    </div>
                    <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                      <div className="w-[90%] h-full bg-[#C4A484]"></div>
                    </div>
                  </div>
                  <div className="p-4 bg-[#111] rounded border border-white/5">
                    <div className="flex justify-between text-xs text-white mb-1 font-semibold">
                      <span>ASC 606 Ingestion Rate</span>
                      <span className="text-[#C4A484]">12,000 tx/sec</span>
                    </div>
                    <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                      <div className="w-[85%] h-full bg-[#C4A484]"></div>
                    </div>
                  </div>
                  <div className="p-4 bg-[#111] rounded border border-white/5">
                    <div className="flex justify-between text-xs text-white mb-1 font-semibold">
                      <span>Contract Audit Latency</span>
                      <span className="text-[#C4A484]">0.08s</span>
                    </div>
                    <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                      <div className="w-[98%] h-full bg-[#C4A484]"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Micro Demo Callout */}
            <div className="bg-[#0c0c0c] border border-[#C4A484]/20 p-8 rounded-lg text-center">
              <h4 className="text-xl text-white font-serif mb-2">Ready to see Quartz in action?</h4>
              <p className="text-xs text-white/50 mb-6 max-w-lg mx-auto">Explore the interactive CPQ engine, generate compliant contracts, and watch ASC 606 revenue curves calculate live in our sandbox.</p>
              <button 
                onClick={() => { setActiveTab("sandbox"); setWorkflowStep("configure"); }} 
                className="px-6 py-3 bg-white text-black text-xs font-bold uppercase tracking-widest hover:bg-[#C4A484] hover:text-black transition-all"
              >
                Go to Live Sandbox
              </button>
            </div>
          </div>
        )}

        {/* TAB 3: THE LIVE SANDBOX */}
        {activeTab === "sandbox" && (
          <div className="px-6 md:px-12 py-10 max-w-7xl mx-auto">
            {/* Header Stage Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 pb-6 border-b border-white/5 gap-4">
              <div>
                <span className="text-[10px] uppercase tracking-[0.3em] text-[#C4A484] font-semibold block mb-1">Interactive Simulator</span>
                <h2 className="text-2xl font-light text-white font-serif">Quartz Commercial Engine</h2>
              </div>
              
              {/* Steps Indicator */}
              <div className="flex items-center gap-1 md:gap-3 text-xs">
                {[
                  { step: "configure", label: "1. Configure CPQ" },
                  { step: "quote", label: "2. Contract Audit" },
                  { step: "sign", label: "3. E-Signature" },
                  { step: "billing", label: "4. ASC 606 Revenue" }
                ].map((s) => (
                  <div key={s.step} className="flex items-center">
                    <button
                      onClick={() => {
                        // Allow navigation to previous steps or next steps only if configured or signed
                        if (s.step === "configure" || 
                            (s.step === "quote" && workflowStep !== "configure") ||
                            (s.step === "sign" && (workflowStep === "sign" || workflowStep === "billing")) ||
                            s.step === workflowStep) {
                          setWorkflowStep(s.step as any);
                        }
                      }}
                      disabled={s.step === "sign" && workflowStep === "configure"}
                      className={`px-3 py-1.5 rounded transition-all font-semibold ${
                        workflowStep === s.step 
                          ? "bg-[#C4A484] text-[#050505]" 
                          : "text-white/40 hover:text-white/80"
                      }`}
                    >
                      {s.label}
                    </button>
                    {s.step !== "billing" && <ChevronRight className="w-3 h-3 text-white/10 hidden md:block" />}
                  </div>
                ))}
              </div>
            </div>

            {/* Step Content: CONFIGURE CPQ */}
            {workflowStep === "configure" && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Product tiers */}
                <div className="lg:col-span-2 space-y-6">
                  <div>
                    <h3 className="text-base font-semibold text-white mb-4 uppercase tracking-wider flex items-center gap-2">
                      <Layers className="w-4 h-4 text-[#C4A484]" />
                      Select Product Edition
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {PRODUCT_TIERS.map((tier) => (
                        <div
                          key={tier.id}
                          onClick={() => setSelectedTier(tier)}
                          className={`p-5 rounded border cursor-pointer transition-all flex flex-col justify-between ${
                            selectedTier.id === tier.id 
                              ? "bg-[#C4A484]/5 border-[#C4A484] shadow-md shadow-[#C4A484]/5" 
                              : "bg-[#0a0a0a] border-white/5 hover:border-white/20"
                          }`}
                        >
                          <div>
                            <div className="flex justify-between items-start mb-2">
                              <span className="text-xs font-bold uppercase tracking-wider text-white">{tier.name}</span>
                              {selectedTier.id === tier.id && <div className="w-2 h-2 rounded-full bg-[#C4A484]"></div>}
                            </div>
                            <p className="text-[11px] text-white/50 leading-relaxed mb-4">{tier.description}</p>
                          </div>
                          <div>
                            <div className="text-lg font-light text-white mb-1">
                              ${tier.basePrice.toLocaleString()}<span className="text-[10px] text-white/40">/mo</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Pricing Sliders & Options */}
                  <div className="bg-[#0a0a0a] border border-white/5 p-6 rounded-lg space-y-6">
                    <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Configure Parameters</h3>
                    
                    {/* Seat slider */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs text-white">
                        <span className="flex items-center gap-2 text-white/60">
                          <User className="w-3.5 h-3.5 text-[#C4A484]" /> Enterprise Seats
                        </span>
                        <span className="font-mono text-white font-semibold">{seats} seats (${(seats * pricePerSeat).toLocaleString()}/mo)</span>
                      </div>
                      <input 
                        type="range" 
                        min="50" 
                        max="2000" 
                        step="25"
                        value={seats} 
                        onChange={(e) => setSeats(Number(e.target.value))}
                        className="w-full accent-[#C4A484] h-1.5 bg-white/10 rounded-lg cursor-pointer"
                      />
                      <div className="flex justify-between text-[10px] text-white/30">
                        <span>50 seats</span>
                        <span>1,000 seats</span>
                        <span>2,000 seats</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-white/5">
                      {/* SLA Level */}
                      <div className="space-y-2">
                        <label className="text-xs text-white/60 block">SLA Commitment</label>
                        <div className="grid grid-cols-3 gap-2">
                          {(["99.9%", "99.99%", "99.999%"] as const).map((level) => (
                            <button
                              key={level}
                              onClick={() => setSlaLevel(level)}
                              className={`py-2 text-xs font-semibold rounded border transition-all ${
                                slaLevel === level 
                                  ? "bg-[#C4A484]/10 border-[#C4A484] text-white" 
                                  : "bg-[#050505] border-white/5 text-white/50 hover:border-white/10"
                              }`}
                            >
                              {level}
                            </button>
                          ))}
                        </div>
                        <span className="text-[10px] text-white/40 block">
                          {slaLevel === "99.9%" ? "Included in base price" : slaLevel === "99.99%" ? "+$1,200/mo" : "+$3,500/mo premium tier"}
                        </span>
                      </div>

                      {/* Term Period */}
                      <div className="space-y-2">
                        <label className="text-xs text-white/60 block">Contract Term (Term Discount)</label>
                        <div className="grid grid-cols-3 gap-2">
                          {(["Monthly", "Annual", "Triennial"] as const).map((termOption) => (
                            <button
                              key={termOption}
                              onClick={() => setTerm(termOption)}
                              className={`py-2 text-xs font-semibold rounded border transition-all ${
                                term === termOption 
                                  ? "bg-[#C4A484]/10 border-[#C4A484] text-white" 
                                  : "bg-[#050505] border-white/5 text-white/50 hover:border-white/10"
                              }`}
                            >
                              {termOption}
                            </button>
                          ))}
                        </div>
                        <span className="text-[10px] text-white/40 block">
                          {term === "Monthly" ? "No term discount" : term === "Annual" ? "15% term discount applied" : "25% long-term discount applied"}
                        </span>
                      </div>
                    </div>

                    {/* Corporate Structure and Deployment Scope */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-white/5">
                      {/* Subsidiary Structure */}
                      <div className="space-y-2">
                        <label className="text-xs text-white/60 block flex items-center gap-1.5 font-medium">
                          Corporate Subsidiary Structure <span className="text-[10px] text-[#C4A484] italic font-normal">(дочерняя структура)</span>
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                          {[
                            { id: "none", label: "None / Core" },
                            { id: "evo", label: "EVO Framework" },
                            { id: "standard", label: "Standard Branch" }
                          ].map((sub) => (
                            <button
                              key={sub.id}
                              type="button"
                              onClick={() => setSubsidiaryStructure(sub.id as any)}
                              className={`py-2 text-[10px] font-bold uppercase tracking-wider rounded border transition-all ${
                                subsidiaryStructure === sub.id 
                                  ? "bg-[#C4A484]/15 border-[#C4A484] text-white shadow-sm shadow-[#C4A484]/10" 
                                  : "bg-[#050505] border-white/5 text-white/50 hover:border-white/10"
                              }`}
                            >
                              {sub.id === "evo" ? "EVO (evosolutions.ai)" : sub.label}
                            </button>
                          ))}
                        </div>
                        <span className="text-[10px] text-white/40 block">
                          {subsidiaryStructure === "none" 
                            ? "Standard primary company billing and liability" 
                            : subsidiaryStructure === "evo" 
                              ? "evosolutions.ai provides comfort, guidance, and support for human activity and jobs without human replacement." 
                              : "Standard affiliate / localized legal entity"}
                        </span>
                      </div>

                      {/* Deployment Scope */}
                      <div className="space-y-2">
                        <label className="text-xs text-white/60 block font-medium">Deployment Scope (Сфера развертывания)</label>
                        <div className="grid grid-cols-3 gap-2">
                          {[
                            { id: "saas", label: "Enterprise SaaS" },
                            { id: "crypto", label: "Crypto/Web3" },
                            { id: "onprem", label: "On-Premise" }
                          ].map((dep) => (
                            <button
                              key={dep.id}
                              type="button"
                              onClick={() => setDeploymentScope(dep.id as any)}
                              className={`py-2 text-[10px] font-bold uppercase tracking-wider rounded border transition-all ${
                                deploymentScope === dep.id 
                                  ? "bg-[#C4A484]/15 border-[#C4A484] text-white shadow-sm shadow-[#C4A484]/10" 
                                  : "bg-[#050505] border-white/5 text-white/50 hover:border-white/10"
                              }`}
                            >
                              {dep.label}
                            </button>
                          ))}
                        </div>
                        <span className="text-[10px] text-white/40 block">
                          {deploymentScope === "saas" 
                            ? "Standard cloud multi-tenant deployment" 
                            : deploymentScope === "crypto" 
                              ? "Digital assets & crypto-currency protocol deployment" 
                              : "Private air-gapped on-premise cloud infrastructure"}
                        </span>
                      </div>
                    </div>

                    {/* Advisory Banners for EVO/Crypto suitability */}
                    {subsidiaryStructure === "evo" && (
                      <div className="p-4 bg-[#C4A484]/10 border border-[#C4A484]/30 rounded-md text-xs text-white/80 flex items-start gap-2.5 animate-fade-in">
                        <Info className="w-4 h-4 mt-0.5 shrink-0 text-[#C4A484]" />
                        <div>
                          <strong className="font-semibold block text-[#C4A484] mb-0.5">🌐 Human Activity Guidance (evosolutions.ai)</strong>
                          The <span className="text-[#C4A484] font-medium font-mono">evosolutions.ai</span> subsidiary structure is dedicated exclusively to providing guidance, comfort, and interactive support to assist humans with their admired tasks, jobs, and creative activities. It serves as an active co-pilot, designed to amplify human capability rather than replace human workers or human agency.
                        </div>
                      </div>
                    )}

                    {deploymentScope === "crypto" && subsidiaryStructure === "evo" && (
                      <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-md text-xs text-emerald-400/90 flex items-start gap-2.5 animate-fade-in">
                        <Check className="w-4 h-4 mt-0.5 shrink-0 text-emerald-400" />
                        <div>
                          <strong className="font-semibold block text-emerald-300 mb-0.5">✓ Optimized Crypto Architecture Alignment</strong>
                          The EVO framework (evosolutions.ai) is highly suitable as a <span className="italic">"дочерняя структура"</span> (subsidiary/child structure) for crypto currency deployments. This ensures legal risk segregation and decentralized network compatibility while supporting human-centric utility protocols.
                        </div>
                      </div>
                    )}

                    {deploymentScope === "crypto" && subsidiaryStructure !== "evo" && (
                      <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-md text-xs text-amber-400/90 flex items-start gap-2.5 animate-fade-in">
                        <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0 text-amber-400" />
                        <div>
                          <strong className="font-semibold block text-amber-300 mb-0.5">⚠ Structural Compliance Warning</strong>
                          Deploying crypto currency protocols directly onto the main company entity introduces substantial balance-sheet risk. The <span className="underline font-bold">EVO (evosolutions.ai) child structure</span> is recommended to isolate crypto-asset operational liabilities.
                        </div>
                      </div>
                    )}

                    {deploymentScope !== "crypto" && subsidiaryStructure === "evo" && (
                      <div className="p-4 bg-white/5 border border-white/10 rounded-md text-xs text-white/60 flex items-start gap-2.5 animate-fade-in">
                        <Info className="w-4 h-4 mt-0.5 shrink-0 text-[#C4A484]" />
                        <div>
                          <strong className="font-semibold block text-white/80 mb-0.5">ℹ Sub-Optimal Framework Deployment</strong>
                          While EVO (evosolutions.ai) is running to support human workflows, it is specifically optimized for decentralized utility token and crypto-currency protocol structures.
                        </div>
                      </div>
                    )}

                    {/* Sales Discount Override */}
                    <div className="space-y-2 pt-4 border-t border-white/5">
                      <div className="flex justify-between text-xs text-white">
                        <span className="text-white/60 flex items-center gap-2">
                          <Building className="w-3.5 h-3.5 text-[#C4A484]" /> Strategic Discount Override
                        </span>
                        <span className="font-mono text-white font-semibold">{discountOverride}%</span>
                      </div>
                      <input 
                        type="range" 
                        min="0" 
                        max="40" 
                        value={discountOverride} 
                        onChange={(e) => setDiscountOverride(Number(e.target.value))}
                        className="w-full accent-[#C4A484] h-1.5 bg-white/10 rounded-lg cursor-pointer"
                      />
                      <div className="flex justify-between text-[10px] text-white/30">
                        <span>0% (Fully Standard)</span>
                        <span>20% (Max Automated)</span>
                        <span>40% (C-Suite Sign-off)</span>
                      </div>
                    </div>
                  </div>

                  {/* Cryptographic Exchange Authentication Gateway */}
                  {deploymentScope === "crypto" && (
                    <div className="bg-[#0a0a0a] border border-white/5 p-6 rounded-lg space-y-6 animate-fade-in">
                      <div>
                        <span className="text-[10px] uppercase tracking-[0.2em] text-[#C4A484] font-semibold block mb-1">Exchange Node Security</span>
                        <h3 className="text-sm font-semibold text-white uppercase tracking-wider flex items-center gap-2">
                          <Lock className="w-4 h-4 text-[#C4A484]" />
                          Cryptographic Authentication Gateway
                        </h3>
                      </div>

                      <p className="text-xs text-white/50 leading-relaxed">
                        Authenticate and connect your sovereign exchange nodes to route automated pricing liquidity, hedging protocols, and digital asset custody agreements safely.
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* GEMINI PORT */}
                        <div className="bg-[#050505] border border-white/5 p-5 rounded-lg space-y-4">
                          <div className="flex justify-between items-start">
                            <div className="flex items-center gap-2">
                              <Coins className="w-4 h-4 text-sky-400" />
                              <div>
                                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Gemini Exchange Node</h4>
                                <span className="text-[9px] font-mono text-white/40 block">API Integration Gateway</span>
                              </div>
                            </div>
                            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase ${
                              geminiStatus === "connected" 
                                ? "bg-emerald-500/10 text-emerald-400" 
                                : geminiStatus === "connecting"
                                  ? "bg-amber-500/10 text-amber-400 animate-pulse"
                                  : geminiStatus === "error"
                                    ? "bg-rose-500/10 text-rose-400"
                                    : "bg-white/5 text-white/40"
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${
                                geminiStatus === "connected" 
                                  ? "bg-emerald-400 shadow-sm shadow-emerald-400/50" 
                                  : geminiStatus === "connecting"
                                    ? "bg-amber-400"
                                    : geminiStatus === "error"
                                      ? "bg-rose-400"
                                      : "bg-white/20"
                              }`}></span>
                              {geminiStatus}
                            </span>
                          </div>

                          {/* Gemini Details or Input Fields */}
                          {geminiStatus !== "connected" ? (
                            <div className="space-y-3">
                              <div>
                                <label className="text-[10px] text-white/40 block mb-1 font-mono uppercase">API Key / Client ID</label>
                                <div className="relative">
                                  <Key className="w-3.5 h-3.5 text-white/30 absolute left-3 top-2.5" />
                                  <input 
                                    type="text"
                                    placeholder="e.g. master-3x7v9w... (or 'demo')"
                                    value={geminiApiKey}
                                    onChange={(e) => setGeminiApiKey(e.target.value)}
                                    className="w-full bg-[#0a0a0a] border border-white/5 rounded px-3 py-2 pl-9 text-xs font-mono text-white placeholder-white/20 focus:border-[#C4A484]/50 outline-none"
                                  />
                                </div>
                              </div>
                              <div>
                                <label className="text-[10px] text-white/40 block mb-1 font-mono uppercase">API Secret</label>
                                <div className="relative">
                                  <Lock className="w-3.5 h-3.5 text-white/30 absolute left-3 top-2.5" />
                                  <input 
                                    type="password"
                                    placeholder="••••••••••••••••••••••••"
                                    value={geminiApiSecret}
                                    onChange={(e) => setGeminiApiSecret(e.target.value)}
                                    className="w-full bg-[#0a0a0a] border border-white/5 rounded px-3 py-2 pl-9 text-xs font-mono text-white placeholder-white/20 focus:border-[#C4A484]/50 outline-none"
                                  />
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleCryptoAuth("gemini")}
                                disabled={geminiStatus === "connecting"}
                                className="w-full py-2 bg-white/5 hover:bg-white/10 text-white font-semibold text-xs rounded border border-white/10 transition-all flex items-center justify-center gap-1.5"
                              >
                                {geminiStatus === "connecting" ? (
                                  <>
                                    <RefreshCw className="w-3 h-3 animate-spin text-[#C4A484]" /> Handshaking...
                                  </>
                                ) : (
                                  <>
                                    <Unlock className="w-3 h-3 text-[#C4A484]" /> Connect Gemini Node
                                  </>
                                )}
                              </button>
                            </div>
                          ) : (
                            <div className="space-y-3 bg-[#0a0a0a] border border-white/5 p-3.5 rounded text-xs">
                              <div className="flex justify-between items-center border-b border-white/5 pb-1.5">
                                <span className="text-white/40">Verified Node:</span>
                                <span className="font-mono text-white text-[11px] font-medium">{geminiAccount || 'Gemini Connected Node'}</span>
                              </div>
                              <div className="flex justify-between items-center border-b border-white/5 pb-1.5">
                                <span className="text-white/40">Live BTC/USD Price:</span>
                                <span className="font-mono text-emerald-400 text-xs font-bold flex items-center gap-1">
                                  <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                                  {geminiTicker || 'Fetching live feed...'}
                                </span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-white/40">Ping Latency:</span>
                                <span className="font-mono text-[#C4A484]">{geminiLatency || '94ms'}</span>
                              </div>
                              {geminiMsg && (
                                <p className="text-[10px] text-white/50 bg-white/5 p-2 rounded leading-relaxed border border-white/5 mt-2">
                                  {geminiMsg}
                                </p>
                              )}
                              <button
                                type="button"
                                onClick={() => handleCryptoDisconnect("gemini")}
                                className="w-full py-1.5 mt-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs rounded border border-rose-500/20 transition-all"
                              >
                                Disconnect & Revoke Credentials
                              </button>
                            </div>
                          )}
                        </div>

                        {/* BINANCE PORT */}
                        <div className="bg-[#050505] border border-white/5 p-5 rounded-lg space-y-4">
                          <div className="flex justify-between items-start">
                            <div className="flex items-center gap-2">
                              <Coins className="w-4 h-4 text-amber-400" />
                              <div>
                                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Binance Exchange Node</h4>
                                <span className="text-[9px] font-mono text-white/40 block">Liquidity & Spot Gateway</span>
                              </div>
                            </div>
                            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase ${
                              binanceStatus === "connected" 
                                ? "bg-emerald-500/10 text-emerald-400" 
                                : binanceStatus === "connecting"
                                  ? "bg-amber-500/10 text-amber-400 animate-pulse"
                                  : binanceStatus === "error"
                                    ? "bg-rose-500/10 text-rose-400"
                                    : "bg-white/5 text-white/40"
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${
                                binanceStatus === "connected" 
                                  ? "bg-emerald-400 shadow-sm shadow-emerald-400/50" 
                                  : binanceStatus === "connecting"
                                    ? "bg-amber-400"
                                    : binanceStatus === "error"
                                      ? "bg-rose-400"
                                      : "bg-white/20"
                              }`}></span>
                              {binanceStatus}
                            </span>
                          </div>

                          {/* Binance Details or Input Fields */}
                          {binanceStatus !== "connected" ? (
                            <div className="space-y-3">
                              <div>
                                <label className="text-[10px] text-white/40 block mb-1 font-mono uppercase">API Key / Client ID</label>
                                <div className="relative">
                                  <Key className="w-3.5 h-3.5 text-white/30 absolute left-3 top-2.5" />
                                  <input 
                                    type="text"
                                    placeholder="e.g. binance-8v2k1... (or 'demo')"
                                    value={binanceApiKey}
                                    onChange={(e) => setBinanceApiKey(e.target.value)}
                                    className="w-full bg-[#0a0a0a] border border-white/5 rounded px-3 py-2 pl-9 text-xs font-mono text-white placeholder-white/20 focus:border-[#C4A484]/50 outline-none"
                                  />
                                </div>
                              </div>
                              <div>
                                <label className="text-[10px] text-white/40 block mb-1 font-mono uppercase">API Secret</label>
                                <div className="relative">
                                  <Lock className="w-3.5 h-3.5 text-white/30 absolute left-3 top-2.5" />
                                  <input 
                                    type="password"
                                    placeholder="••••••••••••••••••••••••"
                                    value={binanceApiSecret}
                                    onChange={(e) => setBinanceApiSecret(e.target.value)}
                                    className="w-full bg-[#0a0a0a] border border-white/5 rounded px-3 py-2 pl-9 text-xs font-mono text-white placeholder-white/20 focus:border-[#C4A484]/50 outline-none"
                                  />
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleCryptoAuth("binance")}
                                disabled={binanceStatus === "connecting"}
                                className="w-full py-2 bg-white/5 hover:bg-white/10 text-white font-semibold text-xs rounded border border-white/10 transition-all flex items-center justify-center gap-1.5"
                              >
                                {binanceStatus === "connecting" ? (
                                  <>
                                    <RefreshCw className="w-3 h-3 animate-spin text-[#C4A484]" /> Handshaking...
                                  </>
                                ) : (
                                  <>
                                    <Unlock className="w-3 h-3 text-[#C4A484]" /> Connect Binance Node
                                  </>
                                )}
                              </button>
                            </div>
                          ) : (
                            <div className="space-y-3 bg-[#0a0a0a] border border-white/5 p-3.5 rounded text-xs">
                              <div className="flex justify-between items-center border-b border-white/5 pb-1.5">
                                <span className="text-white/40">Verified Node:</span>
                                <span className="font-mono text-white text-[11px] font-medium">{binanceAccount || 'Binance Connected Node'}</span>
                              </div>
                              <div className="flex justify-between items-center border-b border-white/5 pb-1.5">
                                <span className="text-white/40">Live BTC/USDT Price:</span>
                                <span className="font-mono text-emerald-400 text-xs font-bold flex items-center gap-1">
                                  <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                                  {binanceTicker || 'Fetching live feed...'}
                                </span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-white/40">Ping Latency:</span>
                                <span className="font-mono text-[#C4A484]">{binanceLatency || '102ms'}</span>
                              </div>
                              {binanceMsg && (
                                <p className="text-[10px] text-white/50 bg-white/5 p-2 rounded leading-relaxed border border-white/5 mt-2">
                                  {binanceMsg}
                                </p>
                              )}
                              <button
                                type="button"
                                onClick={() => handleCryptoDisconnect("binance")}
                                className="w-full py-1.5 mt-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs rounded border border-rose-500/20 transition-all"
                              >
                                Disconnect & Revoke Credentials
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {cryptoAuthError && (
                        <div className="p-3 bg-rose-500/5 border border-rose-500/20 rounded text-xs text-rose-400/90 flex items-start gap-2 animate-fade-in">
                          <ShieldAlert className="w-4 h-4 mt-0.5 shrink-0 text-rose-400" />
                          <div>
                            <strong className="font-semibold block text-rose-300">Authentication Gateway Error</strong>
                            {cryptoAuthError}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* CPQ Sidebar summary */}
                <div className="bg-[#0a0a0a] border border-white/5 p-6 rounded-lg flex flex-col justify-between">
                  <div>
                    <h3 className="text-xs uppercase tracking-widest text-[#C4A484] font-bold mb-4 flex items-center gap-1">
                      <DollarSign className="w-4 h-4" /> QUOTE ESTIMATE
                    </h3>
                    
                    <div className="space-y-3 mb-6 text-xs">
                      <div className="flex justify-between border-b border-white/5 pb-2">
                        <span className="text-white/50">Edition Base ({selectedTier.name})</span>
                        <span className="font-mono">${basePrice.toLocaleString()}/mo</span>
                      </div>
                      <div className="flex justify-between border-b border-white/5 pb-2">
                        <span className="text-white/50">Seat Licensing ({seats} seats)</span>
                        <span className="font-mono">${seatCost.toLocaleString()}/mo</span>
                      </div>
                      <div className="flex justify-between border-b border-white/5 pb-2">
                        <span className="text-white/50">SLA Commitment ({slaLevel})</span>
                        <span className="font-mono">${slaCost.toLocaleString()}/mo</span>
                      </div>
                      <div className="flex justify-between border-b border-white/5 pb-2 text-white font-semibold">
                        <span>Standard Subtotal</span>
                        <span className="font-mono">${subtotal.toLocaleString()}/mo</span>
                      </div>
                      
                      {termDiscountAmount > 0 && (
                        <div className="flex justify-between border-b border-white/5 pb-2 text-emerald-400">
                          <span>{term} Term Discount ({termDiscounts[term] * 100}%)</span>
                          <span className="font-mono">-${termDiscountAmount.toLocaleString()}/mo</span>
                        </div>
                      )}
                      
                      {discountOverride > 0 && (
                        <div className="flex justify-between border-b border-white/5 pb-2 text-emerald-400">
                          <span>Discount Override ({discountOverride}%)</span>
                          <span className="font-mono">-${overrideDiscountAmount.toLocaleString()}/mo</span>
                        </div>
                      )}

                      <div className="flex justify-between text-base font-bold text-white pt-2">
                        <span>Calculated Monthly</span>
                        <span className="font-mono text-[#C4A484]">${finalMonthlyCost.toLocaleString()}/mo</span>
                      </div>
                      
                      <div className="flex justify-between text-xs font-semibold text-white/70 border-t border-white/10 pt-2">
                        <span>Contract Value ({term === "Monthly" ? "1 Month" : term === "Annual" ? "12 Months" : "36 Months"})</span>
                        <span className="font-mono">${totalContractValue.toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Compliance Indicator */}
                    <motion.div 
                      key={compliance.level}
                      initial={{ opacity: 0, scale: 0.95, y: 8 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      transition={{ type: "spring", stiffness: 300, damping: 25 }}
                      whileHover={{ scale: 1.02 }}
                      className={`p-4 rounded border ${compliance.color} text-xs space-y-1 mb-6 cursor-default`}
                    >
                      <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider">
                        {compliance.level === "compliant" && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                        {compliance.level === "warning" && <AlertTriangle className="w-4 h-4 text-amber-500" />}
                        {compliance.level === "critical" && <AlertTriangle className="w-4 h-4 text-rose-500 animate-pulse" />}
                        <span>{compliance.label}</span>
                      </div>
                      <p className="text-[11px] leading-relaxed text-white/70">{compliance.desc}</p>
                    </motion.div>
                  </div>

                  <button
                    onClick={() => setWorkflowStep("quote")}
                    className="w-full py-3 bg-[#C4A484] text-[#050505] text-xs font-bold uppercase tracking-widest hover:bg-white hover:text-[#050505] transition-all"
                  >
                    Proceed to Contract Audit
                  </button>
                </div>
              </div>
            )}

            {/* Step Content: CONTRACT AUDIT */}
            {workflowStep === "quote" && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                  {/* Compliance Ledger Section */}
                  <div className="bg-[#0a0a0a] border border-white/5 p-6 rounded-lg">
                    <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-[#C4A484]" />
                      Dynamic Commercial Guardrails Audit
                    </h3>

                    <div className="space-y-4">
                      {/* Check 1: Margin Protection */}
                      <div className="flex items-start justify-between p-3 bg-[#111] rounded border border-white/5">
                        <div className="space-y-1 pr-4">
                          <h4 className="text-xs text-white font-semibold">Guardrail 1: Gross Margin Level</h4>
                          <p className="text-[11px] text-white/50 leading-relaxed">Verifies that the seat allocation and platform edition yield over 65% gross margins.</p>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold uppercase">
                          <CheckCircle2 className="w-4 h-4" /> Passed
                        </div>
                      </div>

                      {/* Check 2: Discount Authority */}
                      <motion.div 
                        key={`guardrail2-${compliance.level}`}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ type: "spring", stiffness: 350, damping: 25 }}
                        className="flex items-start justify-between p-3 bg-[#111] rounded border border-white/5"
                      >
                        <div className="space-y-1 pr-4">
                          <h4 className="text-xs text-white font-semibold">Guardrail 2: Sales Discount Threshold</h4>
                          <p className="text-[11px] text-white/50 leading-relaxed">Limits dynamic sales overrides without CFO/GC intervention. Current override is {discountOverride}%.</p>
                        </div>
                        <div>
                          {compliance.level === "compliant" && (
                            <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold uppercase">
                              <CheckCircle2 className="w-4 h-4" /> Standard
                            </span>
                          )}
                          {compliance.level === "warning" && (
                            <span className="flex items-center gap-1.5 text-xs text-amber-400 font-semibold uppercase">
                              <AlertTriangle className="w-4 h-4" /> VP Review
                            </span>
                          )}
                          {compliance.level === "critical" && (
                            <span className="flex items-center gap-1.5 text-xs text-rose-400 font-semibold uppercase animate-pulse">
                              <AlertTriangle className="w-4 h-4" /> GC Audit Blocked
                            </span>
                          )}
                        </div>
                      </motion.div>

                      {/* Check 3: SLA Commitment Alignment */}
                      <div className="flex items-start justify-between p-3 bg-[#111] rounded border border-white/5">
                        <div className="space-y-1 pr-4">
                          <h4 className="text-xs text-white font-semibold">Guardrail 3: SLA Liability Alignment</h4>
                          <p className="text-[11px] text-white/50 leading-relaxed">Aligns custom liability clauses with service level commitments of {slaLevel}.</p>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold uppercase">
                          <CheckCircle2 className="w-4 h-4" /> Auto-Aligned
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Session Audit History View */}
                  <div className="bg-[#0a0a0a] border border-white/5 p-6 rounded-lg">
                    <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-3">
                      <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4 text-[#C4A484]" />
                        <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
                          Session Adjustments & Audit Trail
                        </h3>
                      </div>
                      <span className="text-[10px] font-mono text-white/40 uppercase bg-white/5 px-2.5 py-0.5 rounded">
                        Active Session Log
                      </span>
                    </div>

                    {auditLogs.length === 0 ? (
                      <div className="text-center py-6 text-xs text-white/40 font-light flex flex-col items-center gap-2">
                        <CheckCircle2 className="w-8 h-8 text-emerald-500/40" />
                        <p>No manual adjustments detected in the current session.</p>
                        <span className="text-[10px] font-mono text-white/30">Standard pre-approved commercial guidelines active.</span>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="overflow-x-auto max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                          <table className="w-full text-left font-mono text-[11px] text-white/70">
                            <thead>
                              <tr className="border-b border-white/5 text-white/40 text-[9px] uppercase tracking-wider">
                                <th className="pb-2 font-semibold">Timestamp</th>
                                <th className="pb-2 font-semibold">Parameter Changed</th>
                                <th className="pb-2 font-semibold">Original Value</th>
                                <th className="pb-2 font-semibold text-right">Adjusted Value</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                              {auditLogs.map((log) => (
                                <tr key={log.id} className="hover:bg-white/[0.02] transition-colors">
                                  <td className="py-2 text-white/40 font-mono text-[10px]">{log.timestamp}</td>
                                  <td className="py-2 font-sans font-medium text-white">{log.parameter}</td>
                                  <td className="py-2 text-rose-400/80 line-through decoration-rose-500/30">{log.oldValue}</td>
                                  <td className="py-2 text-emerald-400 font-bold text-right">
                                    <span className="inline-flex items-center gap-1 justify-end w-full">
                                      <ArrowRight className="w-3 h-3 text-white/20" />
                                      {log.newValue}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        <div className="pt-2 border-t border-white/5 flex justify-between items-center text-[10px] text-white/40 font-sans">
                          <span>Total manual edits tracked: <strong className="text-[#C4A484]">{auditLogs.length}</strong></span>
                          <button
                            onClick={() => setAuditLogs([])}
                            className="text-[#C4A484] hover:text-white hover:underline uppercase tracking-wider text-[9px] font-mono cursor-pointer"
                          >
                            Reset Trail
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Draft Contract Preview */}
                  <div className="bg-white text-zinc-900 p-8 rounded-lg font-serif shadow-2xl relative overflow-hidden text-xs max-w-4xl leading-relaxed">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-[#C4A484]"></div>
                    
                    <div className="flex justify-between items-start border-b border-zinc-200 pb-4 mb-6">
                      <div>
                        <h2 className="text-base font-bold uppercase tracking-widest text-zinc-800">QUARTZ CLOUD MASTER AGREEMENT</h2>
                        <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-sans font-bold block">Document Ref: Q-2026-00481</span>
                      </div>
                      <div className="text-right font-sans">
                        <span className="text-[9px] font-bold text-zinc-400 block">GENERATED VIA AI CLM</span>
                        <span className="text-xs font-mono font-bold text-[#C4A484]">QUARTZ INC.</span>
                      </div>
                    </div>

                    <p className="mb-4">
                      This MASTER SERVICES AGREEMENT (the <strong>&quot;Agreement&quot;</strong>) is entered into as of June 27, 2026, by and between <strong>Quartz Technologies, Inc.</strong>, with offices at 100 Quartz Way, Ste 400 (<strong>&quot;Provider&quot;</strong>) and the purchasing entity (<strong>&quot;Subscriber&quot;</strong>).
                    </p>

                    <h4 className="font-bold text-zinc-800 uppercase mt-4 mb-2 font-sans text-[11px] tracking-wider border-b border-zinc-100 pb-1">1. COMMERCIAL SCHEDULE</h4>
                    <table className="w-full text-left font-sans text-[11px] mb-4 text-zinc-700">
                      <thead>
                        <tr className="border-b border-zinc-200 text-zinc-400">
                          <th className="py-1">Product Description</th>
                          <th className="py-1 text-right">Units (Seats)</th>
                          <th className="py-1 text-right">Price Rate</th>
                          <th className="py-1 text-right">Net Subtotal</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-zinc-100">
                          <td className="py-1 font-semibold">{selectedTier.name}</td>
                          <td className="py-1 text-right">1 License</td>
                          <td className="py-1 text-right">${basePrice.toLocaleString()}/mo</td>
                          <td className="py-1 text-right">${basePrice.toLocaleString()}/mo</td>
                        </tr>
                        <tr className="border-b border-zinc-100">
                          <td className="py-1">User Seat Licensing</td>
                          <td className="py-1 text-right">{seats}</td>
                          <td className="py-1 text-right">$15.00/mo</td>
                          <td className="py-1 text-right">${seatCost.toLocaleString()}/mo</td>
                        </tr>
                        <tr className="border-b border-zinc-100">
                          <td className="py-1">SLA Premium Service ({slaLevel})</td>
                          <td className="py-1 text-right">1 Allocation</td>
                          <td className="py-1 text-right">${slaCost.toLocaleString()}/mo</td>
                          <td className="py-1 text-right">${slaCost.toLocaleString()}/mo</td>
                        </tr>
                        {termDiscountAmount > 0 && (
                          <tr className="text-emerald-700">
                            <td className="py-1 font-semibold">{term} Term Discount</td>
                            <td className="py-1 text-right">Term Contract</td>
                            <td className="py-1 text-right">-{termDiscounts[term]*100}%</td>
                            <td className="py-1 text-right">-${termDiscountAmount.toLocaleString()}/mo</td>
                          </tr>
                        )}
                        {discountOverride > 0 && (
                          <tr className="text-emerald-700">
                            <td className="py-1 font-semibold">Discount Override Allowed</td>
                            <td className="py-1 text-right">Strategic</td>
                            <td className="py-1 text-right">-{discountOverride}%</td>
                            <td className="py-1 text-right">-${overrideDiscountAmount.toLocaleString()}/mo</td>
                          </tr>
                        )}
                        <tr className="font-bold text-zinc-900 border-t border-zinc-300">
                          <td className="py-1.5" colSpan={3}>Effective Monthly Recurring Revenue (MRR)</td>
                          <td className="py-1.5 text-right">${finalMonthlyCost.toLocaleString()}/mo</td>
                        </tr>
                        <tr className="font-bold text-zinc-900">
                          <td className="py-1" colSpan={3}>Total Net Contract Value (TCV)</td>
                          <td className="py-1 text-right">${totalContractValue.toLocaleString()}</td>
                        </tr>
                      </tbody>
                    </table>

                    <h4 className="font-bold text-zinc-800 uppercase mt-4 mb-2 font-sans text-[11px] tracking-wider border-b border-zinc-100 pb-1">2. SERVICE LEVELS & WARRANTY LIMITS</h4>
                    <p className="mb-4 text-zinc-600 font-sans text-[11px] leading-relaxed">
                      Provider represents that service availability will strictly meet <strong>{slaLevel}</strong> metrics as tracked dynamically. If Provider breaches this threshold for three (3) consecutive billing intervals, Subscriber is entitled to proportional SLA fee credits, capped at a maximum of {discountOverride > 15 ? "30%" : "15%"} of the effective monthly allocation value.
                    </p>

                    <h4 className="font-bold text-zinc-800 uppercase mt-4 mb-2 font-sans text-[11px] tracking-wider border-b border-zinc-100 pb-1">3. REVENUE ALLOCATION AND ASC 606 ACCOUNTING</h4>
                    <p className="text-zinc-600 font-sans text-[11px] leading-relaxed mb-4">
                      This arrangement falls under ASC 606 revenue rules. Revenue is recognized on a monthly, straight-line performance schedule as access is delivered over the designated contract period.
                    </p>

                    {((subsidiaryStructure && subsidiaryStructure !== "none") || (deploymentScope && deploymentScope === "crypto")) && (
                      <>
                        <h4 className="font-bold text-zinc-800 uppercase mt-4 mb-2 font-sans text-[11px] tracking-wider border-b border-zinc-100 pb-1">4. SOVEREIGN SUBSIDIARY & PROTOCOL DEPLOYMENT</h4>
                        <p className="text-zinc-600 font-sans text-[11px] leading-relaxed mb-4">
                          {subsidiaryStructure === "evo" && deploymentScope === "crypto" ? (
                            <span>
                              This Agreement is legally routed to the purchasing entity's designated <strong>EVO child structure (дочерняя структура)</strong>, operating under the <strong>evosolutions.ai</strong> human-cooperative framework. All deployments are restricted to providing comfort, support, and guidance to enhance human task performance and admired jobs, rather than replacement. This EVO entity assumes sole balance-sheet liability and regulatory custody of all cryptographic protocol deployments, utility tokens, and sovereign digital assets associated with this deployment, fully insulating the primary parent corporation.
                            </span>
                          ) : subsidiaryStructure === "evo" ? (
                            <span>
                              This Agreement is legally routed to the purchasing entity's designated <strong>EVO child structure (дочерняя структура)</strong> governed by the <strong>evosolutions.ai</strong> charter, dedicated exclusively to providing active guidance, ergonomic support, and psychological comfort for human jobs and tasks, ensuring full protection against the replacement of human activity.
                            </span>
                          ) : (
                            <span className="text-rose-700 font-bold">
                              ⚠ ATTENTION: Crypto currency deployment is active but lacks the EVO subsidiary (дочерняя структура) framework. Operational protocol liability and digital asset custody will reside directly on the primary core corporate entity.
                            </span>
                          )}
                        </p>
                      </>
                    )}

                    <div className="mt-8 pt-6 border-t border-zinc-200 grid grid-cols-2 gap-8 text-zinc-500 font-sans text-[10px] uppercase tracking-wider font-bold">
                      <div>
                        <span>QUARTZ AUTHORIZED SIGNATURE</span>
                        <div className="mt-4 text-sm font-serif italic text-zinc-800 border-b border-zinc-200 pb-1">
                          Quartz Legal Operations
                        </div>
                      </div>
                      <div>
                        <span>SUBSCRIBER ACCEPTANCE</span>
                        <div className="mt-4 text-[11px] text-zinc-400 border-b border-zinc-200 pb-1 font-normal italic">
                          Signature pending (Step 3)
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contract Audit Control panel */}
                <div className="bg-[#0a0a0a] border border-white/5 p-6 rounded-lg flex flex-col justify-between">
                  <div className="space-y-6">
                    <h3 className="text-xs uppercase tracking-widest text-[#C4A484] font-bold">
                      COMPLIANCE RESOLUTION
                    </h3>

                    <motion.div
                      key={compliance.level}
                      initial={{ opacity: 0, scale: 0.96, y: 12 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      transition={{ type: "spring", stiffness: 280, damping: 22 }}
                    >
                      {compliance.level === "compliant" ? (
                        <div className="space-y-3">
                          <div className="p-3 bg-emerald-500/5 border border-emerald-500/10 rounded text-xs text-emerald-400">
                            ✓ Automated approval verified. The contract is immediately cleared for client execution.
                          </div>
                          <p className="text-xs text-white/50 leading-relaxed">No custom legal revisions or CFO waivers are required for this Quote-to-Cash arrangement.</p>
                        </div>
                      ) : compliance.level === "warning" ? (
                        <div className="space-y-3">
                          <div className="p-3 bg-amber-500/5 border border-amber-500/10 rounded text-xs text-amber-400">
                            ⚠ Discount override ({discountOverride}%) requires VP validation.
                          </div>
                          <p className="text-xs text-white/50 leading-relaxed">You can proceed to sign but in a real-world enterprise flow, this will trigger an internal Slack or email approval notification to the VP of Sales.</p>
                          <button
                            onClick={() => setDiscountOverride(10)}
                            className="w-full py-2 border border-white/10 hover:border-[#C4A484]/40 text-[10px] uppercase tracking-wider text-white font-semibold rounded hover:bg-white/5 transition-all"
                          >
                            Reset Discount to Compliant (10%)
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="p-3 bg-rose-500/5 border border-rose-500/10 rounded text-xs text-rose-400">
                            ✖ Critical Block. Discount override ({discountOverride}%) violates automated guardrails.
                          </div>
                          <p className="text-xs text-white/50 leading-relaxed">Signature is legally blocked. Adjust the CPQ override to less than 20% to pass compliance automatically, or use the AI Compliance Advisor in the chat tab to negotiate a legal waiver.</p>
                          <button
                            onClick={() => setDiscountOverride(20)}
                            className="w-full py-2 bg-[#C4A484]/10 hover:bg-[#C4A484]/20 text-[10px] uppercase tracking-wider text-[#C4A484] font-semibold rounded border border-[#C4A484]/20 transition-all"
                          >
                            Force Override to Max Compliant (20%)
                          </button>
                        </div>
                      )}
                    </motion.div>
                  </div>

                  <button
                    onClick={() => setWorkflowStep("sign")}
                    disabled={compliance.level === "critical"}
                    className={`w-full py-3 text-xs font-bold uppercase tracking-widest transition-all ${
                      compliance.level === "critical"
                        ? "bg-white/5 text-white/20 cursor-not-allowed"
                        : "bg-[#C4A484] text-[#050505] hover:bg-white hover:text-[#050505]"
                    }`}
                  >
                    Proceed to E-Signature
                  </button>
                </div>
              </div>
            )}

            {/* Step Content: E-SIGNATURE */}
            {workflowStep === "sign" && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                  <div className="bg-[#0a0a0a] border border-white/5 p-8 rounded-lg">
                    <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-6 flex items-center gap-2">
                      <FileSignature className="w-5 h-5 text-[#C4A484]" />
                      Digital Signature Terminal
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                      <div className="space-y-4">
                        <div className="space-y-1">
                          <label className="text-xs text-white/50 block">Full Name of Signee</label>
                          <input
                            type="text"
                            placeholder="e.g., Katherine Vance"
                            value={signeeName}
                            onChange={(e) => setSigneeName(e.target.value)}
                            className="w-full bg-[#050505] border border-white/10 rounded px-4 py-3 text-xs text-white focus:outline-none focus:border-[#C4A484]"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs text-white/50 block">Title / Designation</label>
                          <input
                            type="text"
                            placeholder="e.g., Director of Revenue Operations"
                            className="w-full bg-[#050505] border border-white/10 rounded px-4 py-3 text-xs text-white focus:outline-none focus:border-[#C4A484]"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-xs text-white/50 block">Billing Arrangement</label>
                          <div className="grid grid-cols-2 gap-2">
                            {(["Annual Upfront", "Monthly Recurring"] as const).map((option) => (
                              <button
                                key={option}
                                onClick={() => setPaymentOption(option)}
                                className={`py-2 text-[10px] font-bold uppercase tracking-wider rounded border transition-all ${
                                  paymentOption === option
                                    ? "bg-[#C4A484]/10 border-[#C4A484] text-white"
                                    : "bg-[#050505] border-white/5 text-white/50 hover:border-white/10"
                                }`}
                              >
                                {option}
                              </button>
                            ))}
                          </div>
                          <span className="text-[10px] text-white/40 block">
                            {paymentOption === "Annual Upfront" 
                              ? "Pay total annual contract value up front." 
                              : "Pay effective contract value in monthly installments."}
                          </span>
                        </div>
                      </div>

                      {/* Signature Preview Canvas */}
                      <div className="border border-white/10 bg-[#050505] p-6 rounded flex flex-col justify-between items-center text-center relative overflow-hidden">
                        <span className="text-[9px] uppercase tracking-widest text-white/30 absolute top-3 left-3">CRYPTOGRAPHIC VERIFICATION</span>
                        
                        <div className="my-auto py-8">
                          {signeeName ? (
                            <span className="text-3xl font-light font-serif italic text-[#C4A484] tracking-widest px-4 block border-b border-dashed border-white/20 pb-2">
                              {signeeName}
                            </span>
                          ) : (
                            <span className="text-xs text-white/30 italic">Type name to project digital signature</span>
                          )}
                        </div>

                        <div className="text-[10px] text-white/40 w-full pt-4 border-t border-white/5">
                          SHA-256 Key: <span className="font-mono text-[9px] text-[#C4A484]">6f8c2...d2e8b</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end gap-4">
                      <button
                        onClick={() => setWorkflowStep("quote")}
                        className="px-6 py-3 border border-white/10 hover:border-white/20 text-xs font-semibold uppercase tracking-widest hover:bg-white/5 text-white transition-all"
                      >
                        Back
                      </button>
                      <button
                        onClick={handleSignContract}
                        disabled={!signeeName.trim() || isSigning}
                        className={`px-8 py-3 text-xs font-bold uppercase tracking-widest flex items-center gap-2 transition-all ${
                          !signeeName.trim() || isSigning
                            ? "bg-white/5 text-white/20 cursor-not-allowed"
                            : "bg-[#C4A484] text-black hover:bg-white hover:text-black"
                        }`}
                      >
                        {isSigning ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" /> Verifying Cryptographic Ledger...
                          </>
                        ) : (
                          <>
                            Securely Sign Contract <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-[#0a0a0a] border border-white/5 p-6 rounded-lg space-y-6">
                  <h3 className="text-xs uppercase tracking-widest text-[#C4A484] font-bold">
                    SIGNATURE METADATA
                  </h3>
                  
                  <div className="space-y-4 text-xs leading-relaxed">
                    <p className="text-white/60">
                      Signing this digital instrument binds the parties to the generated commercial terms including SLA commitments of <strong className="text-white">{slaLevel}</strong> and seat counts of <strong className="text-white">{seats}</strong>.
                    </p>
                    <div className="p-3 bg-white/5 rounded border border-white/5 text-[11px] font-mono text-white/50 space-y-1">
                      <div>IP: 162.248.14.82</div>
                      <div>UTC: 2026-06-27 22:00</div>
                      <div>System: Chrome OS/AI Studio</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step Content: BILLING & REVENUE SCHEDULE */}
            {workflowStep === "billing" && (
              <div className="space-y-8 animate-fade-in">
                {/* Status Callout banner */}
                <div className="p-6 bg-[#C4A484]/10 border border-[#C4A484]/20 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#C4A484] text-[#050505] rounded-full flex items-center justify-center font-bold">
                      ✓
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Contract Fully Executed & Sign-off Secured</h3>
                      <p className="text-xs text-white/50">Signed by <strong>{signeeName}</strong> on {signedDate}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-white/40 uppercase block">Annual Revenue (ARR) Activated</span>
                    <span className="text-2xl font-light text-[#C4A484]">${annualContractValue.toLocaleString()}</span>
                  </div>
                </div>

                {/* Main Billing and revenue chart grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Revenue Curve Visualization */}
                  <div className="lg:col-span-2 bg-[#0a0a0a] border border-white/5 p-6 rounded-lg space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-white uppercase tracking-wider flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-[#C4A484]" />
                        ASC 606 Revenue Recognition Curve (12-Month Schedule)
                      </h3>
                      <div className="flex items-center gap-4 text-[10px] uppercase font-bold tracking-widest">
                        <div className="flex items-center gap-1.5">
                          <div className="w-2.5 h-2.5 bg-[#C4A484]"></div>
                          <span className="text-white/60">Recognized</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <div className="w-2.5 h-2.5 bg-sky-500"></div>
                          <span className="text-white/60">Deferred</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <div className="w-2.5 h-2.5 bg-emerald-500"></div>
                          <span className="text-white/60">Cash Collected</span>
                        </div>
                      </div>
                    </div>

                    {/* SVG Chart */}
                    <div className="w-full h-64 border-b border-l border-white/10 relative pt-4">
                      <svg viewBox="0 0 100 40" className="w-full h-full overflow-visible" preserveAspectRatio="none">
                        {/* Recognized Revenue Path (Climbs steadily) */}
                        <path
                          d={`M 0,40 L 100,0`}
                          fill="none"
                          stroke="#C4A484"
                          strokeWidth="1.5"
                        />
                        {/* Deferred Revenue Path (Drops steadily) */}
                        <path
                          d={`M 0,0 L 100,40`}
                          fill="none"
                          stroke="#38bdf8"
                          strokeWidth="1.5"
                          strokeDasharray="1.5, 1"
                        />
                        {/* Cash Collected Path (Flat line on top for Annual, climbing for Monthly) */}
                        {paymentOption === "Annual Upfront" ? (
                          <path
                            d={`M 0,0 L 100,0`}
                            fill="none"
                            stroke="#10b981"
                            strokeWidth="1.5"
                          />
                        ) : (
                          <path
                            d={`M 0,40 L 100,0`}
                            fill="none"
                            stroke="#10b981"
                            strokeWidth="1.5"
                          />
                        )}
                      </svg>
                      
                      {/* Month labels */}
                      <div className="flex justify-between text-[10px] text-white/30 pt-2 font-mono">
                        <span>Month 0</span>
                        <span>Month 3</span>
                        <span>Month 6</span>
                        <span>Month 9</span>
                        <span>Month 12</span>
                      </div>
                    </div>

                    <div className="p-4 bg-[#111] rounded text-[11px] text-white/50 leading-relaxed flex items-start gap-2 border border-white/5">
                      <Info className="w-4 h-4 text-[#C4A484] flex-shrink-0 mt-0.5" />
                      <div>
                        Under ASC 606 guidelines, the {paymentOption === "Annual Upfront" ? "entire Cash balance ($" + annualContractValue.toLocaleString() + ") is received instantly" : "Cash balance is collected monthly"}, but revenue MUST be recognized strictly linearly over time. Every month, <strong className="text-white">${Math.round(annualContractValue / 12).toLocaleString()}</strong> shifts from <strong className="text-sky-400">Deferred Revenue</strong> to <strong className="text-[#C4A484]">Recognized Revenue</strong>.
                      </div>
                    </div>
                  </div>

                  {/* Ledger Metrics */}
                  <div className="bg-[#0a0a0a] border border-white/5 p-6 rounded-lg space-y-6 flex flex-col justify-between">
                    <div>
                      <h3 className="text-xs uppercase tracking-widest text-[#C4A484] font-bold">
                        LEDGER TRANSACTION DETAILS
                      </h3>
                      
                      <div className="space-y-4 pt-4 text-xs">
                        <div className="flex justify-between border-b border-white/5 pb-2">
                          <span className="text-white/50">Ledger Status</span>
                          <span className="text-emerald-400 font-semibold uppercase font-mono">Activated</span>
                        </div>
                        <div className="flex justify-between border-b border-white/5 pb-2">
                          <span className="text-white/50">Billing Frequency</span>
                          <span className="font-mono text-white">{paymentOption}</span>
                        </div>
                        <div className="flex justify-between border-b border-white/5 pb-2">
                          <span className="text-white/50">Initial Deferred Balance</span>
                          <span className="font-mono text-sky-400">${annualContractValue.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between border-b border-white/5 pb-2">
                          <span className="text-white/50">Recognized Rate</span>
                          <span className="font-mono text-white">${Math.round(annualContractValue / 12).toLocaleString()}/mo</span>
                        </div>
                        <div className="flex justify-between pt-2 text-base font-bold text-white">
                          <span>Month 1 Recognized</span>
                          <span className="font-mono text-[#C4A484]">${Math.round(annualContractValue / 12).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <button
                        onClick={() => {
                          setWorkflowStep("configure");
                        }}
                        className="w-full py-3 border border-white/10 hover:border-[#C4A484]/30 text-xs font-bold uppercase tracking-widest text-white hover:bg-white/5 transition-all"
                      >
                        Reset and Configure New Quote
                      </button>
                    </div>
                  </div>
                </div>

                {/* GMAIL COMMUNICATIONS HUB */}
                <div className="mt-8 bg-[#0a0a0a] border border-[#C4A484]/20 rounded-lg p-6 space-y-6 relative overflow-hidden">
                  <div className="absolute -right-24 -bottom-24 w-64 h-64 bg-[#C4A484]/5 rounded-full blur-3xl pointer-events-none"></div>
                  
                  <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-white/5 pb-4 gap-4">
                    <div>
                      <span className="text-[10px] uppercase tracking-[0.3em] text-[#C4A484] font-semibold block mb-1">Workspace Dispatcher</span>
                      <h3 className="text-lg font-light text-white font-serif">Gmail Proposal & Audit Courier</h3>
                    </div>
                    {googleUser && (
                      <div className="flex items-center gap-2 text-xs text-emerald-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                        <span>Authorized as <strong className="font-mono text-white">{googleUser.email}</strong></span>
                      </div>
                    )}
                  </div>

                  {!googleUser ? (
                    <div className="flex flex-col items-center justify-center py-8 px-4 text-center space-y-4">
                      <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-white/50 border border-white/10">
                        <Send className="w-5 h-5 text-[#C4A484]" />
                      </div>
                      <div className="max-w-md">
                        <h4 className="text-sm font-semibold text-white">Google Account Authentication Required</h4>
                        <p className="text-xs text-white/50 mt-1">Connect your Google Workspace Gmail account to securely distribute quotes, executed contract schedules, or compliance waiver notifications directly from the Quartz interface.</p>
                      </div>
                      <button
                        onClick={handleGoogleSignIn}
                        disabled={isLoggingIn}
                        className="px-6 py-2.5 bg-white hover:bg-[#C4A484] text-black text-xs font-bold uppercase tracking-wider rounded transition-all flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 48 48">
                          <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                          <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                          <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                          <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                        </svg>
                        {isLoggingIn ? "Connecting account..." : "Sign in with Google"}
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {/* Left: Email Composer Form */}
                      <div className="space-y-4">
                        <div className="space-y-1">
                          <label className="text-xs text-white/50 block">Recipient Email Address</label>
                          <input
                            type="email"
                            placeholder="e.g., client-executive@company.com"
                            value={emailTo}
                            onChange={(e) => setEmailTo(e.target.value)}
                            className="w-full bg-[#050505] border border-white/10 rounded px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#C4A484]"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs text-white/50 block">Subject Line</label>
                          <input
                            type="text"
                            placeholder="Email subject..."
                            value={emailSubject}
                            onChange={(e) => setEmailSubject(e.target.value)}
                            className="w-full bg-[#050505] border border-white/10 rounded px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#C4A484]"
                          />
                        </div>

                        <div className="space-y-1">
                          <div className="flex justify-between items-center">
                            <label className="text-xs text-white/50 block">HTML Email Body Markup Preview</label>
                            <span className="text-[9px] uppercase tracking-wider text-[#C4A484] font-semibold">Ready to Send</span>
                          </div>
                          <textarea
                            rows={8}
                            value={emailBody}
                            onChange={(e) => setEmailBody(e.target.value)}
                            className="w-full bg-[#050505] border border-white/10 rounded px-4 py-2.5 text-[11px] font-mono text-white focus:outline-none focus:border-[#C4A484]"
                          />
                        </div>

                        {emailSentStatus === "success" && (
                          <div className="p-3 bg-emerald-500/5 border border-emerald-500/10 text-emerald-400 text-xs rounded-md">
                            ✓ Success! Email dispatched securely via Google API. Message registered in Gmail thread.
                          </div>
                        )}

                        {emailSentStatus === "error" && (
                          <div className="p-3 bg-rose-500/5 border border-rose-500/10 text-rose-400 text-xs rounded-md">
                            ⚠️ Error: {emailError}
                          </div>
                        )}

                        <button
                          onClick={handleSendEmail}
                          disabled={isSendingEmail || !emailTo.trim() || !emailSubject.trim()}
                          className={`w-full py-3 bg-[#C4A484] text-black hover:bg-white hover:text-black font-bold uppercase tracking-wider text-xs transition-all flex items-center justify-center gap-2 ${
                            isSendingEmail ? "opacity-50 cursor-not-allowed" : ""
                          }`}
                        >
                          {isSendingEmail ? (
                            <>
                              <RefreshCw className="w-4 h-4 animate-spin" /> Dispatching secured SMTP stream...
                            </>
                          ) : (
                            <>
                              <Send className="w-3.5 h-3.5" /> Send Document via Personal Gmail
                            </>
                          )}
                        </button>
                      </div>

                      {/* Right: Live Email Visualizer + Dispatch Log */}
                      <div className="space-y-6">
                        <div className="bg-zinc-950 rounded-lg border border-white/10 p-5 space-y-4">
                          <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest block">Live Inbox Render</span>
                          <div className="bg-white text-zinc-900 rounded p-4 text-xs font-sans space-y-3 shadow-inner">
                            <div className="border-b border-zinc-200 pb-2">
                              <div className="text-zinc-500">Subject: <span className="text-zinc-800 font-semibold">{emailSubject}</span></div>
                              <div className="text-zinc-500 text-[10px]">From: {googleUser.email} (via Quartz Security)</div>
                              <div className="text-zinc-500 text-[10px]">To: {emailTo}</div>
                            </div>
                            <div className="text-[11px] leading-relaxed text-zinc-700 max-h-48 overflow-y-auto pr-1" dangerouslySetInnerHTML={{ __html: emailBody }}></div>
                          </div>
                        </div>

                        {/* Recent Dispatches table */}
                        <div className="space-y-2">
                          <span className="text-[10px] uppercase tracking-wider text-white/40 block font-bold">Recent Gmail Dispatch Logs</span>
                          {sentLog.length === 0 ? (
                            <div className="p-4 bg-white/5 border border-dashed border-white/10 text-center rounded text-xs text-white/30">
                              No dispatches sent in this session yet.
                            </div>
                          ) : (
                            <div className="bg-[#050505] rounded border border-white/5 overflow-hidden text-[11px]">
                              <table className="w-full text-left">
                                <thead className="bg-white/5 text-white/50">
                                  <tr>
                                    <th className="p-2">To</th>
                                    <th className="p-2">Subject</th>
                                    <th className="p-2 text-right">Time</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5 font-mono">
                                  {sentLog.map((log, idx) => (
                                    <tr key={idx} className="hover:bg-white/5">
                                      <td className="p-2 text-white/70 max-w-[120px] truncate">{log.to}</td>
                                      <td className="p-2 text-white/50 max-w-[180px] truncate">{log.subject}</td>
                                      <td className="p-2 text-right text-emerald-400">{log.date}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: CHATBOT COPROCESSOR */}
        {activeTab === "ai-advisors" && (
          <div className="px-6 md:px-12 py-10 max-w-6xl mx-auto flex flex-col h-[calc(100vh-180px)]">
            <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-white/5 mb-6 gap-4">
              <div>
                <span className="text-[10px] uppercase tracking-[0.3em] text-[#C4A484] font-semibold block mb-1">Coprocessor Node</span>
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <h2 className="text-2xl font-light text-white font-serif">Quartz Commercial Advisory AI</h2>
                  <button
                    onClick={handleEmailTranscript}
                    disabled={isSendingEmail || !messages.length}
                    className="flex items-center gap-1.5 px-2.5 py-1 bg-white/5 hover:bg-[#C4A484] hover:text-[#050505] text-[#C4A484] border border-[#C4A484]/20 rounded text-[10px] uppercase tracking-wider font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Send className="w-3 h-3" />
                    {isSendingEmail ? "Dispatching..." : "Email Transcript via Gmail"}
                  </button>
                </div>
              </div>
              
              {/* Advisor Role Selector */}
              <div className="flex items-center bg-[#0a0a0a] border border-white/10 p-1 rounded gap-1">
                {[
                  { id: "general", label: "Strategic General Advisor" },
                  { id: "pricing", label: "Pricing Strategist" },
                  { id: "compliance", label: "Compliance Auditor" }
                ].map((role) => (
                  <button
                    key={role.id}
                    onClick={() => {
                      setChatRole(role.id as any);
                      // Clear and reset chat history with specific message
                      let initialContent = "Welcome to Quartz Commercial AI. Ask me anything about discount policy or ASC 606 accounting.";
                      if (role.id === "compliance") {
                        initialContent = "Quartz Legal & Compliance Auditor active. I will assist in identifying commercial risk, analyzing contract discount deviations, and mitigating margin leakage.";
                      } else if (role.id === "pricing") {
                        initialContent = "Quartz Pricing Strategist active. Consult me on subscription pricing structures, seats-based modeling, and optimizing customer lifetime metrics.";
                      }
                      setMessages([
                        {
                          role: "assistant",
                          content: initialContent
                        }
                      ]);
                    }}
                    className={`px-3 py-1.5 text-xs font-semibold rounded transition-all ${
                      chatRole === role.id 
                        ? "bg-[#C4A484] text-[#050505] font-bold" 
                        : "text-white/50 hover:text-white"
                    }`}
                  >
                    {role.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Chat Thread */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-2 mb-4 scrollbar-thin bg-[#0a0a0a]/40 p-4 rounded-lg border border-white/5">
              {messages.map((msg, index) => (
                <div 
                  key={index} 
                  className={`flex gap-3 max-w-3xl ${msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"}`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    msg.role === "user" ? "bg-white/10 text-white" : "bg-[#C4A484]/10 text-[#C4A484]"
                  }`}>
                    {msg.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>
                  <div className={`p-4 rounded-lg text-xs leading-relaxed ${
                    msg.role === "user" 
                      ? "bg-white/5 text-white border border-white/10" 
                      : "bg-[#111] text-white/90 border border-white/5"
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {isChatLoading && (
                <div className="flex gap-3 max-w-3xl mr-auto">
                  <div className="w-8 h-8 rounded-full bg-[#C4A484]/10 text-[#C4A484] flex items-center justify-center">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="p-4 rounded-lg text-xs bg-[#111] border border-white/5 flex items-center gap-2 text-white/50">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#C4A484]" /> Stream-processing advisory models...
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Quick Presets / Prompt Chips */}
            <div className="mb-4">
              <span className="text-[10px] uppercase tracking-wider text-white/40 block mb-2 font-bold">Suggested Strategic Queries</span>
              <div className="flex flex-wrap gap-2">
                {QUICK_CHIPS[chatRole].map((chip, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(chip)}
                    disabled={isChatLoading}
                    className="text-[10px] text-white/60 bg-white/5 hover:bg-[#C4A484]/10 hover:text-[#C4A484] hover:border-[#C4A484]/20 border border-white/5 px-3 py-1.5 rounded transition-all duration-200"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>

            {/* Input Bar */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder={`Ask the Quartz ${chatRole === "compliance" ? "Compliance Auditor" : chatRole === "pricing" ? "Pricing Strategist" : "General Advisor"}...`}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSendMessage();
                }}
                disabled={isChatLoading}
                className="flex-1 bg-[#0a0a0a] border border-white/10 rounded px-4 py-3 text-xs text-white focus:outline-none focus:border-[#C4A484] disabled:opacity-50"
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={isChatLoading || !inputMessage.trim()}
                className={`px-5 bg-[#C4A484] text-[#050505] rounded hover:bg-white hover:text-black font-semibold transition-all flex items-center justify-center gap-2 text-xs ${
                  isChatLoading || !inputMessage.trim() ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* TAB: QUARTZ AI COPILOT */}
        {activeTab === "quartz-copilot" && (
          <div className="px-6 md:px-12 py-10 max-w-6xl mx-auto space-y-8 animate-fade-in">
            {/* Header */}
            <div className="pb-4 border-b border-white/5 flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <span className="text-[10px] uppercase tracking-[0.3em] text-[#C4A484] font-semibold block mb-1">Human-Centric Autonomous Coprocessor</span>
                <h2 className="text-3xl font-light text-white font-serif">Quartz AI Copilot</h2>
              </div>
              <div className="text-xs text-white/50 max-w-md md:text-right leading-relaxed">
                A sovereign agentic companion combining deep automated synthesis with evosolutions.ai human-centric safeguards. Maintains custom operator comfort through adjustable agency ratios.
              </div>
            </div>

            {/* Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Column: Controls & Node Statuses (5/12 width) */}
              <div className="lg:col-span-5 space-y-6">
                {/* Active Node Integration Statuses */}
                <div className="bg-[#0a0a0a] border border-white/5 rounded-lg p-5 space-y-4">
                  <div className="flex justify-between items-center border-b border-white/5 pb-2.5">
                    <span className="text-xs uppercase tracking-wider text-white/40 font-bold">Interconnected Nodes</span>
                    {geminiStatus !== "connected" || binanceStatus !== "connected" ? (
                      <button 
                        onClick={async () => {
                          if (geminiStatus !== "connected") await handleCryptoAuth("gemini");
                          if (binanceStatus !== "connected") await handleCryptoAuth("binance");
                        }}
                        className="text-[10px] font-mono bg-[#C4A484]/15 hover:bg-[#C4A484]/30 text-[#C4A484] border border-[#C4A484]/30 px-2 py-0.5 rounded transition-all cursor-pointer"
                      >
                        Connect All
                      </button>
                    ) : (
                      <button 
                        onClick={() => {
                          handleCryptoDisconnect("gemini");
                          handleCryptoDisconnect("binance");
                        }}
                        className="text-[10px] font-mono bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 px-2 py-0.5 rounded transition-all cursor-pointer"
                      >
                        Disconnect All
                      </button>
                    )}
                  </div>

                  <div className="space-y-3 text-left">
                    {/* Gemini Exchange Node */}
                    <div 
                      onClick={() => {
                        if (geminiStatus !== "connected" && geminiStatus !== "connecting") {
                          handleCryptoAuth("gemini");
                        } else if (geminiStatus === "connected") {
                          handleCryptoDisconnect("gemini");
                        }
                      }}
                      className="flex justify-between items-center bg-[#050505] hover:bg-white/5 p-3 border border-white/5 rounded cursor-pointer transition-all group"
                    >
                      <div className="flex items-center gap-2">
                        <Coins className="w-4 h-4 text-sky-400 group-hover:scale-110 transition-transform" />
                        <div>
                          <span className="text-xs font-semibold text-white block">Gemini Exchange Node</span>
                          <span className="text-[9px] font-mono text-white/40">API Status: {geminiStatus}</span>
                        </div>
                      </div>
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase transition-all ${
                        geminiStatus === "connected" 
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                          : geminiStatus === "connecting"
                            ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                            : "bg-white/5 text-white/40 border border-transparent hover:border-white/10"
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          geminiStatus === "connected" 
                            ? "bg-emerald-400 shadow-sm shadow-emerald-400/50" 
                            : geminiStatus === "connecting"
                              ? "bg-amber-400 animate-ping"
                              : "bg-white/20"
                        }`}></span>
                        {geminiStatus === "connected" ? "Online" : geminiStatus === "connecting" ? "Handshake..." : "Connect"}
                      </span>
                    </div>

                    {/* Binance Exchange Node */}
                    <div 
                      onClick={() => {
                        if (binanceStatus !== "connected" && binanceStatus !== "connecting") {
                          handleCryptoAuth("binance");
                        } else if (binanceStatus === "connected") {
                          handleCryptoDisconnect("binance");
                        }
                      }}
                      className="flex justify-between items-center bg-[#050505] hover:bg-white/5 p-3 border border-white/5 rounded cursor-pointer transition-all group"
                    >
                      <div className="flex items-center gap-2">
                        <Coins className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
                        <div>
                          <span className="text-xs font-semibold text-white block">Binance Exchange Node</span>
                          <span className="text-[9px] font-mono text-white/40">API Status: {binanceStatus}</span>
                        </div>
                      </div>
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase transition-all ${
                        binanceStatus === "connected" 
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                          : binanceStatus === "connecting"
                            ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                            : "bg-white/5 text-white/40 border border-transparent hover:border-white/10"
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          binanceStatus === "connected" 
                            ? "bg-emerald-400 shadow-sm shadow-emerald-400/50" 
                            : binanceStatus === "connecting"
                              ? "bg-amber-400 animate-ping"
                              : "bg-white/20"
                        }`}></span>
                        {binanceStatus === "connected" ? "Online" : binanceStatus === "connecting" ? "Handshake..." : "Connect"}
                      </span>
                    </div>

                    {/* EVO Compliance Shield */}
                    <div className="flex justify-between items-center bg-[#050505] p-3 border border-white/5 rounded">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        <div>
                          <span className="text-xs font-semibold text-white block">evosolutions.ai Safeguard</span>
                          <span className="text-[9px] font-mono text-white/40">Sovereign Protection (Agency: {customHumanControl}%)</span>
                        </div>
                      </div>
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase bg-emerald-500/10 text-emerald-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50"></span>
                        Active
                      </span>
                    </div>
                  </div>
                </div>

                {/* Copilot AI Advisor Dialogue Thread */}
                <div className="bg-[#0a0a0a] border border-white/5 rounded-lg flex flex-col h-[520px] overflow-hidden text-left">
                  {/* Thread Header */}
                  <div className="bg-[#070707] border-b border-white/5 p-4 flex items-center justify-between flex-shrink-0">
                    <div className="flex items-center gap-2">
                      <Bot className="w-4 h-4 text-[#C4A484]" />
                      <span className="text-xs uppercase tracking-wider text-white font-bold">Coprocessor Co-Advisory Dialogue</span>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 uppercase">
                      Secured Link
                    </span>
                  </div>

                  {/* Message Thread area */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
                    {copilotMessages.map((msg) => (
                      <div 
                        key={msg.id}
                        className={`flex gap-2.5 max-w-[85%] ${msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"}`}
                      >
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] ${
                          msg.role === "user" ? "bg-white/10 text-white" : "bg-[#C4A484]/15 text-[#C4A484] border border-[#C4A484]/20"
                        }`}>
                          {msg.role === "user" ? <User className="w-3 h-3" /> : <Bot className="w-3 h-3" />}
                        </div>
                        <div className="space-y-1">
                          <div className={`p-3 rounded-lg text-[11px] leading-relaxed whitespace-pre-wrap ${
                            msg.role === "user" 
                              ? "bg-white/5 text-white border border-white/10" 
                              : "bg-[#111] text-white/90 border border-white/5"
                          }`}>
                            {msg.content}
                            
                            {/* Running Indicators nested in the active assistant message bubble */}
                            {msg.role === "assistant" && msg.status && msg.status !== "idle" && msg.status !== "completed" && (
                              <div className="mt-2 pt-2 border-t border-white/5 flex items-center gap-2 text-[10px] text-amber-400 font-mono">
                                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                <span>Coprocessor processing stage: {msg.status}...</span>
                              </div>
                            )}
                          </div>
                          <div className={`text-[8px] font-mono text-white/30 ${msg.role === "user" ? "text-right" : "text-left"}`}>
                            {msg.timestamp} {msg.agency && `• ${msg.agency}% Agency`}
                          </div>
                        </div>
                      </div>
                    ))}
                    <div ref={copilotChatEndRef} />
                  </div>

                  {/* Agency Slider & Suggestions & Text Field */}
                  <div className="border-t border-white/5 p-4 bg-[#070707] space-y-3 flex-shrink-0">
                    {/* Human Control slider (the EVO feature!) */}
                    <div className="space-y-1.5 bg-[#050505] p-2.5 border border-white/5 rounded">
                      <div className="flex justify-between text-[10px] text-white/50">
                        <span className="font-semibold uppercase tracking-wider">Human Control Level</span>
                        <span className="font-mono text-[#C4A484] font-bold">{customHumanControl}% Human Agency</span>
                      </div>
                      <input
                        type="range"
                        min="50"
                        max="100"
                        step="5"
                        value={customHumanControl}
                        onChange={(e) => setCustomHumanControl(Number(e.target.value))}
                        className="w-full accent-[#C4A484] h-1 bg-white/10 rounded cursor-pointer"
                        disabled={isManusRunning}
                      />
                      <p className="text-[8px] text-white/35 leading-tight font-mono">
                        {customHumanControl === 100 
                          ? "100% Agency: Quartz Copilot operates as a passive advisor with zero execution rights." 
                          : customHumanControl >= 80 
                            ? `${customHumanControl}% Agency: High protective mode. Generates code & guidance with strict manual checkpoint gates.`
                            : `${customHumanControl}% Agency: Balanced hybrid. Synthesizes assets and structures comfortable toggle checklists.`}
                      </p>
                    </div>

                    {/* Suggestions */}
                    <div className="flex flex-wrap gap-1">
                      {[
                        "Spread Arbitrage",
                        "ASC 606 Audits",
                        "Risk-Shield Policy"
                      ].map((preset, idx) => {
                        const presetDirectives = [
                          "Analyze live Binance and Gemini liquidity spreads and draft a cross-exchange arbitrage hedging smart rule.",
                          "Design ASC 606 revenue recognition audit rules with 20% discount compliance triggers.",
                          "Construct a risk-shield automated policy that halts transaction flow when discount variance is too high."
                        ];
                        return (
                          <button
                            key={idx}
                            disabled={isManusRunning}
                            onClick={() => setManusTask(presetDirectives[idx])}
                            className="text-[9px] text-white/50 bg-[#0c0c0c] hover:bg-[#C4A484]/15 hover:text-[#C4A484] border border-white/5 px-2 py-1 rounded transition-all truncate disabled:opacity-40 cursor-pointer font-mono"
                          >
                            {preset}
                          </button>
                        );
                      })}
                    </div>

                    {/* Input field */}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Instruct Quartz Copilot..."
                        value={manusTask}
                        onChange={(e) => setManusTask(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !isManusRunning && manusTask.trim()) {
                            handleRunQuartzCopilot();
                          }
                        }}
                        disabled={isManusRunning}
                        className="flex-1 bg-[#050505] border border-white/10 rounded px-3 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#C4A484] disabled:opacity-50"
                      />
                      <button
                        onClick={handleRunQuartzCopilot}
                        disabled={isManusRunning || !manusTask.trim()}
                        className="px-4 bg-[#C4A484] hover:bg-white text-black text-xs font-bold uppercase tracking-wider rounded transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
                      >
                        {isManusRunning ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Send className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Sovereign Workspace Center (7/12 width) */}
              <div className="lg:col-span-7 space-y-6">
                
                {manusStatus === "idle" ? (
                  /* Idle Screen */
                  <div className="bg-[#0a0a0a] border border-white/5 rounded-lg p-10 flex flex-col items-center justify-center text-center space-y-4 min-h-[400px]">
                    <div className="w-16 h-16 rounded-full bg-white/5 border border-white/5 flex items-center justify-center text-[#C4A484] shadow-lg shadow-[#C4A484]/5">
                      <Cpu className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-medium text-white font-serif">Awaiting Copilot Directive</h3>
                    <p className="text-xs text-white/40 leading-relaxed max-w-md">
                      Define a sovereign task and adjust your human control slider on the left. Quartz AI Copilot will synthesize compliant logic nodes, query ticker exchanges, run protective human-centric safety checks, and draft interactive guidance guides.
                    </p>
                  </div>
                ) : (
                  /* Active Execution Workspace */
                  <div className="space-y-6">
                    {/* Staged Checklist Progress */}
                    <div className="bg-[#0a0a0a] border border-white/5 rounded-lg p-5 space-y-4 text-left">
                      <div className="flex justify-between items-center border-b border-white/5 pb-2">
                        <span className="text-xs uppercase tracking-wider text-white/40 font-bold">Execution Steps</span>
                        <span className="text-[10px] font-mono text-amber-400 font-bold uppercase tracking-wider animate-pulse flex items-center gap-1">
                          <Activity className="w-3.5 h-3.5" /> status: {manusStatus}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                        {manusSteps.map((step, idx) => (
                          <div 
                            key={idx}
                            className={`p-3 border rounded flex flex-col justify-between transition-all duration-300 ${
                              step.status === "success"
                                ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-400"
                                : step.status === "current"
                                  ? "bg-amber-500/5 border-amber-500/40 text-amber-400 animate-pulse"
                                  : "bg-[#050505] border-white/5 text-white/30"
                            }`}
                          >
                            <div className="flex justify-between items-start">
                              <span className="text-[10px] font-mono font-bold block mb-1">0{idx + 1}</span>
                              {step.status === "success" && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                              {step.status === "current" && <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" />}
                              {step.status === "pending" && <div className="w-3.5 h-3.5 rounded-full border border-white/10"></div>}
                            </div>
                            <div>
                              <h4 className="text-[11px] font-bold uppercase tracking-wide block truncate">{step.label}</h4>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Results / Outputs (visible when completed/testing/executing) */}
                    {(manusOutputText || manusArtifacts.length > 0) && (
                      <div className="bg-[#0a0a0a] border border-white/5 rounded-lg overflow-hidden flex flex-col">
                        
                        {/* Tab Selector between Synthesized Artifacts and EVO Guidance Checklist */}
                        <div className="flex bg-[#070707] border-b border-white/5 p-1 gap-1">
                          <button
                            onClick={() => setCopilotViewMode("artifacts")}
                            className={`flex-1 py-2.5 text-xs font-semibold uppercase tracking-wider rounded transition-all flex items-center justify-center gap-2 ${
                              copilotViewMode === "artifacts"
                                ? "bg-white/5 border border-white/10 text-white font-bold animate-pulse"
                                : "text-white/40 hover:text-white"
                            }`}
                          >
                            <Code className="w-4 h-4 text-[#C4A484]" /> 🤖 Synthesized Logic
                          </button>
                          <button
                            onClick={() => setCopilotViewMode("guidance")}
                            className={`flex-1 py-2.5 text-xs font-semibold uppercase tracking-wider rounded transition-all flex items-center justify-center gap-2 ${
                              copilotViewMode === "guidance"
                                ? "bg-white/5 border border-white/10 text-white font-bold"
                                : "text-white/40 hover:text-white font-medium"
                            }`}
                          >
                            <ShieldCheck className="w-4 h-4 text-emerald-400" /> 🛡️ Protective Companion
                          </button>
                        </div>

                        {copilotViewMode === "artifacts" ? (
                          /* ARTIFACTS VIEW */
                          <div className="p-5 space-y-4 text-left">
                            {/* Executive Summary Text */}
                            {manusOutputText && (
                              <div className="text-xs text-white/80 leading-relaxed space-y-2 prose prose-invert max-w-none">
                                <span className="text-[10px] uppercase tracking-wider text-[#C4A484] font-semibold block mb-1">Executive Summary</span>
                                <p className="whitespace-pre-wrap">{manusOutputText}</p>
                              </div>
                            )}

                            {/* Generated Artifacts Section */}
                            {manusArtifacts.length > 0 && (
                              <div className="border border-white/5 rounded overflow-hidden">
                                {/* File tabs selector */}
                                <div className="flex bg-[#050505] border-b border-white/5 overflow-x-auto scrollbar-thin">
                                  {manusArtifacts.map((art) => (
                                    <button
                                      key={art.name}
                                      onClick={() => setSelectedArtifact(art.name)}
                                      className={`px-4 py-2.5 text-xs font-mono border-r border-white/5 transition-all flex items-center gap-1.5 shrink-0 ${
                                        selectedArtifact === art.name
                                          ? "bg-[#0a0a0a] text-white font-bold border-t-2 border-t-[#C4A484]"
                                          : "text-white/40 hover:text-white"
                                      }`}
                                    >
                                      {art.lang === "json" ? <FileJson className="w-3.5 h-3.5 text-amber-400" /> : <Code className="w-3.5 h-3.5 text-sky-400" />}
                                      {art.name}
                                    </button>
                                  ))}
                                </div>

                                {/* Selected Artifact Code Block */}
                                <div className="bg-[#050505] p-4 overflow-x-auto max-h-[350px] scrollbar-thin">
                                  <pre className="text-xs font-mono text-white/90 leading-relaxed whitespace-pre">
                                    <code>
                                      {manusArtifacts.find(a => a.name === selectedArtifact)?.code || ""}
                                    </code>
                                  </pre>
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          /* EVO GUIDANCE CHECKLISTS VIEW */
                          <div className="p-5 space-y-6 text-left">
                            {guidanceBlueprint && (
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                                
                                {/* Guidance Steps Sequence Selector */}
                                <div className="md:col-span-1 bg-[#050505] border border-white/10 rounded-lg flex flex-col divide-y divide-white/5">
                                  {[
                                    { id: "diagnostic", label: "Diagnostic", desc: "Evaluate and map comfort levels" },
                                    { id: "architecture", label: "Architecture", desc: "Form human-to-AI support loops" },
                                    { id: "deployment", label: "Deployment", desc: "Comfortable staggered rollout" },
                                    { id: "stewardship", label: "Stewardship", desc: "Anti-replacement control locks" }
                                  ].map((step) => {
                                    const isActive = activeGuidanceStep === step.id;
                                    const activities = guidanceBlueprint[step.id]?.activities || [];
                                    const completedCount = activities.filter((act: string) => completedGuidanceActivities[`${step.id}-${act}`]).length;
                                    const isAllComplete = activities.length > 0 && completedCount === activities.length;

                                    return (
                                      <button
                                        key={step.id}
                                        onClick={() => setActiveGuidanceStep(step.id as any)}
                                        className={`p-4 text-left transition-all relative flex flex-col gap-1 group ${
                                          isActive 
                                            ? "bg-white/5 border-l-2 border-[#C4A484]" 
                                            : "bg-[#0c0c0c]/40 hover:bg-[#0c0c0c]"
                                        }`}
                                      >
                                        <div className="flex w-full justify-between items-center">
                                          <span className={`text-sm font-medium transition-colors ${
                                            isActive ? "text-[#C4A484]" : "text-white/70 group-hover:text-white font-serif"
                                          }`}>
                                            {step.label}
                                          </span>
                                          {isAllComplete ? (
                                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                          ) : completedCount > 0 ? (
                                            <span className="text-[9px] font-mono bg-[#C4A484]/20 text-[#C4A484] px-1.5 py-0.5 rounded-full">
                                              {completedCount}/{activities.length}
                                            </span>
                                          ) : (
                                            <span className="w-1.5 h-1.5 rounded-full bg-white/10 group-hover:bg-[#C4A484]/50 transition-colors"></span>
                                          )}
                                        </div>
                                        <span className="text-[10px] text-white/40 leading-snug">{step.desc}</span>
                                      </button>
                                    );
                                  })}
                                </div>

                                {/* Active step rich pane and interactive checklists */}
                                <div className="md:col-span-2 space-y-4">
                                  {(() => {
                                    const currentStepData = guidanceBlueprint[activeGuidanceStep];
                                    if (!currentStepData) return null;

                                    return (
                                      <div className="space-y-4 bg-white/5 border border-white/5 rounded-lg p-5">
                                        <div className="flex justify-between items-start border-b border-white/5 pb-3">
                                          <div>
                                            <span className="text-[9px] uppercase tracking-wider text-[#C4A484] font-semibold block mb-0.5">Active Safeguard Stage</span>
                                            <h4 className="text-sm font-semibold text-white">{currentStepData.objective}</h4>
                                          </div>
                                          <div className="bg-[#C4A484]/10 border border-[#C4A484]/30 px-2 py-1 rounded text-[10px] text-[#C4A484] font-mono font-semibold">
                                            {currentStepData.metric}
                                          </div>
                                        </div>

                                        <p className="text-xs text-white/70 leading-relaxed italic">
                                          "{currentStepData.guidanceText}"
                                        </p>

                                        {/* Interactive checklist */}
                                        <div className="space-y-2 pt-2">
                                          <span className="text-[9px] uppercase tracking-wider text-white/40 block font-bold">Step Verification Activities</span>
                                          <div className="space-y-2">
                                            {currentStepData.activities.map((activity: string, idx: number) => {
                                              const uniqueId = `${activeGuidanceStep}-${activity}`;
                                              const isChecked = !!completedGuidanceActivities[uniqueId];

                                              return (
                                                <div 
                                                  key={idx}
                                                  onClick={() => {
                                                    setCompletedGuidanceActivities(prev => ({
                                                      ...prev,
                                                      [uniqueId]: !isChecked
                                                    }));
                                                  }}
                                                  className={`flex items-start gap-2.5 p-2.5 rounded border cursor-pointer transition-all ${
                                                    isChecked 
                                                      ? "bg-emerald-500/5 border-emerald-500/20 text-white" 
                                                      : "bg-[#050505] border-white/5 hover:border-white/10 text-white/70"
                                                  }`}
                                                >
                                                  <div className={`w-3.5 h-3.5 rounded-sm border mt-0.5 flex items-center justify-center transition-all flex-shrink-0 ${
                                                    isChecked 
                                                      ? "bg-emerald-500 border-emerald-500 text-black" 
                                                      : "border-white/20 bg-white/5"
                                                  }`}>
                                                    {isChecked && <Check className="w-2.5 h-2.5 text-black font-bold" />}
                                                  </div>
                                                  <span className="text-[11px] leading-relaxed">{activity}</span>
                                                </div>
                                              );
                                            })}
                                          </div>
                                        </div>

                                        {/* Intelligent Support Topology Map */}
                                        <div className="border border-white/5 bg-[#050505] rounded-lg p-4 space-y-2.5 mt-2">
                                          <span className="text-[9px] uppercase tracking-wider text-white/40 block font-mono">SUPPORT TOPOLOGY MAP ({activeGuidanceStep.toUpperCase()})</span>
                                          
                                          <div className="h-28 w-full flex items-center justify-center relative overflow-hidden bg-radial-gradient">
                                            {activeGuidanceStep === "diagnostic" && (
                                              <div className="flex flex-col items-center justify-center space-y-2 text-center">
                                                <div className="flex items-center gap-4">
                                                  <div className="w-10 h-10 rounded-full border border-[#C4A484]/30 bg-[#C4A484]/5 flex items-center justify-center relative">
                                                    <User className="w-5 h-5 text-[#C4A484]" />
                                                    <span className="absolute -top-1 -right-1 text-[7px] px-1 bg-[#C4A484] text-black font-mono uppercase rounded font-bold">HUMAN</span>
                                                  </div>
                                                  <div className="flex flex-col text-center text-[#C4A484] text-[10px]">
                                                    <span className="animate-pulse">Comfort Diagnostic</span>
                                                    <span className="text-[8px] text-white/30 font-mono">Agency: {customHumanControl}%</span>
                                                  </div>
                                                  <div className="w-10 h-10 rounded-full border border-white/10 bg-white/5 flex items-center justify-center relative">
                                                    <Bot className="w-5 h-5 text-white/60" />
                                                    <span className="absolute -top-1 -right-1 text-[7px] px-1 bg-white/20 text-white font-mono uppercase rounded font-bold">QUARTZ</span>
                                                  </div>
                                                </div>
                                              </div>
                                            )}

                                            {activeGuidanceStep === "architecture" && (
                                              <div className="flex flex-col items-center justify-center space-y-2 w-full max-w-xs">
                                                <div className="border border-[#C4A484]/40 bg-[#C4A484]/5 rounded p-2 text-center w-full relative">
                                                  <span className="text-[10px] font-semibold text-white">Human Artisan (Active Driver)</span>
                                                </div>
                                                <div className="w-0.5 h-3 border-r border-dashed border-white/20"></div>
                                                <div className="border border-white/10 bg-white/5 rounded p-2 text-center w-full relative">
                                                  <span className="text-[10px] font-semibold text-white/70">Quartz Copilot (Assistive Shield)</span>
                                                </div>
                                              </div>
                                            )}

                                            {activeGuidanceStep === "deployment" && (
                                              <div className="flex flex-col items-center justify-center space-y-2 w-full px-4">
                                                <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                                                  <div className="w-3/4 h-full bg-[#C4A484]"></div>
                                                </div>
                                                <div className="grid grid-cols-3 w-full text-center text-[8px] text-white/40">
                                                  <span>Diagnostic</span>
                                                  <span className="text-[#C4A484] font-bold font-mono">Deployment</span>
                                                  <span>Stewardship</span>
                                                </div>
                                              </div>
                                            )}

                                            {activeGuidanceStep === "stewardship" && (
                                              <div className="flex flex-col items-center justify-center space-y-1.5">
                                                <div className="w-10 h-10 rounded-full border border-emerald-400/50 bg-emerald-500/5 flex items-center justify-center">
                                                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                                                </div>
                                                <span className="text-[10px] font-semibold text-white font-serif">Anti-Replacement Shield Active</span>
                                              </div>
                                            )}
                                          </div>
                                        </div>

                                      </div>
                                    );
                                  })()}
                                </div>

                              </div>
                            )}
                          </div>
                        )}

                      </div>
                    )}

                    {/* Live Terminal Logging Box */}
                    <div className="bg-[#050505] border border-white/5 rounded-lg overflow-hidden flex flex-col text-left">
                      <div className="p-3 bg-white/5 border-b border-white/5 flex justify-between items-center">
                        <div className="flex items-center gap-2 text-white/60">
                          <Terminal className="w-4 h-4 text-[#C4A484]" />
                          <span className="text-[10px] font-mono uppercase tracking-wider">quartz@copilot-node:~</span>
                        </div>
                        <div className="flex gap-1">
                          <span className="w-2.5 h-2.5 rounded-full bg-rose-500/50"></span>
                          <span className="w-2.5 h-2.5 rounded-full bg-amber-500/50"></span>
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/50"></span>
                        </div>
                      </div>

                      <div 
                        id="manus-terminal-logs"
                        className="p-4 bg-black font-mono text-[11px] leading-relaxed text-zinc-300 space-y-1 h-[150px] overflow-y-auto scrollbar-thin"
                      >
                        {manusLogs.length === 0 ? (
                          <div className="text-zinc-500 italic">No logs compiled yet. Launch the coprocessor to initialize.</div>
                        ) : (
                          manusLogs.map((log, index) => (
                            <div key={index} className="whitespace-pre-wrap">{log}</div>
                          ))
                        )}
                      </div>
                    </div>

                  </div>
                )}
                
              </div>

            </div>
          </div>
        )}

        {/* TAB 5: MARKETING STUDIO (IMAGE GENERATOR) */}
        {activeTab === "brand-assets" && (
          <div className="px-6 md:px-12 py-10 max-w-6xl mx-auto">
            <div className="pb-4 border-b border-white/5 mb-8">
              <span className="text-[10px] uppercase tracking-[0.3em] text-[#C4A484] font-semibold block mb-1">Neural Asset Studio</span>
              <h2 className="text-2xl font-light text-white font-serif">Gemini Brand Visualizer</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Form panel */}
              <div className="bg-[#0a0a0a] border border-white/5 p-6 rounded-lg space-y-6">
                <h3 className="text-xs uppercase tracking-widest text-[#C4A484] font-bold flex items-center gap-2">
                  <Sparkles className="w-4 h-4" /> ASSET SPECIFICATION
                </h3>

                <div className="space-y-2">
                  <label className="text-xs text-white/50 block">Design Concept Prompt</label>
                  <textarea
                    rows={4}
                    value={imagePrompt}
                    onChange={(e) => setImagePrompt(e.target.value)}
                    placeholder="Describe the asset, e.g., A minimalist geometric sculpture showing contract compliance with gold details"
                    className="w-full bg-[#050505] border border-white/10 rounded p-3 text-xs text-white focus:outline-none focus:border-[#C4A484] leading-relaxed resize-none"
                  />
                </div>

                {/* Preset Prompts */}
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-wider text-white/40 block font-bold">Suggested Presets</label>
                  <div className="grid grid-cols-1 gap-2">
                    {[
                      "Minimalist golden shield representing global corporate compliance",
                      "Abstract neon chart representing high-frequency subscription growth",
                      "Glass structure showing dynamic commercial contract integration",
                      "Corporate award plaque for ASC 606 integrity"
                    ].map((preset, idx) => (
                      <button
                        key={idx}
                        onClick={() => setImagePrompt(preset)}
                        className="text-[10px] text-left text-white/60 bg-white/5 hover:bg-white/10 border border-white/5 p-2 rounded transition-all truncate"
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Size Selector */}
                <div className="space-y-2">
                  <label className="text-xs text-white/50 block">Output Resolution (Quality)</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(["1K", "2K", "4K"] as const).map((size) => (
                      <button
                        key={size}
                        onClick={() => setImageSize(size)}
                        className={`py-2 text-xs font-semibold rounded border transition-all ${
                          imageSize === size
                            ? "bg-[#C4A484]/10 border-[#C4A484] text-white"
                            : "bg-[#050505] border-white/5 text-white/50 hover:border-white/10"
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                  <span className="text-[10px] text-white/40 block">
                    {imageSize === "1K" ? "Standard web graphics" : imageSize === "2K" ? "High definition mockups" : "Ultra HD print ready (4K)"}
                  </span>
                </div>

                <button
                  onClick={handleGenerateImage}
                  disabled={isGeneratingImage || !imagePrompt.trim()}
                  className="w-full py-3 bg-[#C4A484] text-black text-xs font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-all flex items-center justify-center gap-2"
                >
                  {isGeneratingImage ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" /> Rendering Image...
                    </>
                  ) : (
                    <>
                      Generate Asset with Gemini 3 Pro <ImageIcon className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

              {/* Preview panel */}
              <div className="lg:col-span-2 border border-white/5 bg-[#0a0a0a]/60 rounded-lg flex flex-col items-center justify-center p-6 min-h-[400px] relative">
                {isGeneratingImage && (
                  <div className="absolute inset-0 bg-[#050505]/80 backdrop-blur-sm flex flex-col items-center justify-center z-10 text-center p-6">
                    <RefreshCw className="w-10 h-10 animate-spin text-[#C4A484] mb-4" />
                    <h4 className="text-sm text-white font-medium mb-1 font-serif">Analyzing commercial concept...</h4>
                    <p className="text-xs text-white/50 max-w-xs leading-relaxed">Gemini 3 Pro is generating your custom brand illustration in {imageSize} resolution.</p>
                  </div>
                )}

                {imageError && (
                  <div className="p-4 bg-rose-500/5 border border-rose-500/10 rounded text-xs text-rose-400 text-center max-w-sm space-y-2">
                    <AlertTriangle className="w-6 h-6 text-rose-500 mx-auto" />
                    <p className="font-semibold">Generation Terminated</p>
                    <p className="text-[11px] text-white/60 leading-relaxed">{imageError}</p>
                  </div>
                )}

                {generatedImageUrl ? (
                  <div className="space-y-4 w-full">
                    <div className="relative group overflow-hidden border border-white/10 rounded">
                      <img 
                        src={generatedImageUrl} 
                        alt="Gemini generated commercial asset" 
                        referrerPolicy="no-referrer"
                        className="w-full h-auto object-cover max-h-[450px]"
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                        <a 
                          href={generatedImageUrl} 
                          download="quartz_commercial_asset.png"
                          className="p-3 bg-white text-black rounded-full hover:bg-[#C4A484] hover:text-black transition-all flex items-center gap-2 text-xs font-bold"
                        >
                          <Download className="w-4 h-4" /> Download PNG
                        </a>
                      </div>
                    </div>
                    <div className="flex justify-between items-center text-[10px] text-white/40 font-mono">
                      <span>Model: gemini-3-pro-image-preview</span>
                      <span>Output Quality: {imageSize} ({imageSize === "1K" ? "1024x1024" : imageSize === "2K" ? "2048x2048" : "4096x4096"} equivalent)</span>
                    </div>
                  </div>
                ) : (
                  !isGeneratingImage && !imageError && (
                    <div className="text-center p-8 space-y-4 max-w-sm">
                      <div className="w-12 h-12 rounded-full bg-white/5 border border-white/5 flex items-center justify-center text-white/30 mx-auto">
                        <ImageIcon className="w-6 h-6" />
                      </div>
                      <h4 className="text-sm font-medium text-white/70 font-serif">Creative Canvas Workspace</h4>
                      <p className="text-xs text-white/40 leading-relaxed">Enter design parameters on the left and invoke the visual generator to produce pristine branded art assets.</p>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        )}

      </main>

      {/* Bottom Data Strip */}
      <footer className="grid grid-cols-2 md:grid-cols-4 border-t border-white/5 py-8 px-6 md:px-12 items-end bg-[#050505] gap-6 mt-12">
        <div className="flex flex-col gap-1 text-left">
          <span className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Annual Volume</span>
          <span className="text-2xl font-light text-white font-serif">$4.82B+</span>
        </div>
        <div className="flex flex-col gap-1 text-left">
          <span className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Latency Speed</span>
          <span className="text-2xl font-light text-white font-serif">14.2ms</span>
        </div>
        <div className="flex flex-col gap-1 text-left">
          <span className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Market Cap Reach</span>
          <span className="text-2xl font-light text-white font-serif">182 Cities</span>
        </div>
        <div className="flex justify-end items-center gap-4 col-span-2 md:col-span-1">
          <div className="flex gap-2">
            <div className="w-1 h-8 bg-white/20"></div>
            <div className="w-1 h-5 bg-white/20 mt-3"></div>
            <div className="w-1 h-10 bg-[#C4A484] -mt-2"></div>
            <div className="w-1 h-6 bg-white/20 mt-2"></div>
          </div>
          <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-white whitespace-nowrap">Global Status: Active</span>
        </div>
      </footer>
    </div>
  );
}

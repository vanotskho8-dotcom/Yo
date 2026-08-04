import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  type User 
} from "firebase/auth";
import firebaseConfig from "../../firebase-applet-config.json";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Initialize Google OAuth Provider with all Gmail scopes requested by the user
export const provider = new GoogleAuthProvider();

// Scopes requested in the configuration
const GMAIL_SCOPES = [
  "https://mail.google.com/",
  "https://www.googleapis.com/auth/gmail.addons.current.action.compose",
  "https://www.googleapis.com/auth/gmail.addons.current.message.action",
  "https://www.googleapis.com/auth/gmail.addons.current.message.metadata",
  "https://www.googleapis.com/auth/gmail.addons.current.message.readonly",
  "https://www.googleapis.com/auth/gmail.compose",
  "https://www.googleapis.com/auth/gmail.insert",
  "https://www.googleapis.com/auth/gmail.labels",
  "https://www.googleapis.com/auth/gmail.metadata",
  "https://www.googleapis.com/auth/gmail.modify",
  "https://www.googleapis.com/auth/gmail.readonly",
  "https://www.googleapis.com/auth/gmail.send",
  "https://www.googleapis.com/auth/gmail.settings.basic",
  "https://www.googleapis.com/auth/gmail.settings.sharing"
];

GMAIL_SCOPES.forEach(scope => provider.addScope(scope));

// Flags & cached variables to ensure strict security compliance
let isSigningIn = false;
let cachedAccessToken: string | null = null;

/**
 * Initializes the authentication state listener.
 * This should be loaded when the React application mounts.
 */
export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        cachedAccessToken = null;
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

/**
 * Triggers the popup-based Google Auth Sign-In flow.
 * Must be initiated by a physical click/action of the user.
 */
export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    
    if (!credential?.accessToken) {
      throw new Error("Failed to extract Gmail access token from Firebase Auth credential.");
    }

    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error("Google authentication error:", error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

/**
 * Retrieves the cached Gmail OAuth access token.
 */
export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

/**
 * Logs out the active user and invalidates/purges the cached token from memory.
 */
export const logout = async () => {
  await auth.signOut();
  cachedAccessToken = null;
};

/**
 * Encodes an HTML or text email string into Base64URL (RFC 2822 compliant)
 * required by the Gmail users.messages.send API.
 */
export const buildRawEmail = (to: string, subject: string, htmlBody: string): string => {
  const emailLines = [
    `To: ${to}`,
    "Content-Type: text/html; charset=utf-8",
    "MIME-Version: 1.0",
    `Subject: ${subject}`,
    "",
    htmlBody
  ];
  
  const rawString = emailLines.join("\r\n");
  
  // Safe Base64URL encoding using btoa and regex translation
  return btoa(unescape(encodeURIComponent(rawString)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
};

/**
 * Direct call to Gmail send endpoint.
 */
export const sendGmailMessage = async (
  accessToken: string,
  to: string,
  subject: string,
  htmlBody: string
): Promise<{ id: string; threadId: string }> => {
  const base64Raw = buildRawEmail(to, subject, htmlBody);
  
  const response = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ raw: base64Raw })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gmail API request failed: ${errorText}`);
  }

  return response.json();
};

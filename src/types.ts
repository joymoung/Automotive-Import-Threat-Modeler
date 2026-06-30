export type StrideCategory =
  | "Spoofing"
  | "Tampering"
  | "Repudiation"
  | "Information Disclosure"
  | "Denial of Service"
  | "Elevation of Privilege";

export type ThreatSeverity = "Critical" | "High" | "Medium" | "Low";

export type ThreatStatus = "Open" | "In-Progress" | "Mitigated";

export interface DreadMatrix {
  damage: number;          // 1-10
  reproducibility: number; // 1-10
  exploitability: number;  // 1-10
  affectedUsers: number;   // 1-10
  discoverability: number; // 1-10
}

export interface Threat {
  id: string;
  title: string;
  category: StrideCategory;
  description: string;
  severity: ThreatSeverity;
  status: ThreatStatus;
  impactedComponent: string;
  mitigation: string;
  dread: DreadMatrix;
  remediationNotes?: string;
  customCodeSnippet?: string; // Code snippet explaining secure implementation
}

export interface DfdNode {
  id: string;
  label: string;
  type: "entity" | "process" | "datastore" | "interactor";
  description: string;
}

export interface DfdLink {
  id: string;
  source: string;
  target: string;
  label: string;
}

export const DFD_NODES: DfdNode[] = [
  {
    id: "portal",
    label: "Dealer & Customer Portal",
    type: "interactor",
    description: "Web application where certified B2B dealers participate in vehicle auctions and customers configure custom orders."
  },
  {
    id: "gateway",
    label: "API Gateway & Auth",
    type: "process",
    description: "Main routing point for traffic. Handles authentication (JWT verification), rate-limiting, and basic input validation."
  },
  {
    id: "logistics",
    label: "Customs & Carrier API",
    type: "process",
    description: "Integrates with international Customs systems (CBP) and shipping carriers to file manifests and track physical cargo ships."
  },
  {
    id: "telematics",
    label: "OBD-II Telematics Ingestion",
    type: "process",
    description: "Gathers telemetry, GPS coordinates, and vehicle vitals from cellular-enabled OBD-II dongles plugged into imported cars during transit."
  },
  {
    id: "inventory",
    label: "Vehicle & VIN Manager",
    type: "process",
    description: "Core service managing vehicle inventory state, processing shipping status transitions, and allocating VIN reservations."
  },
  {
    id: "finance",
    label: "Escrow & Wiring Hub",
    type: "process",
    description: "Orchestrates wholesale dealer escrow payments, custom fees wires, and links with Stripe gateway."
  },
  {
    id: "db_core",
    label: "Inventory DB",
    type: "datastore",
    description: "PostgreSQL store containing vehicle records, transit locations, auction bidding logs, and buyer accounts."
  },
  {
    id: "db_secure",
    label: "Customs & Financial DB",
    type: "datastore",
    description: "Highly isolated data store housing legal import declarations, tariff filings, payment history, and crypto hashes of audit trails."
  }
];

export const DFD_LINKS: DfdLink[] = [
  { id: "l1", source: "portal", target: "gateway", label: "User Interaction & Auction Bids" },
  { id: "l2", source: "gateway", target: "inventory", label: "Inventory Search & Booking Requests" },
  { id: "l3", source: "gateway", target: "finance", label: "Invoice Processing & Wiring Commands" },
  { id: "l4", source: "inventory", target: "db_core", label: "VIN allocations & Bid Logs" },
  { id: "l5", source: "finance", target: "db_secure", label: "Tariff Payments & Escrow Ledger" },
  { id: "l6", source: "logistics", target: "inventory", label: "Port Updates & Customs Clearing Status" },
  { id: "l7", source: "logistics", target: "db_secure", label: "Customs Clearances Files" },
  { id: "l8", source: "telematics", target: "db_core", label: "GPS Pings & Diagnostics Logs" }
];

export const INITIAL_THREATS: Threat[] = [
  {
    id: "T-01",
    title: "OBD-II Telematics GPS Coordinate Spoofing",
    category: "Spoofing",
    description: "An attacker intercepts the raw GSM/cellular communication from the vehicle's OBD-II transit dongle and replays or spoofs GPS coordinates. This tricks logistics tracking into believing the car is safely parked at a secure secure port compound while it has physically been stolen during transit.",
    severity: "Critical",
    status: "Open",
    impactedComponent: "OBD-II Telematics Ingestion",
    mitigation: "Implement cryptographically signed telemetry payloads at the hardware dongle level using private/public key pairs provisioned securely during manufacturing. Apply anomalies/kalman-filtering to coordinate progressions server-side to flag geographic teleportation jumps.",
    dread: { damage: 10, reproducibility: 6, exploitability: 7, affectedUsers: 4, discoverability: 7 },
    customCodeSnippet: `// Server-Side Telemetry Verification Example (Node.js)
import crypto from 'crypto';

export function verifyTelemetryPayload(payload: {
  deviceId: string;
  data: any;
  signature: string;
}, devicePublicKeyPem: string): boolean {
  const verifier = crypto.createVerify('sha256');
  
  // Create deterministic representation of telemetry data
  const dataToVerify = JSON.stringify({
    deviceId: payload.deviceId,
    gps: payload.data.gps,
    vitals: payload.data.vitals,
    timestamp: payload.data.timestamp
  });
  
  verifier.update(dataToVerify);
  return verifier.verify(devicePublicKeyPem, payload.signature, 'hex');
}`
  },
  {
    id: "T-02",
    title: "Evading Tariffs via Customs Clearance Declarations Tampering",
    category: "Tampering",
    description: "An external shipping logistics handler intercepts and modifies Customs Manifest payloads. By altering the car's engine size displacement (cc), trim levels, or reported purchase invoices, they falsely trigger lower tariff brackets to evade federal import taxes.",
    severity: "Critical",
    status: "Open",
    impactedComponent: "Customs & Carrier API",
    mitigation: "Enforce digital signatures on all out-of-band Customs declarations. Periodically run an automated reconciliation job that checks the Manufacturer VIN database (e.g. NHTSA / vPIC) to verify that engine size and vehicle details perfectly match declared customs data before submitting.",
    dread: { damage: 9, reproducibility: 5, exploitability: 6, affectedUsers: 3, discoverability: 6 },
    customCodeSnippet: `// Automated VIN Attribute Reconciliation Service
export async function reconcileVinAttributes(declaredEngineCc: number, vin: string): Promise<boolean> {
  try {
    // Fetch official manufacturing specifications from government vPIC API
    const res = await fetch(\`https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVin/\${vin}?format=json\`);
    const details = await res.json();
    
    const displacementLiters = details.Results.find((r: any) => r.Variable === "Displacement (L)")?.Value;
    if (displacementLiters) {
      const actualCc = parseFloat(displacementLiters) * 1000;
      // Alert security/compliance if declared CC is more than 10% lower than actual
      if (declaredEngineCc < (actualCc * 0.9)) {
        console.warn(\`⚠️ [ALERT] Tariff evasion signature detected for VIN \${vin}! Declared \${declaredEngineCc}cc but actually \${actualCc}cc.\`);
        return false;
      }
    }
    return true;
  } catch (err) {
    console.error("Failed to fetch official VIN details", err);
    return false; // Fail secure
  }
}`
  },
  {
    id: "T-03",
    title: "SQL Injection on Live Dealer Auction Bid Logs",
    category: "Tampering",
    description: "An authenticated, malicious dealer injects SQL query structures into the 'Custom Bidding amount' field. This allows them to bypass validation, access backend database tables, and arbitrarily delete, modify, or lower active bids placed by competing dealerships, skewing the final sale price of classic imports.",
    severity: "High",
    status: "Open",
    impactedComponent: "Inventory DB",
    mitigation: "Enforce parameterized queries or ORM models for all transaction logs. Reject raw SQL concatenations entirely. Conduct server-side input schema validation restricting numerical inputs.",
    dread: { damage: 9, reproducibility: 8, exploitability: 7, affectedUsers: 5, discoverability: 8 },
    customCodeSnippet: `// Parameterized Query Logging Bid
import { Client } from 'pg';

export async function submitBidSecurely(client: Client, bidId: string, dealerId: string, vehicleId: string, bidAmount: number) {
  // Safe parameterized query - separates SQL commands from user input values
  const query = 'INSERT INTO auction_bids(id, dealer_id, vehicle_id, amount, timestamp) VALUES($1, $2, $3, $4, NOW())';
  const values = [bidId, dealerId, vehicleId, bidAmount];
  
  if (isNaN(bidAmount) || bidAmount <= 0) {
    throw new Error("Invalid bid amount value.");
  }
  
  return await client.query(query, values);
}`
  },
  {
    id: "T-04",
    title: "Auction Rollback Denial and Repudiation",
    category: "Repudiation",
    description: "A dealer makes a high-value bid on a luxury sports vehicle, wins the auction, but later denies placing the bid, claiming the system logged it in error or their session was hijacked. Without non-repudiation logs, the importer faces significant administrative fees and cargo-storage bottlenecks.",
    severity: "Medium",
    status: "In-Progress",
    impactedComponent: "Dealer & Customer Portal",
    mitigation: "Require dealers to authenticate critical bids with unique transactional session-PINs. Generate an immutable, cryptographically hashed receipt (audit-log blockchain or SHA-256 state ledger) sent to the dealer's verified email on bid submission.",
    dread: { damage: 6, reproducibility: 6, exploitability: 7, affectedUsers: 4, discoverability: 5 },
    customCodeSnippet: `// Creating a Cryptographic Bid Receipt for Non-Repudiation
import crypto from 'crypto';

export interface AuditRecord {
  dealerId: string;
  bidAmount: number;
  vehicleId: string;
  timestamp: string;
  previousHash: string;
}

export function generateImmutableReceipt(record: AuditRecord): string {
  const hash = crypto.createHash('sha256');
  const dataString = \`\${record.dealerId}|\${record.bidAmount}|\${record.vehicleId}|\${record.timestamp}|\${record.previousHash}\`;
  
  return hash.update(dataString).digest('hex');
}`
  },
  {
    id: "T-05",
    title: "IDOR and VIN Status Modification Vulnerability",
    category: "Elevation of Privilege",
    description: "A low-privileged ports officer is able to access endpoints like '/api/inventory/vehicles/:id/status' and change any vehicle's inventory state (e.g., from 'At Sea' to 'Port Release Approved'). Attackers can exploit this Insecure Direct Object Reference (IDOR) to release vehicles to the public illegally before customs clearances are officially paid.",
    severity: "Critical",
    status: "Open",
    impactedComponent: "Vehicle & VIN Manager",
    mitigation: "Implement rigorous authorization middlewares that verify both the user's role and their regional port assignments. Establish direct, server-verified workflows where a vehicle status can ONLY transition to 'Port Release Approved' if there is an automated API callback from the Customs Clearing system verifying tax receipt clearance.",
    dread: { damage: 9, reproducibility: 8, exploitability: 8, affectedUsers: 5, discoverability: 7 },
    customCodeSnippet: `// Safe Role-Based Access Control Middleware for VIN Operations
import { Request, Response, NextFunction } from 'express';

export function authorizeStatusTransition(requiredRole: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user; // Set by preceding authentication middleware
    
    if (!user || user.role !== requiredRole) {
      return res.status(403).json({ 
        error: "Forbidden: You do not possess the necessary clearance level to perform status updates." 
      });
    }
    
    // Check specific bounds, e.g., regional port matches
    const vehiclePortId = req.body.portId;
    if (user.assignedPortId !== 'GLOBAL' && user.assignedPortId !== vehiclePortId) {
      return res.status(403).json({
        error: "Forbidden: Your permissions are limited to your assigned physical compound."
      });
    }
    
    next();
  };
}`
  },
  {
    id: "T-06",
    title: "Unencrypted Leakage of Dealer Credit and Bank Statements",
    category: "Information Disclosure",
    description: "Dealer credit references, business tax certifications, and financial wiring verification documents uploaded to the portal are stored in an unencrypted S3/Cloud Storage bucket. Internal development endpoints accidentally expose log details containing the raw URLs to these documents without authentication tokens.",
    severity: "High",
    status: "Open",
    impactedComponent: "Escrow & Wiring Hub",
    mitigation: "Enforce column-level envelope encryption on all private document links. Store objects in private storage buckets that reject public URL resolution. Serve documents exclusively via short-lived, cryptographically signed URLs (e.g. Google Cloud Signed URLs) with expiration times of under 5 minutes.",
    dread: { damage: 8, reproducibility: 7, exploitability: 6, affectedUsers: 8, discoverability: 6 },
    customCodeSnippet: `// Server-side generation of secure temporary storage access
import { Storage } from '@google-cloud/storage';

const storage = new Storage();

export async function generateSecureDocumentUrl(bucketName: string, fileName: string): Promise<string> {
  const options = {
    version: 'v4' as const,
    action: 'read' as const,
    expires: Date.now() + 5 * 60 * 1000, // 5 minutes validity
  };

  const [url] = await storage
    .bucket(bucketName)
    .file(fileName)
    .getSignedUrl(options);

  return url;
}`
  },
  {
    id: "T-07",
    title: "Live Auction Denial of Service via Bid Congestion",
    category: "Denial of Service",
    description: "Competitive B2B dealers launch automated request botnets to flood the auction submit endpoint during the final two minutes of high-demand classic vehicle auctions. This triggers server-side thread starvation, blocking competing dealers' bids and causing the auction to close below fair market value.",
    severity: "High",
    status: "Open",
    impactedComponent: "API Gateway & Auth",
    mitigation: "Configure rate limiting specifically tuned for bid submissions using Redis-backed token bucket limits. Utilize a robust messaging queue (e.g., RabbitMQ or Google Cloud Pub/Sub) to handle sudden spikes in bid submissions asynchronously, guaranteeing processing order based on server timestamps rather than lock starvation.",
    dread: { damage: 8, reproducibility: 8, exploitability: 7, affectedUsers: 7, discoverability: 6 },
    customCodeSnippet: `// Rate Limiting Config with Express Rate Limit (Concept)
import rateLimit from 'express-rate-limit';

export const bidSubmissionRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // Limit each IP to 10 bids per minute
  message: {
    error: "Too many bid attempts. Rate limit exceeded to prevent auction jamming."
  },
  standardHeaders: true,
  legacyHeaders: false,
});`
  },
  {
    id: "T-08",
    title: "Customs API Webhook Spoofing",
    category: "Spoofing",
    description: "An attacker discovers the webhook receiver URL of the Logistics Tracker service. Because the webhook receiver does not validate signature headers, the attacker sends a spoofed 'Customs Cleared' payload for a restricted vehicle shipment, causing the system to automatically release the vehicle state without official physical authorization.",
    severity: "High",
    status: "Mitigated",
    impactedComponent: "Customs & Carrier API",
    mitigation: "Implement HMAC-SHA256 signature validation on all incoming customs and payment webhooks. Use a shared, rotated secret key to verify that the incoming payload has not been tampered with and was indeed dispatched by the official Customs authorities.",
    dread: { damage: 8, reproducibility: 7, exploitability: 5, affectedUsers: 3, discoverability: 5 },
    customCodeSnippet: `// Verify Customs HMAC Signature Webhook
import crypto from 'crypto';

export function verifyCustomsWebhook(
  rawBody: string, 
  receivedSignature: string, 
  webhookSecret: string
): boolean {
  const hash = crypto
    .createHmac('sha256', webhookSecret)
    .update(rawBody)
    .digest('hex');
  
  // Use constant-time comparison to prevent timing attacks
  return crypto.timingSafeEqual(
    Buffer.from(hash, 'utf-8'), 
    Buffer.from(receivedSignature, 'utf-8')
  );
}`
  }
];

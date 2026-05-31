/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Email } from '../types';
import { encryptText } from '../utils/crypto';

// Let's pre-populate standard encrypted and plaintext emails to demonstrate the UI immediately!
const aliceKey = 'PUB-INT-ALICE-◈⧉⛓';
const developerKey = 'PUB-INT-DEV-⚙⎘⚛';

const msg1 = encryptText(
  "Hello Team, the proprietary dataset for the intent-based router has been securely synced. Please use the private key to unlock the Enron and BC3 indices.",
  developerKey
);

const msg2 = encryptText(
  "Can you verify the offline cache sync on your mobile workspace? The local storage sync protocol expects transaction checksum updates every 120 seconds.",
  developerKey
);

const msg3 = encryptText(
  "ALERT: New device authorization requested. Visual fingerprint checksum: [▲ ⧉ ◈ ⚙ ⛓ ⌘ ⎗ ⋮]. Is this your mobile simulator tab?",
  developerKey
);

export const INITIAL_EMAILS: Email[] = [
  {
    id: 'mail-1',
    sender: 'alice@onlyintent.io',
    senderName: 'Alice (Security Lead)',
    recipient: 'developer@onlyintent.io',
    subject: '🔒 Secure Dataset Core Access Key',
    body: 'Hello Team, the proprietary dataset for the intent-based router has been securely synced. Please use the private key to unlock the Enron and BC3 indices.',
    ciphertext: msg1.ciphertext,
    cipherGlyphs: msg1.glyphMessage,
    timestamp: '2026-05-31T12:05:00Z',
    encrypted: true,
    status: 'received',
    isRead: false,
    intentCategory: 'Research'
  },
  {
    id: 'mail-2',
    sender: 'bob@onlyintent.io',
    senderName: 'Bob (Core Systems)',
    recipient: 'developer@onlyintent.io',
    subject: '⚙ Sync Protocol Checksums - Multi-Device',
    body: 'Can you verify the offline cache sync on your mobile workspace? The local storage sync protocol expects transaction checksum updates every 120 seconds.',
    ciphertext: msg2.ciphertext,
    cipherGlyphs: msg2.glyphMessage,
    timestamp: '2026-05-31T13:10:00Z',
    encrypted: true,
    status: 'received',
    isRead: true,
    intentCategory: 'Sync Protocol'
  },
  {
    id: 'mail-3',
    sender: 'security-notify@onlyintent.io',
    senderName: 'SecOps Sentinel',
    recipient: 'developer@onlyintent.io',
    subject: '🛡 ALERT: Device Synchronization Handshake',
    body: 'ALERT: New device authorization requested. Visual fingerprint checksum: [▲ ⧉ ◈ ⚙ ⛓ ⌘ ⎗ ⋮]. Is this your mobile simulator tab?',
    ciphertext: msg3.ciphertext,
    cipherGlyphs: msg3.glyphMessage,
    timestamp: '2026-05-31T14:15:00Z',
    encrypted: true,
    status: 'received',
    isRead: false,
    intentCategory: 'Security Alert'
  },
  {
    id: 'mail-4',
    sender: 'research-hub@onlyintent.io',
    senderName: 'Intent Study Org',
    recipient: 'developer@onlyintent.io',
    subject: 'Available public datasets for user intent search',
    body: 'Greetings! Our research group has compiled several key datasets (such as the Avocado Corpus) for analyzing user intent interfaces. Check the Research Hub tab to view details.',
    ciphertext: 'Unencrypted Message',
    cipherGlyphs: 'No encryption layer applied to public announcements.',
    timestamp: '2026-05-31T09:45:00Z',
    encrypted: false,
    status: 'received',
    isRead: true,
    intentCategory: 'Research'
  }
];

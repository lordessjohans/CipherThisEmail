/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Email {
  id: string;
  sender: string;
  senderName: string;
  recipient: string;
  subject: string;
  body: string;
  ciphertext: string;
  timestamp: string;
  encrypted: boolean;
  cipherGlyphs: string;
  status: 'draft' | 'sent' | 'received' | 'offline_queued';
  isRead: boolean;
  intentCategory: 'Research' | 'Security Alert' | 'Sync Protocol' | 'General' | 'Proprietary';
}

export interface Device {
  id: string;
  name: string;
  type: 'mobile' | 'desktop' | 'tablet';
  lastSyncTime: string;
  isOnline: boolean;
  pendingSyncCount: number;
}

export interface CryptoKeyPair {
  publicKey: string;
  privateKey: string;
  algorithm: string;
  fingerprint: string;
  glyphRepresentation: string[];
}

export interface IntentDataset {
  id: string;
  name: string;
  description: string;
  category: string;
  size: string;
  recordsCount: string;
  license: string;
  relevanceToIntent: string;
  exploreQuery: string;
}

export interface SearchQuery {
  raw: string;
  inferredIntent: string;
  parsedParams: {
    sender?: string;
    encryptedOnly?: boolean;
    category?: string;
  };
}

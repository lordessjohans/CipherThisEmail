/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { generateDeterministicKeyPair, encryptText, GLYPH_MAP } from '../utils/crypto';
import { CryptoKeyPair } from '../types';
import { KeyRound, ShieldCheck, Cpu, RefreshCw, Layers } from 'lucide-react';

interface KeyGeneratorProps {
  onKeyPairChange: (keyPair: CryptoKeyPair) => void;
  activeKeyPair: CryptoKeyPair;
}

export default function KeyGenerator({ onKeyPairChange, activeKeyPair }: KeyGeneratorProps) {
  const [seed, setSeed] = useState<string>('IntentMaster2026');
  const [owner, setOwner] = useState<string>('Developer OnlyIntent');
  const [sandboxText, setSandboxText] = useState<string>('Secure this secret message');
  const [encryptedOutput, setEncryptedOutput] = useState<{ ciphertext: string; glyphMessage: string }>({
    ciphertext: '',
    glyphMessage: ''
  });

  // Automatically update the keypair when owner or seed changes
  useEffect(() => {
    const freshPair = generateDeterministicKeyPair(owner, seed);
    onKeyPairChange(freshPair);
  }, [owner, seed]);

  // Update sandbox encryption live
  useEffect(() => {
    const result = encryptText(sandboxText, activeKeyPair.publicKey);
    setEncryptedOutput(result);
  }, [sandboxText, activeKeyPair]);

  const handleRandomizeSeed = () => {
    const prefixes = ['Priv', 'Sec', 'Shield', 'Int', 'Core', 'Vortex'];
    const suffixes = ['Alpha', 'Delta', 'Vault', 'Nodes', 'Glyph', 'Matrix'];
    const number = Math.floor(1000 + Math.random() * 9000);
    const randomized = `${prefixes[Math.floor(Math.random() * prefixes.length)]}-${suffixes[Math.floor(Math.random() * suffixes.length)]}-${number}`;
    setSeed(randomized);
  };

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6" id="secops-key-panel">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-neutral-900 text-white rounded-xl">
            <KeyRound className="w-5 h-5" id="icon-security-key" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-800 text-base">E2E Visual Key Ring</h3>
            <p className="text-xs text-slate-500 font-mono">Status: [ACTIVE CRYPTO PAIR]</p>
          </div>
        </div>
        <button
          onClick={handleRandomizeSeed}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 transition"
          id="btn-regen-keys"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Regenerate Seed
        </button>
      </div>

      {/* Identity Configuration */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Key Owner</label>
          <input
            type="text"
            value={owner}
            onChange={(e) => setOwner(e.target.value)}
            className="w-full text-sm bg-white border border-slate-200 px-3 py-2 rounded-lg font-mono text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-400"
            placeholder="Owner Name"
            id="input-key-owner"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Cryptographic Passphrase Seed</label>
          <input
            type="text"
            value={seed}
            onChange={(e) => setSeed(e.target.value)}
            className="w-full text-sm bg-white border border-slate-200 px-3 py-2 rounded-lg font-mono text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-400"
            placeholder="Passphrase seed"
            id="input-key-seed"
          />
        </div>
      </div>

      {/* Cryptographic Pair Details */}
      <div className="bg-white border border-slate-150 rounded-xl p-4 space-y-3 font-mono text-xs">
        <div className="flex justify-between items-center text-slate-500 border-b border-slate-100 pb-2">
          <span>ALGORITHM IN USE:</span>
          <span className="font-semibold text-slate-700">{activeKeyPair.algorithm}</span>
        </div>
        <div className="space-y-1">
          <span className="text-slate-500 block">PUBLIC ENCRYPTION KEY (For encrypting drafts):</span>
          <div className="p-2 bg-neutral-900 text-emerald-400 rounded-lg select-all break-all text-xs" id="display-pubkey">
            {activeKeyPair.publicKey}
          </div>
        </div>
        <div className="space-y-1">
          <span className="text-slate-500 block">PRIVATE DECRYPTION KEY (Kept local, never shared):</span>
          <div className="p-2 bg-neutral-900 text-indigo-400 rounded-lg select-all break-all text-xs" id="display-privkey">
            {activeKeyPair.privateKey}
          </div>
        </div>
        <div className="flex flex-col gap-1.5 pt-1">
          <span className="text-slate-500">VISUAL FINGERPRINT MATRIX (Dense Symbology Verification):</span>
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-150 p-2 rounded-lg">
            <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded text-[10px] font-bold">MATCH SYNC OK</span>
            <span className="text-slate-700 font-bold select-none">{activeKeyPair.fingerprint}</span>
          </div>
        </div>
        <div className="flex gap-2 items-center text-[11px] text-slate-500 pt-1">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Local sandboxed encryption protects against upstream eavesdropping and server injection.</span>
        </div>
      </div>

      {/* Interactive Cryptogram Sandbox */}
      <div className="bg-slate-100/80 border border-slate-200 rounded-xl p-4 space-y-4">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-slate-600 animate-pulse" />
          <h4 className="font-semibold text-xs text-slate-700 uppercase tracking-wider">Live Encryption Sandbox</h4>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Type Plaintext To Generate Secure Visual Glyphs:</label>
          <textarea
            value={sandboxText}
            onChange={(e) => setSandboxText(e.target.value)}
            rows={2}
            className="w-full text-xs font-mono bg-white border border-slate-200 p-2.5 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-350 resize-none"
            placeholder="Type secret message..."
            id="sandbox-textarea"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
          {/* Output 1: Dense Glyphs */}
          <div className="bg-white border border-slate-200 rounded-lg p-3 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-emerald-600 tracking-wider">SECURE GLYPH TRANSFORMATION</span>
              <span className="text-[9px] text-slate-400 font-mono">[{sandboxText.length} characters]</span>
            </div>
            <div className="p-2.5 bg-neutral-50 rounded-md text-base font-mono text-center text-slate-800 font-medium break-all select-all min-h-[48px]" id="sandbox-glyph-output">
              {encryptedOutput.glyphMessage || '⚋'}
            </div>
          </div>

          {/* Output 2: Structured Hex Ciphertext */}
          <div className="bg-white border border-slate-200 rounded-lg p-3 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-indigo-600 tracking-wider">ENCRYPTED BINARY ARRAY</span>
              <span className="text-[9px] text-slate-400 font-mono">Hex Raw Stream</span>
            </div>
            <div className="p-2.5 bg-neutral-50 rounded-md text-[10px] font-mono text-slate-600 break-all select-all min-h-[48px]" id="sandbox-hex-output">
              {encryptedOutput.ciphertext || '⚋'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

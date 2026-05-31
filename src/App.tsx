/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Search,
  Mail,
  Send,
  Database,
  ShieldAlert,
  Menu,
  Lock,
  Unlock,
  Plus,
  Wifi,
  WifiOff,
  User,
  KeyRound,
  Layers,
  Radio,
  FileCode,
  Sparkles,
  HelpCircle,
  Eye,
  Trash2,
  Inbox
} from 'lucide-react';

import { Email, Device, CryptoKeyPair, IntentDataset, SearchQuery } from './types';
import { INITIAL_EMAILS } from './data/emailData';
import { USER_INTENT_DATASETS } from './data/datasets';
import { generateDeterministicKeyPair, encryptText, decryptText, inferUserIntent } from './utils/crypto';

// Subcomponents
import KeyGenerator from './components/KeyGenerator';
import SyncedDevices from './components/SyncedDevices';
import OfflineIndicator from './components/OfflineIndicator';

export default function App() {
  // --- Persistent & In-Memory State ---
  const [emails, setEmails] = useState<Email[]>(() => {
    const saved = localStorage.getItem('onlyintent_emails');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Fallback
      }
    }
    return INITIAL_EMAILS;
  });

  const [devices, setDevices] = useState<Device[]>(() => {
    const saved = localStorage.getItem('onlyintent_devices');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Fallback
      }
    }
    return [
      { id: 'dev-1', name: 'Primary Workstation (Browser)', type: 'desktop', lastSyncTime: '14:20:00', isOnline: true, pendingSyncCount: 0 },
      { id: 'dev-2', name: 'Secure Smartphone Client', type: 'mobile', lastSyncTime: '14:18:30', isOnline: true, pendingSyncCount: 0 },
      { id: 'dev-3', name: 'Secondary Tablet Vault', type: 'tablet', lastSyncTime: '14:10:00', isOnline: false, pendingSyncCount: 1 }
    ];
  });

  const [activeKeyPair, setActiveKeyPair] = useState<CryptoKeyPair>(() => {
    return generateDeterministicKeyPair('Developer OnlyIntent', 'IntentMaster2026');
  });

  const [isOffline, setIsOffline] = useState<boolean>(false);
  const [offlineQueue, setOfflineQueue] = useState<Email[]>(() => {
    const saved = localStorage.getItem('onlyintent_offline_queue');
    return saved ? JSON.parse(saved) : [];
  });

  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'inbox' | 'compose' | 'devices' | 'keys' | 'datasets'>('inbox');
  const [selectedEmailId, setSelectedEmailId] = useState<string>('mail-1');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [inferredIntent, setInferredIntent] = useState<SearchQuery | null>(null);

  // Decryption State
  const [passphraseInput, setPassphraseInput] = useState<string>('');
  const [unlockedEmailIds, setUnlockedEmailIds] = useState<Record<string, boolean>>({});

  // Composer Form
  const [composeRecipient, setComposeRecipient] = useState<string>('alice@onlyintent.io');
  const [composeSubject, setComposeSubject] = useState<string>('');
  const [composeBody, setComposeBody] = useState<string>('');
  const [composeEncrypt, setComposeEncrypt] = useState<boolean>(true);
  const [composeCategory, setComposeCategory] = useState<Email['intentCategory']>('General');
  
  // Real-time Visual Encryption Preview for drafting
  const [draftEncodingPreview, setDraftEncodingPreview] = useState<{ ciphertext: string; glyphMessage: string }>({
    ciphertext: '',
    glyphMessage: ''
  });

  // Save changes to LocalStorage
  useEffect(() => {
    localStorage.setItem('onlyintent_emails', JSON.stringify(emails));
  }, [emails]);

  useEffect(() => {
    localStorage.setItem('onlyintent_devices', JSON.stringify(devices));
  }, [devices]);

  useEffect(() => {
    localStorage.setItem('onlyintent_offline_queue', JSON.stringify(offlineQueue));
  }, [offlineQueue]);

  // Handle draft cryptogram updates live during composition
  useEffect(() => {
    if (composeBody) {
      const cryptoResult = encryptText(composeBody, activeKeyPair.publicKey);
      setDraftEncodingPreview(cryptoResult);
    } else {
      setDraftEncodingPreview({ ciphertext: '', glyphMessage: '' });
    }
  }, [composeBody, activeKeyPair]);

  // Realtime search intent parsing
  useEffect(() => {
    if (searchQuery.trim()) {
      const intentInfo = inferUserIntent(searchQuery);
      setInferredIntent(intentInfo);
    } else {
      setInferredIntent(null);
    }
  }, [searchQuery]);

  // --- Handlers ---
  const handleToggleDeviceStatus = (id: string) => {
    setDevices(prev =>
      prev.map(d => {
        if (d.id === id) {
          const nextState = !d.isOnline;
          return { ...d, isOnline: nextState };
        }
        return d;
      })
    );
  };

  const handleAddSimulatedDevice = (name: string, type: 'mobile' | 'desktop' | 'tablet') => {
    const newDev: Device = {
      id: `dev-${Math.random().toString(36).substr(2, 5)}`,
      name,
      type,
      lastSyncTime: 'Never',
      isOnline: true,
      pendingSyncCount: 0
    };
    setDevices(prev => [...prev, newDev]);
  };

  const handleSyncAllDevices = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour12: false });
      setDevices(prev =>
        prev.map(d =>
          d.isOnline ? { ...d, lastSyncTime: timeStr, pendingSyncCount: 0 } : d
        )
      );
    }, 1200);
  };

  const handleToggleOffline = () => {
    const nextOffline = !isOffline;
    setIsOffline(nextOffline);
    if (!nextOffline && offlineQueue.length > 0) {
      // Re-connected! Automatically flush local outbox
      setTimeout(() => {
        handleFlushOfflineQueue();
      }, 800);
    }
  };

  const handleFlushOfflineQueue = () => {
    if (offlineQueue.length === 0) return;

    // Move queued mails to standard emails database
    setEmails(prev => [...offlineQueue, ...prev]);
    setOfflineQueue([]);
  };

  const handleSendEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!composeRecipient || !composeSubject || !composeBody) return;

    const { ciphertext, glyphMessage } = composeEncrypt 
      ? encryptText(composeBody, activeKeyPair.publicKey)
      : { ciphertext: 'Unencrypted Message', glyphMessage: 'No cryptogram applied.' };

    const newMail: Email = {
      id: `mail-${Math.random().toString(36).substr(2, 6)}`,
      sender: 'developer@onlyintent.io',
      senderName: 'You (Vault Terminal)',
      recipient: composeRecipient,
      subject: composeEncrypt ? `🔒 ${composeSubject}` : composeSubject,
      body: composeBody,
      ciphertext,
      cipherGlyphs: glyphMessage,
      timestamp: new Date().toISOString(),
      encrypted: composeEncrypt,
      status: isOffline ? 'offline_queued' : 'sent',
      isRead: true,
      intentCategory: composeCategory
    };

    if (isOffline) {
      setOfflineQueue(prev => [newMail, ...prev]);
      // Update our other active devices with sync burden
      setDevices(prev => prev.map(d => d.isOnline ? d : { ...d, pendingSyncCount: d.pendingSyncCount + 1 }));
    } else {
      setEmails(prev => [newMail, ...prev]);
      // Trigger temporary device syncing
      setDevices(prev => prev.map(d => d.isOnline ? { ...d, pendingSyncCount: 0 } : { ...d, pendingSyncCount: d.pendingSyncCount + 1 }));
    }

    // Reset Form
    setComposeSubject('');
    setComposeBody('');
    setComposeCategory('General');
    
    // Auto-select the newly sent email or return to folder
    setSelectedEmailId(newMail.id);
    setActiveTab('inbox');
  };

  const handleDeleteEmail = (id: string) => {
    setEmails(prev => prev.filter(m => m.id !== id));
    if (selectedEmailId === id) {
      setSelectedEmailId('');
    }
  };

  const handleDecryptEmail = (id: string, emailObj: Email) => {
    // Check if passphrase decrypt keys match
    // In our E2EE model, if user enters the correct pass phrase or private key sequence, decrypt succeeds!
    // Let's accept either the current private key sequence 'PRV-INT-...' or the seed 'IntentMaster2026' or just non-empty for demonstration
    if (!passphraseInput.trim()) return;

    // Verify passphrase match of the key
    const cleanedPass = passphraseInput.trim();
    if (cleanedPass === activeKeyPair.privateKey || cleanedPass === 'IntentMaster2026' || cleanedPass.toLowerCase() === 'decrypt') {
      setUnlockedEmailIds(prev => ({ ...prev, [id]: true }));
      setPassphraseInput('');
    } else {
      alert('🔒 Verification Fault: Private Key mismatch or invalid signature seed.');
    }
  };

  // --- Filtered Email Selection Logic based on Intent Search ---
  const getFilteredEmails = () => {
    let list = emails;

    if (inferredIntent) {
      const { parsedParams, raw } = inferredIntent;
      const term = raw.toLowerCase();

      // If user typed custom sender
      if (parsedParams.sender) {
        list = list.filter(m => m.senderName.toLowerCase().includes(parsedParams.sender!.toLowerCase()) || m.sender.toLowerCase().includes(parsedParams.sender!.toLowerCase()));
      }
      // If encrypted only query
      if (parsedParams.encryptedOnly) {
        list = list.filter(m => m.encrypted);
      }
      // If specific category
      if (parsedParams.category) {
        list = list.filter(m => m.intentCategory === parsedParams.category);
      }

      // general fallback query search
      if (!parsedParams.sender && !parsedParams.encryptedOnly && !parsedParams.category) {
        list = list.filter(m => 
          m.subject.toLowerCase().includes(term) ||
          m.body.toLowerCase().includes(term) ||
          m.senderName.toLowerCase().includes(term) ||
          m.intentCategory.toLowerCase().includes(term)
        );
      }
    }

    return list;
  };

  const filteredMails = getFilteredEmails();
  const selectedEmail = emails.find(m => m.id === selectedEmailId) || filteredMails[0] || emails[0];

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-800 antialiased p-0 md:p-4 lg:p-6">
      {/* 
        ========================================================================
        LANDMARK WRAPPER: THE ONLY INTENTIONAL SEARCH BROWSER MOCKUP
        Geared exclusively towards secure data privacy & intent accuracy!
        ========================================================================
      */}
      <div className="w-full max-w-7xl mx-auto bg-white border border-slate-300 rounded-none md:rounded-3xl shadow-xl flex flex-col overflow-hidden min-h-[92vh]" id="intent-browser-container">
        
        {/* Browser Top Operating Bar */}
        <div className="bg-slate-900 text-white px-5 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-slate-850" id="browser-address-bar">
          <div className="flex items-center gap-3">
            {/* Visual Red/Green dot controls - No functionality but establishes top browser vibe */}
            <div className="hidden md:flex gap-1.5 font-mono text-neutral-500 text-xs">
              <span className="w-3 h-3 rounded-full bg-rose-500/90 block"></span>
              <span className="w-3 h-3 rounded-full bg-amber-500/90 block"></span>
              <span className="w-3 h-3 rounded-full bg-emerald-500/90 block"></span>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-sm font-extrabold tracking-wider bg-gradient-to-r from-emerald-400 to-indigo-400 bg-clip-text text-transparent font-sans uppercase">
                The Only Intentional Search Browser
              </span>
              <span className="text-[10px] bg-neutral-800 text-neutral-400 font-mono px-2 py-0.5 rounded border border-neutral-700">
                [SECURE PROTOCOL V1]
              </span>
            </div>
          </div>

          {/* Dummy Address input displaying active state */}
          <div className="w-full sm:max-w-md bg-neutral-800 rounded-lg px-3 py-1.5 text-xs text-neutral-300 border border-neutral-700 font-mono flex items-center justify-between shadow-inner">
            <div className="flex items-center gap-1.5 truncate">
              <Lock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="text-emerald-400">HTTPS://</span>
              <span className="truncate">onlyintent.io/vault/secops-node-031</span>
            </div>
            <div className="flex items-center gap-2 text-[10px]">
              {isOffline ? (
                <span className="text-amber-500 font-bold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span> OFFLINE CAGE
                </span>
              ) : (
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span> SECURE PLENUM
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Global Intent Search Toolbar */}
        <div className="bg-slate-50 border-b border-slate-205 p-4 flex flex-col gap-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h1 className="text-xl font-semibold text-slate-800 tracking-tight flex items-center gap-2 leading-none">
              <Mail className="w-5 h-5 text-indigo-600" />
              Cryptographic Encrypted Inbox
            </h1>
            
            {/* Quick stats panel */}
            <div className="flex items-center gap-3 text-xs font-mono">
              <span className="text-slate-400">STATE STATUS:</span>
              <span className="bg-slate-200 text-slate-700 px-2.5 py-1 rounded-md font-bold">
                🔒 E2EE ACTIVE
              </span>
              <span className="bg-slate-200 text-slate-700 px-2.5 py-1 rounded-md font-bold">
                🚫 AD-FREE ZONE
              </span>
            </div>
          </div>

          {/* Intention-Based Smart Search Input */}
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by INTENT (e.g., 'Alice secure', 'phishing metrics', 'metadata logs', 'crypto keys')..."
              className="block w-full pl-10 pr-4 py-2.5 bg-white border border-slate-250 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400 transition"
              id="global-intent-search"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-xs text-slate-400 hover:text-slate-600 font-mono"
              >
                Clear
              </button>
            )}
          </div>

          {/* Dynamic Intent Translation Analytics Box */}
          {inferredIntent ? (
            <div className="bg-slate-900 text-slate-150 p-3.5 rounded-xl border border-indigo-950 font-mono text-xs flex flex-col md:flex-row md:items-center justify-between gap-3 animate-fade-in shadow-md">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
                <div>
                  <span className="text-neutral-400 uppercase text-[9px] tracking-wider block font-bold">Inferred Search Intention Analytics</span>
                  <span className="text-slate-200 font-bold text-[13px]">{inferredIntent.inferredIntent}</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {Object.entries(inferredIntent.parsedParams).map(([k, v]) => (
                  <span key={k} className="bg-neutral-850 px-2 py-0.5 rounded text-[10px] text-emerald-400 border border-neutral-750">
                    {k}: {String(v)}
                  </span>
                ))}
                <span className="bg-indigo-950 px-2.5 py-0.5 rounded text-[10px] text-indigo-300 border border-indigo-900">
                  Query-Safe ✓
                </span>
              </div>
            </div>
          ) : (
            <div className="text-[11px] text-slate-400 font-mono italic">
              💡 Hint: Try typing "Alice" or "Research" to test the AI intent retrieval index.
            </div>
          )}
        </div>

        {/* Tab Selection Row */}
        <div className="px-5 bg-slate-100 border-b border-slate-200 flex flex-wrap gap-2 pt-2.5">
          <button
            onClick={() => setActiveTab('inbox')}
            className={`px-4 py-2 text-xs font-semibold rounded-t-xl transition-all flex items-center gap-1.5 focus:outline-none cursor-pointer ${
              activeTab === 'inbox'
                ? 'bg-white text-slate-900 border-t border-x border-slate-200 relative -mb-px'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
            }`}
            id="tab-inbox"
          >
            <Inbox className="w-3.5 h-3.5" />
            Encrypted Mailbox
          </button>
          
          <button
            onClick={() => setActiveTab('compose')}
            className={`px-4 py-2 text-xs font-semibold rounded-t-xl transition-all flex items-center gap-1.5 focus:outline-none cursor-pointer ${
              activeTab === 'compose'
                ? 'bg-white text-slate-900 border-t border-x border-slate-200 relative -mb-px'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
            }`}
            id="tab-compose"
          >
            <Plus className="w-3.5 h-3.5 text-indigo-600" />
            New Secure Draft
          </button>

          <button
            onClick={() => setActiveTab('devices')}
            className={`px-4 py-2 text-xs font-semibold rounded-t-xl transition-all flex items-center gap-1.5 focus:outline-none cursor-pointer ${
              activeTab === 'devices'
                ? 'bg-white text-slate-900 border-t border-x border-slate-200 relative -mb-px'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
            }`}
            id="tab-devices"
          >
            <Radio className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
            Sync Multi-Devices ({devices.length})
          </button>

          <button
            onClick={() => setActiveTab('keys')}
            className={`px-4 py-2 text-xs font-semibold rounded-t-xl transition-all flex items-center gap-1.5 focus:outline-none cursor-pointer ${
              activeTab === 'keys'
                ? 'bg-white text-slate-900 border-t border-x border-slate-200 relative -mb-px'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
            }`}
            id="tab-keys"
          >
            <KeyRound className="w-3.5 h-3.5" />
            Key Ring Visuals
          </button>

          <button
            onClick={() => setActiveTab('datasets')}
            className={`px-4 py-2 text-xs font-semibold rounded-t-xl transition-all flex items-center gap-2 focus:outline-none cursor-pointer ${
              activeTab === 'datasets'
                ? 'bg-white text-slate-900 border-t border-x border-slate-200 relative -mb-px'
                : 'text-slate-500 hover:text-slate-950 hover:bg-slate-50'
            }`}
            id="tab-datasets"
          >
            <Database className="w-3.5 h-3.5 text-amber-600" />
            Possible Research Datasets
          </button>
        </div>

        {/* 
          ========================================================================
          TAB WORKSPACE DIRECTORY
          ========================================================================
        */}
        <div className="flex-1 min-h-[500px] flex flex-col bg-white">
          
          {/* TAB 1: ENCRYPTED MAILBOX split container */}
          {activeTab === 'inbox' && (
            <div className="flex-1 flex flex-col lg:flex-row h-full">
              
              {/* Left Column: Email list */}
              <div className="w-full lg:w-[380px] border-r border-slate-200 flex flex-col bg-slate-50">
                
                {/* Outbox Status and Quick Offline stats */}
                <div className="p-3 bg-white border-b border-slate-200 flex justify-between items-center text-xs">
                  <span className="font-mono text-slate-500">LISTING: {filteredMails.length} SECURE MESSAGES</span>
                  {offlineQueue.length > 0 && (
                    <span className="bg-amber-100 text-amber-800 text-[10px] font-mono font-bold px-2 py-0.5 rounded animate-pulse">
                      Offline queue has {offlineQueue.length}
                    </span>
                  )}
                </div>

                {filteredMails.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-8 text-center text-slate-400">
                    <Mail className="w-8 h-8 text-slate-300 mb-2" />
                    <p className="text-sm font-semibold">No emails match intent</p>
                    <p className="text-xs text-slate-400 mt-1">Try resetting the search bar</p>
                  </div>
                ) : (
                  <div className="overflow-y-auto divide-y divide-slate-150 flex-1 max-h-[550px]">
                    {/* Render queued offline drafts first with visually distinct color */}
                    {offlineQueue.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => setSelectedEmailId(item.id)}
                        className={`p-4 cursor-pointer text-left transition relative border-l-4 border-amber-500 ${
                          selectedEmailId === item.id ? 'bg-amber-100/70' : 'bg-amber-50/50 hover:bg-amber-100/40'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <span className="font-semibold text-xs text-slate-600 truncate">{item.senderName}</span>
                          <span className="text-[9px] font-mono uppercase bg-amber-100 text-amber-800 font-extrabold px-1.5 py-0.5 rounded tracking-wide">
                            QUEUED
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-800 truncate mb-1">{item.subject}</h4>
                        <p className="text-[11px] text-slate-500 font-mono truncate">{item.cipherGlyphs}</p>
                      </div>
                    ))}

                    {/* Standard items */}
                    {filteredMails.map((item) => {
                      const isUnread = !item.isRead;
                      const isCurrent = selectedEmailId === item.id;
                      return (
                        <div
                          key={item.id}
                          onClick={() => {
                            setSelectedEmailId(item.id);
                            // Mark read
                            item.isRead = true;
                          }}
                          className={`p-4 cursor-pointer text-left transition relative ${
                            isCurrent
                              ? 'bg-slate-200/75 border-l-3 border-slate-900'
                              : 'bg-white hover:bg-slate-100/70'
                          }`}
                        >
                          {isUnread && (
                            <span className="w-2.5 h-2.5 bg-indigo-500 rounded-full absolute top-4.5 right-4"></span>
                          )}
                          <div className="flex justify-between items-start mb-1 pr-4">
                            <span className="font-semibold text-xs text-slate-600 truncate">{item.senderName}</span>
                            <span className="text-[9px] font-mono text-slate-400">
                              {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          
                          <h4 className={`text-xs font-bold text-slate-800 truncate mb-1`}>
                            {item.subject}
                          </h4>
                          
                          <p className="text-[11px] text-slate-500 font-mono truncate">
                            {item.encrypted ? item.cipherGlyphs : item.body}
                          </p>

                          <div className="flex justify-between items-center mt-2.5">
                            <span className="text-[9px] font-mono bg-slate-200 text-slate-600 px-2 py-0.5 rounded font-medium">
                              {item.intentCategory}
                            </span>
                            {item.encrypted && (
                              <span className="text-[9px] font-mono text-emerald-600 font-bold flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                ENC V2
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Right Column: Active Email Detail Screen */}
              <div className="flex-1 bg-white p-6 flex flex-col justify-between">
                {selectedEmail ? (
                  <div className="space-y-6">
                    {/* Detail top header bar */}
                    <div className="flex justify-between items-start border-b border-slate-150 pb-4">
                      <div>
                        <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                          {selectedEmail.subject}
                        </h2>
                        
                        <div className="flex flex-wrap gap-2 items-center mt-2 font-mono text-xs text-slate-500">
                          <span className="text-slate-400">From:</span>
                          <span className="text-slate-800 font-medium">{selectedEmail.senderName}</span>
                          <span className="text-slate-400">&lt;{selectedEmail.sender}&gt;</span>
                          <span className="hidden sm:inline text-slate-350">|</span>
                          <span className="hidden sm:inline">Sent: {new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(selectedEmail.timestamp))}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleDeleteEmail(selectedEmail.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded transition"
                        title="Purge permanently"
                        id="btn-delete-email"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Encryption status strip */}
                    <div className={`p-3.5 rounded-xl flex items-center justify-between text-xs font-mono border ${
                      selectedEmail.encrypted 
                        ? unlockedEmailIds[selectedEmail.id]
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : 'bg-indigo-50 text-indigo-900 border-indigo-200 shadow-sm'
                        : 'bg-slate-50 text-slate-600 border-slate-200'
                    }`}>
                      <div className="flex items-center gap-2">
                        {selectedEmail.encrypted ? (
                          unlockedEmailIds[selectedEmail.id] ? (
                            <>
                              <Unlock className="w-4 h-4 text-emerald-600" />
                              <span>DECRYPTED DECK: Payload unlocked using verified visual keystorage.</span>
                            </>
                          ) : (
                            <>
                              <Lock className="w-4 h-4 text-indigo-600 animate-pulse" />
                              <span>E2EE CIPHERTEXT: Requires local Private Key authentication signature.</span>
                            </>
                          )
                        ) : (
                          <>
                            <HelpCircle className="w-4 h-4 text-slate-400" />
                            <span>PUBLIC TRANSMISSION: No encryption layers were applied. Clear text.</span>
                          </>
                        )}
                      </div>
                      
                      {selectedEmail.encrypted && (
                        <span className="text-[10px] font-bold uppercase">
                          {unlockedEmailIds[selectedEmail.id] ? 'UNLOCKED' : 'LOCKED'}
                        </span>
                      )}
                    </div>

                    {/* Email Core Contents */}
                    <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200/60 min-h-[220px]">
                      {selectedEmail.encrypted && !unlockedEmailIds[selectedEmail.id] ? (
                        /* Encrypted Symbology View */
                        <div className="space-y-4">
                          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                            <span className="text-[10px] text-slate-400 font-mono tracking-wider font-bold">
                              VISUAL CRYMPTOGRAPH DENSE CODES
                            </span>
                            <span className="text-[9px] font-mono text-slate-400">
                              [Characters mode enabled]
                            </span>
                          </div>

                          {/* Beautiful grid of dense encryption characters block representing un-decoded state */}
                          <div className="p-4 bg-neutral-900 text-slate-100 rounded-xl leading-relaxed text-sm md:text-base font-mono font-medium text-center break-all select-none selection:bg-slate-50 shadow-inner max-h-[140px] overflow-y-auto" id="encrypted-char-matrix">
                            {selectedEmail.cipherGlyphs}
                          </div>

                          <div className="font-mono text-[10px] text-slate-400 mt-2 bg-slate-100 p-2 rounded">
                            Hex representation: <span className="break-all">{selectedEmail.ciphertext}</span>
                          </div>
                          
                          {/* Decryption password input field */}
                          <div className="pt-4 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
                            <div>
                              <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">
                                Enter Private Key to Unlock
                              </label>
                              <input
                                type="password"
                                value={passphraseInput}
                                onChange={(e) => setPassphraseInput(e.target.value)}
                                placeholder="Paste PRV-INT-... key or type 'decrypt'"
                                className="w-full text-xs font-mono bg-white border border-slate-200 px-3 py-2 rounded-lg"
                                id="input-decrypt-key"
                              />
                            </div>
                            <button
                              onClick={() => handleDecryptEmail(selectedEmail.id, selectedEmail)}
                              className="px-4 py-2 bg-neutral-900 text-white rounded-lg text-xs font-semibold hover:bg-neutral-800 transition"
                              id="btn-perform-decrypt"
                            >
                              Verify Signature & Decrypt
                            </button>
                          </div>
                        </div>
                      ) : (
                        /* Decrypted / Regular view */
                        <div className="space-y-4">
                          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                            <span className="text-[10px] text-slate-400 font-mono tracking-wider font-bold">
                              UNLOCKED PLAINTEXT WORKSPACE
                            </span>
                            {selectedEmail.encrypted && (
                              <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">
                                Authenticated Decrypt
                              </span>
                            )}
                          </div>
                          <p className="text-slate-800 text-sm whitespace-pre-line leading-relaxed font-sans" id="email-rendered-body">
                            {selectedEmail.encrypted 
                              ? decryptText(selectedEmail.ciphertext, activeKeyPair.privateKey) 
                              : selectedEmail.body}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-slate-400 py-16">
                    <Mail className="w-12 h-12 text-slate-200 mb-2 animate-bounce" />
                    <p className="text-sm font-semibold">Select an email to view encrypted contents</p>
                  </div>
                )}

                {/* Offline simulator and core triggers */}
                <div className="mt-8 pt-4 border-t border-slate-100">
                  <OfflineIndicator
                    isOffline={isOffline}
                    onToggleOffline={handleToggleOffline}
                    cachedCount={emails.length}
                    offlineQueue={offlineQueue}
                    onFlushQueue={handleFlushOfflineQueue}
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: COMPOSE SECURE NEW EMAIL */}
          {activeTab === 'compose' && (
            <div className="p-6 max-w-2xl mx-auto w-full space-y-6">
              <div className="border-b border-slate-200 pb-2">
                <h2 className="text-lg font-bold text-slate-900">Compose Secure Encrypted Draft</h2>
                <p className="text-xs text-slate-500">Draft remains secure within sandboxed terminal. No servers see raw plaintext body tags!</p>
              </div>

              <form onSubmit={handleSendEmail} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Recipient Address</label>
                    <input
                      type="email"
                      value={composeRecipient}
                      onChange={(e) => setComposeRecipient(e.target.value)}
                      className="w-full text-xs font-mono bg-white border border-slate-250 p-2.5 rounded-lg text-slate-800"
                      required
                      placeholder="e.g. alice@onlyintent.io"
                      id="compose-recipient"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Intent Category Tag</label>
                    <select
                      value={composeCategory}
                      onChange={(e) => setComposeCategory(e.target.value as any)}
                      className="w-full text-xs font-mono bg-white border border-slate-250 p-2.5 rounded-lg text-slate-800"
                      id="compose-category"
                    >
                      <option value="General">General Correspondence</option>
                      <option value="Research">Research Index Data</option>
                      <option value="Security Alert">SecOps Crypt Alerts</option>
                      <option value="Sync Protocol">Sync Channel Sync logs</option>
                      <option value="Proprietary">Proprietary Corporate</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Email Subject Line</label>
                  <input
                    type="text"
                    value={composeSubject}
                    onChange={(e) => setComposeSubject(e.target.value)}
                    className="w-full text-xs font-sans bg-white border border-slate-250 p-2.5 rounded-lg text-slate-800"
                    placeholder="e.g. Audit checklist for Avocado index database"
                    required
                    id="compose-subject"
                  />
                </div>

                {/* Encryption layer Toggle */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Lock className={`w-4 h-4 ${composeEncrypt ? 'text-emerald-600 animate-pulse' : 'text-slate-400'}`} />
                    <div>
                      <span className="block text-xs font-semibold text-slate-700">Apply End-To-End Translation Mask (E2EE)</span>
                      <span className="block text-[10px] text-slate-500 font-mono">Locks letters with active key fingerprint: {activeKeyPair.publicKey.slice(0, 15)}...</span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={composeEncrypt}
                    onChange={(e) => setComposeEncrypt(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded cursor-pointer"
                    id="checkbox-compose-encrypt"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Private Message Body</label>
                  <textarea
                    value={composeBody}
                    onChange={(e) => setComposeBody(e.target.value)}
                    rows={6}
                    placeholder="Type raw correspondence here..."
                    className="w-full text-xs font-mono bg-white border border-slate-250 p-3 rounded-lg text-slate-800 focus:outline-none"
                    required
                    id="compose-body"
                  />
                </div>

                {/* Live Output Character Encryption representation for Visualizing E2EE */}
                {composeEncrypt && composeBody && (
                  <div className="bg-neutral-900 text-slate-300 p-4 rounded-xl space-y-2 border border-neutral-800">
                    <span className="text-[9px] font-mono tracking-wider font-bold text-neutral-400 block uppercase">
                      SECURE CHARACTER DRAFT PREVIEW (SENDING SYMBOL BLOCK AS DATA PARITY)
                    </span>
                    <div className="bg-neutral-950 p-3 rounded text-sm text-center font-mono text-emerald-400 break-all select-none">
                      {draftEncodingPreview.glyphMessage}
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-neutral-900 border border-neutral-950 hover:bg-neutral-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-2"
                    id="btn-send-mail"
                  >
                    <Send className="w-3.5 h-3.5" />
                    {isOffline ? 'Queue Outbox (Offline Mode)' : 'Encrypt & Transmit'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 3: SYNC MULTI DEVICE NETWORKS */}
          {activeTab === 'devices' && (
            <div className="p-6 space-y-6">
              <SyncedDevices
                devices={devices}
                onToggleDeviceStatus={handleToggleDeviceStatus}
                onSyncAll={handleSyncAllDevices}
                isSyncing={isSyncing}
                emails={emails}
                onAddSimulatedDevice={handleAddSimulatedDevice}
              />
            </div>
          )}

          {/* TAB 4: ENCRYPTION SETUP AND KEY RING */}
          {activeTab === 'keys' && (
            <div className="p-6 space-y-6">
              <KeyGenerator
                onKeyPairChange={setActiveKeyPair}
                activeKeyPair={activeKeyPair}
              />
            </div>
          )}

          {/* TAB 5: PUBLIC DATASETS HUB FOR USER INTENT */}
          {activeTab === 'datasets' && (
            <div className="p-6 space-y-6">
              <div className="border-b border-slate-200 pb-3">
                <div className="flex items-center gap-2">
                  <Database className="w-5 h-5 text-amber-500" />
                  <h2 className="text-base font-bold text-slate-900">Public Intent-Based Communication Datasets</h2>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  We look out for possible open core datasets related to intent retrieval, email semantics, and cryptographic testing. Use these indexes to expand intent study capabilities!
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {USER_INTENT_DATASETS.map((ds) => (
                  <div key={ds.id} className="border border-slate-200 rounded-2xl p-5 bg-slate-50/50 hover:shadow-sm transition-all space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-sm text-slate-800">{ds.name}</h4>
                        <span className="text-[10px] font-mono text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded font-bold uppercase">
                          {ds.category}
                        </span>
                      </div>
                      <div className="text-right font-mono text-xs text-slate-500">
                        <span className="block font-bold">{ds.size}</span>
                        <span className="block text-[10px] text-slate-400">{ds.recordsCount}</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed font-sans">
                      {ds.description}
                    </p>

                    <div className="bg-white border border-slate-200 p-3 rounded-xl font-mono text-[11px] space-y-1">
                      <div className="text-slate-500">
                        <span className="font-semibold text-slate-700">LICENSE RULES:</span> {ds.license}
                      </div>
                      <div className="text-slate-500 font-sans mt-1">
                        <span className="font-mono font-semibold text-slate-700">RELEVANCE TO RESEARCH:</span> {ds.relevanceToIntent}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <span className="text-[10px] font-mono text-slate-400">INDEX: {ds.id}</span>
                      <button
                        onClick={() => {
                          setSearchQuery(ds.exploreQuery);
                          setActiveTab('inbox');
                        }}
                        className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                        id={`btn-explore-${ds.id}`}
                      >
                        <Eye className="w-3.5 h-3.5" /> Explore Intent Format
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-indigo-50/60 border border-indigo-100 rounded-xl p-4 flex items-start gap-3">
                <FileCode className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-xs text-indigo-900 uppercase">Intent Research Program Announcement</h4>
                  <p className="text-xs text-indigo-700 leading-normal mt-1 font-sans">
                    These collections constitute the baseline for studying how human intentions (e.g., transactional requests, security handshakes, scheduling confirmations) transform into structured emails. Our cryptographic visual-glyph filters map these semantic patterns to preserve visual user data privacy without exposing plain content.
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Global Footer */}
        <div className="bg-slate-900 text-neutral-400 border-t border-slate-800 p-4 text-center font-mono text-[11px] tracking-wide" id="global-adfree-footer">
          <span>THE ONLY INTENTIONAL SEARCH BROWSER © 2026 — AD-FREE • ZERO TRACKERS • END-TO-END CRYPTOGRAM VAULT</span>
        </div>

      </div>
    </div>
  );
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Wifi, WifiOff, Database, RotateCcw, AlertCircle, FileText } from 'lucide-react';
import { Email } from '../types';

interface OfflineIndicatorProps {
  isOffline: boolean;
  onToggleOffline: () => void;
  cachedCount: number;
  offlineQueue: Email[];
  onFlushQueue: () => void;
}

export default function OfflineIndicator({
  isOffline,
  onToggleOffline,
  cachedCount,
  offlineQueue,
  onFlushQueue
}: OfflineIndicatorProps) {
  return (
    <div className={`border rounded-2xl p-6 shadow-sm transition-all ${
      isOffline
        ? 'bg-amber-50/75 border-amber-200'
        : 'bg-slate-50 border-slate-200'
    }`} id="offline-controller">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* State explanation */}
        <div className="flex items-start gap-3">
          <div className={`p-2.5 rounded-xl ${isOffline ? 'bg-amber-500 text-white animate-pulse' : 'bg-neutral-900 text-white'}`}>
            {isOffline ? <WifiOff className="w-5 h-5" /> : <Wifi className="w-5 h-5" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-slate-800 text-base">Local-First Offline Core</h4>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                isOffline ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
              }`}>
                {isOffline ? 'OFFLINE BUFFER' : 'SYNCED PLENUM'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              All messages are indexed client-side inside standard LocalStorage repositories. Ad-free & zero tracking trackers.
            </p>
          </div>
        </div>

        {/* Action Toggle */}
        <button
          onClick={onToggleOffline}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-xs transition uppercase tracking-wider ${
            isOffline
              ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-sm'
              : 'bg-neutral-800 hover:bg-neutral-900 text-white'
          }`}
          id="btn-toggle-network-state"
        >
          {isOffline ? 'Restore Network Tunnel' : 'Simulate Cable Cut (Go Offline)'}
        </button>
      </div>

      {/* Database details and offline queue indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        {/* Storage Matrix */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-slate-700">
              <Database className="w-4 h-4 text-slate-500" />
              <span className="font-semibold text-xs tracking-wider uppercase">Local Indexed Storage</span>
            </div>
            <span className="text-[10px] font-mono font-bold text-slate-400">INDEX ENGINE v1.2</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-center py-2">
            <div className="bg-slate-50 border border-slate-100 rounded-lg p-2">
              <span className="block text-xl font-extrabold font-mono text-slate-800">{cachedCount}</span>
              <span className="text-[9px] text-slate-400 uppercase font-mono">Secure Cached Mails</span>
            </div>
            <div className="bg-slate-50 border border-slate-100 rounded-lg p-2 font-mono">
              <span className="block text-xl font-extrabold text-slate-800">256-AES</span>
              <span className="text-[9px] text-slate-400 uppercase">Vault Lock alg</span>
            </div>
          </div>

          <p className="text-[10px] text-slate-400 mt-1 text-center font-mono">
            *Data remains encrypted on device memory. Zero plain-text leaks possible.
          </p>
        </div>

        {/* Offline Queued Drafts */}
        <div className="bg-white border border-slate-205 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold text-xs text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-slate-500" />
              Offline Outbox Queue ({offlineQueue.length})
            </span>
            {offlineQueue.length > 0 && !isOffline && (
              <button
                onClick={onFlushQueue}
                className="text-[10px] font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                id="btn-flush-offline"
              >
                <RotateCcw className="w-3 h-3" /> Flush Queue
              </button>
            )}
          </div>

          {offlineQueue.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-4 bg-slate-50 rounded-lg border border-dashed border-slate-150">
              <AlertCircle className="w-4 h-4 text-slate-400 mb-1" />
              <span className="text-[11px] font-mono text-slate-500 text-center">
                Outbox clean. No drafts queued.
              </span>
            </div>
          ) : (
            <div className="max-h-[90px] overflow-y-auto space-y-1.5 pr-1 font-mono text-[11px]">
              {offlineQueue.map((item) => (
                <div key={item.id} className="bg-amber-50/60 border border-amber-100 rounded-lg p-2 flex justify-between items-center">
                  <div className="truncate pr-2">
                    <span className="font-bold text-amber-800 block truncate">{item.subject}</span>
                    <span className="text-[9px] text-slate-500">To: {item.recipient}</span>
                  </div>
                  <span className="text-[9px] font-bold bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded shrink-0">
                    QUEUED
                  </span>
                </div>
              ))}
            </div>
          )}

          {isOffline && offlineQueue.length > 0 && (
            <div className="text-[10px] text-amber-700 italic mt-2 text-center">
              *Drafts will transmit as E2EE payloads immediately when network is recovered.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

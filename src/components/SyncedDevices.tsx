/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Device, Email } from '../types';
import { Laptop, Smartphone, Tablet, Radio, Unlink, CheckCircle2, RefreshCw, Send, Zap } from 'lucide-react';

interface SyncedDevicesProps {
  devices: Device[];
  onToggleDeviceStatus: (id: string) => void;
  onSyncAll: () => void;
  isSyncing: boolean;
  emails: Email[];
  onAddSimulatedDevice: (name: string, type: 'mobile' | 'desktop' | 'tablet') => void;
}

export default function SyncedDevices({
  devices,
  onToggleDeviceStatus,
  onSyncAll,
  isSyncing,
  emails,
  onAddSimulatedDevice
}: SyncedDevicesProps) {
  const [newDeviceName, setNewDeviceName] = useState('');
  const [newDeviceType, setNewDeviceType] = useState<'mobile' | 'desktop' | 'tablet'>('mobile');
  const [showAddForm, setShowAddForm] = useState(false);
  const [syncHistory, setSyncHistory] = useState<Array<{ time: string; details: string; status: string }>>([
    { time: '14:15:02', details: 'Initialized Secure Vault Tunnel with Core Server', status: 'SUCCESS' },
    { time: '14:15:05', details: 'Transferred 3 secure E2EE mail vectors', status: 'SUCCESS' }
  ]);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeviceName.trim()) return;
    onAddSimulatedDevice(newDeviceName.trim(), newDeviceType);
    setNewDeviceName('');
    setShowAddForm(false);
    
    // Add entry to history
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour12: false });
    setSyncHistory(prev => [
      { time: timeStr, details: `Registered node: ${newDeviceName} [${newDeviceType.toUpperCase()}]`, status: 'PROVISIONED' },
      ...prev
    ]);
  };

  const handleSyncClick = () => {
    onSyncAll();
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour12: false });
    const activeNodes = devices.filter(d => d.isOnline).length;
    setTimeout(() => {
      setSyncHistory(prev => [
        {
          time: timeStr,
          details: `Synchronized ${emails.length} mailbox records across ${activeNodes} authorized active cryptographic devices. Checked hashes.`,
          status: 'SUCCESS'
        },
        ...prev
      ]);
    }, 1200);
  };

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'desktop':
        return <Laptop className="w-5 h-5" />;
      case 'tablet':
        return <Tablet className="w-5 h-5 text-indigo-500" />;
      case 'mobile':
      default:
        return <Smartphone className="w-5 h-5 text-emerald-500" />;
    }
  };

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6" id="device-sync-panel">
      {/* Synchronization Control Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-4 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-indigo-600 animate-pulse" />
            <h3 className="font-semibold text-slate-800 text-base">Multi-Device Cloud Synchronization</h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Active secure synchronizer with zero visual ad footprint. Decentralized local-first vaulting.
          </p>
        </div>

        <button
          onClick={handleSyncClick}
          disabled={isSyncing || devices.filter(d => d.isOnline).length === 0}
          className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition shadow-sm ${
            isSyncing
              ? 'bg-neutral-800 text-neutral-400 cursor-not-allowed'
              : 'bg-neutral-900 text-white hover:bg-neutral-800 active:bg-neutral-950'
          }`}
          id="btn-sync-trigger"
        >
          <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
          {isSyncing ? 'Encrypting & Syncing...' : 'Synchronize Sync Nodes'}
        </button>
      </div>

      {/* Grid of Simulated Device Frames to depict synched user interface */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {devices.map((device) => (
          <div
            key={device.id}
            className={`border rounded-xl p-4 transition-all relative overflow-hidden bg-white ${
              device.isOnline
                ? 'border-slate-200 shadow-sm'
                : 'border-slate-200 bg-slate-100 opacity-65'
            }`}
          >
            {/* Visual Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded-lg ${device.isOnline ? 'bg-slate-150 text-slate-700' : 'bg-slate-200 text-slate-400'}`}>
                  {getDeviceIcon(device.type)}
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-slate-800">{device.name}</h4>
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">{device.type} node</span>
                </div>
              </div>

              {/* Status Switch */}
              <button
                onClick={() => onToggleDeviceStatus(device.id)}
                className={`text-[9px] font-mono px-2 py-0.5 rounded cursor-pointer transition ${
                  device.isOnline
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                    : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                }`}
                id={`btn-toggle-dev-${device.id}`}
              >
                {device.isOnline ? '● ONLINE' : '○ OFFLINE'}
              </button>
            </div>

            {/* Sync Properties */}
            <div className="font-mono text-[11px] text-slate-500 space-y-1 my-2">
              <div className="flex justify-between">
                <span>LOCAL STATE CACHE:</span>
                <span className="font-bold text-slate-700">{emails.length} files</span>
              </div>
              <div className="flex justify-between">
                <span>LAST KEY ROTATION:</span>
                <span className="text-slate-600 font-medium">31-May-2026</span>
              </div>
              <div className="flex justify-between">
                <span>PENDING VECTOR SYNC:</span>
                <span className={`font-bold ${device.pendingSyncCount > 0 && device.isOnline ? 'text-amber-500' : 'text-slate-500'}`}>
                  {device.isOnline ? device.pendingSyncCount : '—'}
                </span>
              </div>
            </div>

            {/* Visual Link Status Bar */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between mt-3 text-[10px]">
              <span className="text-slate-400">Sync Status:</span>
              <div className="flex items-center gap-1">
                {device.isOnline ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="text-emerald-700 font-bold">TUNNEL ESTABLISHED</span>
                  </>
                ) : (
                  <>
                    <Unlink className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-slate-400">ISOLATED VAULT</span>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Simulator Management */}
      <div className="border border-slate-150 rounded-xl p-4 bg-white space-y-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-amber-500" />
            <h4 className="font-semibold text-xs text-slate-700 uppercase tracking-wider">Device Lab Network Node Simulator</h4>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
            id="toggle-add-device-form"
          >
            {showAddForm ? 'Cancel Registration' : '+ Register Secondary Vault'}
          </button>
        </div>

        {showAddForm && (
          <form onSubmit={handleCreate} className="flex flex-wrap gap-3 items-end p-3 bg-slate-50 rounded-lg">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Simulated User Workstation Name</label>
              <input
                type="text"
                value={newDeviceName}
                onChange={(e) => setNewDeviceName(e.target.value)}
                placeholder="e.g. iPad Pro Security Vault"
                className="w-full text-xs font-mono bg-white border border-slate-200 p-2 rounded focus:outline-none"
                required
                id="input-sim-device-name"
              />
            </div>
            <div className="w-[120px]">
              <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Device Layout Group</label>
              <select
                value={newDeviceType}
                onChange={(e) => setNewDeviceType(e.target.value as any)}
                className="w-full text-xs font-mono bg-white border border-slate-200 p-2 rounded focus:outline-none"
                id="select-sim-device-type"
              >
                <option value="mobile">Mobile Vault</option>
                <option value="tablet">Secure Tablet</option>
                <option value="desktop">Desktop Terminal</option>
              </select>
            </div>
            <button
              type="submit"
              className="bg-neutral-900 text-white text-xs font-medium px-4 py-2 rounded object-contain hover:bg-neutral-800"
              id="submit-add-device"
            >
              Add Device to Network
            </button>
          </form>
        )}
      </div>

      {/* Sync Log Feed */}
      <div className="bg-neutral-900 rounded-xl p-4 space-y-2">
        <span className="text-[10px] font-mono font-bold text-neutral-400 block tracking-wider uppercase">
          SECURE SECOPS TUNNEL SYNC TELEMETRY LOGGER
        </span>
        <div className="gaps-1 overflow-y-auto max-h-[110px] pr-2 space-y-1.5 font-mono text-xs">
          {isSyncing && (
            <div className="text-emerald-400 font-medium animate-pulse flex items-center gap-2">
              <span className="text-[10px]">●</span>
              <span>[TRANSMITTING] Compiling P2P cryptograms, distributing visual cryptographic glyph bundles...</span>
            </div>
          )}
          {syncHistory.map((log, idx) => (
            <div key={idx} className="flex justify-between items-start gap-4 border-b border-neutral-800 pb-1.5">
              <div className="flex gap-2">
                <span className="text-neutral-500">[{log.time}]</span>
                <span className="text-neutral-300">{log.details}</span>
              </div>
              <span className={`text-[10px] font-bold ${log.status === 'SUCCESS' ? 'text-emerald-400' : 'text-indigo-400'}`}>
                {log.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

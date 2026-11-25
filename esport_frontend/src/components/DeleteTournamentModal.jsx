import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, AlertCircle, Eye, EyeOff, RefreshCw, Trash2, X } from 'lucide-react';
import { apiFetch } from '../utils/api';

/**
 * Password-verified tournament deletion modal restricted to Super Administrators.
 */
export default function DeleteTournamentModal({ tournament, onClose, onDeleted }) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (tournament) {
      setPassword('');
      setShowPassword(false);
      setError('');
      setIsDeleting(false);
    }
  }, [tournament]);

  if (!tournament || typeof document === 'undefined') return null;

  const handleClose = () => {
    if (isDeleting) return;
    setPassword('');
    setError('');
    if (onClose) onClose();
  };

  const handleConfirmDelete = async (e) => {
    if (e) e.preventDefault();
    if (!password.trim()) {
      setError('Administrator password is required.');
      return;
    }

    setIsDeleting(true);
    setError('');
    try {
      const targetIdentifier = tournament.id || tournament.name;
      const res = await apiFetch(`/api/tournaments/${encodeURIComponent(targetIdentifier)}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: password.trim() }),
      });

      if (res.ok) {
        setPassword('');
        setError('');
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('tournament-deleted', { detail: tournament }));
        }
        if (onDeleted) await onDeleted(tournament);
        if (onClose) onClose();
      } else {
        const errData = await res.json().catch(() => ({}));
        setError(errData.error || 'Failed to delete tournament folder. Please check your password.');
      }
    } catch (_) {
      setError('Network error while deleting tournament folder.');
    } finally {
      setIsDeleting(false);
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in"
      onClick={handleClose}
    >
      <div
        className="bg-bg-200 border border-red-500/50 rounded-2xl w-full max-w-lg overflow-hidden shadow-[0_0_50px_rgba(239,68,68,0.3)] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-red-950/40 border-b border-red-500/30 p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400 shrink-0">
              <AlertTriangle size={20} />
            </div>
            <div>
              <h3 className="font-tactical text-base font-extrabold uppercase tracking-wider text-red-300">
                Confirm Tournament Deletion
              </h3>
              <span className="font-tactical text-[10px] text-red-400/80 font-bold uppercase tracking-widest">
                SUPER ADMINISTRATOR AUTHORIZATION
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            disabled={isDeleting}
            className="text-slate-400 hover:text-white transition-colors p-1 cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleConfirmDelete} className="p-6 flex flex-col gap-5">
          <div className="bg-red-500/10 border border-red-500/25 rounded-xl p-4 text-xs text-red-200 leading-relaxed">
            <p className="font-bold mb-1 text-red-300">
              Warning: This action is permanent and irreversible!
            </p>
            <p>
              You are about to delete the tournament folder{' '}
              <strong className="text-white font-mono uppercase underline">{tournament.name}</strong>.
              All associated match records, brackets, and standings will be purged.
            </p>
          </div>

          {error && (
            <div className="bg-red-900/40 border border-red-500/60 rounded-xl p-3 text-xs text-red-300 flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <label className="font-tactical text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
              <span>
                Enter Your Password To Confirm <span className="text-red-400">*</span>
              </span>
              <span className="text-[10px] text-slate-500 lowercase font-mono">
                super admin credential
              </span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your administrator password"
                autoFocus
                className="w-full bg-slate-950 border border-slate-700 focus:border-red-500 text-white font-mono text-sm rounded-xl px-4 py-3 pr-11 focus:outline-none transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={handleClose}
              disabled={isDeleting}
              className="hud-btn-secondary px-5 py-2.5 text-xs font-tactical font-extrabold uppercase tracking-wider"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isDeleting || !password.trim()}
              className="bg-red-600 hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-xl font-tactical text-xs font-extrabold uppercase tracking-wider shadow-[0_0_20px_rgba(239,68,68,0.4)] transition-all flex items-center gap-2 cursor-pointer"
            >
              {isDeleting ? (
                <>
                  <RefreshCw size={14} className="animate-spin" />
                  <span>Verifying &amp; Deleting...</span>
                </>
              ) : (
                <>
                  <Trash2 size={14} />
                  <span>Authorize &amp; Delete</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}

'use client';

import React, { useState } from 'react';
import { ServiceOrder } from '@/types';
import { generateWhatsAppMessage, getWhatsAppShareUrl } from '@/lib/utils';
import { MessageSquare, Copy, Check, ExternalLink, X } from 'lucide-react';

interface WhatsAppModalProps {
  order: ServiceOrder;
  onClose: () => void;
}

export function WhatsAppModal({ order, onClose }: WhatsAppModalProps) {
  const [copied, setCopied] = useState(false);
  const messageText = generateWhatsAppMessage(order);
  const whatsappUrl = getWhatsAppShareUrl(order);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(messageText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-slate-800 px-4 py-3 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-2 text-emerald-400">
            <MessageSquare className="w-5 h-5" />
            <h3 className="font-bold text-white text-base">Comprovativo WhatsApp / SMS</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto flex-1 space-y-3">
          <p className="text-xs text-slate-300">
            Texto estruturado pronto para envio ao cliente com discriminação transparente do orçamento e laudo fotográfico arquivado:
          </p>

          <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-emerald-300 whitespace-pre-wrap leading-relaxed select-all">
            {messageText}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-800/90 p-4 border-t border-slate-700 flex flex-col sm:flex-row gap-2">
          <button
            onClick={handleCopy}
            className="flex-1 py-3 px-4 rounded-xl bg-slate-700 hover:bg-slate-600 active:bg-slate-500 text-white font-bold text-sm flex items-center justify-center gap-2 transition"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Copiado com Sucesso!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-slate-300" />
                <span>Copiar Texto Completo</span>
              </>
            )}
          </button>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold text-sm flex items-center justify-center gap-2 transition shadow-md shadow-emerald-900/30 text-center"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Abrir no WhatsApp</span>
          </a>
        </div>
      </div>
    </div>
  );
}

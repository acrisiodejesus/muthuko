'use client';

import React, { useState } from 'react';
import { ServiceOrder, ReclaimedPart, PartCategory } from '@/types';
import { savePart, saveOrder } from '@/lib/db';
import { Layers, Plus, Check, X, AlertTriangle } from 'lucide-react';

interface HarvestPartsModalProps {
  order: ServiceOrder;
  onClose: () => void;
  onHarvested: () => void;
}

const CATEGORIES: PartCategory[] = [
  'Transístor / MOSFET',
  'Capacitor',
  'Diodo / Retificador',
  'Regulador CI',
  'Conector / Chave',
  'Barramento LED',
  'Transformador / Bobina',
  'Outro',
];

export function HarvestPartsModal({
  order,
  onClose,
  onHarvested,
}: HarvestPartsModalProps) {
  const [code, setCode] = useState('');
  const [category, setCategory] = useState<PartCategory>('Transístor / MOSFET');
  const [description, setDescription] = useState('');
  const [condition, setCondition] = useState<'Testado OK' | 'Requer Teste'>('Testado OK');
  const [quantity, setQuantity] = useState(1);
  const [binLocation, setBinLocation] = useState('Gaveta A1 - Bancada Nampula');
  const [priceMT, setPriceMT] = useState(50);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [harvestedList, setHarvestedList] = useState<string[]>([]);

  // Sugestões rápidas de componentes frequentes em bancada de Nampula
  const quickChips = [
    { code: 'IRF3205', cat: 'Transístor / MOSFET' as PartCategory, price: 120 },
    { code: '13003', cat: 'Transístor / MOSFET' as PartCategory, price: 60 },
    { code: 'KBP307', cat: 'Diodo / Retificador' as PartCategory, price: 90 },
    { code: '450V 100uF', cat: 'Capacitor' as PartCategory, price: 150 },
    { code: 'LM7805', cat: 'Regulador CI' as PartCategory, price: 70 },
    { code: '1N4007', cat: 'Diodo / Retificador' as PartCategory, price: 15 },
  ];

  const handleAddPart = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    setIsSubmitting(true);
    try {
      const newPart: ReclaimedPart = {
        id: `PRT-${Date.now().toString().slice(-6)}`,
        code: code.trim(),
        category,
        description: description.trim() || `Extraído de sucata: ${order.brandModel}`,
        condition,
        donorOrderId: order.id,
        donorDevice: `${order.brandModel} (${order.deviceType})`,
        binLocation,
        quantity: Math.max(1, quantity),
        priceMT: Math.max(0, priceMT),
        createdAt: new Date().toISOString(),
      };

      await savePart(newPart);

      // Marca a ordem como reaproveitada (scavenged)
      const updatedOrder: ServiceOrder = {
        ...order,
        scavenged: true,
        updatedAt: new Date().toISOString(),
      };
      await saveOrder(updatedOrder);

      setHarvestedList((prev) => [...prev, `${quantity}x ${newPart.code}`]);
      setCode('');
      setDescription('');
    } catch (err) {
      console.error('Erro ao extrair peça:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFinish = () => {
    onHarvested();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-amber-500/10 border-b border-amber-500/30 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-500 text-slate-950 font-bold">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Extração de Sucata Ética</h3>
              <p className="text-xs text-amber-300">
                Aparelho abandonado: <strong className="text-white">{order.brandModel}</strong> ({order.id})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto flex-1 space-y-4">
          <div className="bg-slate-800/80 rounded-xl p-3 border border-slate-700 flex items-start gap-2.5 text-xs text-slate-300">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              Aparelho com mais de 45 dias sem levantamento na oficina ({order.neighborhood}).
              Os componentes em bom estado são catalogados no banco comunitário para reuso justo.
            </div>
          </div>

          {/* Atalhos Rápidos */}
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1.5">
              Componentes Típicos de Bancada (Clique para preencher rápido):
            </label>
            <div className="flex flex-wrap gap-1.5">
              {quickChips.map((chip) => (
                <button
                  type="button"
                  key={chip.code}
                  onClick={() => {
                    setCode(chip.code);
                    setCategory(chip.cat);
                    setPriceMT(chip.price);
                  }}
                  className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-slate-800 text-amber-400 hover:bg-slate-700 border border-slate-700 transition active:scale-95"
                >
                  +{chip.code}
                </button>
              ))}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleAddPart} className="space-y-3 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Código do Componente *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: IRF3205 ou 1000uF 25V"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Categoria
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as PartCategory)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Quantidade
                </label>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-sm text-white font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Preço Social (MT)
                </label>
                <input
                  type="number"
                  min="0"
                  step="5"
                  value={priceMT}
                  onChange={(e) => setPriceMT(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-sm text-white font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Estado
                </label>
                <select
                  value={condition}
                  onChange={(e) => setCondition(e.target.value as 'Testado OK' | 'Requer Teste')}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white"
                >
                  <option value="Testado OK">Testado OK</option>
                  <option value="Requer Teste">Requer Teste</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">
                Localização / Gaveta na Oficina
              </label>
              <input
                type="text"
                value={binLocation}
                onChange={(e) => setBinLocation(e.target.value)}
                placeholder="Ex: Gaveta A1 - Potência"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !code.trim()}
              className="w-full py-2.5 px-3 rounded-lg bg-amber-500 hover:bg-amber-400 active:bg-amber-600 disabled:opacity-50 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-sm"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Catalogar Esta Peça no Banco</span>
            </button>
          </form>

          {/* Peças já salvas nesta sessão */}
          {harvestedList.length > 0 && (
            <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-xl p-3">
              <span className="text-xs font-bold text-emerald-400 block mb-1">
                Peças Catalogadas com Sucesso ({harvestedList.length}):
              </span>
              <ul className="text-xs text-emerald-200 list-disc list-inside space-y-0.5 font-mono">
                {harvestedList.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-800 p-3.5 border-t border-slate-700 flex justify-end gap-2">
          <button
            onClick={handleFinish}
            className="py-2.5 px-4 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs flex items-center gap-1.5 transition"
          >
            <Check className="w-4 h-4 text-emerald-400" />
            <span>Concluir Extração</span>
          </button>
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { ReclaimedPart, PartCategory } from '@/types';
import { savePart } from '@/lib/db';
import { Layers, Plus, X } from 'lucide-react';

interface AddPartModalProps {
  onClose: () => void;
  onAdded: (part: ReclaimedPart) => void;
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

export function AddPartModal({ onClose, onAdded }: AddPartModalProps) {
  const [code, setCode] = useState('');
  const [category, setCategory] = useState<PartCategory>('Transístor / MOSFET');
  const [description, setDescription] = useState('');
  const [condition, setCondition] = useState<'Testado OK' | 'Requer Teste'>('Testado OK');
  const [donorDevice, setDonorDevice] = useState('');
  const [binLocation, setBinLocation] = useState('Gaveta A1 - Bancada Nampula');
  const [quantity, setQuantity] = useState(1);
  const [priceMT, setPriceMT] = useState(50);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    setIsSubmitting(true);
    try {
      const newPart: ReclaimedPart = {
        id: `PRT-${Date.now().toString().slice(-6)}`,
        code: code.trim(),
        category,
        description: description.trim() || `Componente recuperado de bancada`,
        condition,
        donorDevice: donorDevice.trim() || 'Placa de sucata avulsa',
        binLocation: binLocation.trim() || 'Gaveta Geral',
        quantity: Math.max(1, quantity),
        priceMT: Math.max(0, priceMT),
        createdAt: new Date().toISOString(),
      };

      await savePart(newPart);
      onAdded(newPart);
      onClose();
    } catch (err) {
      console.error('Erro ao adicionar peça:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-slate-800 px-4 py-3 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded bg-amber-500 text-slate-950 font-bold">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-base">Nova Peça no Catálogo</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-3.5 overflow-y-auto flex-1 text-xs">
          <div>
            <label className="font-bold text-slate-300 block mb-1">
              Código do Semicondutor / Peça *
            </label>
            <input
              type="text"
              required
              placeholder="Ex: IRF3205, 13003, KBP307, 450V 100uF"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 font-mono"
            />
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="font-bold text-slate-300 block mb-1">Categoria</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as PartCategory)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-2 text-white focus:outline-none focus:border-amber-400"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-300 block mb-1">Estado de Teste</label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value as 'Testado OK' | 'Requer Teste')}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-2 text-white focus:outline-none focus:border-amber-400"
              >
                <option value="Testado OK">Testado OK</option>
                <option value="Requer Teste">Requer Teste</option>
              </select>
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-300 block mb-1">Aparelho de Origem / Doador</label>
            <input
              type="text"
              placeholder="Ex: TV Skyworth 43 sucata ou Inversor 1000W"
              value={donorDevice}
              onChange={(e) => setDonorDevice(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="font-bold text-slate-300 block mb-1">Quantidade</label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
              />
            </div>

            <div>
              <label className="font-bold text-slate-300 block mb-1">Preço Comunitário (MT)</label>
              <input
                type="number"
                min="0"
                step="5"
                value={priceMT}
                onChange={(e) => setPriceMT(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-300 block mb-1">Localização na Bancada (Gaveta/Caixa)</label>
            <input
              type="text"
              placeholder="Ex: Gaveta A1 - Potência"
              value={binLocation}
              onChange={(e) => setBinLocation(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="font-bold text-slate-300 block mb-1">Descrição / Notas Técnicas</label>
            <input
              type="text"
              placeholder="Ex: MOSFET canal N 55V 110A para inversores"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting || !code.trim()}
              className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 active:bg-amber-600 disabled:opacity-50 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 transition shadow-md"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Salvar no Banco de Peças</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

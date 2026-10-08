'use client';

import React, { useState, useMemo } from 'react';
import { ReclaimedPart, PartCategory } from '@/types';
import { savePart, deletePart } from '@/lib/db';
import { formatMT } from '@/lib/utils';
import {
  Layers,
  Search,
  Plus,
  Tag,
  CheckCircle,
  HelpCircle,
  Cpu,
  Trash2,
  Minus,
  Sparkles,
  MapPin,
  Box,
} from 'lucide-react';
import { AddPartModal } from '../modals/AddPartModal';

interface PartsBankTabProps {
  parts: ReclaimedPart[];
  onPartsChange: () => void;
}

const CATEGORIES: string[] = [
  'Todos',
  'Transístor / MOSFET',
  'Capacitor',
  'Diodo / Retificador',
  'Regulador CI',
  'Barramento LED',
  'Conector / Chave',
  'Transformador / Bobina',
  'Outro',
];

export function PartsBankTab({ parts, onPartsChange }: PartsBankTabProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [showAddModal, setShowAddModal] = useState(false);

  const filteredParts = useMemo(() => {
    return parts.filter((part) => {
      const matchesSearch =
        part.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        part.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        part.donorDevice.toLowerCase().includes(searchQuery.toLowerCase()) ||
        part.binLocation.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCat =
        selectedCategory === 'Todos' || part.category === selectedCategory;

      return matchesSearch && matchesCat;
    });
  }, [parts, searchQuery, selectedCategory]);

  const totalItemsCount = useMemo(() => {
    return parts.reduce((acc, p) => acc + (p.quantity || 1), 0);
  }, [parts]);

  const totalValueMT = useMemo(() => {
    return parts.reduce((acc, p) => acc + p.priceMT * (p.quantity || 1), 0);
  }, [parts]);

  const handleUseOne = async (part: ReclaimedPart) => {
    if (part.quantity <= 1) {
      if (confirm(`A peça ${part.code} é a última em estoque. Marcar como utilizada e remover do banco?`)) {
        await deletePart(part.id);
        onPartsChange();
      }
    } else {
      const updated = {
        ...part,
        quantity: part.quantity - 1,
      };
      await savePart(updated);
      onPartsChange();
    }
  };

  const handleAddQuantity = async (part: ReclaimedPart) => {
    const updated = {
      ...part,
      quantity: (part.quantity || 1) + 1,
    };
    await savePart(updated);
    onPartsChange();
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Top Banner Sucata Ética */}
      <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-3 shadow-md">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500 text-slate-950 flex items-center justify-center font-bold shrink-0">
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-sm font-black text-white flex items-center gap-2">
                <span>BANCO DE PEÇAS & SUCATA ÉTICA</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/40">
                  Economia Circular
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Componentes testados de placas abandonadas das oficinas de Nampula.
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 font-black text-xs flex items-center gap-1.5 transition shadow-sm ml-auto"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Registar Peça</span>
          </button>
        </div>

        {/* Resumo Rápido */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800 text-center">
          <div className="bg-slate-950 p-2 rounded-xl border border-slate-800/80">
            <span className="text-[10px] text-slate-400 block">Catalogadas</span>
            <strong className="text-sm font-black text-amber-400">{parts.length} tipos</strong>
          </div>
          <div className="bg-slate-950 p-2 rounded-xl border border-slate-800/80">
            <span className="text-[10px] text-slate-400 block">Unidades em Stock</span>
            <strong className="text-sm font-black text-cyan-400">{totalItemsCount} pcs</strong>
          </div>
          <div className="bg-slate-950 p-2 rounded-xl border border-slate-800/80">
            <span className="text-[10px] text-slate-400 block">Valor Economizado</span>
            <strong className="text-sm font-black text-emerald-400 font-mono">{formatMT(totalValueMT)}</strong>
          </div>
        </div>

        {/* Busca e Filtros */}
        <div className="space-y-2 pt-1">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Buscar por código (IRF3205, 13003, KBP307), modelo ou gaveta..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2 text-slate-400 hover:text-white text-xs"
              >
                Limpar
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2.5 py-1.5 rounded-lg whitespace-nowrap font-medium transition shrink-0 ${
                    isSelected
                      ? 'bg-cyan-500 text-slate-950 font-black'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700/60'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Lista de Peças */}
      {filteredParts.length === 0 ? (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-8 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
            <Layers className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-white text-sm">Nenhum componente encontrado</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Não encontramos peças com os termos da pesquisa. Tente buscar pelo código do semicondutor (Ex: 13003, IRF3205).
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filteredParts.map((part) => (
            <div
              key={part.id}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-3.5 transition shadow-sm space-y-2.5 flex flex-col justify-between"
            >
              <div>
                {/* Cabeçalho da Peça: Código Mono & Badge de Teste */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-mono text-base font-black text-amber-400 tracking-wider">
                      {part.code}
                    </h3>
                    <span className="text-[11px] text-cyan-300 font-medium">
                      {part.category}
                    </span>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold border flex items-center gap-1 ${
                      part.condition === 'Testado OK'
                        ? 'bg-emerald-950 text-emerald-300 border-emerald-500/40'
                        : 'bg-amber-950 text-amber-300 border-amber-500/40'
                    }`}
                  >
                    {part.condition === 'Testado OK' ? (
                      <CheckCircle className="w-3 h-3" />
                    ) : (
                      <HelpCircle className="w-3 h-3" />
                    )}
                    <span>{part.condition}</span>
                  </span>
                </div>

                {/* Descrição */}
                <p className="text-xs text-slate-300 mt-1 line-clamp-2">
                  {part.description}
                </p>

                {/* Origem e Localização na Bancada */}
                <div className="space-y-1 mt-2 pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
                  <div className="flex items-center gap-1.5 truncate">
                    <Tag className="w-3 h-3 text-amber-500 shrink-0" />
                    <span className="truncate">Origem: {part.donorDevice}</span>
                  </div>
                  <div className="flex items-center gap-1.5 truncate">
                    <Box className="w-3 h-3 text-cyan-400 shrink-0" />
                    <span className="truncate text-slate-300">{part.binLocation}</span>
                  </div>
                </div>
              </div>

              {/* Rodapé: Quantidade, Preço Social & Ações */}
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between text-xs pt-1 mt-2">
                <div>
                  <span className="text-[10px] text-slate-400 block">Preço Social</span>
                  <strong className="text-amber-400 font-mono font-black text-xs">
                    {formatMT(part.priceMT)}
                  </strong>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1">
                    <span className="text-[11px] text-slate-400">Qtd:</span>
                    <strong className="text-white font-mono font-bold">{part.quantity}</strong>
                  </div>

                  <button
                    onClick={() => handleUseOne(part)}
                    className="p-1.5 rounded-lg bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-500/30 transition text-xs font-bold"
                    title="Usar 1 peça em reparação"
                  >
                    Usar
                  </button>

                  <button
                    onClick={() => handleAddQuantity(part)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
                    title="Adicionar mais 1 ao estoque"
                  >
                    +1
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showAddModal && (
        <AddPartModal
          onClose={() => setShowAddModal(false)}
          onAdded={() => {
            onPartsChange();
          }}
        />
      )}
    </div>
  );
}

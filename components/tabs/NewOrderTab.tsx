'use client';

import React, { useState, useRef } from 'react';
import { DeviceType, Neighborhood, ServiceOrder } from '@/types';
import { saveOrder } from '@/lib/db';
import { formatMT } from '@/lib/utils';
import {
  compressImage,
  generateDiagnosticBoardPlaceholder,
  generateDiagnosticChassisPlaceholder,
} from '@/lib/image-compressor';
import {
  Camera,
  Coins,
  CheckCircle2,
  Upload,
  Sparkles,
  MessageSquare,
  AlertCircle,
  FileCheck,
} from 'lucide-react';
import { WhatsAppModal } from '../modals/WhatsAppModal';

interface NewOrderTabProps {
  onOrderCreated: (order: ServiceOrder) => void;
  nextOrderNumber: number;
}

const DEVICE_TYPES: DeviceType[] = [
  'TV',
  'Rádio',
  'Painel/Inversor Solar',
  'Amplificador',
  'Ferro',
  'Outro',
];

const NEIGHBORHOODS: Neighborhood[] = ['Muhala', 'Namutequeliua', 'Outro'];

const TECHNICIANS = [
  'Mestre Momade (Muhala)',
  'Técnico Celestino (Namutequeliua)',
  'Técnico Américo (Muhala)',
  'Mestre Rassul (Namutequeliua)',
];

export function NewOrderTab({ onOrderCreated, nextOrderNumber }: NewOrderTabProps) {
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [neighborhood, setNeighborhood] = useState<Neighborhood>('Muhala');
  const [technicianName, setTechnicianName] = useState(TECHNICIANS[0]);
  const [deviceType, setDeviceType] = useState<DeviceType>('TV');
  const [brandModel, setBrandModel] = useState('');
  const [reportedDefect, setReportedDefect] = useState('');
  const [initialObservation, setInitialObservation] = useState('');

  // Orçamento
  const [partsCost, setPartsCost] = useState<number>(0);
  const [laborCost, setLaborCost] = useState<number>(350);

  // Fotos comprimidas (base64)
  const [chassisPhoto, setChassisPhoto] = useState<string>('');
  const [boardPhoto, setBoardPhoto] = useState<string>('');
  const [isCompressingChassis, setIsCompressingChassis] = useState(false);
  const [isCompressingBoard, setIsCompressingBoard] = useState(false);

  const [createdOrder, setCreatedOrder] = useState<ServiceOrder | null>(null);
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const chassisFileInputRef = useRef<HTMLInputElement>(null);
  const boardFileInputRef = useRef<HTMLInputElement>(null);

  const totalCost = Number(partsCost || 0) + Number(laborCost || 0);

  // Manipulador de upload com compressão via Canvas (máx 800x600)
  const handleChassisUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsCompressingChassis(true);
    try {
      const compressed = await compressImage(file, 800, 600, 0.72);
      setChassisPhoto(compressed);
    } catch (err) {
      console.error('Falha na compressão da foto da carcaça:', err);
    } finally {
      setIsCompressingChassis(false);
    }
  };

  const handleBoardUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsCompressingBoard(true);
    try {
      const compressed = await compressImage(file, 800, 600, 0.72);
      setBoardPhoto(compressed);
    } catch (err) {
      console.error('Falha na compressão da foto da placa:', err);
    } finally {
      setIsCompressingBoard(false);
    }
  };

  // Simulação rápida para bancada sem webcam
  const handleSimulateChassis = () => {
    const simulated = generateDiagnosticChassisPlaceholder(
      deviceType,
      brandModel || 'Modelo Não Especificado',
      clientName || 'Cliente Bancada'
    );
    setChassisPhoto(simulated);
  };

  const handleSimulateBoard = () => {
    const simulated = generateDiagnosticBoardPlaceholder(
      deviceType,
      brandModel || 'Circuito Interno',
      initialObservation || 'Peças mexidas / solda fria anterior identificadas'
    );
    setBoardPhoto(simulated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim() || !brandModel.trim() || !reportedDefect.trim()) {
      alert('Por favor preencha o nome do cliente, modelo do aparelho e o defeito reportado.');
      return;
    }

    setIsSaving(true);
    try {
      const orderId = `MTK-2026-${String(nextOrderNumber).padStart(3, '0')}`;

      // Garante fotos se não tiver inserido
      const finalChassis =
        chassisPhoto ||
        generateDiagnosticChassisPlaceholder(deviceType, brandModel, clientName);
      const finalBoard =
        boardPhoto ||
        generateDiagnosticBoardPlaceholder(
          deviceType,
          brandModel,
          initialObservation || 'Inspecionado na bancada'
        );

      const newOrder: ServiceOrder = {
        id: orderId,
        clientName: clientName.trim(),
        clientPhone: clientPhone.trim() || '+258840000000',
        neighborhood,
        technicianName,
        deviceType,
        brandModel: brandModel.trim(),
        reportedDefect: reportedDefect.trim(),
        initialObservation:
          initialObservation.trim() || 'Placa inspecionada visualmente na recepção.',
        chassisPhotoUrl: finalChassis,
        boardPhotoUrl: finalBoard,
        status: 'Aguardando Avaliação',
        partsCost: Number(partsCost || 0),
        laborCost: Number(laborCost || 0),
        totalCost,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        daysInShop: 0,
      };

      await saveOrder(newOrder);
      setCreatedOrder(newOrder);
      onOrderCreated(newOrder);
    } catch (err) {
      console.error('Erro ao salvar nova ordem:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetForm = () => {
    setClientName('');
    setClientPhone('');
    setBrandModel('');
    setReportedDefect('');
    setInitialObservation('');
    setPartsCost(0);
    setLaborCost(350);
    setChassisPhoto('');
    setBoardPhoto('');
    setCreatedOrder(null);
  };

  return (
    <div className="space-y-4 pb-24">
      {/* Mensagem de sucesso quando salva */}
      {createdOrder ? (
        <div className="bg-emerald-950/80 border border-emerald-500/50 rounded-2xl p-5 space-y-4 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center shrink-0 font-black">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div>
              <span className="text-xs font-mono font-black text-amber-400 bg-slate-950 px-2 py-0.5 rounded border border-amber-500/30">
                {createdOrder.id}
              </span>
              <h2 className="text-lg font-black text-white mt-1">
                Ordem Registada com Sucesso!
              </h2>
              <p className="text-xs text-emerald-200">
                Fotos de placa e carcaça gravadas em IndexedDB com compressão segura (800x600).
              </p>
            </div>
          </div>

          <div className="bg-slate-900/90 p-3.5 rounded-xl border border-slate-800 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Cliente:</span>
              <strong className="text-white">{createdOrder.clientName}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Aparelho:</span>
              <strong className="text-white">{createdOrder.brandModel}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Orçamento Transparente:</span>
              <strong className="text-amber-400 font-mono font-bold">
                {formatMT(createdOrder.totalCost)} (Peças: {formatMT(createdOrder.partsCost)} + MO: {formatMT(createdOrder.laborCost)})
              </strong>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 pt-1">
            <button
              onClick={() => setShowWhatsAppModal(true)}
              className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition shadow-md shadow-emerald-950"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Gerar Comprovativo WhatsApp / SMS</span>
            </button>

            <button
              onClick={handleResetForm}
              className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-2 transition border border-slate-700"
            >
              <FileCheck className="w-4 h-4 text-amber-400" />
              <span>Registar Outro Aparelho</span>
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Card 1: Identificação do Cliente */}
          <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-3.5 shadow-md">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h2 className="text-sm font-black text-amber-400 flex items-center gap-2">
                <span>1. PROTOCOLO DE ENTRADA & CLIENTE</span>
              </h2>
              <span className="text-xs font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                MTK-2026-{String(nextOrderNumber).padStart(3, '0')}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Nome do Cliente *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Alberto Macuácua"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Contacto (Celular / WhatsApp) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: 84 123 4567 ou +258 86..."
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Bairro da Oficina
                </label>
                <select
                  value={neighborhood}
                  onChange={(e) => setNeighborhood(e.target.value as Neighborhood)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                >
                  {NEIGHBORHOODS.map((b) => (
                    <option key={b} value={b}>
                      Bairro {b}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Técnico Responsável
                </label>
                <select
                  value={technicianName}
                  onChange={(e) => setTechnicianName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                >
                  {TECHNICIANS.map((tech) => (
                    <option key={tech} value={tech}>
                      {tech}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Card 2: Aparelho & Defeito */}
          <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-3.5 shadow-md">
            <h2 className="text-sm font-black text-amber-400 border-b border-slate-800 pb-2">
              2. EQUIPAMENTO & DEFEITO
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Tipo de Aparelho
                </label>
                <select
                  value={deviceType}
                  onChange={(e) => setDeviceType(e.target.value as DeviceType)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                >
                  {DEVICE_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Marca / Modelo Exato *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Skyworth 32E2000 LED ou Inversor 1000W"
                  value={brandModel}
                  onChange={(e) => setBrandModel(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">
                Defeito Relatado pelo Cliente *
              </label>
              <textarea
                required
                rows={2}
                placeholder="Ex: Tem som mas a tela está escura; cheiro a queimado..."
                value={reportedDefect}
                onChange={(e) => setReportedDefect(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">
                Estado da Placa / Peças Ausentes (Proteção contra extravio)
              </label>
              <input
                type="text"
                placeholder="Ex: Transistor Q201 com marcas de ferro de solda anterior; sem 2 parafusos."
                value={initialObservation}
                onChange={(e) => setInitialObservation(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Registar se a placa já veio mexida de outra oficina protege o técnico de reclamações falsas.
              </span>
            </div>
          </div>

          {/* Card 3: Protocolo Visual (2 Fotos com Compressão Canvas 800x600) */}
          <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-3.5 shadow-md">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h2 className="text-sm font-black text-amber-400 flex items-center gap-2">
                <Camera className="w-4 h-4" />
                <span>3. PROTOCOLO VISUAL (2 FOTOS OBRIGATÓRIAS)</span>
              </h2>
              <span className="text-[11px] text-slate-400">
                Compressão automática Canvas &lt; 800x600px
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Foto 1: Carcaça / Etiqueta */}
              <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 space-y-2">
                <span className="text-xs font-bold text-slate-200 block">
                  Foto 1: Carcaça / Etiqueta / Selo
                </span>

                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  ref={chassisFileInputRef}
                  onChange={handleChassisUpload}
                  className="hidden"
                />

                <div className="aspect-[4/3] rounded-lg border border-dashed border-slate-700 bg-slate-900 overflow-hidden flex items-center justify-center relative">
                  {chassisPhoto ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={chassisPhoto}
                      alt="Carcaça"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center p-3 text-slate-500 space-y-1">
                      <Camera className="w-6 h-6 mx-auto opacity-40" />
                      <span className="text-[11px] block">Nenhuma foto tirada</span>
                    </div>
                  )}

                  {isCompressingChassis && (
                    <div className="absolute inset-0 bg-black/70 flex items-center justify-center text-xs text-amber-300 font-bold">
                      Comprimindo via Canvas...
                    </div>
                  )}
                </div>

                <div className="flex gap-1.5 pt-1">
                  <button
                    type="button"
                    onClick={() => chassisFileInputRef.current?.click()}
                    className="flex-1 py-1.5 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-1 border border-slate-700 transition"
                  >
                    <Upload className="w-3.5 h-3.5 text-amber-400" />
                    <span>Tirar Foto</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleSimulateChassis}
                    className="py-1.5 px-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs border border-slate-700 flex items-center gap-1 transition"
                    title="Simular selo/etiqueta técnica"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Simular</span>
                  </button>
                </div>
              </div>

              {/* Foto 2: Foto Macro da Placa */}
              <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 space-y-2">
                <span className="text-xs font-bold text-slate-200 block">
                  Foto 2: Macro da Placa (Componentes mexidos)
                </span>

                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  ref={boardFileInputRef}
                  onChange={handleBoardUpload}
                  className="hidden"
                />

                <div className="aspect-[4/3] rounded-lg border border-dashed border-slate-700 bg-slate-900 overflow-hidden flex items-center justify-center relative">
                  {boardPhoto ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={boardPhoto}
                      alt="Placa Macro"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center p-3 text-slate-500 space-y-1">
                      <Camera className="w-6 h-6 mx-auto opacity-40" />
                      <span className="text-[11px] block">Nenhuma foto tirada</span>
                    </div>
                  )}

                  {isCompressingBoard && (
                    <div className="absolute inset-0 bg-black/70 flex items-center justify-center text-xs text-amber-300 font-bold">
                      Comprimindo via Canvas...
                    </div>
                  )}
                </div>

                <div className="flex gap-1.5 pt-1">
                  <button
                    type="button"
                    onClick={() => boardFileInputRef.current?.click()}
                    className="flex-1 py-1.5 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-1 border border-slate-700 transition"
                  >
                    <Upload className="w-3.5 h-3.5 text-amber-400" />
                    <span>Tirar Macro</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleSimulateBoard}
                    className="py-1.5 px-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs border border-slate-700 flex items-center gap-1 transition"
                    title="Simular circuito interno com anotações de bancada"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Simular</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Card 4: Discriminação Transparente do Orçamento */}
          <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-3.5 shadow-md">
            <h2 className="text-sm font-black text-amber-400 flex items-center gap-2 border-b border-slate-800 pb-2">
              <Coins className="w-4 h-4" />
              <span>4. DISCRIMINAÇÃO TRANSPARENTE DE ORÇAMENTO (MT)</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Custo Estimado da Peça (MT)
                </label>
                <input
                  type="number"
                  min="0"
                  step="10"
                  value={partsCost}
                  onChange={(e) => setPartsCost(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400 font-mono"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Valor repassado das peças novas ou do banco de sucata ética.
                </span>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Mão de Obra do Técnico (MT)
                </label>
                <input
                  type="number"
                  min="0"
                  step="10"
                  value={laborCost}
                  onChange={(e) => setLaborCost(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400 font-mono"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Trabalho de diagnóstico, desoxidação e soldagem de precisão.
                </span>
              </div>
            </div>

            {/* Somatório em destaque */}
            <div className="bg-slate-950 p-3.5 rounded-xl border border-amber-500/30 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-300 block">
                  TOTAL TRANSPARENTE PARA O CLIENTE:
                </span>
                <span className="text-[11px] text-slate-400">
                  {formatMT(partsCost)} (Peça) + {formatMT(laborCost)} (Mão de Obra)
                </span>
              </div>
              <span className="text-xl font-black text-amber-400 font-mono">
                {formatMT(totalCost)}
              </span>
            </div>
          </div>

          {/* Submissão */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSaving}
              className="w-full py-3.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 active:bg-amber-600 disabled:opacity-50 text-slate-950 font-black text-sm flex items-center justify-center gap-2 transition shadow-lg shadow-amber-500/20"
            >
              <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
              <span>Registar Ordem na Bancada (Persistência Offline)</span>
            </button>
          </div>
        </form>
      )}

      {showWhatsAppModal && createdOrder && (
        <WhatsAppModal
          order={createdOrder}
          onClose={() => setShowWhatsAppModal(false)}
        />
      )}
    </div>
  );
}

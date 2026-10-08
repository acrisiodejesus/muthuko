import { OrderStatus, ServiceOrder } from '@/types';

/**
 * Formata valor numérico para Meticais (MT)
 */
export function formatMT(value: number): string {
  return `${new Intl.NumberFormat('pt-MZ').format(value)} MT`;
}

/**
 * Normaliza número de telefone moçambicano para o padrão WhatsApp internacional
 */
export function normalizeMozPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('258')) {
    return digits;
  }
  if (digits.length === 9 && (digits.startsWith('84') || digits.startsWith('85') || digits.startsWith('86') || digits.startsWith('87') || digits.startsWith('82') || digits.startsWith('83'))) {
    return `258${digits}`;
  }
  return digits;
}

/**
 * Retorna classes CSS de cores para os status operacionais
 */
export function getStatusBadgeStyle(status: OrderStatus): { bg: string; text: string; border: string } {
  switch (status) {
    case 'Aguardando Avaliação':
      return { bg: 'bg-amber-100 dark:bg-amber-950/70', text: 'text-amber-800 dark:text-amber-300', border: 'border-amber-400' };
    case 'Em Reparação':
      return { bg: 'bg-blue-100 dark:bg-blue-950/70', text: 'text-blue-800 dark:text-blue-300', border: 'border-blue-400' };
    case 'Pronto para Levantamento':
      return { bg: 'bg-emerald-100 dark:bg-emerald-950/70', text: 'text-emerald-800 dark:text-emerald-300', border: 'border-emerald-400' };
    case 'Entregue':
      return { bg: 'bg-slate-200 dark:bg-slate-800', text: 'text-slate-700 dark:text-slate-300', border: 'border-slate-400' };
    case 'Abandonado (>45 dias)':
      return { bg: 'bg-rose-100 dark:bg-rose-950/70', text: 'text-rose-800 dark:text-rose-300', border: 'border-rose-400' };
    default:
      return { bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-800 dark:text-slate-200', border: 'border-slate-300' };
  }
}

/**
 * Gera mensagem formatada para envio via WhatsApp ou SMS com orçamento transparente
 */
export function generateWhatsAppMessage(order: ServiceOrder): string {
  const dateFormatted = new Date(order.createdAt).toLocaleDateString('pt-MZ');
  
  return `*MUTHUKO — PROTOCOLO DE ENTRADA & ORÇAMENTO TRANSPARENTE*
📍 *Oficina Nampula (${order.neighborhood})*
👤 *Técnico Responsável:* ${order.technicianName}
🔖 *Protocolo:* ${order.id} | *Data:* ${dateFormatted}
----------------------------------------
👤 *Cliente:* ${order.clientName}
📱 *Contacto:* ${order.clientPhone}
📺 *Aparelho:* ${order.deviceType} — ${order.brandModel}
🔍 *Defeito Informado:* ${order.reportedDefect}
📷 *Registo Visual da Placa:* ${order.initialObservation || 'Inspecionado na bancada (fotos arquivadas)'}
----------------------------------------
💰 *DISCRIMINAÇÃO DO ORÇAMENTO:*
• Custo da(s) Peça(s): *${formatMT(order.partsCost)}*
• Mão de Obra Técnica: *${formatMT(order.laborCost)}*
👉 *VALOR TOTAL:* *${formatMT(order.totalCost)}*
----------------------------------------
📌 *Estado Atual:* ${order.status}
ℹ️ _Nota Comunitária Muthuko: Aparelhos não levantados após 45 dias da conclusão poderão ter componentes reaproveitados de forma ética para cobertura de custos operacionais._

Agradecemos a sua confiança na nossa bancada!`;
}

/**
 * Gera URL pronta para o WhatsApp (wa.me)
 */
export function getWhatsAppShareUrl(order: ServiceOrder): string {
  const phone = normalizeMozPhone(order.clientPhone);
  const text = encodeURIComponent(generateWhatsAppMessage(order));
  return `https://wa.me/${phone}?text=${text}`;
}

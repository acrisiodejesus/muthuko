/**
 * Utilitário de Compressão de Imagens no Cliente via Canvas API
 * Otimizado para telas de smartphones e bancadas técnicas em Moçambique.
 * Redimensiona fotos para até 800x600px mantendo aspect ratio e comprime para JPEG ~70-150KB.
 */

export async function compressImage(
  fileOrBlob: File | Blob,
  maxWidth = 800,
  maxHeight = 600,
  quality = 0.72
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Erro ao ler arquivo da imagem'));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Falha ao processar dados da imagem'));
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Manter proporção limitando a maxWidth e maxHeight
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return reject(new Error('Contexto 2D do Canvas indisponível'));
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // Desenhar imagem redimensionada
        ctx.drawImage(img, 0, 0, width, height);

        // Adicionar carimbo d'água discreto de segurança "Muthuko Nampula"
        ctx.fillStyle = 'rgba(15, 23, 42, 0.65)';
        ctx.fillRect(8, height - 26, 210, 20);
        ctx.fillStyle = '#f59e0b';
        ctx.font = 'bold 11px system-ui, sans-serif';
        ctx.fillText(`MUTHUKO | ${new Date().toLocaleDateString('pt-MZ')}`, 14, height - 12);

        // Exportar como JPEG comprimido
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };

      img.src = e.target?.result as string;
    };

    reader.readAsDataURL(fileOrBlob);
  });
}

/**
 * Gera um placeholder visual realista de placa de circuito interno com indicação de componentes mexidos,
 * ideal para simulação rápida sem câmera ou demonstração de bancada.
 */
export function generateDiagnosticBoardPlaceholder(
  deviceType: string,
  model: string,
  notes: string = 'Vestígios de solda prévia / capacitor estufado'
): string {
  if (typeof document === 'undefined') return '';

  const canvas = document.createElement('canvas');
  canvas.width = 800;
  canvas.height = 600;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Placa de fenolite/fibra verde escura
  ctx.fillStyle = '#064e3b';
  ctx.fillRect(0, 0, 800, 600);

  // Grade de trilhas de cobre
  ctx.strokeStyle = '#047857';
  ctx.lineWidth = 3;
  for (let x = 40; x < 800; x += 60) {
    ctx.beginPath();
    ctx.moveTo(x, 40);
    ctx.lineTo(x + 30, 280);
    ctx.lineTo(x - 20, 560);
    ctx.stroke();
  }

  // Furos de fixação nos cantos
  ctx.fillStyle = '#fbbf24';
  [
    [30, 30],
    [770, 30],
    [30, 570],
    [770, 570]
  ].forEach(([cx, cy]) => {
    ctx.beginPath();
    ctx.arc(cx, cy, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(cx, cy, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fbbf24';
  });

  // Transformador / Dissipador
  ctx.fillStyle = '#334155';
  ctx.fillRect(100, 100, 220, 160);
  ctx.fillStyle = '#94a3b8';
  ctx.fillRect(115, 115, 190, 20);
  ctx.fillRect(115, 150, 190, 20);
  ctx.fillRect(115, 185, 190, 20);

  // Capacitores de fonte primária
  ctx.fillStyle = '#1e293b';
  ctx.beginPath();
  ctx.arc(380, 160, 40, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 4;
  ctx.stroke();
  ctx.fillStyle = '#cbd5e1';
  ctx.font = 'bold 12px monospace';
  ctx.fillText('450V 120uF', 345, 165);

  // Semicondutor / MOSFET de potência
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(480, 120, 80, 100);
  ctx.fillStyle = '#e2e8f0';
  ctx.font = 'bold 11px monospace';
  ctx.fillText('IRF3205', 495, 165);

  // Circuito Integrado microcontrolador SMD
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(250, 340, 260, 140);
  ctx.fillStyle = '#fbbf24';
  ctx.font = 'bold 14px monospace';
  ctx.fillText(`MUTHUKO-PCB / ${deviceType.toUpperCase()}`, 270, 400);
  ctx.font = '12px monospace';
  ctx.fillText(`REF: ${model.slice(0, 24)}`, 270, 425);

  // Marcação em destaque de "COMPONENTE MEXIDO / AUSENTE" (Protocolo de transparência)
  ctx.strokeStyle = '#ef4444';
  ctx.lineWidth = 5;
  ctx.setLineDash([8, 6]);
  ctx.strokeRect(450, 90, 140, 160);
  ctx.setLineDash([]);

  // Tag de alerta
  ctx.fillStyle = '#ef4444';
  ctx.fillRect(450, 65, 190, 26);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 12px system-ui, sans-serif';
  ctx.fillText('⚠ SINAL DE SOLDA / FALTANDO', 455, 82);

  // Rodapé do laudo
  ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
  ctx.fillRect(0, 540, 800, 60);
  ctx.fillStyle = '#f59e0b';
  ctx.font = 'bold 14px system-ui, sans-serif';
  ctx.fillText('REGISTO VISUAL DE ENTRADA — OFICINAS NAMPULA', 20, 565);
  ctx.fillStyle = '#e2e8f0';
  ctx.font = '12px system-ui, sans-serif';
  ctx.fillText(`Inspeção: ${notes}`, 20, 585);

  return canvas.toDataURL('image/jpeg', 0.75);
}

/**
 * Gera um placeholder visual da etiqueta/carcaça externa do aparelho
 */
export function generateDiagnosticChassisPlaceholder(
  deviceType: string,
  model: string,
  client: string
): string {
  if (typeof document === 'undefined') return '';

  const canvas = document.createElement('canvas');
  canvas.width = 800;
  canvas.height = 600;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Fundo metálico / plástico escovado
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(0, 0, 800, 600);

  // Grade da carcaça
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 1;
  for (let y = 30; y < 600; y += 25) {
    ctx.beginPath();
    ctx.moveTo(30, y);
    ctx.lineTo(770, y);
    ctx.stroke();
  }

  // Etiqueta branca de modelo / selo de fábrica
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(150, 160, 500, 280);
  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 2;
  ctx.strokeRect(150, 160, 500, 280);

  // Conteúdo da etiqueta
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 22px system-ui, sans-serif';
  ctx.fillText(`ETIQUETA DO APARELHO: ${deviceType.toUpperCase()}`, 180, 210);

  ctx.font = 'bold 16px monospace';
  ctx.fillText(`MODELO / S/N: ${model}`, 180, 250);

  ctx.font = '14px system-ui, sans-serif';
  ctx.fillStyle = '#475569';
  ctx.fillText(`Proprietário(a): ${client}`, 180, 290);
  ctx.fillText(`Tensão de Trabalho: 220V~ 50Hz / 12V-24V DC`, 180, 320);

  // Código de barras simulado
  ctx.fillStyle = '#0f172a';
  let barX = 180;
  for (let i = 0; i < 40; i++) {
    const barW = (i % 3 === 0) ? 6 : (i % 2 === 0 ? 3 : 2);
    ctx.fillRect(barX, 350, barW, 45);
    barX += barW + 3;
  }

  // Carimbo de recepção Muthuko
  ctx.strokeStyle = '#059669';
  ctx.lineWidth = 4;
  ctx.strokeRect(460, 270, 160, 60);
  ctx.fillStyle = '#059669';
  ctx.font = 'bold 14px system-ui, sans-serif';
  ctx.fillText('RECEPCIONADO', 475, 296);
  ctx.font = '11px monospace';
  ctx.fillText('NAMPULA - BANCADA', 470, 316);

  return canvas.toDataURL('image/jpeg', 0.75);
}

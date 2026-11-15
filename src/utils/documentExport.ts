import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

export function triggerUint8Download(
  filename: string,
  bytes: Uint8Array | string,
  mimeType: string
) {
  const blobPart: BlobPart =
    typeof bytes === 'string'
      ? bytes
      : new Uint8Array(bytes).buffer;
  const blob = new Blob([blobPart], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1400);
}

/**
 * Renders an editorial A4 document page (supporting both Ge'ez/Amharic and Latin scripts cleanly)
 * onto an offscreen canvas at crisp A4 resolution and returns PNG dataUrl + raw Uint8Array bytes.
 */
export async function renderDocumentToCanvasPng(params: {
  title: string;
  subtitle?: string;
  metaLine?: string;
  sections: { heading: string; content: string }[];
  signatureFooter?: string;
  photoDataUrl?: string;
}): Promise<{ dataUrl: string; bytes: Uint8Array }> {
  const width = 1240;
  const height = 1754;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas 2D context unavailable');
  }

  // Crisp paper background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);

  // Subtle emerald accent bar at top
  ctx.fillStyle = '#065f46';
  ctx.fillRect(0, 0, width, 16);

  const marginX = 84;
  let y = 92;
  const maxTextWidth = params.photoDataUrl ? width - marginX * 2 - 170 : width - marginX * 2;

  const drawWrapped = (
    text: string,
    x: number,
    startY: number,
    maxW: number,
    lineHeight: number,
    font: string,
    color: string
  ): number => {
    ctx.font = font;
    ctx.fillStyle = color;
    let curY = startY;
    const paragraphs = String(text || '').split('\n');
    for (const para of paragraphs) {
      const trimmed = para.trim();
      if (!trimmed) {
        curY += lineHeight * 0.55;
        continue;
      }
      const words = trimmed.split(/\s+/);
      let line = '';
      for (const w of words) {
        const testLine = line ? `${line} ${w}` : w;
        if (ctx.measureText(testLine).width > maxW && line) {
          if (curY < height - 90) {
            ctx.fillText(line, x, curY);
          }
          line = w;
          curY += lineHeight;
        } else {
          line = testLine;
        }
      }
      if (line && curY < height - 90) {
        ctx.fillText(line, x, curY);
        curY += lineHeight;
      }
    }
    return curY;
  };

  // Optional portrait photo (top-right for DE / UAE)
  if (params.photoDataUrl) {
    try {
      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const image = new Image();
        image.crossOrigin = 'anonymous';
        image.onload = () => resolve(image);
        image.onerror = reject;
        image.src = params.photoDataUrl!;
      });
      ctx.drawImage(img, width - marginX - 132, 76, 132, 160);
      ctx.strokeStyle = '#d6d3d1';
      ctx.lineWidth = 2;
      ctx.strokeRect(width - marginX - 132, 76, 132, 160);
    } catch {
      // Skip if photo fails to load
    }
  }

  // Title
  y = drawWrapped(
    params.title,
    marginX,
    y,
    maxTextWidth,
    46,
    '700 36px "Noto Sans Ethiopic", "Segoe UI", system-ui, sans-serif',
    '#064e3b'
  );

  if (params.subtitle) {
    y += 4;
    y = drawWrapped(
      params.subtitle,
      marginX,
      y,
      maxTextWidth,
      30,
      '600 22px "Noto Sans Ethiopic", "Segoe UI", system-ui, sans-serif',
      '#44403c'
    );
  }

  if (params.metaLine) {
    y += 6;
    y = drawWrapped(
      params.metaLine,
      marginX,
      y,
      maxTextWidth,
      26,
      '500 18px "Noto Sans Ethiopic", "Segoe UI", system-ui, sans-serif',
      '#57534e'
    );
  }

  y = Math.max(y + 18, params.photoDataUrl ? 256 : y + 18);
  ctx.strokeStyle = '#1c1917';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(marginX, y);
  ctx.lineTo(width - marginX, y);
  ctx.stroke();
  y += 38;

  for (const sec of params.sections) {
    if (!sec.content.trim()) continue;
    if (y > height - 150) break;

    ctx.font = '700 19px "Noto Sans Ethiopic", "Segoe UI", system-ui, sans-serif';
    ctx.fillStyle = '#065f46';
    ctx.fillText(sec.heading.toUpperCase(), marginX, y);
    y += 10;

    ctx.strokeStyle = '#d6d3d1';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(marginX, y);
    ctx.lineTo(width - marginX, y);
    ctx.stroke();
    y += 28;

    y = drawWrapped(
      sec.content,
      marginX,
      y,
      width - marginX * 2,
      28,
      '400 19px "Noto Sans Ethiopic", "Segoe UI", system-ui, sans-serif',
      '#1c1917'
    );
    y += 22;
  }

  if (params.signatureFooter) {
    const footerY = height - 88;
    ctx.strokeStyle = '#d6d3d1';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(marginX, footerY - 26);
    ctx.lineTo(width - marginX, footerY - 26);
    ctx.stroke();
    ctx.font = '500 17px "Segoe UI", system-ui, sans-serif';
    ctx.fillStyle = '#44403c';
    ctx.fillText(params.signatureFooter, marginX, footerY);
  }

  const dataUrl = canvas.toDataURL('image/png');
  const base64 = dataUrl.split(',')[1] || '';
  const binaryStr = atob(base64);
  const bytes = new Uint8Array(binaryStr.length);
  for (let i = 0; i < binaryStr.length; i++) {
    bytes[i] = binaryStr.charCodeAt(i);
  }
  return { dataUrl, bytes };
}

/**
 * Generates a real binary .pdf document from canvas pages using pdf-lib,
 * optionally appending or filling an existing uploaded PDF document!
 */
export async function buildRealPdfBytes(params: {
  sourcePdfBytes?: Uint8Array | null;
  acroFormValues?: Record<string, string>;
  pages: {
    title: string;
    subtitle?: string;
    metaLine?: string;
    sections: { heading: string; content: string }[];
    signatureFooter?: string;
    photoDataUrl?: string;
  }[];
}): Promise<Uint8Array> {
  if (params.sourcePdfBytes) {
    try {
      const pdfDoc = await PDFDocument.load(params.sourcePdfBytes, {
        ignoreEncryption: true,
      });

      // Attempt to fill genuine AcroForm fields inside uploaded PDF
      try {
        const form = pdfDoc.getForm();
        const fields = form.getFields();
        for (const field of fields) {
          const name = field.getName();
          const newVal = params.acroFormValues?.[name];
          const maybeField = field as unknown as { setText?: (v: string) => void };
          if (newVal !== undefined && typeof maybeField.setText === 'function') {
            try {
              maybeField.setText(newVal);
            } catch {
              // Non-WinAnsi text fallback handled via clean summary page below
            }
          }
        }
      } catch {
        // Uploaded PDF may not have interactive AcroForm fields
      }

      // Also embed the clean edited summary / filled sheet page(s) inside the PDF
      for (const pageSpec of params.pages) {
        const { bytes: pngBytes } = await renderDocumentToCanvasPng(pageSpec);
        const pngImage = await pdfDoc.embedPng(pngBytes);
        const page = pdfDoc.addPage([595.28, 841.89]);
        page.drawImage(pngImage, {
          x: 0,
          y: 0,
          width: 595.28,
          height: 841.89,
        });
      }

      return await pdfDoc.save();
    } catch {
      // Fallback to fresh PDF generation if uploaded bytes couldn't be merged
    }
  }

  const pdfDoc = await PDFDocument.create();
  for (const pageSpec of params.pages) {
    const { bytes: pngBytes } = await renderDocumentToCanvasPng(pageSpec);
    const pngImage = await pdfDoc.embedPng(pngBytes);
    const page = pdfDoc.addPage([595.28, 841.89]);
    page.drawImage(pngImage, {
      x: 0,
      y: 0,
      width: 595.28,
      height: 841.89,
    });
  }
  return await pdfDoc.save();
}

export async function inspectUploadedPdf(bytes: Uint8Array): Promise<{
  pageCount: number;
  acroFields: { name: string; currentValue: string }[];
  extractedHintText: string;
}> {
  let pageCount = 1;
  const acroFields: { name: string; currentValue: string }[] = [];

  try {
    const pdfDoc = await PDFDocument.load(bytes, { ignoreEncryption: true });
    pageCount = pdfDoc.getPageCount();
    const form = pdfDoc.getForm();
    for (const f of form.getFields()) {
      const name = f.getName();
      let currentValue = '';
      const maybeTextField = f as unknown as { getText?: () => string | undefined };
      if (typeof maybeTextField.getText === 'function') {
        currentValue = maybeTextField.getText() || '';
      }
      acroFields.push({ name, currentValue });
    }
  } catch {
    // Ignore strict PDF form errors
  }

  // Lightweight ASCII / printable snippet scan for quick AI context
  let extractedHintText = '';
  try {
    const rawStr = new TextDecoder('latin1').decode(bytes.slice(0, 120_000));
    const matches = rawStr.match(/\(([A-Za-z0-9 ,.:;!?@\-_/]{4,120})\)/g) || [];
    const uniqueLines = Array.from(
      new Set(matches.map((m) => m.slice(1, -1).trim()).filter((s) => /[a-zA-Z]{2,}/.test(s)))
    );
    extractedHintText = uniqueLines.slice(0, 45).join('\n');
  } catch {
    extractedHintText = '';
  }

  return { pageCount, acroFields, extractedHintText };
}

export function stampSimplePdfWatermarkHeader(pdfBytes: Uint8Array, text: string): Promise<Uint8Array> {
  return PDFDocument.load(pdfBytes, { ignoreEncryption: true }).then(async (doc) => {
    const font = await doc.embedFont(StandardFonts.HelveticaBold);
    for (const page of doc.getPages()) {
      page.drawText(text.slice(0, 60), {
        x: 36,
        y: 18,
        size: 8,
        font,
        color: rgb(0.4, 0.4, 0.4),
      });
    }
    return doc.save();
  });
}

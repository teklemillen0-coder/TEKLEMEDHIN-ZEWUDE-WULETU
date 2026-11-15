import { DigitalProduct, Language, PurchaseOrder } from '../types';
import { UI_TRANSLATIONS } from '../i18n/translations';

function triggerDownload(filename: string, content: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function buildCategoryModuleHtml(product: DigitalProduct, mode: 'full' | 'sample'): string {
  if (mode === 'sample') {
    return `<div class="box"><strong>Sample Preview Notice:</strong> Complete payment via Telebirr (0925695197) or CBE (1000211261513) on AddisVault to unlock the full multi-chapter edition, answer keys, formulas, and printable checklists.</div>`;
  }

  switch (product.category) {
    case 'national_exams':
      return `
        <h2>Part II: Official Answer Key &amp; Step-by-Step Explanations</h2>
        <div class="box">
          <table class="data-table">
            <thead>
              <tr><th>Section</th><th>Topic / Competency</th><th>Correct Key</th><th>Explanation Summary</th></tr>
            </thead>
            <tbody>
              <tr><td>Part A (Q1–Q15)</td><td>Core Concepts &amp; Definitions</td><td>B, D, A, C...</td><td>Eliminate distractors using unit/definition checks from Grade curriculum.</td></tr>
              <tr><td>Part B (Q16–Q35)</td><td>Problem Solving &amp; Calculations</td><td>C, A, B, D...</td><td>Full step-by-step derivations verified against Ethiopian MoE / EUEE keys.</td></tr>
              <tr><td>Part C (Q36–Q50)</td><td>Applied Scenarios &amp; Synthesis</td><td>D, B, C, A...</td><td>Includes timed 90-second speed-solving notes for exam day.</td></tr>
            </tbody>
          </table>
        </div>`;

    case 'childrens_books':
      return `
        <h2>Illustrated Story Spread (Print-Ready A4)</h2>
        <div class="illustration-frame">
          <svg viewBox="0 0 640 240" width="100%" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Ethiopian Storybook Illustration">
            <rect width="640" height="240" rx="16" fill="#ecfdf5"/>
            <path d="M0 190 Q160 110 320 170 T640 160 L640 240 L0 240 Z" fill="#065f46"/>
            <path d="M0 205 Q200 155 420 195 T640 185 L640 240 L0 240 Z" fill="#047857"/>
            <circle cx="510" cy="68" r="34" fill="#fbbf24"/>
            <circle cx="150" cy="145" r="22" fill="#d97706"/>
            <path d="M136 168 L164 168 L172 212 L128 212 Z" fill="#f59e0b"/>
            <text x="44" y="58" fill="#064e3b" font-family="sans-serif" font-size="20" font-weight="bold">AddisVault Children's Edition</text>
            <text x="44" y="84" fill="#047857" font-family="sans-serif" font-size="13">${product.title.en}</text>
          </svg>
        </div>
        <div class="box">
          <strong>Parent Read-Aloud Activity:</strong> Ask your child what lesson the main character learned, then print this page via <em>Ctrl/Cmd + P → Save as PDF</em> for bedtime reading.
        </div>`;

    case 'culinary':
      return `
        <h2>Kitchen Ingredient Weights &amp; Preparation Timeline</h2>
        <div class="box">
          <table class="data-table">
            <thead>
              <tr><th>Stage</th><th>Key Action</th><th>Timing / Temp</th><th>Chef Tip</th></tr>
            </thead>
            <tbody>
              <tr><td>1. Mise en Place</td><td>Measure spices, wash &amp; dice aromatics</td><td>15 min</td><td>Use dry iron pan before adding fats</td></tr>
              <tr><td>2. Base Simmer</td><td>Slow-cook onions/spices to build depth</td><td>25–35 min</td><td>Stir frequently on medium-low heat</td></tr>
              <tr><td>3. Finishing</td><td>Add Niter Kibbeh / herbs &amp; rest</td><td>10 min</td><td>Serve warm with fresh Injera or bread</td></tr>
            </tbody>
          </table>
        </div>`;

    case 'repair_kits':
      return `
        <h2>Technician Bench Checklist &amp; Safety Matrix</h2>
        <div class="box">
          <table class="data-table">
            <thead>
              <tr><th>Check Step</th><th>Tool / Code</th><th>Expected Reading / Rule</th></tr>
            </thead>
            <tbody>
              <tr><td>Pre-Repair Backup</td><td>NVRAM / EFS / User Partition</td><td>Always back up IMEI &amp; user files before flashing</td></tr>
              <tr><td>Hardware Test</td><td>*#0*# / *#*#4636#*#* / DC PSU</td><td>Verify rails (19V / 3.3V / 5V) &amp; short current before IC rework</td></tr>
              <tr><td>Post-Repair QC</td><td>Charging, Audio, Wi-Fi, Baseband</td><td>Confirm full network signal &amp; battery charge draw</td></tr>
            </tbody>
          </table>
        </div>`;

    case 'livestock':
      return `
        <h2>Farm Feed Ratio &amp; Veterinary Care Schedule</h2>
        <div class="box">
          <table class="data-table">
            <thead>
              <tr><th>Component</th><th>Recommended Ratio / Action</th><th>Schedule</th></tr>
            </thead>
            <tbody>
              <tr><td>Concentrate Mix</td><td>Wheat bran 45% + Noug cake 30% + Maize 22% + Minerals 3%</td><td>Daily balanced feeding</td></tr>
              <tr><td>Clean Water &amp; Hygiene</td><td>Sanitize troughs &amp; provide fresh water ad libitum</td><td>Twice daily</td></tr>
              <tr><td>Biosecurity &amp; Vet Log</td><td>Vaccination + deworming + antibiotic withdrawal tracking</td><td>Seasonal &amp; per dose</td></tr>
            </tbody>
          </table>
        </div>`;

    case 'medical':
      return `
        <h2>Clinical / Health Reference Summary Matrix</h2>
        <div class="box">
          <p><strong>Safety Disclaimer:</strong> Designed as an educational &amp; structured reference aligned with Ethiopian clinical standards. Always verify weight-based pediatric dosing and emergency red flags with a licensed clinician.</p>
          <ul>
            <li>Check vital signs &amp; hydration status first on every assessment.</li>
            <li>Cross-check drug allergies, renal dosing, and pregnancy safety.</li>
            <li>Log follow-up dates and patient danger-sign instructions clearly.</li>
          </ul>
        </div>`;

    default:
      return `
        <h2>Module 2: Practical Ethiopian Implementation &amp; Checklist</h2>
        <div class="box">
          <strong>Action Checklist:</strong>
          <ol>
            <li>Review the core curriculum / operational standards above.</li>
            <li>Print or save offline for fast access without mobile data (Ctrl/Cmd + P → Save as PDF).</li>
            <li>Access your unlocked copies anytime inside AddisVault → My Downloads.</li>
          </ol>
        </div>`;
  }
}

export function downloadProductFile(
  product: DigitalProduct,
  mode: 'full' | 'sample',
  lang: Language
) {
  const t = UI_TRANSLATIONS[lang];
  const title = product.title[lang];
  const desc = product.description[lang];
  const highlights = product.highlights[lang];
  const sample = product.sampleExcerpt[lang];
  const baseName = slugify(product.title.en) || product.id;
  const suffix = mode === 'sample' ? '-SAMPLE' : '-FULL';

  if (product.fileExtension === 'csv') {
    const csvRows = [
      ['SKU', 'Template Title', 'Item / Line', 'Amount (ETB)', 'VAT 15% (ETB)', 'Total (ETB)', 'Notes'],
      [product.sku, `"${product.title.en}"`, 'Sample Entry 01', '10000', '=D2*0.15', '=D2+E2', `"${mode === 'sample' ? 'Sample Preview Row' : 'Full Licensed Formula Row'}"`],
      [product.sku, `"${product.title.en}"`, 'Sample Entry 02', '24500', '=D3*0.15', '=D3+E3', 'Auto-calculated Birr ledger'],
      [product.sku, `"${product.title.en}"`, 'Sample Entry 03', '48000', '=D4*0.15', '=D4+E4', 'Ready for Excel & Google Sheets'],
    ];
    if (mode === 'full') {
      csvRows.push(
        [product.sku, `"${product.title.en}"`, 'Monthly Overhead', '15200', '=D5*0.15', '=D5+E5', 'Included in full workbook'],
        [product.sku, `"${product.title.en}"`, 'Net Margin Check', '=SUM(D2:D5)', '=SUM(E2:E5)', '=SUM(F2:F5)', 'Summary Formula Row']
      );
    }
    const csvContent = '\uFEFF' + csvRows.map((r) => r.join(',')).join('\n');
    triggerDownload(`${baseName}${suffix}.csv`, csvContent, 'text/csv;charset=utf-8;');
    return;
  }

  const metaParts = [
    t.categories[product.category],
    product.gradeBand,
    product.subject,
    product.examYear,
    product.track,
    product.audience,
    product.format,
    `${product.priceEtb.toLocaleString()} ETB`,
  ].filter(Boolean);

  const htmlContent = `<!doctype html>
<html lang="${lang}">
<head>
  <meta charset="utf-8" />
  <title>${title} — AddisVault (${mode.toUpperCase()})</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; max-width: 840px; margin: 40px auto; padding: 0 24px; color: #1c1917; line-height: 1.68; }
    .badge { display: inline-block; font-size: 12px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; color: #065f46; border-bottom: 2px solid #d97706; padding-bottom: 4px; }
    h1 { font-size: 28px; margin: 16px 0 8px; color: #064e3b; }
    .meta { color: #57534e; font-size: 14px; margin-bottom: 24px; }
    .box { background: #f5f5f4; border: 1px solid #e7e5e4; border-radius: 12px; padding: 20px; margin: 20px 0; }
    .illustration-frame { margin: 20px 0; border-radius: 16px; overflow: hidden; border: 1px solid #d6d3d1; }
    h2 { font-size: 18px; color: #065f46; margin-top: 28px; }
    .data-table { width: 100%; border-collapse: collapse; font-size: 14px; }
    .data-table th, .data-table td { border-bottom: 1px solid #d6d3d1; padding: 10px 8px; text-align: left; }
    .data-table th { color: #064e3b; font-weight: 700; }
    @media print { body { margin: 0; max-width: 100%; } }
  </style>
</head>
<body>
  <div class="badge">AddisVault Digital Library · ${product.sku} · ${mode === 'sample' ? 'FREE SAMPLE' : 'LICENSED FULL EDITION'}</div>
  <h1>${title}</h1>
  <div class="meta">${metaParts.join(' · ')}</div>
  <p>${desc}</p>
  <div class="box">
    <strong>${t.whatsIncluded}:</strong>
    <ul>${highlights.map((h) => `<li>${h}</li>`).join('')}</ul>
  </div>
  <h2>${mode === 'sample' ? t.samplePreviewTitle : 'Part I: Core Content & Guide'}</h2>
  <p>${sample}</p>
  ${buildCategoryModuleHtml(product, mode)}
</body>
</html>`;

  triggerDownload(`${baseName}${suffix}.html`, htmlContent, 'text/html;charset=utf-8;');
}

export function downloadSalesCsv(orders: PurchaseOrder[]) {
  const headers = [
    'Order ID',
    'Created At',
    'Payment Method',
    'FT / Ref Number',
    'Promo Code',
    'Subtotal (ETB)',
    'Discount (ETB)',
    'Total (ETB)',
    'Items',
    'Buyer Contact',
  ];

  const rows = orders.map((order) => [
    order.id,
    order.createdAt,
    order.paymentMethod.toUpperCase(),
    `"${order.refNumber}"`,
    order.promoCode || '',
    order.subtotalEtb.toString(),
    order.discountEtb.toString(),
    order.totalEtb.toString(),
    `"${order.items.map((i) => `${i.titleSnapshot} x${i.quantity}`).join('; ')}"`,
    `"${order.buyerContact || ''}"`,
  ]);

  const csv = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  triggerDownload(
    `addisvault-sales-ledger-${new Date().toISOString().slice(0, 10)}.csv`,
    csv,
    'text/csv;charset=utf-8;'
  );
}

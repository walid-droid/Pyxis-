/**
 * Exports simples côté navigateur : CSV (compatible Excel) et impression PDF
 * via la boîte de dialogue du système. Aucune dépendance externe.
 */

export type CsvValue = string | number | boolean | null | undefined;

/** Échappe une valeur CSV (guillemets, séparateurs, retours à la ligne). */
function escapeCell(value: CsvValue): string {
  if (value === null || value === undefined) return "";
  const text = String(value).replace(/"/g, '""');
  return /[";\n\r]/.test(text) ? `"${text}"` : text;
}

/** Télécharge un tableau de lignes au format CSV (séparateur `;`). */
export function exportCsv(
  filename: string,
  rows: Array<Record<string, CsvValue>>,
  columns?: string[],
): void {
  if (rows.length === 0) return;

  const headers = columns ?? Object.keys(rows[0]);
  const lines = [
    headers.map(escapeCell).join(";"),
    ...rows.map((row) => headers.map((key) => escapeCell(row[key])).join(";")),
  ];

  // BOM UTF-8 : Excel reconnaît ainsi les accents et l'arabe.
  const blob = new Blob([`\uFEFF${lines.join("\r\n")}`], {
    type: "text/csv;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename.endsWith(".csv") ? filename : `${filename}.csv`;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

/** Ouvre la boîte d'impression du navigateur (impression ou « Enregistrer en PDF »). */
export function printDocument(): void {
  window.print();
}

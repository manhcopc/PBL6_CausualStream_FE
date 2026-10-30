import type { PredictionEvent } from '@/domain/entities/analysis';

export function exportPredictions(rows: PredictionEvent[], type: 'json' | 'csv'): void {
  const content = type === 'json'
    ? JSON.stringify(rows, null, 2)
    : ['timestamp,action,confidence,decision,message', ...rows.map((row) => `${row.timestamp},"${row.action}",${row.confidence},${row.decision},"${row.message}"`)].join('\n');
  const blob = new Blob([content], { type: type === 'json' ? 'application/json' : 'text/csv' });
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = objectUrl;
  link.download = `causalstream-demo.${type}`;
  link.click();
  URL.revokeObjectURL(objectUrl);
}

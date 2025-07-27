export function parseDeklarativEtagenCode(code: string): number[] {
  const etagenMatch = code.match(/etagen\s*=\s*\[(.*?)\]/s);
  if (!etagenMatch) return [];

  const inner = etagenMatch[1];

  const matches = [...inner.matchAll(/"nr":\s*(\d+)/g)];

  const etagen = matches.map((m) => parseInt(m[1], 10));

  return Array.from(new Set(etagen)).sort((a, b) => a - b);
}

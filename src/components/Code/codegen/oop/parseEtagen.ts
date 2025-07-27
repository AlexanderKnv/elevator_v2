export function parseOopEtagenCode(code: string): number[] {
    const matches = [...code.matchAll(/Etage\((\d+)\)/g)];
    const etagen = matches.map((m) => parseInt(m[1], 10));
    return Array.from(new Set(etagen)).sort((a, b) => a - b);
}

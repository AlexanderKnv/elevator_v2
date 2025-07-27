export function parseImperativEtagenCode(code: string): number[] {
    const matches = [...code.matchAll(/etage_\w+\s*=\s*(\d+)/g)];
    const etagen = matches.map((m) => parseInt(m[1], 10));
    return Array.from(new Set(etagen)).sort((a, b) => a - b);
}

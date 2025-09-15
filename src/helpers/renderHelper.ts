// Для Deklarativ (json-подобный/Python-нижний регистр)
export const pyBool = (b: boolean) => (b ? "true" : "false");
export const pyNullNum = (n: number | null | undefined) => (n == null || Number.isNaN(n) ? "null" : String(n));
export const pyNullStr = (s: string | null | undefined) => (s == null ? "null" : `"${s}"`);
export const pyNumArray = (nums: number[]) => `[${nums.map(String).join(", ")}]`;

// Для Imperativ/OOP (etage_<n>, True/False/None)
export const pyBoolTF = (b: boolean) => (b ? "True" : "False");
export const etageVar = (n: number) => `etage_${n}`;
export const etageVarOrNone = (n: number | null | undefined) => (n == null ? "None" : etageVar(n));
export const etageVarArray = (nums: number[]) => `[${nums.map(etageVar).join(", ")}]`;
export const pyNoneOrQuoted = (s: string | null | undefined) => (s == null ? "None" : `"${s}"`);

export const renderGlobals = (speedMs: number, doorTimeMs: number) =>
    `SPEED = ${speedMs}\nDOOR_TIME = ${doorTimeMs}`;

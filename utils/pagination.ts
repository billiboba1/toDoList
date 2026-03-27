export function buildPagination(total: number, current: number): Array<number | 'gap'> {
    if (total <= 1) {
        return total === 1 ? [1] : [];
    }

    if (total <= 7) {
        return Array.from({ length: total }, (_, i) => i + 1);
    }

    const set = new Set<number>();
    set.add(1);
    set.add(total);

    for (let i = current - 1; i <= current + 1; i++) {
        if (i >= 1 && i <= total) {
            set.add(i);
        }
    }

    const sorted = [...set].sort((a, b) => a - b);
    const out: Array<number | 'gap'> = [];

    for (let i = 0; i < sorted.length; i++) {
        const cur = sorted[i]!;
        if (i > 0 && cur - sorted[i - 1]! > 1) {
            out.push('gap');
        }
        out.push(cur);
    }

    return out;
}

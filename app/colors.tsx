export function getSupportedTextColor(score: number): string {
    if (0 <= score && score < 0.5) {
        return "text-red-500";
    } else if (0.5 <= score && score <= 1) {
        return "text-green-500";
    }
    return "text-gray-500";
}

export function getSupportedBgColor(score: number): string {
    if (0 <= score && score < 0.5) {
        return "bg-red-300";
    } else if (0.5 <= score && score <= 1) {
        return "bg-green-300";
    }
    return "bg-gray-500";
}
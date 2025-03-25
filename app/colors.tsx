export function getSupportedTextColor(score: number): string {
    if (0 <= score && score < 0.5) {
        return "text-red-500";
    } else if (0.5 <= score && score <= 1) {
        return "text-green-500";
    }
    return "text-gray-500";
}

export function getSupportedBgColor(score: number): string {
    if (0 <= score && score < 0.125) {
        return "bg-red-500";
    } else if (0.125 <= score && score < 0.25) {
        return "bg-red-400";
    } else if (0.25 <= score && score < 0.375) {
        return "bg-red-300";
    } else if (0.375 <= score && score < 0.5) {
        return "bg-red-200";
    } else if (0.5 <= score && score < 0.625) {
        return "bg-green-200";
    } else if (0.625 <= score && score < 0.75) {
        return "bg-green-300";
    } else if (0.75 <= score && score < 0.875) {
        return "bg-green-400";
    } else if (0.875 <= score && score <= 1) {
        return "bg-green-500";
    }
    return "bg-gray-500";
}
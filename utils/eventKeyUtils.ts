export function isEnterWithoutShift(e: KeyboardEvent | React.KeyboardEvent): boolean {
    return e.key === "Enter" && !e.shiftKey;
}
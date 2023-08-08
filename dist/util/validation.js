export function validate(validateableInput) {
    let isValid = true;
    const { value, required, minLength, maxLength, min, max } = validateableInput;
    if (required) {
        isValid = isValid && value.toString().trim().length !== 0;
    }
    if (minLength !== null &&
        typeof value === "string" &&
        typeof minLength !== "undefined") {
        isValid = isValid && value.trim().length >= minLength;
    }
    if (maxLength !== null &&
        typeof value === "string" &&
        typeof maxLength !== "undefined") {
        isValid = isValid && value.trim().length <= maxLength;
    }
    if (min != null && typeof value === "number") {
        isValid = isValid && value >= min;
    }
    if (max != null && typeof value === "number") {
        isValid = isValid && value <= max;
    }
    return isValid;
}
//# sourceMappingURL=validation.js.map
export class NumberValidator extends BaseValidator {
    parse() { this.sanitizers.push(v => Number(v)); return this; }
    min(min) { this.addRule(v => v < min ? `min ${min}` : null); return this; }
    max(max) { this.addRule(v => v > max ? `max ${max}` : null); return this; }
}
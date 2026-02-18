export class StringValidator extends BaseValidator {
    trim() { this.sanitizers.push(v => typeof v === 'string' ? v.trim() : v); return this; }
    lowercase() { this.sanitizers.push(v => typeof v === 'string' ? v.toLowerCase() : v); return this; }
    uppercase() { this.sanitizers.push(v => typeof v === 'string' ? v.toUpperCase() : v); return this; }
    min(len) { this.addRule(v => typeof v === 'string' && v.length < len ? `min length ${len}` : null); return this; }
    max(len) { this.addRule(v => typeof v === 'string' && v.length > len ? `max length ${len}` : null); return this; }
    regex(pattern) { this.addRule(v => !pattern.test(v) ? `does not match pattern` : null); return this; }
    email() { this.regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/); return this; }
}
export class BooleanValidator extends BaseValidator {
    parse() { this.sanitizers.push(v => v === 'true' || v === true); return this; }
}
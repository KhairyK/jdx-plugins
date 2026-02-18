export class BaseValidator {
  constructor() { this.rules = []; this.sanitizers = []; }
  
  sanitize(value) {
    let val = value;
    for (const fn of this.sanitizers) val = fn(val);
    return val;
  }
  
  addRule(fn) { this.rules.push(fn); return this; }
  
  validateValue(value) {
    let val = this.sanitize(value);
    const errors = [];
    for (const rule of this.rules) {
      const err = rule(val);
      if (err) errors.push(err);
    }
    return { valid: errors.length === 0, value: val, errors };
  }
}
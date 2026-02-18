export class Validator {
  static string() { return new StringValidator(); }
  static number() { return new NumberValidator(); }
  static boolean() { return new BooleanValidator(); }
  static array(schema) { return new ArrayValidator(schema); }
  static object(schema) { return new ObjectValidator(schema); }
}

// ===== Base Validator =====
class BaseValidator {
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

// ===== String Validator =====
class StringValidator extends BaseValidator {
  trim() { this.sanitizers.push(v => typeof v === 'string' ? v.trim() : v); return this; }
  lowercase() { this.sanitizers.push(v => typeof v === 'string' ? v.toLowerCase() : v); return this; }
  uppercase() { this.sanitizers.push(v => typeof v === 'string' ? v.toUpperCase() : v); return this; }
  min(len) { this.addRule(v => typeof v === 'string' && v.length < len ? `min length ${len}` : null); return this; }
  max(len) { this.addRule(v => typeof v === 'string' && v.length > len ? `max length ${len}` : null); return this; }
  regex(pattern) { this.addRule(v => !pattern.test(v) ? `does not match pattern` : null); return this; }
  email() { this.regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/); return this; }
}

// ===== Number Validator =====
class NumberValidator extends BaseValidator {
  parse() { this.sanitizers.push(v => Number(v)); return this; }
  min(min) { this.addRule(v => v < min ? `min ${min}` : null); return this; }
  max(max) { this.addRule(v => v > max ? `max ${max}` : null); return this; }
}

// ===== Boolean Validator =====
class BooleanValidator extends BaseValidator {
  parse() { this.sanitizers.push(v => v === 'true' || v === true); return this; }
}

// ===== Array Validator =====
class ArrayValidator extends BaseValidator {
  constructor(itemSchema) { super(); this.itemSchema = itemSchema; }
  of(schema) { this.itemSchema = schema; return this; }
  
  validateValue(value) {
    if (!Array.isArray(value)) return { valid: false, value, errors: ["not an array"] };
    const data = [];
    const errors = [];
    value.forEach((v, idx) => {
      const res = this.itemSchema.validate(v);
      if (!res.valid) errors[idx] = res.errors;
      data.push(res.value);
    });
    return { valid: errors.length === 0, value: data, errors };
  }
}

// ===== Object Validator =====
class ObjectValidator extends BaseValidator {
  constructor(schema) { super(); this.schema = schema; }
  
  validateValue(obj) {
    if (typeof obj !== 'object' || obj === null) return { valid: false, value: obj, errors: ["not an object"] };
    const data = {};
    const errors = {};
    for (const key in this.schema) {
      const res = this.schema[key].validate(obj[key]);
      if (!res.valid) errors[key] = res.errors;
      data[key] = res.value;
    }
    return { valid: Object.keys(errors).length === 0, value: data, errors };
  }
}

// ===== Helper method for usage =====
Validator.prototype.validate = function(data) { return this.validateValue(data); };
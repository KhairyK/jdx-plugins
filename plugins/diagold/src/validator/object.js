export class ObjectValidator extends BaseValidator {
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
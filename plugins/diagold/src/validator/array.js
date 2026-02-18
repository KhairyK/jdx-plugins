export class ArrayValidator extends BaseValidator {
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
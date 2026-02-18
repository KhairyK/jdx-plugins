import { BaseValidator } from './base.js'
import { StringValidator } from './string.js'
import { NumberValidator } from './number.js'
import { BooleanValidator } from './boolean.js'
import { ArrayValidator } from './array.js'
import { ObjectValidator } from './object.js'

export class Validator {
  static string() { return new StringValidator(); }
  static number() { return new NumberValidator(); }
  static boolean() { return new BooleanValidator(); }
  static array(schema) { return new ArrayValidator(schema); }
  static object(schema) { return new ObjectValidator(schema); }
}

Validator.prototype.validate = function(data) { return this.validateValue(data); };
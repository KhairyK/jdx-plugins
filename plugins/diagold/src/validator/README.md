# DiaGold Validator

> This Validator is **Inspirated** by [Zod](https://www.npmjs.com/package/zod)

## How to use it

```js
// Import the Package
import { Validator } from 'diagold/validator';

const userSchema = Validator.object({
  // String Validator
  name: Validator.string().trim().min(3),
  age: Validator.number().parse().min(0).max(120),
  email: Validator.string().trim().lowercase().email(),
  roles: Validator.array().of(Validator.string().trim()),
  address: Validator.object({
    city: Validator.string().trim(),
    zip: Validator.string().regex(/^\d{5}$/)
  })
});

// Data input
const userData = {
  name: "   Jhon Dow   ",
  age: "25",
  email: "USER@EXAMPLE.COM",
  roles: ["admin  ", "dev "],
  address: { city: "San Francisco", zip: "12345" }
};

// Validation & auto sanitize
const result = userSchema.validate(userData);

console.log(result.valid); // true
console.log(result.value);
/* Output sanitized:
{
  name: "Jhon Dow",
  age: 25,
  email: "user@example.com",
  roles: ["admin", "dev"],
  address: { city: "San Francisco", zip: "12345" }
}
*/
```
# Stringfyr

[![npm version](https://img.shields.io/npm/v/stringfyr.svg)](https://www.npmjs.com/package/stringfyr) 
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT) 
[![GitHub stars](https://img.shields.io/github/stars/KhairyK/jdx-plugins?style=social)](https://github.com/KhairyK/jdx-plugins)

**Stringfyr** is a high-performance, lightweight string utility library providing a comprehensive set of functions for string manipulation. It is fully compatible with **ESM, UMD, AMD, and CJS** environments.

---

## Features

- Capitalize first letter of a string
- Convert strings to **kebab-case**, **snake_case**, and **camelCase**
- Truncate strings with ellipsis
- Reverse strings
- Generate random strings
- Strip HTML tags
- Create URL-friendly slugs
- Template strings with placeholders
- Mask sensitive parts of strings (emails, passwords, etc.)

---

## Installation

```bash
npm install stringfyr
# or
jdx-plugins add stringfyr
```

[!NOTE]: If you are using JDX CLI, you must first install JDX CLI from NPM. [Read this](https://jdx.opendnf.cloud/install-cli) to install the JDX CLI.

---

## Usage

### CommondJS

```js
const str = require('stringfyr');

// Capitalization
console.log(str.capitalize("hello world")); // "Hello world"

// Case conversions
console.log(str.kebabCase("Hello World")); // "hello-world"
console.log(str.snakeCase("Hello World")); // "hello_world"
console.log(str.camelCase("hello world")); // "helloWorld"

// Truncate
console.log(str.truncate("This is a long string", 10)); // "This is a ..."

// Reverse
console.log(str.reverse("hello")); // "olleh"

// Random string
console.log(str.randomString(8)); // "aB3dE1X2"

// Strip HTML
console.log(str.stripHtml("<p>Hello</p>")); // "Hello"

// Slugify
console.log(str.slugify("Hello World! @2026")); // "hello-world-2026"

// Template
console.log(str.template("Hello, {name}!", {name: "Sholeh"})); // "Hello, Sholeh!"

// Mask
console.log(str.mask("jhondow@example.com", 3)); // "jho***@example.com"
```

### ESM

```js
import { capitalize, kebabCase } from 'stringfyr';

console.log(capitalize("hello world")); // "Hello world"
console.log(kebabCase("Hello World")); // "hello-world"
```

### UMD

```html
<script src="https://cdn.jsdelivr.net/npm/stringfyr@1.0.0/dist/stringfyr.umd.js"></script>
<script>
    console.log(capitalize("hello world")); // "Hello world"
    console.log(kebabCase("Hello World")); // "hello-world"
</script>

---

## Repository

Full source code and documentation are available at [GitHub](https://github.com/KhairyK/jdx-plugins/tree/main/plugins/stringfyr).

---

## License

MIT License
'use strict';

/**
 * Stringfyr Source Code (C) 2026
 * OpenDN Foundation / KhairyK / Sholehuddin Khairy
 * @license MIT  |  Version v1.0.0
 */

function capitalize(str) {
    if (!str) return '';
    return str[0].toUpperCase() + str.slice(1);
}

function kebabCase(str) {
    return str.trim().toLowerCase().replace(/\s+/g, '-');
}

function snakeCase(str) {
    return str.trim().toLowerCase().replace(/\s+/g, '_');
}

function camelCase(str) {
    const words = str.trim().split(/\s+/);
    return words[0].toLowerCase() + words.slice(1).map(w => capitalize(w)).join('');
}

function truncate(str, length = 20) {
    if (!str) return '';
    return str.length > length ? str.slice(0, length) + '...' : str;
}

function reverse(str) {
    return str.split('').reverse().join('');
}

function randomString(len = 6) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    return Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

function stripHtml(str) {
    return str.replace(/<\/?[^>]+(>|$)/g, '');
}

function slugify(str) {
    return str
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
}

function template(str, data = {}) {
    return str.replace(/{(\w+)}/g, (_, key) => (key in data ? data[key] : `{${key}}`));
}

function mask(str, visible = 3) {
    if (!str || str.length <= visible) return str;
    const [start, end] = [str.slice(0, visible), str.slice(visible)];
    const masked = end.replace(/./g, '*');
    return start + masked;
}

exports.camelCase = camelCase;
exports.capitalize = capitalize;
exports.kebabCase = kebabCase;
exports.mask = mask;
exports.randomString = randomString;
exports.reverse = reverse;
exports.slugify = slugify;
exports.snakeCase = snakeCase;
exports.stripHtml = stripHtml;
exports.template = template;
exports.truncate = truncate;
//# sourceMappingURL=stringfyr.cjs.js.map

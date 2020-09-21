"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.all = exports.prop = exports.reduce = exports.map = exports.head = exports.trim = exports.curry = exports.upsertItem = exports.deepEqual = exports.compose = exports.randomString = void 0;
exports.randomString = () => Math.random().toString(36).substring(7);
exports.compose = (...fns) => (...args) => fns.reduceRight((res, fn) => [fn.call(null, ...res)], args)[0];
exports.deepEqual = (a, b) => {
    return JSON.stringify(a) === JSON.stringify(b);
};
exports.upsertItem = (items, data, index) => {
    return items.map((item, itemIndex) => {
        return itemIndex === index ? { ...item, ...data } : { ...item };
    });
};
function curry(fn) {
    const arity = fn.length;
    return function $curry(...args) {
        if (args.length < arity) {
            return $curry.bind(null, ...args);
        }
        return fn.call(null, ...args);
    };
}
exports.curry = curry;
exports.trim = (s) => s.trim();
exports.head = (xs) => xs[0];
exports.map = curry((f, xs) => xs.map(f));
exports.reduce = curry((f, x, xs) => xs.reduce(f, x));
exports.prop = curry((p, obj) => (obj ? obj[p] : undefined));
const reduceTruthy = (prev, current) => {
    return !!current ? prev : false;
};
exports.all = exports.reduce(reduceTruthy, true);
//# sourceMappingURL=utilities.js.map
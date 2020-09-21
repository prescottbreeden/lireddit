/**
 * Creates a random 7 character string.
 * @return string
 */
export const randomString = () => Math.random().toString(36).substring(7);

/**
 *  compose :: ((a -> b), (b -> c),  ..., (y -> z)) -> a -> z
 */
export const compose = (...fns: Function[]) => (...args: any[]) =>
  fns.reduceRight((res, fn) => [fn.call(null, ...res)], args)[0];

/**
 *  Evaluate any two values for deep equality
 *  @param a any value
 *  @param b any value
 *  @return boolean
 */
export const deepEqual = (a: unknown, b: unknown) => {
  return JSON.stringify(a) === JSON.stringify(b);
};

export const upsertItem = <T>(items: T[], data: Partial<T>, index: number) => {
  return items.map((item: T, itemIndex: number) => {
    return itemIndex === index ? { ...item, ...data } : { ...item };
  });
};

/**
 *  curry :: ((a, b, ...) -> c) -> a -> b -> ... -> c
 */
export function curry(fn: Function) {
  const arity = fn.length;

  return function $curry(...args: any[]): any {
    if (args.length < arity) {
      return $curry.bind(null, ...args);
    }

    return fn.call(null, ...args);
  };
}

/**
 *  trim :: String -> String
 */
export const trim = (s: string) => s.trim();

/**
 *  head :: [a] -> a
 */
export const head = (xs: any[]) => xs[0];

/**
 *  map :: (a -> b) -> [a] -> [b]
 */
export const map = curry((f: any, xs: any[]) => xs.map(f));

/**
 *  reduce :: ((b, a) -> b) -> b -> [a] -> b
 */
export const reduce = curry((f: any, x: any, xs: any[]) => xs.reduce(f, x));

/**
 *  prop :: String -> {a} -> [a | Undefined]
 */
export const prop = curry((p: string, obj: any) => (obj ? obj[p] : undefined));

const reduceTruthy = (prev: any, current: any) => {
  return !!current ? prev : false;
};

export const all = reduce(reduceTruthy, true);

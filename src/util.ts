import { join, resolve } from "path";
import FormData from "form-data";

export type Awaited<T> = T extends Promise<infer U> ? U : T;

export type Option<T> = T | undefined;

export const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

export const getRandom = <T>(arr: Array<T>) =>
  arr[Math.floor(Math.random() * arr.length)];

export const multiline = (...args: Array<{ toString(): string }>) =>
  args.join("\n");

export const unreachable = (x: never): never => {
  throw new Error("unreachable!");
};
export const unimplemented = () => new Error("unimplemented!");

export const exists = <T>(x: Option<T>): x is T => typeof x !== "undefined";

export const orDefault = <T>(x: Option<T>, fallback: T) =>
  typeof x === "undefined" ? fallback : x;

export const mockingCase = (sentence: string) =>
  sentence.split("").reduce((str, char, idx) => {
    return `${str}${idx % 2 === 0 ? char : char.toUpperCase()}`;
  }, "");

export const parseToNumber = (numberLikeString: string) => {
  const maybeNumber = Number(numberLikeString);

  if (Number.isNaN(maybeNumber)) {
    throw new Error(
      `Expected a number-like-string but got: ${numberLikeString}`
    );
  }

  return maybeNumber;
};

export const tail = <T>(xs: T[]): T | undefined => xs[xs.length - 1];

export const STATIC_DIR = resolve(join(__dirname, "..", "static"));

export const range = (start = 0, end = Infinity) =>
  Array(end - start)
    .fill(0)
    .map((_, idx) => idx + start);

export const tap =
  <T>(fn: (x: T) => void) =>
  (x: T) => {
    fn(x);
    return x;
  };

export const isRecordLike = (x: unknown): x is Record<string, unknown> =>
  Object(x) === x;

export const createFormData = (
  input: unknown,
  formData = new FormData(),
  propName = ""
) => {
  if (Array.isArray(input)) {
    input.forEach((el, idx) =>
      createFormData(el, formData, `${propName}[${idx}]`)
    );
  } else if (isRecordLike(input)) {
    Object.entries(input).forEach(([prop, val]) =>
      createFormData(val, formData, propName ? `${propName}[${prop}]` : prop)
    );
  } else {
    formData.append(propName, input);
  }

  return formData;
};

export const timeout = <T>(fn: () => Promise<T>, ms: number) =>
  Promise.race([
    fn(),
    sleep(ms).then(() => {
      throw new Error(`timeout`);
    }),
  ]);

export const textIf = <T>(input: T | undefined, text: string) =>
  exists(input) ? text : "";

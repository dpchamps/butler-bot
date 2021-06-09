export const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));
export type Awaited<T> = T extends Promise<infer U> ? U : T;
export type Option<T> = T | undefined;


export const getRandom = <T>(arr: Array<T>) => arr[Math.floor(Math.random()*arr.length)];
export const multiline = (...args: Array<{toString(): string}>) => args.join('\n');
export const unreachable = () : never => {throw new Error("unreachable!")};

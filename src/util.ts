export const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));
export type Awaited<T> = T extends Promise<infer U> ? U : T;
export type Option<T> = T | undefined;

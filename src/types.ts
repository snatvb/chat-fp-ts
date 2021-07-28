export type ElementArrayOf<T> = T extends Array<infer U> ? U : T

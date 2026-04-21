type Metadata = {
  source?: string
  description?: string
} & Record<string, string>
export interface CanaryStoreEntry {
  name: string
  value: CanaryValue
  variants?: [true, false] | [false, true] | string[] | number[]
  override?: CanaryValue
  metadata?: Metadata
}

export type CanaryConfig = Array<CanaryStoreEntry>
  | Array<[string, CanaryStoreEntry]>
  | ReadonlyArray<CanaryStoreEntry>
  | ReadonlyArray<[string, CanaryStoreEntry]>

export type CanaryValue = boolean | string | number | null | undefined
export interface Overrides {
  [key: string]: CanaryValue
}

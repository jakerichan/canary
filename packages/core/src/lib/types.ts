type Metadata = {
  source?: string
  description?: string
} & Record<string, string>
export interface CanaryStoreEntry {
  name: string
  value: CanaryValue
  variants?: [true, false] | [false, true] | string[] | number[] | object[]
  override?: CanaryValue
  metadata?: Metadata
}

export type CanaryConfig = Array<CanaryStoreEntry> | Array<[string, CanaryStoreEntry]>

export type CanaryValue = boolean | string | number | object | null | undefined
export interface Overrides {
  [key: string]: CanaryValue
}

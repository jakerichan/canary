export interface CanaryStoreEntry {
  name: string
  value: CanaryValue
  variants?: [true, false] | [false, true] | string[] | number[] | object[]
  override?: CanaryValue
  metadata?: {
    description: string
  }
}

export type CanaryValue = boolean | string | number | object | null | undefined
export interface Overrides {
  [key: string]: CanaryValue
}

export const SterilizedValue = {
  sterilized: 's',
  intact: 'i'
} as const;

export type SterilizedType = (typeof SterilizedValue)[keyof typeof SterilizedValue] | "";

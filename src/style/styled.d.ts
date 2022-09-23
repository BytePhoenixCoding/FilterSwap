// eslint-disable-next-line import/no-unresolved
import { FilterTheme } from '@filterswap-libs/uikit/dist/theme'

declare module 'styled-components' {
  /* eslint-disable @typescript-eslint/no-empty-interface */
  export interface DefaultTheme extends FilterTheme {}
}

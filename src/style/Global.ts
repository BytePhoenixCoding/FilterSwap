import { createGlobalStyle } from 'styled-components'

const GlobalStyle = createGlobalStyle`
  html {
    background: ${({ theme }: any) => theme.colors.gradients.background};
  }

  body {

    img {
      height: auto;
      max-width: 100%;
    }
  }
`

export default GlobalStyle

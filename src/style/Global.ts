import { createGlobalStyle } from 'styled-components'

// background-color: ${({ theme }) => theme.colors.background};
const GlobalStyle = createGlobalStyle`
  body {

    img {
      height: auto;
      max-width: 100%;
    }
  }
`

export default GlobalStyle

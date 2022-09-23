import { MenuEntry } from '../../custom_modules/@filterswap-libs/uikit'

const config: MenuEntry[] = [
  {
    label: 'Trade',
    icon: 'TradeIcon',
    initialOpenState: true,
    items: [
      {
        label: 'Swap',
        href: '/swap',
      },
      {
        label: 'Liquidity',
        href: '/pool',
      },
      {
        label: 'Create Token',
        href: '/createtoken',
      },
    ],
  },
  {
    label: 'More',
    icon: 'MoreIcon',
    items: [
      {
        label: 'Other stuff 1',
        href: 'https://docs.Filterswap.finance/contact-us',
      },
      {
        label: 'Other stuff 2',
        href: 'https://voting.Filterswap.finance',
      },
    ],
  },
]

export default config

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
    initialOpenState: true,
    items: [
      {
        label: 'Token Verification',
        href: '/verifytoken',
      },
      {
        label: 'Presales (coming soon!)',
        href: 'about:blank',
      },
      {
        label: 'Governance (coming soon!)',
        href: 'about:blank',
      },
    ],
  },
]

export default config

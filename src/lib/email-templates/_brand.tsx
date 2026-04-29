import * as React from 'react'
import { Hr, Section, Text } from '@react-email/components'

export const brand = {
  navy: '#0f1a33',
  gold: '#c9a25a',
  goldSoft: '#e3c98a',
  cream: '#f7f3ea',
  text: '#3a3a3a',
  muted: '#8a8a8a',
  border: '#e8e1d2',
}

export const styles = {
  main: {
    backgroundColor: '#ffffff',
    fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
    margin: 0,
    padding: 0,
  } as const,
  container: {
    maxWidth: '560px',
    margin: '0 auto',
    padding: '0',
  } as const,
  header: {
    backgroundColor: brand.navy,
    padding: '36px 32px 28px',
    textAlign: 'center' as const,
  },
  brandWord: {
    fontFamily: '"Cormorant Garamond", Georgia, "Times New Roman", serif',
    fontSize: '32px',
    letterSpacing: '0.18em',
    color: brand.cream,
    margin: 0,
    fontWeight: 500 as const,
  },
  brandRule: {
    width: '48px',
    height: '1px',
    border: 'none',
    backgroundColor: brand.gold,
    margin: '14px auto 0',
  },
  tagline: {
    fontFamily: '"Cormorant Garamond", Georgia, serif',
    fontStyle: 'italic' as const,
    color: brand.goldSoft,
    fontSize: '13px',
    margin: '12px 0 0',
    letterSpacing: '0.04em',
  },
  body: {
    padding: '36px 32px 28px',
  },
  h1: {
    fontFamily: '"Cormorant Garamond", Georgia, serif',
    fontSize: '26px',
    fontWeight: 600 as const,
    color: brand.navy,
    margin: '0 0 18px',
    lineHeight: 1.2,
  },
  text: {
    fontSize: '15px',
    color: brand.text,
    lineHeight: 1.6,
    margin: '0 0 18px',
  },
  link: { color: brand.navy, textDecoration: 'underline' },
  button: {
    backgroundColor: brand.gold,
    color: brand.navy,
    fontSize: '14px',
    fontWeight: 600 as const,
    letterSpacing: '0.04em',
    borderRadius: '8px',
    padding: '14px 28px',
    textDecoration: 'none',
    display: 'inline-block',
    margin: '8px 0 8px',
  },
  code: {
    fontFamily: '"SF Mono", Menlo, Consolas, monospace',
    fontSize: '28px',
    fontWeight: 700 as const,
    color: brand.navy,
    letterSpacing: '0.3em',
    backgroundColor: brand.cream,
    border: `1px solid ${brand.border}`,
    borderRadius: '8px',
    padding: '18px 24px',
    textAlign: 'center' as const,
    margin: '8px 0 24px',
  },
  divider: {
    border: 'none',
    borderTop: `1px solid ${brand.border}`,
    margin: '28px 0 20px',
  },
  footerSection: {
    padding: '0 32px 36px',
    textAlign: 'center' as const,
  },
  footer: {
    fontSize: '12px',
    color: brand.muted,
    lineHeight: 1.6,
    margin: '0 0 6px',
  },
  footerBrand: {
    fontFamily: '"Cormorant Garamond", Georgia, serif',
    fontSize: '13px',
    color: brand.navy,
    letterSpacing: '0.16em',
    margin: '0 0 4px',
  },
}

export const Header = ({ tagline }: { tagline?: string }) => (
  <Section style={styles.header}>
    <Text style={styles.brandWord}>APERIO</Text>
    <Hr style={styles.brandRule} />
    {tagline ? <Text style={styles.tagline}>{tagline}</Text> : null}
  </Section>
)

export const Footer = ({ siteName }: { siteName: string }) => (
  <Section style={styles.footerSection}>
    <Hr style={styles.divider} />
    <Text style={styles.footerBrand}>APERIO</Text>
    <Text style={styles.footer}>Where the Word opens.</Text>
    <Text style={styles.footer}>
      You're receiving this email because of activity on your {siteName} account.
    </Text>
  </Section>
)
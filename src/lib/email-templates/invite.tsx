import * as React from 'react'
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components'
import { Footer, Header, styles } from './_brand'

interface InviteEmailProps {
  siteName: string
  siteUrl: string
  confirmationUrl: string
}

export const InviteEmail = ({
  siteName,
  siteUrl,
  confirmationUrl,
}: InviteEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>You've been invited to {siteName}</Preview>
    <Body style={styles.main}>
      <Container style={styles.container}>
        <Header tagline="Where the Word opens." />
        <Section style={styles.body}>
          <Heading style={styles.h1}>You've been invited</Heading>
          <Text style={styles.text}>
            You've been invited to join{' '}
            <Link href={siteUrl} style={styles.link}>
              <strong>{siteName}</strong>
            </Link>
            . Accept below to create your account and begin reading.
          </Text>
          <Button style={styles.button} href={confirmationUrl}>
            Accept invitation
          </Button>
          <Text style={{ ...styles.text, fontSize: '13px', color: '#8a8a8a', marginTop: '24px' }}>
            If you weren't expecting this invitation, you may safely ignore it.
          </Text>
        </Section>
        <Footer siteName={siteName} />
      </Container>
    </Body>
  </Html>
)

export default InviteEmail

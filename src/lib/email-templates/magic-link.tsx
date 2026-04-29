import * as React from 'react'
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components'
import { Footer, Header, styles } from './_brand'

interface MagicLinkEmailProps {
  siteName: string
  confirmationUrl: string
}

export const MagicLinkEmail = ({
  siteName,
  confirmationUrl,
}: MagicLinkEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Your sign-in link for {siteName}</Preview>
    <Body style={styles.main}>
      <Container style={styles.container}>
        <Header tagline="Where the Word opens." />
        <Section style={styles.body}>
          <Heading style={styles.h1}>Your sign-in link</Heading>
          <Text style={styles.text}>
            Click below to enter {siteName}. The link will expire shortly for
            your security.
          </Text>
          <Button style={styles.button} href={confirmationUrl}>
            Sign in
          </Button>
          <Text style={{ ...styles.text, fontSize: '13px', color: '#8a8a8a', marginTop: '24px' }}>
            If you didn't request this link, you can safely ignore this email.
          </Text>
        </Section>
        <Footer siteName={siteName} />
      </Container>
    </Body>
  </Html>
)

export default MagicLinkEmail

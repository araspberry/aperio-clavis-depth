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

interface SignupEmailProps {
  siteName: string
  siteUrl: string
  recipient: string
  confirmationUrl: string
}

export const SignupEmail = ({
  siteName,
  siteUrl,
  recipient,
  confirmationUrl,
}: SignupEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Open the Word — confirm your email for {siteName}</Preview>
    <Body style={styles.main}>
      <Container style={styles.container}>
        <Header tagline="Where the Word opens." />
        <Section style={styles.body}>
          <Heading style={styles.h1}>Welcome to Aperio.</Heading>
          <Text style={styles.text}>
            Thank you for joining{' '}
            <Link href={siteUrl} style={styles.link}>
              <strong>{siteName}</strong>
            </Link>
            . A scholarly Bible reader awaits you — Greek &amp; Hebrew lexicon,
            cross references, and historical context for every verse.
          </Text>
          <Text style={styles.text}>
            Please confirm{' '}
            <Link href={`mailto:${recipient}`} style={styles.link}>
              {recipient}
            </Link>{' '}
            to begin:
          </Text>
          <Button style={styles.button} href={confirmationUrl}>
            Confirm email
          </Button>
          <Text style={{ ...styles.text, fontSize: '13px', color: '#8a8a8a', marginTop: '24px' }}>
            If you didn't create an account, you may safely ignore this email.
          </Text>
        </Section>
        <Footer siteName={siteName} />
      </Container>
    </Body>
  </Html>
)

export default SignupEmail

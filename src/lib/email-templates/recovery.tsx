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

interface RecoveryEmailProps {
  siteName: string
  confirmationUrl: string
}

export const RecoveryEmail = ({
  siteName,
  confirmationUrl,
}: RecoveryEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Reset your password for {siteName}</Preview>
    <Body style={styles.main}>
      <Container style={styles.container}>
        <Header tagline="Where the Word opens." />
        <Section style={styles.body}>
          <Heading style={styles.h1}>Reset your password</Heading>
          <Text style={styles.text}>
            We received a request to reset your password for {siteName}. Click
            below to choose a new one.
          </Text>
          <Button style={styles.button} href={confirmationUrl}>
            Reset password
          </Button>
          <Text style={{ ...styles.text, fontSize: '13px', color: '#8a8a8a', marginTop: '24px' }}>
            If you didn't request a reset, you can safely ignore this email —
            your password will remain unchanged.
          </Text>
        </Section>
        <Footer siteName={siteName} />
      </Container>
    </Body>
  </Html>
)

export default RecoveryEmail

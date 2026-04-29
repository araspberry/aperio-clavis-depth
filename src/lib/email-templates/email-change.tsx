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

interface EmailChangeEmailProps {
  siteName: string
  email: string
  newEmail: string
  confirmationUrl: string
}

export const EmailChangeEmail = ({
  siteName,
  email,
  newEmail,
  confirmationUrl,
}: EmailChangeEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Confirm your new email for {siteName}</Preview>
    <Body style={styles.main}>
      <Container style={styles.container}>
        <Header tagline="Where the Word opens." />
        <Section style={styles.body}>
          <Heading style={styles.h1}>Confirm your new email</Heading>
          <Text style={styles.text}>
            You requested to change your email on {siteName} from{' '}
            <Link href={`mailto:${email}`} style={styles.link}>{email}</Link>{' '}
            to{' '}
            <Link href={`mailto:${newEmail}`} style={styles.link}>{newEmail}</Link>.
          </Text>
          <Button style={styles.button} href={confirmationUrl}>
            Confirm change
          </Button>
          <Text style={{ ...styles.text, fontSize: '13px', color: '#8a8a8a', marginTop: '24px' }}>
            If you didn't request this change, please secure your account
            immediately.
          </Text>
        </Section>
        <Footer siteName={siteName} />
      </Container>
    </Body>
  </Html>
)

export default EmailChangeEmail

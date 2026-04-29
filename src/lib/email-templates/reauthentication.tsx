import * as React from 'react'
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components'
import { Footer, Header, styles } from './_brand'

interface ReauthenticationEmailProps {
  token: string
}

export const ReauthenticationEmail = ({ token }: ReauthenticationEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Your verification code</Preview>
    <Body style={styles.main}>
      <Container style={styles.container}>
        <Header tagline="Where the Word opens." />
        <Section style={styles.body}>
          <Heading style={styles.h1}>Confirm it's you</Heading>
          <Text style={styles.text}>Use the code below to confirm your identity:</Text>
          <Text style={styles.code}>{token}</Text>
          <Text style={{ ...styles.text, fontSize: '13px', color: '#8a8a8a' }}>
            This code will expire shortly. If you didn't request this, you may
            safely ignore this email.
          </Text>
        </Section>
        <Footer siteName="Aperio" />
      </Container>
    </Body>
  </Html>
)

export default ReauthenticationEmail

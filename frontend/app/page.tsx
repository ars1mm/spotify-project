/**
 * ************************************
 * EN: HOME PAGE - ENTRY POINT
 *    Main entry point for the application
 * AL: FAQJA KRYESORE - PIKA E HYRJES
 *    Pika kryesore e hyrjes për aplikacionin
 * ************************************
 * 
 * THIS FILE:
 * - Entry point for the root route (/)
 * - Wraps the SpotifyLayout component
 * - No business logic here
 * 
 * HOW TO MODIFY THIS PAGE:
 * 1. Add page-level providers if needed
 * 2. Add page metadata for SEO
 * 3. Change the wrapped component
 * 
 * KJO FILE:
 * - Pika e hyrjes për rrugën kryesore (/)
 * - Mbështjell komponentin SpotifyLayout
 * - Nuk ka logjikë biznesi këtu
 * 
 * SI TË MODIFIKONI KËTË FAQE:
 * 1. Shtoni providerë në nivel faqeje nëse nevojitet
 * 2. Shtoni metadata për SEO
 * 3. Ndërroni komponentin e mbështjellë
 */

import { SpotifyLayout } from './components/layout/SpotifyLayout'

export const metadata = {
  title: 'Spotify Project - Music Streaming',
  description: 'A modern music streaming application built with Next.js',
}

export default function Home() {
  return <SpotifyLayout />
}

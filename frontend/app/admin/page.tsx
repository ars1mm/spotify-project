/**
 * ************************************
 * EN: ADMIN PAGE - ROUTE ENTRY POINT
 *    Main entry point for the admin section
 * AL: FAQJA ADMIN - PIKA E HYRJES SË RRUGËS
 *    Pika kryesore e hyrjes për seksionin admin
 * ************************************
 * 
 * THIS FILE:
 * - Entry point for /admin route
 * - Wraps the AdminDashboard component
 * - No business logic here
 * 
 * HOW TO MODIFY THIS PAGE:
 * 1. Add page-level providers here if needed
 * 2. Add page-level metadata
 * 3. Import and render the main component
 * 
 * KJO FILE:
 * - Pika e hyrjes për rrugën /admin
 * - Mbështjell komponentin AdminDashboard
 * - Nuk ka logjikë biznesi këtu
 * 
 * SI TË MODIFIKONI KËTË FAQE:
 * 1. Shtoni providerë në nivel faqeje këtu nëse nevojitet
 * 2. Shtoni metadata në nivel faqeje
 * 3. Importoni dhe shfaqni komponentin kryesor
 */

import AdminDashboard from '@/app/components/admin/AdminDashboard'

export const metadata = {
  title: 'Admin Dashboard - Spotify Project',
  description: 'Admin dashboard for managing songs and content',
}

export default function AdminPage() {
  return <AdminDashboard />
}

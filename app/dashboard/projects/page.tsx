/**
 * Projects Page - Redirects to Vibe Coder
 * All projects are managed through VettCode Vibe
 */

import { redirect } from 'next/navigation';

export default function ProjectsPage() {
  redirect('/dashboard/vibe');
}

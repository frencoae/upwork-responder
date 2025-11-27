// app/page.tsx - UPDATED
import { redirect } from 'next/navigation'

export default function Home() {
  redirect('/auth/login')
}
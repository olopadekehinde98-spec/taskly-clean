import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import NewGigForm from './NewGigForm'

export default async function NewServicePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: categories } = await supabase
    .from('categories')
    .select('id, name, icon')
    .eq('is_active', true)
    .order('sort_order')

  return <NewGigForm categories={categories ?? []} />
}

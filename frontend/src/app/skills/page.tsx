import { fetchSkills } from '@/app/actions'
import SkillsClient from './SkillsClient'

export const dynamic = 'force-dynamic'

export default async function SkillsPage() {
  const skills = await fetchSkills()
  return <SkillsClient skills={skills} />
}

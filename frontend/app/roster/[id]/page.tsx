import RosterClient from './RosterClient'

export default function RosterPage({ params }: { readonly params: Promise<{ id: string }> }) {
  return <RosterClient params={params} />
}


import { useEffect } from 'react'
import { useParams, Navigate } from 'react-router-dom'
import { findSlot } from '../data/slots'
import { useRecents } from '../store/recents'
import Slot from '../games/Slot'

export default function SlotRoute() {
  const { slug } = useParams()
  const cfg = slug ? findSlot(slug) : undefined
  const add = useRecents((s) => s.add)
  useEffect(() => {
    if (cfg) add({ to: `/slot/${cfg.slug}`, name: cfg.name, emoji: '🎰', accent: cfg.accent })
  }, [cfg, add])
  if (!cfg) return <Navigate to="/slots" replace />
  return <Slot cfg={cfg} />
}

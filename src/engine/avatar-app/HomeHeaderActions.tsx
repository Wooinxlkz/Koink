import './HomeHeaderActions.scss'

import { LanguageSwitcher } from './LanguageSwitcher'

// The original theme toggle is removed: no CSS anywhere in this app (see
// THIRD_PARTY_NOTICES.md for what was and wasn't changed) actually responds
// to a `.dark` class, so it visually did nothing but swap its own icon —
// dead UI, not a real feature. Language switching is real and stays.
export const HomeHeaderActions = () => {
  return <LanguageSwitcher />
}

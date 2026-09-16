import './HomeHeaderActions.scss'

import { useEffect, useState } from 'react'

import { LanguageSwitcher } from './LanguageSwitcher'
import { useAvatarLocale } from './avatarLocale'

// Previously this toggled a `.dark` class that nothing in the app's CSS
// responded to (see CHANGELOG). It now works: `src/styles/theme-tokens.scss`
// defines both a light `:root` and a `:root.dark` override for every color
// token the vendored UI actually uses, and this toggles `.dark` on
// `<html>` to match that selector.
export const HomeHeaderActions = () => {
  const { t } = useAvatarLocale()
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'))

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
  }, [dark])

  return (
    <>
      <button
        className='avatar-app__theme-toggle'
        type='button'
        aria-label={dark ? t('Switch to light theme') : t('Switch to dark theme')}
        title={dark ? t('Light theme') : t('Dark theme')}
        onClick={() => setDark(value => !value)}
      >
        {dark
          ? (
            <svg viewBox='0 0 20 20' aria-hidden='true'>
              <circle cx='10' cy='10' r='3.6' />
              <path
                strokeLinecap='round'
                d='M10 1.6v2.1M10 16.3v2.1M18.4 10h-2.1M3.7 10H1.6M15.7 4.3l-1.5 1.5M5.8 14.2l-1.5 1.5M15.7 15.7l-1.5-1.5M5.8 5.8 4.3 4.3'
              />
            </svg>
          )
          : (
            <svg viewBox='0 0 20 20' aria-hidden='true'>
              <path strokeLinecap='round' strokeLinejoin='round' d='M17.3 12.9A7.4 7.4 0 0 1 7.1 2.7a7.4 7.4 0 1 0 10.2 10.2Z' />
            </svg>
          )}
      </button>
      <LanguageSwitcher />
    </>
  )
}

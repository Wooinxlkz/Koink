import './HomeHeaderActions.scss'

import { useEffect, useState } from 'react'

import { LanguageSwitcher } from './LanguageSwitcher'
import { useAvatarLocale } from './avatarLocale'

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
              <circle cx='10' cy='10' r='3.2' />
              <path d='M10 1.8v2M10 16.2v2M1.8 10h2M16.2 10h2M4.2 4.2l1.4 1.4M14.4 14.4l1.4 1.4M15.8 4.2l-1.4 1.4M5.6 14.4l-1.4 1.4' />
            </svg>
          )
          : (
            <svg viewBox='0 0 20 20' aria-hidden='true'>
              <path d='M16.9 12.6A7 7 0 0 1 7.4 3.1a7 7 0 1 0 9.5 9.5Z' />
            </svg>
          )}
      </button>
      <LanguageSwitcher />
    </>
  )
}

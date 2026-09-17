import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react'

import { HomePage } from './HomePage'
import { LAST_EDITOR_QUERY_STORAGE_KEY } from './avatarHome'
import { useAvatarLocale } from './avatarLocale'

const loadEditor = () => import('./App')
const AvatarEditor = lazy(loadEditor)
const EDITOR_HASH = '#/editor'

export const createRandomAvatarEditorQuery = (seed: string, seedFields: string) => {
  const params = new URLSearchParams()
  params.set('seed', seed)
  params.set('seedFields', seedFields)
  return `?${params.toString()}`
}

const isEditorLocation = () => (
  window.location.hash === EDITOR_HASH || new URLSearchParams(window.location.search).size > 0
)

const replaceLocation = (query: string, hash: string) => {
  const url = new URL(window.location.href)
  url.search = query
  url.hash = hash
  window.history.pushState(null, '', url)
}

interface RootProps {
  /** Passed straight through to HomePage's Companion tile, if provided. */
  readonly onOpenCompanion?: () => void
  /**
   * Skip HomePage entirely and open straight into the editor (with a
   * random avatar, since the editor needs something to edit) — used so
   * Koink's own "Studio" tab goes directly to editing, while "Home" shows
   * this same Root's normal HomePage-first behavior.
   */
  readonly startInEditor?: boolean
  /**
   * The counterpart to startInEditor, for the "Home" tab's own Root
   * instance: force the gallery, even if the *other* Root instance (the
   * "Studio" tab's) left the browser's shared URL pointed at an editor
   * link. Both tabs mount independent Root instances but read the same
   * global `window.location`, so without this, switching Home -> Studio
   * -> Home could land back on whatever Studio was last editing instead
   * of the gallery Home is supposed to always show.
   */
  readonly startAtHome?: boolean
}

const Root = ({ onOpenCompanion, startInEditor = false, startAtHome = false }: RootProps) => {
  const { t } = useAvatarLocale()
  const [editorOpen, setEditorOpen] = useState(() => {
    if (startInEditor) return true
    if (startAtHome) return false
    return isEditorLocation()
  })
  const randomEditorOpeningRef = useRef(false)

  useEffect(() => {
    const syncRoute = () => setEditorOpen(isEditorLocation())
    window.addEventListener('hashchange', syncRoute)
    window.addEventListener('popstate', syncRoute)
    return () => {
      window.removeEventListener('hashchange', syncRoute)
      window.removeEventListener('popstate', syncRoute)
    }
  }, [])

  useEffect(() => {
    if (!editorOpen) randomEditorOpeningRef.current = false
  }, [editorOpen])

  useEffect(() => {
    if (editorOpen) return
    const connection = (navigator as Navigator & {
      connection?: { readonly saveData?: boolean }
    }).connection
    if (connection?.saveData) return

    const idleWindow = window as typeof window & {
      cancelIdleCallback?: (id: number) => void
      requestIdleCallback?: (callback: () => void, options?: { timeout: number }) => number
    }
    let idleId: number | undefined
    const timeoutId = window.setTimeout(() => {
      if (idleWindow.requestIdleCallback != null) {
        idleId = idleWindow.requestIdleCallback(() => void loadEditor(), { timeout: 1800 })
        return
      }
      void loadEditor()
    }, 4000)
    return () => {
      window.clearTimeout(timeoutId)
      if (idleId != null) idleWindow.cancelIdleCallback?.(idleId)
    }
  }, [editorOpen])

  useEffect(() => {
    // Counterpart to the startInEditor effect further down: if Home's Root
    // mounts while the shared URL still points at an editor link (left
    // over from the Studio tab's own Root instance), clear it — Home
    // should always read as Home, in the URL too, not just on screen.
    if (startAtHome && isEditorLocation()) replaceLocation('', '')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const openEditor = useCallback((query: string) => {
    replaceLocation(query, EDITOR_HASH)
    setEditorOpen(true)
  }, [])

  const openRandomEditor = useCallback(() => {
    if (randomEditorOpeningRef.current) return
    randomEditorOpeningRef.current = true

    void import('./avatarSeed')
      .then(({ AVATAR_SEED_FIELDS, createRandomAvatarSeed, serializeAvatarSeedFields }) => {
        openEditor(createRandomAvatarEditorQuery(
          createRandomAvatarSeed(),
          serializeAvatarSeedFields(AVATAR_SEED_FIELDS)
        ))
      })
      .catch(() => {
        randomEditorOpeningRef.current = false
      })
  }, [openEditor])

  useEffect(() => {
    // startInEditor got us into "editor" state immediately, but if there's
    // no actual template/seed in the URL yet (a fresh "Studio" tab click,
    // not a reload of an existing editor link), the editor has nothing to
    // show — give it a random avatar, the same way "Surprise me" does.
    if (startInEditor && !isEditorLocation()) openRandomEditor()
    // Intentionally only on mount: startInEditor is a one-time "how did we
    // get here" signal, not something that should re-trigger later.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const openHome = useCallback(() => {
    if (window.location.search.length > 1) {
      try {
        window.localStorage.setItem(LAST_EDITOR_QUERY_STORAGE_KEY, window.location.search)
      } catch {
        // Navigation should continue even if storage is unavailable.
      }
    }
    replaceLocation('', '')
    setEditorOpen(false)
  }, [])

  if (editorOpen) {
    return (
      <Suspense fallback={<div className='avatar-home-loading' aria-label={t('Opening editor')}><i /><i /></div>}>
        <AvatarEditor onHome={openHome} />
      </Suspense>
    )
  }

  return (
    <HomePage
      onCreate={template => openEditor(`?template=${template}`)}
      onCreateBreed={(entity, breed) => {
        const params = new URLSearchParams({ entity, breed })
        openEditor(`?${params.toString()}`)
      }}
      onCreateEffectStyle={(entity, effectStyle) => {
        const params = new URLSearchParams({ effectStyle: String(effectStyle), template: String(entity) })
        openEditor(`?${params.toString()}`)
      }}
      onSurprise={openRandomEditor}
      onPrepareEditor={() => void loadEditor()}
      onOpenCompanion={onOpenCompanion}
    />
  )
}

export default Root

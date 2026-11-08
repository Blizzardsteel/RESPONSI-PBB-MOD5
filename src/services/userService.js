// ---------------------------------------------------------------------------
// User profile / identity — stored in localStorage
// ---------------------------------------------------------------------------

const USER_PROFILE_KEY = 'bookvault_user_profile'

const DEFAULT_PROFILE = {
  name: 'Kevin Novantino Hindiarto',
  nim: '21120124140109',
  kelompok: '27',
  username: 'Kevin',
  bio: '',
  avatar: null,
}

export const getUserProfile = () => {
  try {
    const raw = localStorage.getItem(USER_PROFILE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      // Always ensure identity fields are present
      return {
        ...DEFAULT_PROFILE,
        ...parsed,
        name: DEFAULT_PROFILE.name,
        nim: DEFAULT_PROFILE.nim,
        kelompok: DEFAULT_PROFILE.kelompok,
      }
    }
  } catch {
    /* corrupted — fall through */
  }
  return { ...DEFAULT_PROFILE }
}

export const saveUserProfile = (profile) => {
  try {
    const data = {
      ...profile,
      name: DEFAULT_PROFILE.name,
      nim: DEFAULT_PROFILE.nim,
      kelompok: DEFAULT_PROFILE.kelompok,
      updatedAt: new Date().toISOString(),
    }
    localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(data))
    return { success: true, data }
  } catch (err) {
    return { success: false, message: err.message }
  }
}

export const updateAvatar = (avatarBase64) => {
  const profile = getUserProfile()
  profile.avatar = avatarBase64
  return saveUserProfile(profile)
}

export default {
  getUserProfile,
  saveUserProfile,
  updateAvatar,
}

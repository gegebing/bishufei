import type { UserInfo, UserRole } from '@/api'
/*
 * 用户状态:登录态、当前角色、资料与资质
 */
import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', () => {
  const token = ref('')
  const userInfo = ref<UserInfo | null>(null)
  /** 当前身份(首页/接单广场随其切换内容) */
  const role = ref<UserRole>('pilot')

  const isLogin = computed(() => !!token.value)
  const hasLicense = computed(() => !!userInfo.value?.licenseNo)

  function setLogin(t: string, info: UserInfo) {
    token.value = t
    userInfo.value = info
  }

  function setProfile(info: UserInfo) {
    userInfo.value = info
  }

  function setRole(r: UserRole) {
    role.value = r
  }

  function logout() {
    token.value = ''
    userInfo.value = null
  }

  return { token, userInfo, role, isLogin, hasLicense, setLogin, setProfile, setRole, logout }
})

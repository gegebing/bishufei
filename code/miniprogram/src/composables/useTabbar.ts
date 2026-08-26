export interface TabbarItem {
  name: string
  value?: number
  active: boolean
  title: string
  icon: string
}

// 毕数飞行平台 TabBar(5 项一级入口,与 UI 设计规范一致)
const tabbarItems = ref<TabbarItem[]>([
  { name: 'home', active: true, title: '首页', icon: 'home' },
  { name: 'orders', active: false, title: '接单广场', icon: 'compass' },
  { name: 'learn', active: false, title: '学习中心', icon: 'book' },
  { name: 'mall', active: false, title: '装备商城', icon: 'store' },
  { name: 'mine', active: false, title: '我的', icon: 'user' },
])

export function useTabbar() {
  const tabbarList = computed(() => tabbarItems.value)

  const activeTabbar = computed(() => {
    const item = tabbarItems.value.find(item => item.active)
    return item || tabbarItems.value[0]
  })

  const getTabbarItemValue = (name: string) => {
    const item = tabbarItems.value.find(item => item.name === name)
    return item?.value
  }

  const setTabbarItem = (name: string, value: number) => {
    const tabbarItem = tabbarItems.value.find(item => item.name === name)
    if (tabbarItem) {
      tabbarItem.value = value
    }
  }

  const setTabbarItemActive = (name: string) => {
    tabbarItems.value.forEach((item) => {
      if (item.name === name) {
        item.active = true
      }
      else {
        item.active = false
      }
    })
  }

  return {
    tabbarList,
    activeTabbar,
    getTabbarItemValue,
    setTabbarItem,
    setTabbarItemActive,
  }
}

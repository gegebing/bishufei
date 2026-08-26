<script setup lang="ts">
import type { Order, UserRole } from '@/api'
import { apiGetRecommendOrders, apiGetTodo } from '@/api'
import { useUserStore } from '@/store/userStore'

definePage({
  name: 'home',
  type: 'home',
  layout: 'tabbar',
  style: {
    navigationBarTitleText: '毕数飞行平台',
  },
})

const router = useRouter()
const userStore = useUserStore()

function toast(title: string) {
  uni.showToast({ title, icon: 'none' })
}

/* ===== 身份切换 ===== */
const roles: { key: UserRole, label: string }[] = [
  { key: 'pilot', label: '我是飞手(接单)' },
  { key: 'client', label: '我是客户(发单)' },
  { key: 'student', label: '我是学员(培训)' },
]

function switchRole(role: UserRole) {
  if (userStore.role === role)
    return
  userStore.setRole(role)
}

/* ===== 角色化待办 ===== */
const todo = ref<any>(null)

async function fetchTodo(role: string) {
  try {
    const res = await apiGetTodo(role)
    todo.value = res.data
  }
  catch {
    // mock 异常时保持空态,不阻塞首页
  }
}

watch(() => userStore.role, role => fetchTodo(role))

/** 一级 Tab 路由名 */
const TAB_NAMES = ['home', 'orders', 'learn', 'mall', 'mine']

function onTodoAction() {
  const target = todo.value?.actionTarget
  if (!target)
    return
  const targetStr = String(target)
  if (targetStr.startsWith('ORD')) {
    router.push({ name: 'order-detail', query: { id: targetStr } })
  }
  else if (TAB_NAMES.includes(targetStr)) {
    router.pushTab({ name: targetStr })
  }
  else {
    router.push({ name: targetStr })
  }
}

/* ===== 金刚区 ===== */
interface GridMenu {
  key: string
  label: string
  icon: string
  fg: string
  bgA: string
  bgB: string
  action: { kind: 'tab', name: string } | { kind: 'route', name: string } | { kind: 'toast', text: string } | { kind: 'contact' }
}

const gridMenus: GridMenu[] = [
  { key: 'orders', label: '接单广场', icon: 'compass', fg: '#1677FF', bgA: '#DCEAFF', bgB: '#F2F8FF', action: { kind: 'tab', name: 'orders' } },
  { key: 'publish', label: '发布需求', icon: 'send', fg: '#F56A00', bgA: '#FFE8CF', bgB: '#FFF6EC', action: { kind: 'tab', name: 'orders' } },
  { key: 'caac', label: 'CAAC考证', icon: 'idcard', fg: '#B27B00', bgA: '#FFF0C2', bgB: '#FFFAE8', action: { kind: 'tab', name: 'learn' } },
  { key: 'skill', label: '技能培训', icon: 'book', fg: '#00A06B', bgA: '#CFF5E4', bgB: '#EFFCF5', action: { kind: 'tab', name: 'learn' } },
  { key: 'mall', label: '装备商城', icon: 'store', fg: '#722ED1', bgA: '#E9DFFB', bgB: '#F7F3FE', action: { kind: 'tab', name: 'mall' } },
  { key: 'check', label: '官方验机', icon: 'safe', fg: '#0E9E9E', bgA: '#C9F2F2', bgB: '#EBFBFB', action: { kind: 'tab', name: 'mall' } },
  { key: 'repair', label: '维修服务', icon: 'tool', fg: '#D62E8C', bgA: '#FBDCEF', bgB: '#FDF0F8', action: { kind: 'route', name: 'repair-apply' } },
  { key: 'kf', label: '在线客服', icon: 'headset', fg: '#46A018', bgA: '#DCF5CE', bgB: '#F2FBEA', action: { kind: 'contact' } },
]

function onGridTap(item: GridMenu) {
  if (item.action.kind === 'tab')
    router.pushTab({ name: item.action.name })
  else if (item.action.kind === 'route')
    router.push({ name: item.action.name })
  else if (item.action.kind === 'toast')
    toast(item.action.text)
}

/* ===== 推荐订单 ===== */
const recommendOrders = ref<Order[]>([])

async function fetchRecommend() {
  try {
    const res = await apiGetRecommendOrders()
    recommendOrders.value = res.data || []
  }
  catch {
    recommendOrders.value = []
  }
}

function goOrderDetail(order: Order) {
  router.push({ name: 'order-detail', query: { id: order.id } })
}

onMounted(() => {
  fetchTodo(userStore.role)
  fetchRecommend()
})
</script>

<template>
  <view class="bs-page home-page">
    <!-- 云端晴空 Hero -->
    <view class="hero bs-sky-hero">
      <view class="hh-top">
        <view class="city">
          <wd-icon name="location" size="28rpx" color="#fff" />
          <text>成都市</text>
        </view>
        <wd-icon name="notification" size="38rpx" color="#fff" @click="toast('暂无新系统通知')" />
      </view>
      <view class="hh-brand">
        BISSU FLIGHT · 低空飞行服务生态
      </view>
      <view class="search" @click="router.pushTab({ name: 'orders' })">
        <wd-icon name="search-line" size="30rpx" color="rgba(255, 255, 255, 0.9)" />
        <text class="search-text">
          搜索航拍、电力巡检、植保订单或课程...
        </text>
      </view>
      <view class="role-switcher">
        <view
          v-for="r in roles" :key="r.key" class="role-btn"
          :class="{ 'role-btn--active': userStore.role === r.key }" @click="switchRole(r.key)"
        >
          {{ r.label }}
        </view>
      </view>
    </view>

    <!-- 角色化待办浮卡 -->
    <view class="todo-card">
      <view class="todo-head">
        <view class="todo-title">
          <wd-icon name="thunderbolt" size="26rpx" color="#FF7A00" />
          <text>{{ todo?.title || '飞手任务待办' }}</text>
        </view>
        <text
          v-if="todo?.badge" class="bs-badge"
          :class="userStore.role === 'student' ? 'bs-badge--primary' : 'bs-badge--warning'"
        >
          {{ todo.badge }}
        </text>
      </view>
      <view class="todo-body">
        {{ todo?.content || '今日暂无待办事项' }}
      </view>
      <view class="todo-foot">
        <view class="todo-hint" :class="`todo-hint--${todo?.hintType || 'warn'}`">
          {{ todo?.hint || '' }}
        </view>
        <view
          v-if="todo?.actionText" class="todo-btn"
          :class="{ 'todo-btn--accent': userStore.role === 'client' }" @click="onTodoAction"
        >
          {{ todo.actionText }}
        </view>
      </view>
    </view>

    <!-- 金刚区 8 宫格 -->
    <view class="bs-card grid-card">
      <view class="grid-menu">
        <template v-for="item in gridMenus" :key="item.key">
          <button v-if="item.action.kind === 'contact'" class="grid-item grid-btn" open-type="contact">
            <view class="grid-icon" :style="{ background: `linear-gradient(145deg, ${item.bgA}, ${item.bgB})` }">
              <wd-icon :name="item.icon" size="40rpx" :color="item.fg" />
            </view>
            <text class="grid-label">
              {{ item.label }}
            </text>
          </button>
          <view v-else class="grid-item" @click="onGridTap(item)">
            <view class="grid-icon" :style="{ background: `linear-gradient(145deg, ${item.bgA}, ${item.bgB})` }">
              <wd-icon :name="item.icon" size="40rpx" :color="item.fg" />
            </view>
            <text class="grid-label">
              {{ item.label }}
            </text>
          </view>
        </template>
      </view>
    </view>

    <!-- CAAC 成长 Banner -->
    <view class="banner-card" hover-class="banner-card--hover" @click="toast('技能班结业立享 ¥800 专属补贴券,考证班报名可抵扣')">
      <view class="banner-kicker">
        学员专属成长通道
      </view>
      <view class="banner-title">
        考取民航 CAAC 执照 · 解锁合规接单
      </view>
      <view class="banner-sub">
        技能班结业立享 <text class="banner-amount bs-num">
          ¥800
        </text> 专属补贴券
        <wd-icon name="arrow-right" size="20rpx" color="rgba(255, 255, 255, 0.85)" />
      </view>
    </view>

    <!-- 推荐任务订单 -->
    <view class="section-head">
      <view class="section-title">
        推荐任务订单
      </view>
      <view class="section-link" @click="router.pushTab({ name: 'orders' })">
        查看全部 (28)
        <wd-icon name="arrow-right" size="20rpx" color="#1677FF" />
      </view>
    </view>

    <OrderCard
      v-for="order in recommendOrders" :key="order.id" :order="order" action-text="查看抢单"
      @click="goOrderDetail" @action="goOrderDetail"
    />
    <view v-if="!recommendOrders.length" class="empty-tip">
      正在加载推荐订单...
    </view>
  </view>
</template>

<style lang="scss" scoped>
/* ===== Hero ===== */
.hero {
  padding: 24rpx 32rpx 80rpx;
  border-bottom-left-radius: 56rpx;
  border-bottom-right-radius: 56rpx;
}

.hh-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.city {
  display: flex;
  align-items: center;
  gap: 8rpx;
  font-size: 28rpx;
  font-weight: 600;
}

.hh-brand {
  font-size: 20rpx;
  letter-spacing: 0.22em;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.72);
  margin-bottom: 20rpx;
}

.search {
  display: flex;
  align-items: center;
  gap: 12rpx;
  background: rgba(255, 255, 255, 0.16);
  border: 1rpx solid rgba(255, 255, 255, 0.28);
  border-radius: var(--bs-radius-full);
  padding: 16rpx 28rpx;
  margin-bottom: 24rpx;
}

.search-text {
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.92);
}

.role-switcher {
  display: flex;
  background: rgba(8, 30, 70, 0.28);
  border: 1rpx solid rgba(255, 255, 255, 0.2);
  border-radius: var(--bs-radius-full);
  padding: 6rpx;
}

.role-btn {
  flex: 1;
  text-align: center;
  padding: 12rpx 0;
  font-size: 24rpx;
  border-radius: var(--bs-radius-full);
  color: rgba(255, 255, 255, 0.85);
  transition: all 0.25s;
}

.role-btn--active {
  background: #fff;
  color: var(--bs-brand-primary-deep);
  font-weight: 600;
  box-shadow: 0 6rpx 20rpx rgba(3, 20, 50, 0.28);
}

/* ===== 待办浮卡 ===== */
.todo-card {
  position: relative;
  z-index: 2;
  background: var(--bs-bg-card);
  border-radius: var(--bs-radius-xl);
  padding: 24rpx 28rpx 24rpx 34rpx;
  margin: -56rpx 32rpx 24rpx;
  box-shadow: var(--bs-shadow-float);
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 8rpx;
    background: var(--bs-brand-gradient);
  }
}

.todo-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10rpx;
}

.todo-title {
  display: flex;
  align-items: center;
  gap: 8rpx;
  font-size: 26rpx;
  font-weight: 600;
  color: var(--bs-text-primary);
}

.todo-body {
  font-size: 24rpx;
  color: var(--bs-text-secondary);
  line-height: 1.55;
}

.todo-foot {
  margin-top: 12rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16rpx;
}

.todo-hint {
  font-size: 22rpx;
  flex: 1;
}

.todo-hint--warn {
  color: #D96A00;
}

.todo-hint--info {
  color: var(--bs-brand-primary);
}

.todo-hint--ok {
  color: var(--bs-success);
}

.todo-btn {
  flex-shrink: 0;
  background: linear-gradient(135deg, #1677FF 0%, #00A6FF 100%);
  color: #fff;
  font-size: 24rpx;
  font-weight: 600;
  padding: 10rpx 26rpx;
  border-radius: var(--bs-radius-full);
  box-shadow: 0 8rpx 20rpx rgba(22, 119, 255, 0.3);
}

.todo-btn--accent {
  background: linear-gradient(135deg, #FF9433 0%, #FF7A00 55%, #F56A00 100%);
  box-shadow: 0 8rpx 20rpx rgba(255, 122, 0, 0.3);
}

/* ===== 金刚区 ===== */
.grid-card {
  padding: 28rpx 16rpx 16rpx;
}

.grid-menu {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 28rpx 12rpx;
}

.grid-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12rpx;
  text-align: center;
}

.grid-btn {
  background: none;
  padding: 0;
  margin: 0;
  line-height: 1.4;
  font-size: inherit;

  &::after {
    border: none;
  }
}

.grid-icon {
  width: 96rpx;
  height: 96rpx;
  border-radius: 32rpx;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: inset 0 2rpx 0 rgba(255, 255, 255, 0.65), 0 8rpx 20rpx rgba(15, 42, 90, 0.07);
}

.grid-label {
  font-size: 24rpx;
  color: var(--bs-text-secondary);
}

/* ===== Banner ===== */
.banner-card {
  margin: 0 32rpx 28rpx;
  border-radius: var(--bs-radius-lg);
  background: linear-gradient(155deg, #14295C 0%, #1F3B7A 55%, #2B56A8 100%);
  color: #fff;
  padding: 30rpx 32rpx;
  box-shadow: var(--bs-shadow-float);
}

.banner-card--hover {
  opacity: 0.92;
}

.banner-kicker {
  font-size: 22rpx;
  color: #9FC4FF;
  letter-spacing: 0.06em;
}

.banner-title {
  font-size: 32rpx;
  font-weight: 700;
  margin: 10rpx 0 8rpx;
}

.banner-sub {
  display: flex;
  align-items: center;
  gap: 8rpx;
  font-size: 22rpx;
  opacity: 0.85;
}

.banner-amount {
  color: #FFD591;
  font-weight: 700;
}

/* ===== 推荐区块 ===== */
.section-head {
  padding: 4rpx 32rpx 20rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.section-title {
  position: relative;
  font-size: 32rpx;
  font-weight: 700;
  color: var(--bs-text-primary);
  padding-left: 20rpx;

  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 8rpx;
    bottom: 8rpx;
    width: 8rpx;
    border-radius: 4rpx;
    background: var(--bs-brand-gradient);
  }
}

.section-link {
  display: flex;
  align-items: center;
  gap: 4rpx;
  font-size: 24rpx;
  color: var(--bs-brand-primary);
}

.empty-tip {
  text-align: center;
  font-size: 24rpx;
  color: var(--bs-text-tertiary);
  padding: 40rpx 0;
}
</style>

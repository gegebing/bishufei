<script setup lang="ts">
import type { UserInfo } from '@/api'
import { apiGetProfile } from '@/api'
import { useUserStore } from '@/store/userStore'

definePage({
  name: 'mine',
  layout: 'tabbar',
  style: {
    navigationBarTitleText: '我的',
  },
})

const router = useRouter()
const userStore = useUserStore()

const profile = ref<UserInfo | null>(null)

async function fetchProfile() {
  try {
    const res = await apiGetProfile()
    profile.value = res.data
    userStore.setProfile(res.data)
  }
  catch {
    // mock 异常时展示占位数据
  }
}

/* 信用分圆环进度(满分 100) */
const creditRingStyle = computed(() => {
  const score = Math.min(profile.value?.creditScore ?? 98, 100)
  const deg = Math.round(score * 3.6)
  return { background: `conic-gradient(#00B578 0 ${deg}deg, #E6F4EE ${deg}deg 360deg)` }
})

function toast(title: string) {
  uni.showToast({ title, icon: 'none' })
}

interface MenuItem {
  key: string
  icon: string
  color: string
  label: string
  action: { kind: 'route', name: string } | { kind: 'toast', text: string } | { kind: 'contact' }
}

const menus: MenuItem[] = [
  { key: 'kf', icon: 'headset', color: '#07C160', label: '微信小程序官方客服', action: { kind: 'contact' } },
  { key: 'contract', icon: 'file', color: '#1677FF', label: '电子服务合同存证', action: { kind: 'toast', text: '电子合同存证中心' } },
  { key: 'repair', icon: 'tool', color: '#D62E8C', label: '维修工单进度跟踪', action: { kind: 'route', name: 'repair-order' } },
  { key: 'subsidy', icon: 'gift', color: '#00B578', label: '人社证书补贴申请', action: { kind: 'route', name: 'caac-subsidy' } },
  { key: 'appeal', icon: 'safe', color: '#F56A00', label: '信用分与防跳单申诉', action: { kind: 'toast', text: '信用申诉与保证金管理' } },
]

function onMenuTap(item: MenuItem) {
  if (item.action.kind === 'route')
    router.push({ name: item.action.name })
  else if (item.action.kind === 'toast')
    toast(item.action.text)
}

onMounted(fetchProfile)
</script>

<template>
  <view class="bs-page mine-page">
    <!-- 资料头 -->
    <view class="mine-hero bs-sky-hero">
      <view class="mine-row">
        <view class="avatar-ring">
          <wd-icon name="user" size="52rpx" color="#fff" />
        </view>
        <view class="mine-main">
          <view class="mine-name">
            <text>{{ profile?.nickname || '王建军' }}</text>
            <text class="bs-badge bs-badge--gold">
              <wd-icon name="check-circle-fill" size="20rpx" color="#6D4C00" />
              民航CAAC认证
            </text>
          </view>
          <view class="mine-license bs-num">
            执照编号:{{ profile?.licenseNo || 'CAAC-UAV-2026089912' }}
          </view>
          <view class="mine-crew">
            所属机组:{{ profile?.crew || '都都市天府低空巡检一组(机长)' }}
          </view>
        </view>
      </view>
    </view>

    <!-- 资产与信用 -->
    <view class="bs-card asset-card">
      <view class="asset-credit">
        <view class="credit-ring" :style="creditRingStyle">
          <view class="credit-ring-inner">
            <text class="credit-num bs-num">
              {{ profile?.creditScore ?? 98 }}
            </text>
            <text class="credit-label">
              信用分
            </text>
          </view>
        </view>
        <view class="asset-label">
          平台履约信用
        </view>
      </view>
      <view class="asset-sep" />
      <view class="asset-item">
        <view class="asset-num asset-num--up bs-num">
          ¥{{ (profile?.totalIncome ?? 14250).toLocaleString() }}
        </view>
        <view class="asset-label">
          接单总收益(已提现)
        </view>
      </view>
      <view class="asset-sep" />
      <view class="asset-item">
        <view class="asset-num asset-num--plain bs-num">
          ¥{{ (profile?.deposit ?? 1000).toLocaleString() }}
        </view>
        <view class="asset-label">
          履约保证金(已缴纳)
        </view>
      </view>
    </view>

    <!-- 资质资产 -->
    <view class="bs-card">
      <view class="qual-title">
        我的飞手资质与装备资产
      </view>
      <view class="qual-list">
        <view class="qual-row">
          <view class="qual-name">
            <wd-icon name="idcard" size="30rpx" color="#1677FF" />
            <text>CAAC 超视距驾驶员执照</text>
          </view>
          <text class="qual-val qual-val--ok">
            已核验有效
          </text>
        </view>
        <view class="qual-row">
          <view class="qual-name">
            <wd-icon name="send" size="30rpx" color="#00B578" />
            <text>UOM 实名登记设备 (DJI M300)</text>
          </view>
          <text class="qual-val qual-val--info bs-num">
            SN: 1581F4...
          </text>
        </view>
        <view class="qual-row">
          <view class="qual-name">
            <wd-icon name="safe" size="30rpx" color="#722ED1" />
            <text>平台强制保险 (随单自动附加)</text>
          </view>
          <text class="qual-val qual-val--ok">
            三者险100万+机身险
          </text>
        </view>
      </view>
    </view>

    <!-- 功能菜单 -->
    <view class="bs-card menu-list">
      <template v-for="item in menus" :key="item.key">
        <button v-if="item.action.kind === 'contact'" class="menu-row menu-btn" open-type="contact">
          <view class="menu-label">
            <wd-icon :name="item.icon" size="34rpx" :color="item.color" />
            <text>{{ item.label }}</text>
          </view>
          <wd-icon name="arrow-right" size="24rpx" color="#8C8C8C" />
        </button>
        <view v-else class="menu-row" hover-class="menu-row--hover" @click="onMenuTap(item)">
          <view class="menu-label">
            <wd-icon :name="item.icon" size="34rpx" :color="item.color" />
            <text>{{ item.label }}</text>
          </view>
          <wd-icon name="arrow-right" size="24rpx" color="#8C8C8C" />
        </view>
      </template>
    </view>
  </view>
</template>

<style lang="scss" scoped>
/* ===== 资料头 ===== */
.mine-hero {
  padding: 32rpx 32rpx 92rpx;
  border-bottom-left-radius: 56rpx;
  border-bottom-right-radius: 56rpx;
}

.mine-row {
  display: flex;
  align-items: center;
  gap: 28rpx;
}

.avatar-ring {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  border: 3rpx solid rgba(255, 255, 255, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 8rpx 28rpx rgba(3, 20, 50, 0.25), inset 0 2rpx 0 rgba(255, 255, 255, 0.3);
}

.mine-main {
  flex: 1;
  min-width: 0;
}

.mine-name {
  display: flex;
  align-items: center;
  gap: 12rpx;
  font-size: 34rpx;
  font-weight: 700;
}

.mine-license {
  font-size: 24rpx;
  opacity: 0.88;
  margin-top: 8rpx;
}

.mine-crew {
  font-size: 22rpx;
  opacity: 0.78;
  margin-top: 4rpx;
}

/* ===== 资产卡 ===== */
.asset-card {
  margin: -64rpx 32rpx 28rpx;
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 32rpx 24rpx;
}

.asset-credit {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12rpx;
}

.credit-ring {
  width: 124rpx;
  height: 124rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 24rpx rgba(0, 181, 120, 0.22);
}

.credit-ring-inner {
  width: 96rpx;
  height: 96rpx;
  border-radius: 50%;
  background: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  line-height: 1;
}

.credit-num {
  font-size: 36rpx;
  font-weight: 700;
  color: var(--bs-brand-teal);
}

.credit-label {
  font-size: 18rpx;
  color: var(--bs-text-tertiary);
  margin-top: 4rpx;
}

.asset-item {
  text-align: center;
}

.asset-num {
  font-size: 38rpx;
  font-weight: 700;
}

.asset-num--up {
  color: var(--bs-brand-primary);
}

.asset-num--plain {
  color: var(--bs-text-primary);
}

.asset-label {
  font-size: 22rpx;
  color: var(--bs-text-tertiary);
  margin-top: 6rpx;
}

.asset-sep {
  width: 2rpx;
  align-self: stretch;
  background: var(--bs-divider);
}

/* ===== 资质列表 ===== */
.qual-title {
  font-size: 28rpx;
  font-weight: 700;
  color: var(--bs-text-primary);
  margin-bottom: 24rpx;
}

.qual-list {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.qual-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16rpx;
}

.qual-name {
  display: flex;
  align-items: center;
  gap: 14rpx;
  font-size: 26rpx;
  color: var(--bs-text-primary);
}

.qual-val {
  font-size: 24rpx;
  font-weight: 500;
  white-space: nowrap;
}

.qual-val--ok {
  color: var(--bs-success);
}

.qual-val--info {
  color: var(--bs-brand-primary);
}

/* ===== 功能菜单 ===== */
.menu-list {
  padding-top: 4rpx;
  padding-bottom: 4rpx;
}

.menu-row {
  padding: 28rpx 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 28rpx;
  color: var(--bs-text-primary);
  border-bottom: 2rpx solid var(--bs-divider);

  &:last-child {
    border-bottom: none;
  }
}

.menu-row--hover {
  opacity: 0.6;
}

.menu-btn {
  background: none;
  padding: 28rpx 0;
  margin: 0;
  line-height: 1.4;
  font-size: 28rpx;
  text-align: left;
  width: 100%;

  &::after {
    border: none;
  }
}

.menu-label {
  display: flex;
  align-items: center;
  gap: 16rpx;
}
</style>

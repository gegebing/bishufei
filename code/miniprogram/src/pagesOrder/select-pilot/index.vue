<script setup lang="ts">
/**
 * 收到的接单申请 · 需求方选飞手
 * 多维对比:执照等级/信用分/完成单量/好评率/响应速度,选定后推送电子合同
 */
import type { PilotApp } from '@/api'
import { apiChoosePilot, apiGetPilotApps } from '@/api'

definePage({
  name: 'select-pilot',
  style: { navigationBarTitleText: '收到的接单申请' },
})

const apps = ref<PilotApp[]>([])
const chosen = ref('')
const choosing = ref(false)

onMounted(async () => {
  const res = await apiGetPilotApps()
  if (res.code === 2000)
    apps.value = res.data || []
})

async function choose(p: PilotApp) {
  if (!p || (chosen.value && chosen.value !== p.name) || choosing.value)
    return
  choosing.value = true
  try {
    const res = await apiChoosePilot('ORD20260825004', p.name)
    uni.showToast({ title: res.msg || `已选定 ${p.name},电子合同已推送`, icon: 'none' })
    if (res.code === 2000)
      chosen.value = p.name
  }
  finally {
    choosing.value = false
  }
}
</script>

<template>
  <view class="bs-page sp-page">
    <!-- 务务摘要 -->
    <view class="task-box">
      <view class="task-title">
        务务:简阳市 500 亩水稻飞防植保
      </view>
      <view class="task-sub">
        预算 ¥6,400 · 定金将托管至平台监管账户 · 建议优先选择「超视距执照 + 高信用」飞手
      </view>
    </view>

    <!-- 申请飞手卡片 -->
    <view
      v-for="p in apps" :key="p.name"
      class="bs-card pilot-card" :class="{ 'pilot-card--chosen': chosen === p.name }"
    >
      <view class="pilot-head">
        <view class="pilot-avatar">
          👨‍✈️
        </view>
        <view class="pilot-info">
          <view class="pilot-name">
            {{ p.name }}
            <text class="bs-badge" :class="p.license.includes('超视距') ? 'bs-badge--gold' : 'bs-badge--default'">
              {{ p.license }}
            </text>
          </view>
          <view class="pilot-org">
            {{ p.org }} · 申请于 {{ p.appliedAt }}
          </view>
        </view>
        <view class="pilot-quote bs-num">
          <text class="cur">
            ¥
          </text>{{ p.quote.toLocaleString() }}
        </view>
      </view>

      <view class="pilot-stats">
        <view class="stat">
          <text class="stat-num bs-num">
            {{ p.creditScore }}
          </text>
          <text class="stat-label">
            信用分
          </text>
        </view>
        <view class="stat">
          <text class="stat-num bs-num">
            {{ p.finishedOrders }}
          </text>
          <text class="stat-label">
            完成单量
          </text>
        </view>
        <view class="stat">
          <text class="stat-num bs-num">
            {{ p.praiseRate }}
          </text>
          <text class="stat-label">
            好评率
          </text>
        </view>
        <view class="stat">
          <text class="stat-num bs-num">
            {{ p.responseTime }}
          </text>
          <text class="stat-label">
            响应速度
          </text>
        </view>
      </view>

      <view class="pilot-foot">
        <text class="foot-note">
          保证金已缴 · CAAC 执照已核验
        </text>
        <view
          class="choose-btn"
          :class="{ 'choose-btn--disabled': chosen && chosen !== p.name, 'choose-btn--done': chosen === p.name }"
          @click="choose(p)"
        >
          {{ chosen === p.name ? '已选定 ✓' : '选择 TA' }}
        </view>
      </view>
    </view>

    <view class="page-note">
      选定后将推送电子服务合同,需求方支付定金后订单生效;其余申请自动礼貌回绝。
    </view>
  </view>
</template>

<style lang="scss" scoped>
.sp-page {
  min-height: 100vh;
}

.task-box {
  background: linear-gradient(180deg, #F0F7FF, #F7FBFF);
  border: 1rpx dashed rgba(22, 119, 255, 0.45);
  border-radius: var(--bs-radius-lg);
  margin: 24rpx 32rpx;
  padding: 22rpx 26rpx;
}

.task-title {
  font-size: 27rpx;
  font-weight: 700;
  color: var(--bs-brand-primary);
  margin-bottom: 8rpx;
}

.task-sub {
  font-size: 22rpx;
  color: var(--bs-text-secondary);
  line-height: 1.6;
}

.pilot-card--chosen {
  outline: 4rpx solid rgba(22, 119, 255, 0.55);
  outline-offset: -4rpx;
}

.pilot-head {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.pilot-avatar {
  width: 88rpx;
  height: 88rpx;
  border-radius: 50%;
  background: linear-gradient(145deg, #1677FF, #69B4FF);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40rpx;
  flex-shrink: 0;
  box-shadow: inset 0 2rpx 0 rgba(255, 255, 255, 0.35), 0 8rpx 20rpx rgba(15, 42, 90, 0.15);
}

.pilot-info {
  flex: 1;
  min-width: 0;
}

.pilot-name {
  display: flex;
  align-items: center;
  gap: 12rpx;
  font-size: 28rpx;
  font-weight: 700;
  color: var(--bs-text-primary);
}

.pilot-org {
  font-size: 21rpx;
  color: var(--bs-text-tertiary);
  margin-top: 6rpx;
}

.pilot-quote {
  font-size: 34rpx;
  font-weight: 700;
  color: var(--bs-brand-accent);
  flex-shrink: 0;

  .cur {
    font-size: 22rpx;
  }
}

/* 四维数据 */
.pilot-stats {
  display: flex;
  background: var(--bs-divider);
  border-radius: var(--bs-radius-md);
  padding: 16rpx 0;
  margin-top: 20rpx;
}

.stat {
  flex: 1;
  text-align: center;

  &+ .stat {
    border-left: 2rpx solid var(--bs-bg-card);
  }
}

.stat-num {
  display: block;
  font-size: 27rpx;
  font-weight: 700;
  color: var(--bs-text-primary);
}

.stat-label {
  font-size: 19rpx;
  color: var(--bs-text-tertiary);
  margin-top: 4rpx;
}

/* 底部操作 */
.pilot-foot {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20rpx;
}

.foot-note {
  font-size: 21rpx;
  color: var(--bs-text-tertiary);
}

.choose-btn {
  background: linear-gradient(135deg, #FF9433 0%, #FF7A00 55%, #F56A00 100%);
  color: #fff;
  font-size: 24rpx;
  font-weight: 600;
  padding: 12rpx 30rpx;
  border-radius: var(--bs-radius-full);
  box-shadow: 0 8rpx 20rpx rgba(255, 122, 0, 0.3);
}

.choose-btn--disabled {
  opacity: 0.45;
  box-shadow: none;
}

.choose-btn--done {
  background: linear-gradient(135deg, #00B578, #1FC98C);
  box-shadow: 0 8rpx 20rpx rgba(0, 181, 120, 0.3);
}

.page-note {
  text-align: center;
  font-size: 21rpx;
  color: var(--bs-text-tertiary);
  padding: 8rpx 32rpx 40rpx;
}
</style>

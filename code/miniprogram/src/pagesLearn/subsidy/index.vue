<script setup lang="ts">
/**
 * 人社证书补贴查询与申领(V3.0 4.2.5)
 * 地区切换匹配当地补贴标准,材料由平台自动汇总推送
 */
import { apiApplySubsidy } from '@/api'
import { useUserStore } from '@/store/userStore'

definePage({
  name: 'caac-subsidy',
  style: { navigationBarTitleText: '人社证书补贴' },
})

const userStore = useUserStore()

const subsidyDB: Record<string, { within: string, beyond: string, trainer: string, note: string }> = {
  成都市: { within: '1,500~2,000', beyond: '2,000~3,000', trainer: '3,000~5,000', note: '需成都社保或在蓉就业证明,取证后 12 个月内申领有效。' },
  绵阳市: { within: '1,200~1,800', beyond: '1,800~2,600', trainer: '2,600~4,500', note: '已纳入绵阳低空经济试点补贴目录,每季度集中受理。' },
  宜宾市: { within: '1,000~1,500', beyond: '1,500~2,200', trainer: '2,200~4,000', note: '需本地定点机构结业证书,与技能提升补贴不重复享受。' },
}
const cities = Object.keys(subsidyDB)
const city = ref('成都市')
const now = computed(() => subsidyDB[city.value])
const applying = ref(false)

async function apply() {
  if (applying.value)
    return
  applying.value = true
  try {
    const res = await apiApplySubsidy(userStore.userInfo?.licenseNo || 'CAAC-UAV-2026089912')
    uni.showToast({ title: res.msg || `${city.value}补贴申请已提交,预计可申领 ¥2,500`, icon: 'none' })
  }
  finally {
    applying.value = false
  }
}
</script>

<template>
  <view class="bs-page subsidy-page">
    <!-- 政策 Hero -->
    <view class="sub-hero">
      <view class="sh-kicker">
        人社部门 CAAC 证书补贴政策
      </view>
      <view class="sh-title">
        考取执照 · 最高可领 ¥5,000 补贴
      </view>
      <view class="sh-sub">
        支持个人自行申领或培训机构批量代办,审核通过后直达个人银行账户
      </view>
    </view>

    <!-- 地区切换 -->
    <view class="bs-card">
      <view class="sec-title">
        选择参保地,自动匹配当地标准
      </view>
      <view class="city-row">
        <text v-for="c in cities" :key="c" class="chip" :class="{ on: city === c }" @click="city = c">
          {{ c }}
        </text>
      </view>
      <view class="tier-row">
        <text>视距内驾驶员执照</text>
        <text class="tier-val bs-num">
          ¥{{ now.within }}
        </text>
      </view>
      <view class="tier-row">
        <text>超视距驾驶员执照</text>
        <text class="tier-val bs-num">
          ¥{{ now.beyond }}
        </text>
      </view>
      <view class="tier-row">
        <text>教员执照</text>
        <text class="tier-val bs-num">
          ¥{{ now.trainer }}
        </text>
      </view>
    </view>

    <!-- 申请要件 -->
    <view class="bs-card">
      <view class="sec-title">
        申请要件(平台代整理 · 一键推送)
      </view>
      <view class="doc-list">
        <view class="doc-item">
          ✓ CAAC 电子执照
        </view>
        <view class="doc-item">
          ✓ 身份证正反面
        </view>
        <view class="doc-item">
          ✓ 本人银行卡
        </view>
        <view class="doc-item">
          ✓ 平台缴费凭证
        </view>
      </view>
      <view class="policy-note">
        {{ now.note }}
      </view>
    </view>

    <!-- 吸底操作 -->
    <view class="bottom-bar">
      <view class="apply-btn" :class="{ 'apply-btn--disabled': applying }" @click="apply">
        {{ applying ? '提交中...' : '一键申领(材料自动汇总推送)' }}
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.subsidy-page {
  min-height: 100vh;
  padding-bottom: 220rpx;
}

.sub-hero {
  background: linear-gradient(150deg, #00875A 0%, #00B578 60%, #1FC98C 100%);
  color: #fff;
  padding: 44rpx 32rpx 52rpx;
  border-bottom-left-radius: 40rpx;
  border-bottom-right-radius: 40rpx;
}

.sh-kicker {
  font-size: 22rpx;
  opacity: 0.85;
  letter-spacing: 0.05em;
}

.sh-title {
  font-size: 36rpx;
  font-weight: 700;
  margin: 10rpx 0 8rpx;
}

.sh-sub {
  font-size: 22rpx;
  opacity: 0.85;
  line-height: 1.5;
}

.sec-title {
  font-size: 28rpx;
  font-weight: 700;
  color: var(--bs-text-primary);
  margin-bottom: 20rpx;
}

.city-row {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
  margin-bottom: 24rpx;
}

.chip {
  padding: 12rpx 28rpx;
  font-size: 24rpx;
  border-radius: var(--bs-radius-full);
  background: #fff;
  border: 1rpx solid var(--bs-border);
  color: var(--bs-text-secondary);
}

.chip.on {
  background: var(--bs-brand-primary);
  border-color: transparent;
  color: #fff;
  font-weight: 600;
  box-shadow: 0 8rpx 20rpx rgba(22, 119, 255, 0.3);
}

.tier-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(0, 181, 120, 0.06);
  border-radius: var(--bs-radius-md);
  padding: 20rpx 24rpx;
  font-size: 25rpx;
  color: var(--bs-text-primary);

  &+ .tier-row {
    margin-top: 14rpx;
  }
}

.tier-val {
  color: var(--bs-success);
  font-weight: 700;
}

.doc-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16rpx;
}

.doc-item {
  background: var(--bs-divider);
  border-radius: var(--bs-radius-md);
  padding: 18rpx 22rpx;
  font-size: 23rpx;
  color: var(--bs-text-primary);
}

.policy-note {
  margin-top: 20rpx;
  font-size: 21rpx;
  color: var(--bs-text-tertiary);
  line-height: 1.65;
}

.bottom-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  background: #fff;
  padding: 20rpx 32rpx calc(20rpx + env(safe-area-inset-bottom));
  box-shadow: 0 -4rpx 16rpx rgba(0, 0, 0, 0.05);
}

.apply-btn {
  height: 92rpx;
  border-radius: var(--bs-radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10rpx;
  font-size: 30rpx;
  font-weight: 600;
  color: #fff;
  background: linear-gradient(135deg, #1677FF 0%, #00A6FF 100%);
  box-shadow: 0 12rpx 28rpx rgba(22, 119, 255, 0.32);
}

.apply-btn--disabled {
  opacity: 0.55;
}
</style>

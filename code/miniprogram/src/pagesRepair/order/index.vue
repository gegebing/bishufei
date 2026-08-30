<script setup lang="ts">
/**
 * 维修工单详情(V3.0 4.5.4 进度跟踪 / 4.5.6 质保)
 * 六态进度:待检测 → 检测中 → 定方案 → 维修中 → 质检中 → 已完成
 */
import type { RepairInfo } from '@/api'
import { apiAcceptRepair, apiGetRepairOrder } from '@/api'

definePage({
  name: 'repair-order',
  style: { navigationBarTitleText: '维修工单详情' },
})

const order = ref<RepairInfo | null>(null)
const done = ref(false)
const accepting = ref(false)

const steps = ['待检测', '检测中', '定方案', '维修中', '质检中', '已完成']

function nodeState(index: number) {
  if (done.value || index < (order.value?.statusIndex ?? 0))
    return 'completed'
  if (index === (order.value?.statusIndex ?? 0))
    return 'active'
  return 'pending'
}

onLoad(async () => {
  const res = await apiGetRepairOrder()
  if (res?.data)
    order.value = res.data
})

async function accept() {
  if (!order.value || done.value || accepting.value)
    return
  accepting.value = true
  try {
    const res = await apiAcceptRepair(order.value.id)
    uni.showToast({ title: res.msg || '验收确认,质保已生效', icon: 'none' })
    if (res.code === 2000)
      done.value = true
  }
  finally {
    accepting.value = false
  }
}

/** 配件清单合计 */
function partsTotal() {
  return order.value?.parts.reduce((sum, p) => sum + p.price, 0) ?? 0
}
</script>

<template>
  <view class="bs-page ro-page">
    <template v-if="order">
      <!-- 工单头 + 六态进度 -->
      <view class="bs-card">
        <view class="ro-head">
          <view class="ro-title">
            工单 {{ order.id }}
          </view>
          <text class="bs-badge" :class="done ? 'bs-badge--success' : 'bs-badge--primary'">
            {{ done ? '已完成' : `${order.mode === 'mail' ? '寄修' : '上门'} · ${steps[order.statusIndex]}` }}
          </text>
        </view>
        <view class="ro-sub">
          承修:{{ order.vendor }} · 预付款 ¥{{ order.total }} 已托管
        </view>

        <!-- 紧凑六步进度条 -->
        <view class="stepper-compact">
          <template v-for="(s, i) in steps" :key="s">
            <view class="sc-node" :class="`sc-node--${nodeState(i)}`">
              <view class="sc-circle">
                <text v-if="nodeState(i) === 'completed'">
                  ✓
                </text>
                <text v-else>
                  {{ i + 1 }}
                </text>
              </view>
              <text class="sc-label">
                {{ s }}
              </text>
            </view>
            <view v-if="i < steps.length - 1" class="sc-link" :class="{ 'sc-link--done': nodeState(i) === 'completed' }" />
          </template>
        </view>

        <view class="status-box">
          <view class="status-row">
            <text>当前节点:</text>
            <text class="bs-badge bs-badge--primary">
              {{ done ? '已完成' : steps[order.statusIndex] }}
            </text>
          </view>
          <view class="status-desc">
            {{ order.faultDesc }};已完成图传模块拆检并按报价单完成换件,预计 08-27 质检通过后{{ order.mode === 'mail' ? '顺丰发回' : '上门交付' }}。
          </view>
        </view>
      </view>

      <!-- 更换配件清单 -->
      <view class="bs-card">
        <view class="sec-title">
          更换配件清单(与报价单一致)
        </view>
        <view v-for="p in order.parts" :key="p.name" class="part-row">
          <text>{{ p.name }}</text>
          <text class="part-price bs-num">
            ¥{{ p.price }}
          </text>
        </view>
        <view class="part-row part-total">
          <text>合计(平台托管 · 验收后结算)</text>
          <text class="part-price bs-num">
            ¥{{ partsTotal() }}
          </text>
        </view>
      </view>

      <!-- 维修影像存档 -->
      <view class="bs-card">
        <view class="sec-title">
          维修影像存档
        </view>
        <view class="photo-row">
          <view class="photo-item" style="background: linear-gradient(150deg, #5B6B84, #8296B3);">
            🔧
          </view>
          <view class="photo-item" style="background: linear-gradient(150deg, #1677FF, #69B4FF);">
            🔩
          </view>
          <view class="photo-item" style="background: linear-gradient(150deg, #00A06B, #5FE3B3);">
            📷
          </view>
        </view>
        <view class="photo-note">
          拆检 / 换件 / 复测三阶段照片已关联 UOM 设备档案(SN: {{ order.sn }}),二手交易时买家可查维修历史。
        </view>
      </view>

      <!-- 质保承诺 -->
      <view class="bs-card">
        <view class="warranty-row">
          <text>质保承诺:</text>
          <text class="bs-badge bs-badge--success">
            整机维修 · {{ order.warrantyDays }} 天质保
          </text>
        </view>
        <view class="warranty-note">
          质保期内同一故障免费返修,往返物流由维修商承担;争议由平台依据维修记录与配件溯源仲裁。
        </view>
      </view>

      <!-- 吸底操作 -->
      <view class="bottom-bar">
        <view class="accept-btn" :class="{ 'accept-btn--disabled': done || accepting }" @click="accept">
          {{ done ? '已完成验收 · 尾款已结算' : (accepting ? '结算中...' : '确认验收并结算') }}
        </view>
        <view class="bar-note" :class="{ ok: done }">
          {{ done ? '✓ 已解锁评价入口,维修记录已写入设备档案' : `验收确认后,托管款扣除平台佣金后 T+1 结算至维修商对公账户` }}
        </view>
      </view>
    </template>
  </view>
</template>

<style lang="scss" scoped>
.ro-page {
  min-height: 100vh;
  padding-bottom: 220rpx;
}

.ro-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.ro-title {
  font-size: 30rpx;
  font-weight: 700;
  color: var(--bs-text-primary);
}

.ro-sub {
  font-size: 22rpx;
  color: var(--bs-text-tertiary);
  margin: 10rpx 0 28rpx;
}

/* 紧凑六步进度条 */
.stepper-compact {
  display: flex;
  align-items: flex-start;
  margin-bottom: 28rpx;
}

.sc-node {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
  width: 84rpx;
  flex-shrink: 0;
  text-align: center;
}

.sc-circle {
  width: 44rpx;
  height: 44rpx;
  border-radius: 50%;
  background: #fff;
  border: 3rpx solid var(--bs-border);
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: 600;
  font-size: 19rpx;
  color: var(--bs-text-secondary);
  box-sizing: border-box;
}

.sc-label {
  font-size: 18rpx;
  color: var(--bs-text-tertiary);
  white-space: nowrap;
}

.sc-node--completed .sc-circle {
  background: var(--bs-success);
  border-color: var(--bs-success);
  color: #fff;
}

.sc-node--active .sc-circle {
  background: var(--bs-brand-primary);
  border-color: var(--bs-brand-primary);
  color: #fff;
  box-shadow: 0 0 0 8rpx rgba(22, 119, 255, 0.18);
}

.sc-node--completed .sc-label,
.sc-node--active .sc-label {
  color: var(--bs-text-primary);
  font-weight: 600;
}

.sc-link {
  flex: 1;
  height: 4rpx;
  margin-top: 20rpx;
  background: var(--bs-border);
  border-radius: 2rpx;
}

.sc-link--done {
  background: var(--bs-success);
}

.status-box {
  background: var(--bs-divider);
  border-radius: var(--bs-radius-md);
  padding: 20rpx 24rpx;
}

.status-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 25rpx;
  font-weight: 600;
  color: var(--bs-text-primary);
  margin-bottom: 10rpx;
}

.status-desc {
  font-size: 22rpx;
  color: var(--bs-text-secondary);
  line-height: 1.65;
}

.sec-title {
  font-size: 28rpx;
  font-weight: 700;
  color: var(--bs-text-primary);
  margin-bottom: 20rpx;
}

/* 配件清单 */
.part-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 24rpx;
  color: var(--bs-text-secondary);
  padding: 14rpx 0;

  &+ .part-row {
    border-top: 1rpx dashed var(--bs-border);
  }
}

.part-price {
  font-weight: 600;
  color: var(--bs-text-primary);
}

.part-total {
  background: rgba(0, 181, 120, 0.06);
  border-radius: var(--bs-radius-md);
  padding: 16rpx 20rpx;
  font-weight: 600;
  color: var(--bs-text-primary);

  &+ .part-row,
  & {
    border-top: none;
    margin-top: 12rpx;
  }

  .part-price {
    color: var(--bs-success);
  }
}

/* 影像占位 */
.photo-row {
  display: flex;
  gap: 16rpx;
}

.photo-item {
  flex: 1;
  height: 128rpx;
  border-radius: var(--bs-radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40rpx;
  box-shadow: inset 0 2rpx 0 rgba(255, 255, 255, 0.35), 0 8rpx 20rpx rgba(15, 42, 90, 0.12);
}

.photo-note {
  margin-top: 16rpx;
  font-size: 21rpx;
  color: var(--bs-text-tertiary);
  line-height: 1.6;
}

/* 质保 */
.warranty-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 26rpx;
  font-weight: 600;
  color: var(--bs-text-primary);
}

.warranty-note {
  margin-top: 14rpx;
  font-size: 22rpx;
  color: var(--bs-text-secondary);
  line-height: 1.65;
}

/* 吸底操作 */
.bottom-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  background: #fff;
  padding: 20rpx 32rpx calc(16rpx + env(safe-area-inset-bottom));
  box-shadow: 0 -4rpx 16rpx rgba(0, 0, 0, 0.05);
}

.accept-btn {
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

.accept-btn--disabled {
  background: var(--bs-divider);
  color: var(--bs-text-disabled);
  box-shadow: none;
}

.bar-note {
  text-align: center;
  font-size: 20rpx;
  color: var(--bs-text-tertiary);
  margin-top: 12rpx;

  &.ok {
    color: var(--bs-success);
  }
}
</style>

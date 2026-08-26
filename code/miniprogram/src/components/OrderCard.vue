<script setup lang="ts">
import type { Order } from '@/api'

/**
 * 订单卡片(首页推荐/接单广场复用)
 * 结构:状态标签+标题+价格 / 任务标签行 / 地点时间 / 底部保障与主操作
 */
const props = defineProps<{
  order: Order
  /** 底部操作按钮文案,不传则不显示按钮 */
  actionText?: string
  /** 资质不符等禁用原因,传入则按钮置灰 */
  disabledReason?: string
}>()

const emit = defineEmits<{
  click: [order: Order]
  action: [order: Order]
}>()

const airspaceBadge = computed(() => {
  return props.order.airspace === 'controlled'
    ? { cls: 'bs-badge--danger', icon: '⚠', text: '管制空域(需批文)' }
    : { cls: 'bs-badge--success', icon: '✓', text: '适飞空域(真高≤120m)' }
})

function onCardClick() {
  emit('click', props.order)
}

function onAction(e: Event) {
  e.stopPropagation()
  if (!props.disabledReason)
    emit('action', props.order)
}
</script>

<template>
  <view class="bs-card order-card" hover-class="order-card--hover" @click="onCardClick">
    <view class="oc-head">
      <text class="oc-title">
        {{ order.title }}
      </text>
      <text class="oc-price bs-num">
        <text class="oc-cur">
          ¥
        </text>{{ order.price.toLocaleString() }}
      </text>
    </view>

    <view class="oc-badges">
      <text class="bs-badge bs-badge--primary">
        {{ order.type }}
      </text>
      <text class="bs-badge" :class="airspaceBadge.cls">
        {{ airspaceBadge.icon }} {{ airspaceBadge.text }}
      </text>
      <text class="bs-badge bs-badge--gold">
        {{ order.licenseReq }}
      </text>
    </view>

    <view class="oc-info">
      <view class="oc-info-row">
        <text class="oc-info-icon">
          📍
        </text>{{ order.location }}
      </view>
      <view class="oc-info-row">
        <text class="oc-info-icon">
          🕐
        </text>{{ order.time }}
      </view>
    </view>

    <view class="oc-foot">
      <text class="oc-note">
        🛡 平台资金托管 · 强制保险护航
      </text>
      <view v-if="actionText" class="oc-btn" :class="{ 'oc-btn--disabled': !!disabledReason }" @click="onAction">
        {{ disabledReason || actionText }}
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.order-card--hover {
  background: var(--bs-divider);
}

.oc-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20rpx;
  margin-bottom: 16rpx;
}

.oc-title {
  font-size: var(--bs-font-body);
  font-weight: 700;
  color: var(--bs-text-primary);
  line-height: 1.4;
  flex: 1;
}

.oc-price {
  font-size: 38rpx;
  font-weight: 700;
  color: var(--bs-brand-accent);
  white-space: nowrap;
  line-height: 1.2;
}

.oc-cur {
  font-size: 26rpx;
  margin-right: 2rpx;
}

.oc-badges {
  display: flex;
  gap: 12rpx;
  flex-wrap: wrap;
  margin-bottom: 20rpx;
}

.oc-info {
  font-size: var(--bs-font-footnote);
  color: var(--bs-text-secondary);
  line-height: 1.7;
}

.oc-info-icon {
  margin-right: 8rpx;
  font-size: 22rpx;
}

.oc-foot {
  border-top: 1rpx dashed var(--bs-border);
  margin-top: 20rpx;
  padding-top: 20rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.oc-note {
  font-size: 22rpx;
  color: var(--bs-text-tertiary);
}

.oc-btn {
  background: linear-gradient(135deg, #FF9433 0%, #FF7A00 55%, #F56A00 100%);
  color: #fff;
  font-size: 24rpx;
  font-weight: 600;
  padding: 12rpx 26rpx;
  border-radius: var(--bs-radius-full);
  box-shadow: 0 8rpx 20rpx rgba(255, 122, 0, 0.3);
}

.oc-btn--disabled {
  background: var(--bs-divider);
  color: var(--bs-text-disabled);
  box-shadow: none;
}
</style>

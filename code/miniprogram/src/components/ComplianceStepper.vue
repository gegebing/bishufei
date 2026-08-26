<script setup lang="ts">
/**
 * UOM「一登二查三申请」+ 强制保险 合规步骤条
 * 已完成:青绿打勾;当前:主色高亮;未完成:置灰
 */
const props = defineProps<{
  /** 当前进行到的步骤(0-based,已完成数) */
  current: number
}>()

const steps = ['① 一登实名', '② 二查空域', '③ 三申请批文', '④ 强制保险']

function nodeState(index: number) {
  if (index < props.current)
    return 'completed'
  if (index === props.current)
    return 'active'
  return 'pending'
}
</script>

<template>
  <view class="stepper">
    <template v-for="(label, i) in steps" :key="i">
      <view class="step-node" :class="`step-node--${nodeState(i)}`">
        <view class="step-circle">
          <text v-if="nodeState(i) === 'completed'">
            ✓
          </text>
          <text v-else>
            {{ i + 1 }}
          </text>
        </view>
        <text class="step-label">
          {{ label }}
        </text>
      </view>
      <view v-if="i < steps.length - 1" class="step-link" :class="{ 'step-link--done': i < current }" />
    </template>
  </view>
</template>

<style lang="scss" scoped>
.stepper {
  display: flex;
  align-items: flex-start;
  margin: 8rpx 0 36rpx;
}

.step-node {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10rpx;
  width: 132rpx;
  flex-shrink: 0;
  text-align: center;
}

.step-circle {
  width: 56rpx;
  height: 56rpx;
  border-radius: 50%;
  background: #fff;
  border: 4rpx solid var(--bs-border);
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: 600;
  font-size: 24rpx;
  color: var(--bs-text-secondary);
  box-sizing: border-box;
}

.step-label {
  font-size: 21rpx;
  color: var(--bs-text-tertiary);
  white-space: nowrap;
}

.step-node--completed .step-circle {
  background: var(--bs-success);
  border-color: var(--bs-success);
  color: #fff;
}

.step-node--active .step-circle {
  background: var(--bs-brand-primary);
  border-color: var(--bs-brand-primary);
  color: #fff;
  box-shadow: 0 0 0 6rpx rgba(22, 119, 255, 0.2);
}

.step-node--completed .step-label,
.step-node--active .step-label {
  color: var(--bs-text-primary);
  font-weight: 600;
}

.step-link {
  flex: 1;
  height: 4rpx;
  margin-top: 28rpx;
  background: var(--bs-border);
  border-radius: 2rpx;
}

.step-link--done {
  background: var(--bs-success);
}
</style>

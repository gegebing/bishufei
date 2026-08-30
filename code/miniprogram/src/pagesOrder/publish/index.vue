<script setup lang="ts">
import { apiPublishOrder } from '@/api'

definePage({
  name: 'order-publish',
  style: { navigationBarTitleText: '发布飞行需求' },
})

const router = useRouter()

const typeOptions = ['航拍摄影', '电力巡检', '正射测绘', '农业植保']
const selectedTypes = ref<string[]>(['电力巡检'])
const location = ref('')
const price = ref('')
const coord = ref<{ lat?: number, lng?: number }>({})
const submitting = ref(false)

function toggleType(t: string) {
  const idx = selectedTypes.value.indexOf(t)
  if (idx >= 0)
    selectedTypes.value.splice(idx, 1)
  else
    selectedTypes.value.push(t)
}

function onPickLocation() {
  uni.chooseLocation({
    success: (res) => {
      location.value = res.address ? `${res.address}${res.name}` : res.name
      coord.value = { lat: res.latitude, lng: res.longitude }
      uni.showToast({ title: '地图选点成功(适飞区)', icon: 'none' })
    },
    fail: () => {
      uni.showToast({ title: '地图选点暂不可用,请手动输入作业地点', icon: 'none' })
    },
  })
}

async function onSubmit() {
  if (submitting.value)
    return
  if (!selectedTypes.value.length) {
    uni.showToast({ title: '请选择任务类型', icon: 'none' })
    return
  }
  if (!location.value.trim()) {
    uni.showToast({ title: '请填写作业地点', icon: 'none' })
    return
  }
  const priceNum = Number(price.value)
  if (!priceNum || priceNum <= 0) {
    uni.showToast({ title: '请输入有效的预算金额', icon: 'none' })
    return
  }
  submitting.value = true
  try {
    await apiPublishOrder({
      type: selectedTypes.value.join('、'),
      location: location.value.trim(),
      price: priceNum,
      ...coord.value,
    })
    uni.showToast({ title: '需求发布成功!已托管定金至资金监管专户', icon: 'none' })
    setTimeout(() => router.back(), 800)
  }
  finally {
    submitting.value = false
  }
}
</script>

<template>
  <view class="bs-page pub-page">
    <view class="bs-card pub-card">
      <view class="form-title">
        填写飞行需求基本信息
      </view>

      <!-- 任务类型(可多选) -->
      <view class="field">
        <view class="field-label">
          任务类型 <text class="req">
            *
          </text>
        </view>
        <view class="chip-row">
          <text
            v-for="t in typeOptions"
            :key="t"
            class="chip"
            :class="{ 'chip--on': selectedTypes.includes(t) }"
            @click="toggleType(t)"
          >
            {{ t }}
          </text>
        </view>
      </view>

      <!-- 作业地点 -->
      <view class="field">
        <view class="field-label">
          作业地点 (地图选点) <text class="req">
            *
          </text>
        </view>
        <view class="loc-row">
          <input v-model="location" class="form-input" type="text" placeholder="如如:成都市天府新区兴隆湖">
          <view class="loc-btn" @click="onPickLocation">
            📍 选点
          </view>
        </view>
      </view>

      <!-- 智能空域预判 -->
      <view class="airspace-box">
        <view class="airspace-title">
          🛰 智能空域预判参考(UOM法规指引)
        </view>
        <view class="airspace-body">
          任务预估作业真高:<text class="airspace-strong">
            ≤ 80 米
          </text>
        </view>
        <view class="airspace-body">
          空域属性初判:<text class="airspace-ok">
            适飞空域(真高120米以下免报备申请)
          </text>
        </view>
        <view class="airspace-note">
          * 平台不替代UOM审批职能,飞手接单后需在UOM复核。
        </view>
      </view>

      <!-- 预算 -->
      <view class="field">
        <view class="field-label">
          项目预算金额 (元) <text class="req">
            *
          </text>
        </view>
        <input v-model="price" class="form-input price-input" type="digit" placeholder="请输入预算总额">
      </view>

      <view class="submit-btn" @click="onSubmit">
        🚀 立即发布至订单广场
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.pub-page {
  padding-top: 24rpx;
}

.form-title {
  font-size: 30rpx;
  font-weight: 700;
  color: var(--bs-text-primary);
  margin-bottom: 28rpx;
}

.field {
  margin-bottom: 28rpx;
}

.field-label {
  font-size: 26rpx;
  color: var(--bs-text-secondary);
  font-weight: 500;
  margin-bottom: 14rpx;
}

.req {
  color: var(--bs-danger);
  font-weight: 600;
}

.chip-row {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.chip {
  padding: 12rpx 28rpx;
  font-size: 24rpx;
  border-radius: var(--bs-radius-full);
  background: #fff;
  border: 1rpx solid var(--bs-border);
  color: var(--bs-text-secondary);
}

.chip--on {
  background: var(--bs-brand-primary);
  border-color: transparent;
  color: #fff;
  font-weight: 600;
  box-shadow: 0 8rpx 20rpx rgba(22, 119, 255, 0.3);
}

.loc-row {
  display: flex;
  gap: 16rpx;
}

.form-input {
  flex: 1;
  height: 88rpx;
  border: 1rpx solid var(--bs-border);
  border-radius: 20rpx;
  padding: 0 24rpx;
  font-size: 28rpx;
  background: #fff;
  color: var(--bs-text-primary);
  box-sizing: border-box;
}

.price-input {
  width: 100%;
  font-weight: 700;
  color: var(--bs-brand-accent);
  font-size: 32rpx;
}

.loc-btn {
  flex-shrink: 0;
  height: 88rpx;
  display: flex;
  align-items: center;
  padding: 0 28rpx;
  border-radius: 20rpx;
  background: #fff;
  color: var(--bs-brand-primary);
  border: 1rpx solid rgba(22, 119, 255, 0.55);
  font-size: 24rpx;
  font-weight: 600;
  box-sizing: border-box;
}

.airspace-box {
  background: linear-gradient(180deg, #F0F7FF, #F7FBFF);
  border: 1rpx dashed rgba(22, 119, 255, 0.45);
  border-radius: var(--bs-radius-lg);
  padding: 22rpx 26rpx;
  margin-bottom: 28rpx;
  font-size: 24rpx;
}

.airspace-title {
  font-weight: 600;
  color: var(--bs-brand-primary);
  margin-bottom: 8rpx;
}

.airspace-body {
  color: var(--bs-text-secondary);
  line-height: 1.55;
}

.airspace-strong {
  color: var(--bs-text-primary);
  font-weight: 600;
}

.airspace-ok {
  color: var(--bs-success);
  font-weight: 600;
}

.airspace-note {
  font-size: 22rpx;
  color: var(--bs-text-tertiary);
  margin-top: 4rpx;
}

.submit-btn {
  background: linear-gradient(135deg, #1677FF 0%, #00A6FF 100%);
  color: #fff;
  text-align: center;
  font-size: 30rpx;
  font-weight: 600;
  border-radius: var(--bs-radius-full);
  padding: 26rpx 0;
  box-shadow: 0 12rpx 28rpx rgba(22, 119, 255, 0.32);
}
</style>

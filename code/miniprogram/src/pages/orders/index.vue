<script setup lang="ts">
import type { Order } from '@/api'
/**
 * 接单广场(飞手接单 / 需求发布 双模式)
 * 结构:顶部胶囊切换 → 接单:类型筛选 chips + 订单列表(OrderCard)→ 发布:需求表单 + 空域预判
 */
import { apiGetOrderList, apiGrabOrder, apiPublishOrder } from '@/api'
import OrderCard from '@/components/OrderCard.vue'

definePage({
  name: 'orders',
  layout: 'tabbar',
  style: {
    navigationBarTitleText: '接单广场',
  },
})

const router = useRouter()

/* ===== 模式切换 ===== */
const isPublishMode = ref(false)

/* ===== 接单模式 ===== */
const typeFilters = [
  { label: '全部', value: 'all' },
  { label: '电力/光伏巡检', value: '巡检' },
  { label: '农业植保', value: '植保' },
  { label: '航拍与实景三维', value: '测绘' },
]
const filterType = ref('all')
const orderList = ref<Order[]>([])
const loading = ref(false)

async function loadOrders() {
  loading.value = true
  try {
    const res = await apiGetOrderList(filterType.value)
    if (res.code === 2000)
      orderList.value = res.data || []
  }
  finally {
    loading.value = false
  }
}

function onFilterChange(value: string) {
  filterType.value = value
  loadOrders()
}

function goDetail(order: Order) {
  router.push({ name: 'order-detail', query: { id: order.id } })
}

async function onGrab(order: Order) {
  const res = await apiGrabOrder(order.id)
  uni.showToast({ title: res.msg || '抢单成功', icon: 'none' })
  if (res.code === 2000)
    router.push({ name: 'order-detail', query: { id: order.id } })
}

/* ===== 发布模式 ===== */
const publishTypes = ['航拍摄影', '电力巡检', '正射测绘', '农业植保']
const selectedTypes = ref<string[]>(['电力巡检'])
const location = ref('')
const coord = ref<{ lat?: number, lng?: number }>({})
const price = ref('')
const submitting = ref(false)

function toggleType(t: string) {
  const idx = selectedTypes.value.indexOf(t)
  if (idx >= 0)
    selectedTypes.value.splice(idx, 1)
  else
    selectedTypes.value.push(t)
}

function chooseLocation() {
  uni.chooseLocation({
    success: (res) => {
      location.value = res.address || res.name
      coord.value = { lat: res.latitude, lng: res.longitude }
    },
    fail: () => {
      uni.showToast({ title: '选点不可用,请手动输入作业地点', icon: 'none' })
    },
  })
}

async function submitPublish() {
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
    const res = await apiPublishOrder({
      type: selectedTypes.value.join('/'),
      location: location.value.trim(),
      price: priceNum,
      ...coord.value,
    })
    uni.showToast({ title: res.msg || '发布成功', icon: 'none' })
    if (res.code === 2000) {
      price.value = ''
      isPublishMode.value = false
    }
  }
  finally {
    submitting.value = false
  }
}

onMounted(loadOrders)
</script>

<template>
  <view class="bs-page orders-page">
    <!-- 顶部胶囊切换 -->
    <view class="seg-bar">
      <view class="seg">
        <view class="seg-item" :class="{ on: !isPublishMode }" @click="isPublishMode = false">
          飞手接单广场
        </view>
        <view class="seg-item" :class="{ on: isPublishMode }" @click="isPublishMode = true">
          发布飞行需求
        </view>
      </view>
    </view>

    <!-- 接单模式 -->
    <template v-if="!isPublishMode">
      <scroll-view scroll-x class="chip-row" :show-scrollbar="false">
        <view
          v-for="f in typeFilters"
          :key="f.value"
          class="chip"
          :class="{ on: filterType === f.value }"
          @click="onFilterChange(f.value)"
        >
          {{ f.label }}
        </view>
      </scroll-view>

      <view v-if="!loading && !orderList.length" class="empty">
        暂无该类型订单,换个筛选看看
      </view>

      <OrderCard
        v-for="order in orderList"
        :key="order.id"
        :order="order"
        action-text="我要抢单"
        @click="goDetail"
        @action="onGrab"
      />
    </template>

    <!-- 发布模式 -->
    <view v-else class="publish-wrap">
      <view class="bs-card form-card">
        <view class="form-title">
          填写飞行需求基本信息
        </view>

        <view class="field">
          <view class="field-label">
            任务类型(可多选)<text class="req">
              *
            </text>
          </view>
          <view class="chip-row in-form">
            <view
              v-for="t in publishTypes"
              :key="t"
              class="chip"
              :class="{ on: selectedTypes.includes(t) }"
              @click="toggleType(t)"
            >
              {{ t }}
            </view>
          </view>
        </view>

        <view class="field">
          <view class="field-label">
            作业地点(地图选点)<text class="req">
              *
            </text>
          </view>
          <view class="loc-row">
            <input v-model="location" class="form-input" placeholder="如如:成都市天府新区兴隆湖">
            <view class="loc-btn" @click="chooseLocation">
              <wd-icon name="location" size="14px" />
              <text>选点</text>
            </view>
          </view>
        </view>

        <!-- 智能空域预判 -->
        <view class="airspace-box">
          <view class="airspace-title">
            🛰 智能空域预判参考(UOM法规指引)
          </view>
          <view class="airspace-body">
            任务预估作业真高:<text class="strong">
              ≤ 80 米
            </text>
          </view>
          <view class="airspace-body">
            空域属性初判:<text class="free">
              适飞空域(真高120米以下免报备申请)
            </text>
          </view>
          <view class="airspace-note">
            * 平台不替代UOM审批职能,飞手接单后需在UOM复核。
          </view>
        </view>

        <view class="field">
          <view class="field-label">
            项目预算金额(元)<text class="req">
              *
            </text>
          </view>
          <input v-model="price" class="form-input price-input" type="digit" placeholder="请输入预算总额">
        </view>

        <view class="submit-btn" :class="{ 'submit-btn--disabled': submitting }" @click="submitPublish">
          <wd-icon name="send" size="15px" />
          <text>{{ submitting ? '发布中...' : '立即发布至订单广场' }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.orders-page {
  min-height: 100vh;
}

/* 顶部胶囊切换 */
.seg-bar {
  background: #fff;
  padding: 16rpx 32rpx;
  border-bottom: 1rpx solid var(--bs-border);
}

.seg {
  display: flex;
  background: var(--bs-bg-page);
  border-radius: var(--bs-radius-full);
  padding: 6rpx;
  border: 1rpx solid rgba(229, 230, 235, 0.7);
}

.seg-item {
  flex: 1;
  text-align: center;
  padding: 12rpx 0;
  font-size: 26rpx;
  border-radius: var(--bs-radius-full);
  color: var(--bs-text-secondary);
}

.seg-item.on {
  background: #fff;
  color: var(--bs-brand-primary);
  font-weight: 600;
  box-shadow: 0 4rpx 16rpx rgba(15, 42, 90, 0.12);
}

/* 筛选 chips */
.chip-row {
  padding: 24rpx 32rpx 20rpx;
  white-space: nowrap;
}

.chip {
  display: inline-flex;
  margin-right: 16rpx;
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

.chip-row.in-form {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
  padding: 0;
  white-space: normal;
}

.chip-row.in-form .chip {
  margin-right: 0;
}

.empty {
  text-align: center;
  font-size: 26rpx;
  color: var(--bs-text-tertiary);
  padding: 80rpx 0;
}

/* 发布表单 */
.publish-wrap {
  padding: 24rpx 32rpx 40rpx;
}

.form-card {
  margin: 0;
}

.form-title {
  font-size: 30rpx;
  font-weight: 700;
  margin-bottom: 28rpx;
  color: var(--bs-text-primary);
}

.field {
  margin-bottom: 28rpx;
}

.field-label {
  font-size: 26rpx;
  color: var(--bs-text-secondary);
  margin-bottom: 14rpx;
  font-weight: 500;
}

.req {
  color: var(--bs-danger);
  margin-left: 4rpx;
}

.form-input {
  width: 100%;
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
  font-weight: 700;
  color: var(--bs-brand-accent);
  font-size: 32rpx;
}

.loc-row {
  display: flex;
  gap: 16rpx;
}

.loc-row .form-input {
  flex: 1;
}

.loc-btn {
  flex-shrink: 0;
  height: 88rpx;
  padding: 0 28rpx;
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  gap: 8rpx;
  font-size: 24rpx;
  font-weight: 600;
  color: var(--bs-brand-primary);
  border: 1rpx solid rgba(22, 119, 255, 0.55);
  background: #fff;
  box-sizing: border-box;
}

/* 空域预判卡 */
.airspace-box {
  background: linear-gradient(180deg, #F0F7FF, #F7FBFF);
  border: 1rpx dashed rgba(22, 119, 255, 0.45);
  border-radius: 24rpx;
  padding: 22rpx 26rpx;
  margin-bottom: 28rpx;
}

.airspace-title {
  font-size: 24rpx;
  font-weight: 600;
  color: var(--bs-brand-primary);
  margin-bottom: 8rpx;
}

.airspace-body {
  font-size: 24rpx;
  color: var(--bs-text-secondary);
  line-height: 1.6;
}

.airspace-body .strong {
  color: var(--bs-text-primary);
  font-weight: 600;
}

.airspace-body .free {
  color: var(--bs-success);
  font-weight: 600;
}

.airspace-note {
  font-size: 22rpx;
  color: var(--bs-text-tertiary);
  margin-top: 4rpx;
}

/* 提交按钮 */
.submit-btn {
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

.submit-btn--disabled {
  opacity: 0.6;
}
</style>

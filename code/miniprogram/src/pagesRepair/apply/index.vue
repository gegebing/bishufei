<script setup lang="ts">
import type { RepairMode } from '@/api'
/**
 * 维修服务报修(V3.0 4.5.4)
 * 设备信息 → 故障描述 → AI 预诊断 → 智能匹配维修商报价对比 → 寄修/上门双模式提交
 */
import { apiSubmitRepair } from '@/api'

definePage({
  name: 'repair-apply',
  style: { navigationBarTitleText: '维修报修' },
})

const router = useRouter()

/* ===== 设备与故障 ===== */
const device = ref('DJI M300 RTK')
const sn = ref('1581F4AA9812')
const faultDesc = ref('')

/** AI 预诊断:按故障描述关键词匹配演示规则 */
interface DiagResult { cause: string, range: string, advice: string }
function diagnose(desc: string): DiagResult {
  const d = desc.trim()
  if (!d)
    return { cause: '待描述故障现象', range: '-', advice: '请填写故障描述后获取 AI 预诊断结果' }
  if (d.includes('图传') || d.includes('信号'))
    return { cause: '图传模块排线松动 / 图传频段干扰', range: '¥300 ~ ¥800', advice: '建议寄修检测,48 小时出具正式方案' }
  if (d.includes('电池') || d.includes('续航'))
    return { cause: '动力电池电芯老化 / 循环寿命衰减', range: '¥400 ~ ¥1,200', advice: '建议更换原厂电池并做循环校准' }
  if (d.includes('电机') || d.includes('桨'))
    return { cause: '电机轴承磨损 / 桨叶动平衡异常', range: '¥200 ~ ¥600', advice: '建议寄修更换电机并进行整机标定' }
  return { cause: '飞控自检异常(需上机检测)', range: '¥200 ~ ¥500', advice: '建议寄修做黑匣子日志分析' }
}

const diag = computed(() => diagnose(faultDesc.value))

/* ===== 维修商报价(智能匹配 3 家) ===== */
const quotes = [
  { vendor: '大疆授权服务中心 (成都)', level: '品牌授权', levelCls: 'bs-badge--gold', price: 680, warranty: 90 },
  { vendor: '极飞四川维修中心', level: '高级', levelCls: 'bs-badge--primary', price: 520, warranty: 90 },
  { vendor: '成都翼修电子科技', level: '中级', levelCls: 'bs-badge--default', price: 380, warranty: 30 },
]
const vendorIndex = ref(1)

/* ===== 服务方式 ===== */
const mode = ref<RepairMode>('mail')
const submitting = ref(false)

async function submit() {
  if (!faultDesc.value.trim()) {
    uni.showToast({ title: '请填写故障描述', icon: 'none' })
    return
  }
  submitting.value = true
  try {
    const q = quotes[vendorIndex.value] ?? quotes[0]
    const res = await apiSubmitRepair({
      device: device.value,
      sn: sn.value,
      faultDesc: faultDesc.value.trim(),
      mode: mode.value,
      vendor: q.vendor,
    })
    uni.showToast({ title: res.msg || '报修单已提交', icon: 'none' })
    if (res.code === 2000)
      setTimeout(() => router.push({ name: 'repair-order' }), 1000)
  }
  finally {
    submitting.value = false
  }
}
</script>

<template>
  <view class="bs-page ra-page">
    <!-- 报修设备 -->
    <view class="bs-card">
      <view class="sec-title">
        报修设备信息
      </view>
      <view class="field">
        <view class="field-label">
          设备型号
        </view>
        <input v-model="device" class="form-input" placeholder="例如:DJI M300 RTK">
      </view>
      <view class="field">
        <view class="field-label">
          设备 SN 码(UOM 序列号核验)
        </view>
        <input v-model="sn" class="form-input bs-num" placeholder="机身底部 SN 编码">
      </view>
      <view class="field last">
        <view class="field-label">
          故障描述<text class="req">
            *
          </text>
        </view>
        <textarea
          v-model="faultDesc"
          class="form-textarea"
          :maxlength="120"
          placeholder="描述故障现象,如:图传信号断续,飞行 10 分钟后图传丢失"
        />
      </view>
    </view>

    <!-- AI 预诊断 -->
    <view class="diag-box">
      <view class="diag-title">
        ✨ AI 故障预诊断
      </view>
      <view class="diag-body">
        疑似故障:<text class="strong">
          {{ diag.cause }}
        </text>
      </view>
      <view v-if="diag.range !== '-'" class="diag-body">
        预估维修费用区间:<text class="strong bs-num">
          {{ diag.range }}
        </text> · {{ diag.advice }}
      </view>
      <view v-else class="diag-body">
        {{ diag.advice }}
      </view>
    </view>

    <!-- 维修商报价对比 -->
    <view class="bs-card">
      <view class="sec-title">
        智能匹配维修商 (3 家报价)
      </view>
      <view
        v-for="(q, i) in quotes" :key="q.vendor"
        class="quote-row" :class="{ on: vendorIndex === i }" @click="vendorIndex = i"
      >
        <view class="quote-main">
          <view class="quote-vendor">
            {{ q.vendor }}
            <text class="bs-badge" :class="q.levelCls">
              {{ q.level }}
            </text>
          </view>
          <view class="quote-meta">
            质保 {{ q.warranty }} 天 · 寄修包邮
          </view>
        </view>
        <view class="quote-price bs-num">
          ¥{{ q.price }}
        </view>
      </view>
    </view>

    <!-- 服务方式 -->
    <view class="bs-card">
      <view class="sec-title">
        选择服务方式
      </view>
      <view class="mode-card" :class="{ on: mode === 'mail' }" @click="mode = 'mail'">
        <view class="mode-head">
          <wd-icon :name="mode === 'mail' ? 'check-circle-fill' : 'circle'" size="34rpx" :color="mode === 'mail' ? '#1677FF' : '#BFBFBF'" />
          <text>寄修模式 (推荐 · 包邮)</text>
        </view>
        <view class="mode-desc">
          顺丰上门取件免运费,运费险由平台赠送;维修商收货后 48 小时内出具正式检测方案
        </view>
      </view>
      <view class="mode-card" :class="{ on: mode === 'onsite' }" @click="mode = 'onsite'">
        <view class="mode-head">
          <wd-icon :name="mode === 'onsite' ? 'check-circle-fill' : 'circle'" size="34rpx" :color="mode === 'onsite' ? '#1677FF' : '#BFBFBF'" />
          <text>上门模式 (企业客户 / 批量维修)</text>
        </view>
        <view class="mode-desc">
          认证技师上门取件或现场检修,上门费 ¥30 以报价单形式单独列明
        </view>
      </view>
    </view>

    <!-- 吸底提交 -->
    <view class="bottom-bar">
      <view class="submit-btn" :class="{ 'submit-btn--disabled': submitting }" @click="submit">
        {{ submitting ? '提交中...' : (mode === 'mail' ? '提交报修 (寄修模式 · 包邮)' : '提交报修 (预约技师上门)') }}
      </view>
      <view class="bar-note">
        维修记录将关联 UOM 设备档案 · 支持以旧换新抵扣
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.ra-page {
  min-height: 100vh;
  padding-bottom: 240rpx;
}

.sec-title {
  font-size: 28rpx;
  font-weight: 700;
  color: var(--bs-text-primary);
  margin-bottom: 24rpx;
}

.field {
  margin-bottom: 24rpx;

  &.last {
    margin-bottom: 0;
  }
}

.field-label {
  font-size: 25rpx;
  color: var(--bs-text-secondary);
  margin-bottom: 12rpx;
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
  font-size: 27rpx;
  background: #fff;
  color: var(--bs-text-primary);
  box-sizing: border-box;
}

.form-textarea {
  width: 100%;
  min-height: 140rpx;
  border: 1rpx solid var(--bs-border);
  border-radius: 20rpx;
  padding: 20rpx 24rpx;
  font-size: 26rpx;
  background: #fff;
  color: var(--bs-text-primary);
  box-sizing: border-box;
}

/* AI 预诊断 */
.diag-box {
  background: linear-gradient(180deg, #F0F7FF, #F7FBFF);
  border: 1rpx dashed rgba(22, 119, 255, 0.45);
  border-radius: var(--bs-radius-lg);
  padding: 22rpx 26rpx;
  margin: 0 32rpx 24rpx;
}

.diag-title {
  font-size: 25rpx;
  font-weight: 600;
  color: var(--bs-brand-primary);
  margin-bottom: 10rpx;
}

.diag-body {
  font-size: 23rpx;
  color: var(--bs-text-secondary);
  line-height: 1.65;

  .strong {
    color: var(--bs-text-primary);
    font-weight: 600;
  }
}

/* 报价对比 */
.quote-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
  background: var(--bs-divider);
  border-radius: var(--bs-radius-md);
  padding: 20rpx 22rpx;
  border: 2rpx solid transparent;

  &+ .quote-row {
    margin-top: 16rpx;
  }

  &.on {
    background: rgba(22, 119, 255, 0.05);
    border-color: rgba(22, 119, 255, 0.55);
  }
}

.quote-main {
  flex: 1;
  min-width: 0;
}

.quote-vendor {
  display: flex;
  align-items: center;
  gap: 10rpx;
  font-size: 25rpx;
  font-weight: 600;
  color: var(--bs-text-primary);
}

.quote-meta {
  font-size: 21rpx;
  color: var(--bs-text-tertiary);
  margin-top: 6rpx;
}

.quote-price {
  font-size: 30rpx;
  font-weight: 700;
  color: var(--bs-brand-accent);
  flex-shrink: 0;
}

/* 服务方式 */
.mode-card {
  border: 2rpx solid var(--bs-border);
  border-radius: var(--bs-radius-md);
  padding: 20rpx 22rpx;

  &+ .mode-card {
    margin-top: 16rpx;
  }

  &.on {
    border-color: rgba(22, 119, 255, 0.55);
    background: rgba(22, 119, 255, 0.05);
  }
}

.mode-head {
  display: flex;
  align-items: center;
  gap: 12rpx;
  font-size: 26rpx;
  font-weight: 600;
  color: var(--bs-text-primary);
}

.mode-desc {
  font-size: 21rpx;
  color: var(--bs-text-tertiary);
  line-height: 1.55;
  margin-top: 8rpx;
  padding-left: 46rpx;
}

/* 吸底提交 */
.bottom-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  background: #fff;
  padding: 20rpx 32rpx calc(16rpx + env(safe-area-inset-bottom));
  box-shadow: 0 -4rpx 16rpx rgba(0, 0, 0, 0.05);
}

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
  background: linear-gradient(135deg, #FF9433 0%, #FF7A00 55%, #F56A00 100%);
  box-shadow: 0 12rpx 28rpx rgba(255, 122, 0, 0.32);
}

.submit-btn--disabled {
  opacity: 0.55;
}

.bar-note {
  text-align: center;
  font-size: 20rpx;
  color: var(--bs-text-tertiary);
  margin-top: 12rpx;
}
</style>

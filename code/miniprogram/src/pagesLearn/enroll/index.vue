<script setup lang="ts">
/**
 * 培训报名 / CAAC 收银台(V3.0 4.2.4 报名即分账 + 阶梯退费)
 * query:id=班级ID type=skill 零费用报名确认 | caac 报名收银台
 */
import type { CaacClass, Course } from '@/api'
import { apiEnrollCaac, apiEnrollCourse, apiGetCaacDetail, apiGetCourseDetail } from '@/api'

definePage({
  name: 'learn-enroll',
  style: { navigationBarTitleText: '报名确认' },
})

const router = useRouter()
const enrollType = ref<'skill' | 'caac'>('caac')
const classId = ref('')
const course = ref<Course | null>(null)
const caac = ref<CaacClass | null>(null)

/* ===== 零费用报名表单(skill) ===== */
const idCard = ref('')
const jobStatuses = ['农村转移劳动力', '应届毕业生', '失业待业人员', '企业在职转岗']
const jobIndex = ref(0)
const submitting = ref(false)

/* ===== CAAC 收银台 ===== */
/** 学员成长券,推荐班可抵扣 800 元 */
const voucher = computed(() => (caac.value?.recommended ? 800 : 0))
const payAmount = computed(() => (caac.value ? caac.value.price - voucher.value : 0))
const agreedRefund = ref(false)
const paying = ref(false)

onLoad(async (query) => {
  classId.value = (query?.id as string) || ''
  enrollType.value = (query?.type as 'skill' | 'caac') || 'caac'
  if (!classId.value)
    return
  if (enrollType.value === 'skill') {
    const res = await apiGetCourseDetail(classId.value)
    if (res?.data)
      course.value = res.data
  }
  else {
    const res = await apiGetCaacDetail(classId.value)
    if (res?.data)
      caac.value = res.data
  }
})

async function submitSkillEnroll() {
  const card = idCard.value.trim()
  if (!/^\d{17}[\dX]$/i.test(card)) {
    uni.showToast({ title: '请输入有效的 18 位身份证号', icon: 'none' })
    return
  }
  submitting.value = true
  try {
    const res = await apiEnrollCourse({
      courseId: classId.value,
      idCard: card,
      jobStatus: jobStatuses[jobIndex.value] ?? '',
    })
    uni.showToast({ title: res.msg || '人社局资格校验通过,零元报名成功!', icon: 'none' })
    if (res.code === 2000)
      setTimeout(() => router.back(), 1200)
  }
  finally {
    submitting.value = false
  }
}

async function confirmPay() {
  if (!agreedRefund.value || paying.value)
    return
  paying.value = true
  try {
    const res = await apiEnrollCaac(classId.value)
    uni.showToast({ title: res.msg || `支付成功 ¥${payAmount.value.toLocaleString()} 至监管账户`, icon: 'none' })
    if (res.code === 2000)
      setTimeout(() => router.back(), 1400)
  }
  finally {
    paying.value = false
  }
}
</script>

<template>
  <view class="bs-page enroll-page">
    <!-- ===== 技能培训 · 零费用报名确认 ===== -->
    <template v-if="enrollType === 'skill' && course">
      <view class="bs-card form-card">
        <view class="form-title">
          免费报名资格核验
        </view>
        <view class="course-brief">
          <text class="brief-name">
            {{ course.title }}
          </text>
          <text class="brief-org">
            定点机构:{{ course.org }} · {{ course.hours }} 课时 · {{ course.startDate }} 开班
          </text>
          <text class="bs-badge bs-badge--success">
            人社直补 ¥0 · 全程免费
          </text>
        </view>

        <view class="field">
          <view class="field-label">
            身份证号(人社补贴资格核验)<text class="req">
              *
            </text>
          </view>
          <input v-model="idCard" class="form-input" placeholder="请输入本人 18 位身份证号">
        </view>

        <view class="field">
          <view class="field-label">
            当前就业状态<text class="req">
              *
            </text>
          </view>
          <picker :range="jobStatuses" :value="jobIndex" @change="jobIndex = Number($event.detail.value)">
            <view class="form-input picker-input">
              {{ jobStatuses[jobIndex] }}
              <wd-icon name="arrow-down" size="24rpx" color="#8C8C8C" />
            </view>
          </picker>
        </view>

        <view class="tip-box">
          补贴说明:培训费用由人社部门直补定点培训机构,学员全程零费用;结业颁发官方培训合格证明(支持扫码验真),并作为补贴核验依据。
        </view>

        <view class="submit-btn" :class="{ 'submit-btn--disabled': submitting }" @click="submitSkillEnroll">
          {{ submitting ? '资格校验中...' : '提交报名(免费)' }}
        </view>
      </view>
    </template>

    <!-- ===== CAAC · 报名收银台 ===== -->
    <template v-else-if="caac">
      <view class="cashier-amount bs-card">
        <view class="amount-label">
          {{ caac.title }}
        </view>
        <view class="amount-num bs-num">
          <text class="cur">
            ¥
          </text>{{ payAmount.toLocaleString() }}
        </view>
      </view>

      <view class="bs-card">
        <view class="pay-row">
          <text>培训班费</text>
          <text class="strong bs-num">
            ¥{{ caac.price.toLocaleString() }}
          </text>
        </view>
        <view v-if="voucher" class="pay-row">
          <text>学员成长券</text>
          <text class="strong bs-num discount">
            -¥{{ voucher }}
          </text>
        </view>
        <view class="pay-row">
          <text>资金通道</text>
          <text class="strong">
            银行资金监管账户
          </text>
        </view>
        <view class="pay-row">
          <text>结算方式</text>
          <text class="strong">
            报名即分账 · 平台服务费 20% 即结
          </text>
        </view>
      </view>

      <view class="bs-card">
        <view class="sec-title">
          阶梯退费规则(按培训进度)
        </view>
        <view class="refund-row">
          <text>开课前申请退费</text>
          <text class="strong">
            退还 90%
          </text>
        </view>
        <view class="refund-row">
          <text>开课 ≤ 总课时 30%</text>
          <text class="strong">
            退还 60%
          </text>
        </view>
        <view class="refund-row">
          <text>总课时 30% ~ 50%</text>
          <text class="strong">
            退还 30%
          </text>
        </view>
        <view class="refund-row">
          <text>超过总课时 50%</text>
          <text class="strong danger">
            不予退费
          </text>
        </view>
        <view class="refund-note">
          因机构原因停课/师资变动:全额退款且平台免收服务费;退款由平台(20%)与机构(80%)按原分账比例各自承担。
        </view>
      </view>

      <view class="agree-row" @click="agreedRefund = !agreedRefund">
        <wd-icon
          :name="agreedRefund ? 'check-circle-fill' : 'circle'"
          size="34rpx"
          :color="agreedRefund ? '#1677FF' : '#BFBFBF'"
        />
        <text>我已阅读并同意《培训服务协议》反跳单条款及上述阶梯退费规则</text>
      </view>
    </template>

    <!-- 吸底操作 -->
    <view v-if="enrollType === 'caac' && caac" class="bottom-bar">
      <view class="enroll-btn" :class="{ 'enroll-btn--disabled': !agreedRefund || paying }" @click="confirmPay">
        {{ paying ? '支付中...' : `微信支付 ¥${payAmount.toLocaleString()}` }}
      </view>
      <view class="bar-note">
        支付成功后平台留存 20%,机构实时到账 80%,分账凭证支持双方对账
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.enroll-page {
  min-height: 100vh;
  padding-bottom: 220rpx;
}

.form-title {
  font-size: 30rpx;
  font-weight: 700;
  color: var(--bs-text-primary);
  margin-bottom: 24rpx;
}

.course-brief {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 12rpx;
  background: var(--bs-divider);
  border-radius: var(--bs-radius-md);
  padding: 20rpx;
  margin-bottom: 28rpx;
}

.brief-name {
  font-size: 28rpx;
  font-weight: 600;
  color: var(--bs-text-primary);
}

.brief-org {
  font-size: 22rpx;
  color: var(--bs-text-secondary);
}

.field {
  margin-bottom: 26rpx;
}

.field-label {
  font-size: 25rpx;
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
  font-size: 27rpx;
  background: #fff;
  color: var(--bs-text-primary);
  box-sizing: border-box;
}

.picker-input {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.tip-box {
  background: rgba(0, 181, 120, 0.06);
  border: 1rpx dashed rgba(0, 181, 120, 0.5);
  border-radius: var(--bs-radius-md);
  padding: 20rpx;
  font-size: 22rpx;
  color: var(--bs-text-secondary);
  line-height: 1.65;
  margin-bottom: 32rpx;
}

.submit-btn,
.enroll-btn {
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

.enroll-btn {
  background: linear-gradient(135deg, #FF9433 0%, #FF7A00 55%, #F56A00 100%);
  box-shadow: 0 12rpx 28rpx rgba(255, 122, 0, 0.32);
}

.submit-btn--disabled,
.enroll-btn--disabled {
  opacity: 0.55;
}

/* ===== 收银台 ===== */
.cashier-amount {
  text-align: center;
}

.amount-label {
  font-size: 24rpx;
  color: var(--bs-text-secondary);
}

.amount-num {
  font-size: 64rpx;
  font-weight: 700;
  color: var(--bs-brand-accent);
  margin-top: 8rpx;
}

.amount-num .cur {
  font-size: 32rpx;
}

.pay-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 24rpx;
  color: var(--bs-text-secondary);
  padding: 16rpx 4rpx;

  &+ .pay-row {
    border-top: 1rpx dashed var(--bs-border);
  }
}

.pay-row .strong {
  color: var(--bs-text-primary);
  font-weight: 600;
}

.pay-row .discount {
  color: var(--bs-success);
}

.sec-title {
  font-size: 27rpx;
  font-weight: 700;
  color: var(--bs-text-primary);
  margin-bottom: 10rpx;
}

.refund-row {
  display: flex;
  justify-content: space-between;
  font-size: 23rpx;
  color: var(--bs-text-secondary);
  padding: 9rpx 0;

  .strong {
    color: var(--bs-text-primary);
    font-weight: 600;
  }

  .danger {
    color: var(--bs-danger);
  }
}

.refund-note {
  margin-top: 10rpx;
  font-size: 20rpx;
  color: var(--bs-text-tertiary);
  line-height: 1.6;
  background: var(--bs-divider);
  border-radius: var(--bs-radius-md);
  padding: 16rpx 20rpx;
}

.agree-row {
  display: flex;
  align-items: flex-start;
  gap: 12rpx;
  font-size: 22rpx;
  color: var(--bs-text-secondary);
  line-height: 1.55;
  padding: 8rpx 32rpx 0;
}

.bottom-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  background: #fff;
  padding: 20rpx 32rpx calc(16rpx + env(safe-area-inset-bottom));
  box-shadow: 0 -4rpx 16rpx rgba(0, 0, 0, 0.05);
}

.bar-note {
  text-align: center;
  font-size: 20rpx;
  color: var(--bs-text-tertiary);
  margin-top: 12rpx;
}
</style>

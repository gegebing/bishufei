<script setup lang="ts">
import type { Order } from '@/api'
import { apiCheckIn, apiGetOrderDetail, apiReportUom } from '@/api'
import ComplianceStepper from '@/components/ComplianceStepper.vue'

definePage({
  name: 'order-detail',
  style: { navigationBarTitleText: '订单履约工作台' },
})

const router = useRouter()

const order = ref<Order | null>(null)
const orderId = ref('')
/** 已回传的 UOM 批文号,空串表示未回传 */
const uomDocNo = ref('')
/** 合规步骤:已完成步骤数(实名/查空域默认已完成) */
const currentStep = ref(2)
const submitting = ref(false)
/* ===== 电子服务合同(V3.0 防跳单) ===== */
const contractSigned = ref(false)
const showContract = ref(false)
const agreeContract = ref(false)

const isControlled = computed(() => order.value?.airspace === 'controlled')
const uomUploaded = computed(() => !!uomDocNo.value)
/** 管制空域订单必须回传批文后方可打卡 */
const canCheckIn = computed(() => !!order.value && (!isControlled.value || uomUploaded.value))

const statusMap: Record<Order['status'], { cls: string, text: string }> = {
  pending: { cls: 'bs-badge--warning', text: '待接单' },
  ongoing: { cls: 'bs-badge--primary', text: '履约进行中' },
  done: { cls: 'bs-badge--success', text: '已完成' },
}

onLoad(async (query) => {
  orderId.value = (query?.id as string) || ''
  if (!orderId.value)
    return
  const res = await apiGetOrderDetail(orderId.value)
  if (res?.data) {
    order.value = res.data
    // 适飞空域无需申请批文,合规流程视为已就绪
    if (res.data.airspace !== 'controlled')
      currentStep.value = 4
  }
})

function onCallPrivacy() {
  uni.showToast({ title: '正在通过虚拟中间号 199****8821 建立隐私通话...', icon: 'none' })
}

function goChat() {
  router.push({ name: 'order-chat', query: { id: orderId.value } })
}

function signContract() {
  if (!agreeContract.value)
    return
  contractSigned.value = true
  showContract.value = false
  uni.showToast({ title: '合同已签署并区块链存证(存证编号 0x8f3a…e21c)', icon: 'none' })
}

async function onUploadUom() {
  if (submitting.value || uomUploaded.value)
    return
  submitting.value = true
  const docNo = 'UOM-20260825-998'
  try {
    await apiReportUom(orderId.value, docNo)
    uomDocNo.value = docNo
    currentStep.value = 4
    uni.showToast({ title: `UOM 审批批文号 ${docNo} 回传核验成功!`, icon: 'none' })
  }
  finally {
    submitting.value = false
  }
}

async function onCheckIn() {
  if (!canCheckIn.value || submitting.value)
    return
  submitting.value = true
  try {
    // 一期演示使用固定坐标,正式版接入 uni.getLocation 实时定位
    await apiCheckIn(orderId.value, 27.30, 105.28)
    uni.showToast({ title: '现场 GPS 打卡成功 (经纬度 105.28, 27.30),作业开始!', icon: 'none' })
  }
  finally {
    submitting.value = false
  }
}
</script>

<template>
  <view class="bs-page od-page">
    <!-- 管制空域常驻提示条 -->
    <view v-if="isControlled" class="risk-banner">
      <view class="risk-title">
        ⚠ 管制空域安全提示:
      </view>
      该任务地点位于空管管制空域,起飞前必须回传 UOM 审批批文,作业已由平台自动附加强制商业保险。
    </view>

    <template v-if="order">
      <!-- 订单信息 -->
      <view class="bs-card od-info">
        <view class="od-info-head">
          <text class="od-title">
            {{ order.title }}
          </text>
          <text class="bs-badge" :class="statusMap[order.status].cls">
            {{ statusMap[order.status].text }}
          </text>
        </view>
        <view class="od-price bs-num">
          <text class="od-cur">
            ¥
          </text>{{ order.price.toLocaleString() }}
          <text class="od-price-note">
            (定金已托管)
          </text>
        </view>
        <view class="od-badges">
          <text class="bs-badge bs-badge--primary">
            {{ order.type }}
          </text>
          <text v-if="isControlled" class="bs-badge bs-badge--danger">
            ⚠ 管制空域(需批文)
          </text>
          <text v-else class="bs-badge bs-badge--success">
            ✓ 适飞空域(真高≤120m)
          </text>
          <text class="bs-badge bs-badge--gold">
            {{ order.licenseReq }}
          </text>
        </view>
        <view class="od-rows">
          <view class="od-row">
            📍 作业地点:{{ order.location }}
          </view>
          <view class="od-row">
            🕐 预定时间:{{ order.time }}
          </view>
          <view v-if="order.droneReq" class="od-row">
            🛠 机型要求:{{ order.droneReq }}
          </view>
          <view class="od-row">
            👤 需求发包方:{{ order.publisher }} (对公结算)
          </view>
        </view>
        <view class="od-phone">
          <text class="od-phone-note">
            🔒 号码双向脱敏 · IM 全程存证
          </text>
          <view class="od-phone-btns">
            <view class="od-phone-btn" @click="goChat">
              <text>💬 平台IM</text>
            </view>
            <view class="od-phone-btn" @click="onCallPrivacy">
              <wd-icon name="phone" size="24rpx" />
              <text>虚拟号</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 电子服务合同(V3.0 4.6.1/4.6.5 防跳单) -->
      <view class="bs-card">
        <view class="uom-title">
          <wd-icon name="file" size="30rpx" color="#1677FF" />
          <text>电子服务合同</text>
        </view>
        <view class="uom-sub">
          接入 e签宝 · 具备法律效力 · 签署记录全程存证
        </view>
        <view class="step-box">
          <view class="step-box-head">
            <text>合同编号:BS-HT-20260825-006</text>
            <text class="bs-badge" :class="contractSigned ? 'bs-badge--success' : 'bs-badge--warning'">
              {{ contractSigned ? '已签署 · 存证 0x8f3a…e21c' : '待签署' }}
            </text>
          </view>
          <view v-if="!contractSigned" class="contract-brief">
            含<text class="contract-warn">
              反跳单条款
            </text>:任何一方不得引导或接受私下交易,违者支付订单金额 30% 违约金。
          </view>
          <view v-if="!contractSigned" class="step-box-btn" @click="agreeContract = false; showContract = true">
            ✍ 在线签署合同
          </view>
          <view v-else class="contract-ok">
            ✓ 双方已签署,需求方定金已托管至监管账户
          </view>
        </view>
      </view>

      <!-- UOM 合规与保险核验 -->
      <view class="bs-card">
        <view class="uom-title">
          <wd-icon name="safe" size="30rpx" color="#1677FF" />
          <text>UOM「一登二查三申请」与保险核验</text>
        </view>
        <view class="uom-sub">
          根据《无人驾驶航空器飞行管理暂行条例》硬性履约流程
        </view>

        <ComplianceStepper :current="currentStep" />

        <!-- ③ UOM 批文回传 -->
        <view v-if="isControlled" class="step-box">
          <view class="step-box-head">
            <text>管制空域 UOM 飞行批文回传:</text>
            <text class="bs-badge" :class="uomUploaded ? 'bs-badge--success' : 'bs-badge--danger'">
              {{ uomUploaded ? `已回传 ${uomDocNo}` : '待上传' }}
            </text>
          </view>
          <view v-if="!uomUploaded" class="step-box-btn" @click="onUploadUom">
            ⬆ 点击上传 UOM 审批截图 / 批文号
          </view>
        </view>
        <view v-else class="step-box">
          <view class="step-box-head">
            <text>空域属性:</text>
            <text class="bs-badge bs-badge--success">
              ✓ 适飞空域,免报备申请
            </text>
          </view>
        </view>

        <!-- ④ 平台强制保险 -->
        <view class="step-box">
          <view class="step-box-head">
            <text>平台强制保险(三者险+机身险):</text>
            <text class="bs-badge bs-badge--success">
              ✓ 已自动附加
            </text>
          </view>
          <view class="step-box-body">
            本订单已由平台自动附加 <text class="step-box-strong">
              第三者责任险(保额100万)+ 机身险
            </text>,保费 ¥25 已随单代收,保单与订单实时绑定,出险由保司绿色通道理赔。
          </view>
          <view class="policy-box">
            🛡 电子保单号:PICC-UAV-20260825-3500 · 承保:中国人保财险 · 与机身 SN 码自动绑定
          </view>
        </view>
      </view>
    </template>

    <!-- 吸底操作区 -->
    <view class="bottom-bar">
      <view class="checkin-btn" :class="{ 'checkin-btn--disabled': !canCheckIn }" @click="onCheckIn">
        📍 现场 GPS 定位打卡 (开始作业)
      </view>
      <view v-if="order && !canCheckIn" class="checkin-blocked">
        * 必须完成 UOM 批文回传,方可开始现场打卡作业(平台强制保险已自动附加)。
      </view>
    </view>

    <!-- 电子合同签署弹层 -->
    <view v-if="showContract" class="overlay" @click.self="showContract = false">
      <view class="contract-panel">
        <view class="panel-head">
          <text class="panel-title">
            ✍ 电子服务合同签署
          </text>
          <wd-icon name="close" size="36rpx" color="#8C8C8C" @click="showContract = false" />
        </view>
        <view class="panel-meta">
          甲方(需求方):贵州电网毕节供电局
          乙方(飞手):王建军 138****1234(已实名核验)
          服务内容:220kV 输电线路精细巡检(七星关区岔河镇)
        </view>
        <view class="clause-box">
          <text class="clause-strong">
            反跳单条款(显著提示)
          </text>:甲乙双方确认本次服务通过毕数飞行平台撮合达成,任何一方不得引导或接受私下交易;违者须向平台支付订单金额 <text class="clause-strong">
            30%
          </text> 的违约金,平台有权扣除保证金并公示违规记录。
        </view>
        <view class="panel-row">
          <text>合同金额</text>
          <text class="row-val">
            ¥3,500(定金 40% 托管监管账户)
          </text>
        </view>
        <view class="panel-row">
          <text>签署效力</text>
          <text class="row-val">
            e签宝 CA 数字证书 · 区块链存证
          </text>
        </view>
        <view class="agree-row" @click="agreeContract = !agreeContract">
          <wd-icon
            :name="agreeContract ? 'check-circle-fill' : 'circle'"
            size="34rpx"
            :color="agreeContract ? '#1677FF' : '#BFBFBF'"
          />
          <text>我已逐条阅读全部条款,承诺不进行站外私下交易</text>
        </view>
        <view class="sign-btn" :class="{ 'sign-btn--disabled': !agreeContract }" @click="signContract">
          使用 CA 证书签名并提交
        </view>
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.od-page {
  padding-bottom: 220rpx;
}

.risk-banner {
  background: linear-gradient(90deg, #FFF1F0, #FFF7F5);
  border-left: 8rpx solid var(--bs-danger);
  padding: 22rpx 28rpx;
  font-size: 24rpx;
  color: #CF1322;
  line-height: 1.55;
}

.risk-title {
  font-weight: 700;
  margin-bottom: 4rpx;
}

.od-info {
  margin-top: 24rpx;
}

.od-info-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20rpx;
}

.od-title {
  font-size: var(--bs-font-h3);
  font-weight: 700;
  color: var(--bs-text-primary);
  line-height: 1.4;
  flex: 1;
}

.od-price {
  font-size: 44rpx;
  font-weight: 700;
  color: var(--bs-brand-accent);
  margin: 8rpx 0 20rpx;
}

.od-cur {
  font-size: 28rpx;
  margin-right: 2rpx;
}

.od-price-note {
  font-size: 24rpx;
  color: var(--bs-text-tertiary);
  font-weight: 400;
  margin-left: 8rpx;
}

.od-badges {
  display: flex;
  gap: 12rpx;
  flex-wrap: wrap;
  margin-bottom: 20rpx;
}

.od-rows {
  font-size: 24rpx;
  color: var(--bs-text-secondary);
  line-height: 1.9;
}

.od-phone {
  margin-top: 20rpx;
  padding-top: 20rpx;
  border-top: 1rpx dashed var(--bs-border);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.od-phone-note {
  font-size: 24rpx;
  color: var(--bs-text-tertiary);
}

.od-phone-btns {
  display: flex;
  gap: 14rpx;
}

.od-phone-btn {
  display: flex;
  align-items: center;
  gap: 8rpx;
  font-size: 24rpx;
  font-weight: 600;
  color: var(--bs-brand-primary);
  border: 1rpx solid rgba(22, 119, 255, 0.55);
  border-radius: var(--bs-radius-full);
  padding: 12rpx 26rpx;
}

.contract-brief {
  font-size: 21rpx;
  color: var(--bs-text-secondary);
  line-height: 1.6;
}

.contract-warn {
  color: #D46B08;
  font-weight: 600;
}

.contract-ok {
  font-size: 21rpx;
  color: var(--bs-success);
}

/* 合同签署弹层 */
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(10, 20, 40, 0.5);
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40rpx;
}

.contract-panel {
  width: 100%;
  max-height: 80vh;
  overflow-y: auto;
  background: #fff;
  border-radius: var(--bs-radius-xl);
  padding: 36rpx 32rpx;
  box-shadow: var(--bs-shadow-float);
}

.panel-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.panel-title {
  font-size: 30rpx;
  font-weight: 700;
  color: var(--bs-text-primary);
}

.panel-meta {
  font-size: 22rpx;
  color: var(--bs-text-secondary);
  line-height: 1.7;
  margin: 20rpx 0;
}

.clause-box {
  background: #FFFBE6;
  border: 1rpx dashed #F7BA48;
  border-radius: var(--bs-radius-md);
  padding: 20rpx 24rpx;
  font-size: 21rpx;
  color: #6D4C00;
  line-height: 1.7;
  margin-bottom: 16rpx;
}

.clause-strong {
  color: #D46B08;
  font-weight: 700;
}

.panel-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16rpx;
  font-size: 23rpx;
  color: var(--bs-text-secondary);
  padding: 14rpx 4rpx;

  &+ .panel-row {
    border-top: 1rpx dashed var(--bs-border);
  }
}

.row-val {
  color: var(--bs-text-primary);
  font-weight: 600;
  text-align: right;
}

.agree-row {
  display: flex;
  align-items: flex-start;
  gap: 12rpx;
  font-size: 21rpx;
  color: var(--bs-text-secondary);
  line-height: 1.55;
  margin: 22rpx 0;
}

.sign-btn {
  height: 88rpx;
  border-radius: var(--bs-radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  font-weight: 600;
  color: #fff;
  background: linear-gradient(135deg, #1677FF 0%, #00A6FF 100%);
  box-shadow: 0 12rpx 28rpx rgba(22, 119, 255, 0.32);
}

.sign-btn--disabled {
  background: var(--bs-divider);
  color: var(--bs-text-disabled);
  box-shadow: none;
}

.uom-title {
  display: flex;
  align-items: center;
  gap: 10rpx;
  font-size: 28rpx;
  font-weight: 700;
  color: var(--bs-text-primary);
}

.uom-sub {
  font-size: 22rpx;
  color: var(--bs-text-tertiary);
  margin: 6rpx 0 24rpx;
}

.step-box {
  background: var(--bs-bg-page);
  border-radius: var(--bs-radius-lg);
  padding: 24rpx;
  margin-bottom: 20rpx;
  font-size: 24rpx;
  border: 1rpx solid rgba(229, 230, 235, 0.7);
}

.step-box:last-child {
  margin-bottom: 0;
}

.step-box-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16rpx;
  font-weight: 600;
  color: var(--bs-text-primary);
}

.step-box-btn {
  margin-top: 16rpx;
  text-align: center;
  font-size: 24rpx;
  font-weight: 600;
  color: var(--bs-brand-primary);
  border: 1rpx solid rgba(22, 119, 255, 0.55);
  border-radius: var(--bs-radius-full);
  padding: 16rpx 0;
}

.step-box-body {
  margin-top: 12rpx;
  color: var(--bs-text-secondary);
  line-height: 1.6;
}

.step-box-strong {
  color: var(--bs-text-primary);
  font-weight: 600;
}

.policy-box {
  margin-top: 16rpx;
  background: #F6FFED;
  border: 1rpx dashed #95D475;
  border-radius: var(--bs-radius-md);
  padding: 16rpx 20rpx;
  font-size: 22rpx;
  color: #389E0D;
  line-height: 1.5;
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

.checkin-btn {
  background: linear-gradient(135deg, #1677FF 0%, #00A6FF 100%);
  color: #fff;
  text-align: center;
  font-size: 30rpx;
  font-weight: 600;
  border-radius: var(--bs-radius-full);
  padding: 26rpx 0;
  box-shadow: 0 12rpx 28rpx rgba(22, 119, 255, 0.32);
}

.checkin-btn--disabled {
  background: var(--bs-divider);
  color: var(--bs-text-disabled);
  box-shadow: none;
}

.checkin-blocked {
  text-align: center;
  font-size: 22rpx;
  color: var(--bs-danger);
  margin-top: 14rpx;
}
</style>

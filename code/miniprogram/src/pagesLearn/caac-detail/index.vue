<script setup lang="ts">
import type { CaacClass } from '@/api'
import { apiGetCaacDetail } from '@/api'

definePage({
  name: 'caac-detail',
  style: { navigationBarTitleText: '考证班详情' },
})

const router = useRouter()
const item = ref<CaacClass | null>(null)
const classId = ref('')

onLoad(async (query) => {
  classId.value = (query?.id as string) || ''
  if (!classId.value)
    return
  const res = await apiGetCaacDetail(classId.value)
  if (res?.data)
    item.value = res.data
})

function onEnroll() {
  router.push({ name: 'learn-enroll', query: { id: classId.value, type: 'caac' } })
}
</script>

<template>
  <view class="bs-page cd-page">
    <template v-if="item">
      <!-- 封面区 -->
      <view class="cd-hero">
        <view class="cd-hero-icon">
          🪪
        </view>
        <view class="cd-hero-kicker">
          中国民用航空局 (CAAC) 官方执照
        </view>
        <view class="cd-hero-title">
          {{ item.title }}
        </view>
        <view class="cd-hero-sub">
          持证即可在平台抢接高薪商业订单 · 可申请人社证书补贴 {{ item.subsidy }}
        </view>
      </view>

      <!-- 班级信息 -->
      <view class="bs-card">
        <view class="cd-badges">
          <text v-if="item.recommended" class="bs-badge bs-badge--gold">
            🏆 金标推荐
          </text>
          <text class="bs-badge bs-badge--primary">
            {{ item.droneType }} · {{ item.level }}
          </text>
          <text class="bs-badge bs-badge--success">
            人社证书补贴 {{ item.subsidy }}
          </text>
        </view>
        <view class="cd-price-row">
          <text class="cd-price bs-num">
            <text class="cd-cur">
              ¥
            </text>{{ item.price.toLocaleString() }}
          </text>
          <text v-if="item.recommended" class="cd-price-note">
            技能班结业学员可享 ¥800 专属补贴券
          </text>
        </view>
        <view class="cd-rows">
          <view class="cd-row">
            🪪 执照类型:{{ item.level }}(民航局颁发,全国通用)
          </view>
          <view class="cd-row">
            🛠 机型类别:{{ item.droneType }}
          </view>
          <view class="cd-row">
            🕐 培训周期:{{ item.period }}
          </view>
          <view class="cd-row">
            🏫 机构资质:{{ item.org }}
          </view>
        </view>
      </view>

      <!-- 补贴说明 -->
      <view class="bs-card">
        <view class="cd-sec-title">
          人社证书补贴说明
        </view>
        <view class="cd-row policy-desc">
          考取 CAAC 执照后,可在「我的 - 人社证书补贴申请」一键申领证书补贴:视距内 ¥1,500~2,000、超视距 ¥2,000~3,000、教员 ¥3,000~5,000(以当地人社政策为准),材料由平台自动汇总推送。本班参考额度:<text class="policy-strong">
            {{ item.subsidy }}
          </text>。
        </view>
      </view>

      <!-- 资金监管说明 -->
      <view class="bs-card">
        <view class="cd-sec-title">
          资金监管 · T+1 分账结算
        </view>
        <view class="cd-row policy-desc">
          报名费用由微信支付官方分账专户冻结托管,T+1分账结算给机构;首考未过免费重培,中途退学按协议原路退回未消课时费用。
        </view>
      </view>
    </template>

    <!-- 吸底主按钮(橙色 CTA) -->
    <view class="bottom-bar">
      <view class="enroll-btn" @click="onEnroll">
        立即报名缴费
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.cd-page {
  padding-bottom: 200rpx;
}

.cd-hero {
  background: linear-gradient(155deg, #14295C 0%, #1F3B7A 55%, #2B56A8 100%);
  color: #fff;
  padding: 48rpx 32rpx 56rpx;
  border-bottom-left-radius: 40rpx;
  border-bottom-right-radius: 40rpx;
}

.cd-hero-icon {
  font-size: 72rpx;
  margin-bottom: 16rpx;
}

.cd-hero-kicker {
  font-size: 22rpx;
  color: #9FC4FF;
  letter-spacing: 0.06em;
}

.cd-hero-title {
  font-size: 36rpx;
  font-weight: 700;
  margin: 8rpx 0 6rpx;
  line-height: 1.35;
}

.cd-hero-sub {
  font-size: 22rpx;
  opacity: 0.85;
  line-height: 1.5;
}

.cd-badges {
  display: flex;
  gap: 12rpx;
  flex-wrap: wrap;
  margin-bottom: 16rpx;
}

.cd-price-row {
  display: flex;
  align-items: baseline;
  gap: 16rpx;
  flex-wrap: wrap;
  margin-bottom: 16rpx;
}

.cd-price {
  font-size: 44rpx;
  font-weight: 700;
  color: var(--bs-brand-accent);
}

.cd-cur {
  font-size: 28rpx;
}

.cd-price-note {
  font-size: 22rpx;
  color: var(--bs-success);
}

.cd-rows {
  font-size: 24rpx;
  color: var(--bs-text-secondary);
  line-height: 1.9;
}

.cd-sec-title {
  font-size: 28rpx;
  font-weight: 700;
  color: var(--bs-text-primary);
  margin-bottom: 16rpx;
}

.policy-desc {
  line-height: 1.6;
}

.policy-strong {
  color: var(--bs-text-primary);
  font-weight: 600;
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

.enroll-btn {
  background: linear-gradient(135deg, #FF9433 0%, #FF7A00 55%, #F56A00 100%);
  color: #fff;
  text-align: center;
  font-size: 30rpx;
  font-weight: 600;
  border-radius: var(--bs-radius-full);
  padding: 26rpx 0;
  box-shadow: 0 12rpx 28rpx rgba(255, 122, 0, 0.32);
}
</style>

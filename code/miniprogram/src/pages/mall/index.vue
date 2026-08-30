<script setup lang="ts">
/**
 * 装备商城:二手专区(SN防盗抢核验 / 42项官方验机 / UOM权属过户)+ 全新官方整机与配件
 */
definePage({
  name: 'mall',
  layout: 'tabbar',
  style: {
    navigationBarTitleText: '装备商城',
  },
})

const tab = ref<'secondhand' | 'new'>('secondhand')

function toast(title: string) {
  uni.showToast({ title, icon: 'none' })
}

/* ===== 二手商品 ===== */
const secondhandGoods = [
  {
    id: 'SH001',
    img: '/static/img/product-drone.jpg',
    title: '【95新】大疆 DJI Mavic 3E 行业测绘无人机',
    meta: '飞行总时长 32小时 · 电池循环 18次',
    badges: ['官方已验机', 'SN已核验'],
    price: 18500,
    priceDel: '¥24,999',
    seller: '毕节某测绘工作室 (实名)',
    reportable: true,
  },
  {
    id: 'SH002',
    img: '/static/img/demand-farm.jpg',
    title: '【9成新】极飞 P100 Pro 农业无人飞机',
    meta: '作业面积 1200亩 · 包含4电1充',
    badges: ['官方已验机', '支持UOM过户'],
    price: 29000,
    priceDel: '¥43,000',
    seller: '黔西植保服务队 (实名)',
    reportable: false,
  },
]

/* ===== 全新官方 ===== */
const newGoods = [
  {
    id: 'NW001',
    img: '/static/img/demand-city.jpg',
    title: '【官方直营】大疆 Matrice 350 RTK 行业旗舰机',
    meta: '支持挂载禅思 H20T 热成像 / L2 激光雷达',
    badges: ['正品保障', '官方直营'],
    price: 49888,
    priceDel: '',
    seller: '毕数官方自营',
    reportable: false,
  },
]

/* ===== 42项验机报告弹层 ===== */
const showReport = ref(false)
const reportItems = [
  { name: '1. 飞控黑匣子日志分析', val: '✓ 历史无炸机/无进水记录', ok: true },
  { name: '2. 动力电池循环与压差', val: '✓ 循环18次 寿命98% 压差0.01V', ok: true },
  { name: '3. 云台电机与机械虚位', val: '✓ 角度回中正常 传感器良好', ok: true },
  { name: '4. UOM 国家平台登记校验', val: '✓ 原机主已解绑 可合法过户', ok: false },
]
</script>

<template>
  <view class="bs-page mall-page">
    <!-- 顶部胶囊切换 -->
    <view class="seg-bar">
      <view class="seg seg--fill">
        <view class="seg-item" :class="{ on: tab === 'secondhand' }" @click="tab = 'secondhand'">
          闲置二手专区(42项验机)
        </view>
        <view class="seg-item" :class="{ on: tab === 'new' }" @click="tab = 'new'">
          全新官方整机与配件
        </view>
      </view>
    </view>

    <!-- ===== 二手专区 ===== -->
    <template v-if="tab === 'secondhand'">
      <view class="guarantee-box">
        <view class="guarantee-title">
          🛡 毕数官方二手安全交易保障
        </view>
        <view class="guarantee-body">
          强制输入机身 SN 码防盗抢赃机 · 42项专业物理与日志验机 · UOM 权属过户指引
        </view>
      </view>

      <view v-for="g in secondhandGoods" :key="g.id" class="bs-card product-card">
        <view class="product-row" @click="g.reportable ? (showReport = true) : toast('商品详情二期开放')">
          <image class="product-cover" :src="g.img" mode="aspectFill" />
          <view class="product-main">
            <view class="product-title">
              {{ g.title }}
            </view>
            <view class="product-meta">
              {{ g.meta }}
            </view>
            <view class="product-badges">
              <text v-for="b in g.badges" :key="b" class="bs-badge bs-badge--success">
                ✓ {{ b }}
              </text>
            </view>
            <view class="product-price bs-num">
              ¥{{ g.price.toLocaleString() }}
              <text v-if="g.priceDel" class="price-del">
                {{ g.priceDel }}
              </text>
            </view>
          </view>
        </view>
        <view class="product-foot">
          <text class="foot-seller">
            卖家:{{ g.seller }}
          </text>
          <view
            v-if="g.reportable" class="btn-secondary-sm"
            @click.stop="showReport = true"
          >
            查看42项验机报告
          </view>
          <view v-else class="btn-secondary-sm" @click.stop="toast('下单功能二期开放')">
            立即咨询
          </view>
        </view>
      </view>
    </template>

    <!-- ===== 全新官方 ===== -->
    <template v-else>
      <view v-for="g in newGoods" :key="g.id" class="bs-card product-card">
        <view class="product-row">
          <image class="product-cover" :src="g.img" mode="aspectFill" />
          <view class="product-main">
            <view class="product-title">
              {{ g.title }}
            </view>
            <view class="product-meta">
              {{ g.meta }}
            </view>
            <view class="product-badges">
              <text v-for="b in g.badges" :key="b" class="bs-badge" :class="b === '正品保障' ? 'bs-badge--primary' : 'bs-badge--gold'">
                {{ b }}
              </text>
            </view>
            <view class="product-price bs-num">
              ¥{{ g.price.toLocaleString() }}
            </view>
          </view>
        </view>
        <view class="product-foot">
          <text class="foot-seller">
            卖家:{{ g.seller }}
          </text>
          <view class="btn-primary-block" @click="toast('支持企业对公转账与 13% 专票')">
            立即咨询企业集采
          </view>
        </view>
      </view>
    </template>

    <!-- 42项官方验机报告弹层 -->
    <view v-if="showReport" class="overlay" @click.self="showReport = false">
      <view class="report-panel">
        <view class="report-head">
          <text class="report-title">
            ✅ 42项官方验机检测报告
          </text>
          <wd-icon name="close" size="36rpx" color="#8C8C8C" @click="showReport = false" />
        </view>
        <view class="report-meta">
          检测机型:DJI Mavic 3E | 序列号:<text class="bs-num">
            1581F4AA9812
          </text>
          检测机构:毕数飞行官方无人机检测实验室 (毕节市)
        </view>
        <view v-for="(r, i) in reportItems" :key="i" class="report-row">
          <text>{{ r.name }}</text>
          <text class="report-val" :class="r.ok ? 'ok' : 'info'">
            {{ r.val }}
          </text>
        </view>
        <view class="report-btn" @click="showReport = false; toast('已将验机凭证加入交易保障')">
          确认保障并关闭
        </view>
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.mall-page {
  min-height: 100vh;
}

/* 胶囊切换 */
.seg-bar {
  background: #fff;
  padding: 16rpx 32rpx;
  border-bottom: 1rpx solid var(--bs-border);
}

.seg--fill .seg-item {
  flex: 1;
  text-align: center;
}

.seg {
  display: flex;
  background: var(--bs-divider);
  border-radius: var(--bs-radius-full);
  padding: 6rpx;
  border: 1rpx solid rgba(229, 230, 235, 0.7);
}

.seg-item {
  padding: 12rpx 20rpx;
  font-size: 24rpx;
  border-radius: var(--bs-radius-full);
  color: var(--bs-text-secondary);
  white-space: nowrap;
}

.seg-item.on {
  background: #fff;
  color: var(--bs-brand-primary);
  font-weight: 600;
  box-shadow: 0 4rpx 16rpx rgba(15, 42, 90, 0.12);
}

/* 保障条 */
.guarantee-box {
  margin: 24rpx 32rpx;
  background: rgba(0, 181, 120, 0.07);
  border: 1rpx dashed rgba(0, 181, 120, 0.5);
  border-radius: var(--bs-radius-lg);
  padding: 22rpx 26rpx;
}

.guarantee-title {
  font-size: 25rpx;
  font-weight: 600;
  color: var(--bs-success);
  margin-bottom: 6rpx;
}

.guarantee-body {
  font-size: 21rpx;
  color: var(--bs-text-secondary);
  line-height: 1.55;
}

/* 商品卡 */
.product-card {
  margin-bottom: 24rpx;
}

.product-row {
  display: flex;
  gap: 24rpx;
}

.product-cover {
  width: 176rpx;
  height: 176rpx;
  border-radius: var(--bs-radius-lg);
  flex-shrink: 0;
}

.product-main {
  flex: 1;
  min-width: 0;
}

.product-title {
  font-size: 28rpx;
  font-weight: 700;
  color: var(--bs-text-primary);
  line-height: 1.35;
}

.product-meta {
  font-size: 22rpx;
  color: var(--bs-text-secondary);
  margin: 8rpx 0 10rpx;
}

.product-badges {
  display: flex;
  gap: 10rpx;
  flex-wrap: wrap;
}

.product-price {
  font-size: 34rpx;
  font-weight: 700;
  color: var(--bs-brand-accent);
  margin-top: 12rpx;
}

.price-del {
  font-size: 22rpx;
  color: var(--bs-text-tertiary);
  text-decoration: line-through;
  font-weight: 400;
  margin-left: 10rpx;
}

.product-foot {
  border-top: 1rpx dashed var(--bs-border);
  margin-top: 20rpx;
  padding-top: 18rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16rpx;
}

.foot-seller {
  font-size: 21rpx;
  color: var(--bs-text-tertiary);
  flex: 1;
  min-width: 0;
}

.btn-secondary-sm {
  flex-shrink: 0;
  font-size: 22rpx;
  font-weight: 600;
  color: var(--bs-brand-primary);
  border: 1rpx solid rgba(22, 119, 255, 0.55);
  border-radius: var(--bs-radius-full);
  padding: 10rpx 22rpx;
}

.btn-primary-block {
  flex-shrink: 0;
  font-size: 23rpx;
  font-weight: 600;
  color: #fff;
  background: linear-gradient(135deg, #1677FF 0%, #00A6FF 100%);
  border-radius: var(--bs-radius-full);
  padding: 14rpx 26rpx;
  box-shadow: 0 8rpx 20rpx rgba(22, 119, 255, 0.3);
}

/* 验机报告弹层 */
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

.report-panel {
  width: 100%;
  max-height: 80vh;
  overflow-y: auto;
  background: #fff;
  border-radius: var(--bs-radius-xl);
  padding: 36rpx 32rpx;
  box-shadow: var(--bs-shadow-float);
}

.report-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.report-title {
  font-size: 30rpx;
  font-weight: 700;
  color: var(--bs-text-primary);
}

.report-meta {
  font-size: 22rpx;
  color: var(--bs-text-secondary);
  line-height: 1.7;
  margin-bottom: 20rpx;
}

.report-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16rpx;
  background: var(--bs-divider);
  padding: 18rpx 22rpx;
  border-radius: 14rpx;
  font-size: 23rpx;
  color: var(--bs-text-primary);

  &+ .report-row {
    margin-top: 14rpx;
  }
}

.report-val {
  font-weight: 600;
  font-size: 21rpx;
  text-align: right;
  flex-shrink: 0;

  &.ok {
    color: var(--bs-success);
  }

  &.info {
    color: var(--bs-brand-primary);
  }
}

.report-btn {
  margin-top: 28rpx;
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
</style>

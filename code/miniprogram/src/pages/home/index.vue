<script setup lang="ts">
/**
 * 首页
 * 结构:Banner 轮播 → 5×2 金刚区 → 平台公告 → 优质培训机构(横滑)
 *      → 最新需求(2x2) → 商城推荐(横滑)
 * 金刚区图标:阿里 iconfont 字体(iconfont-src/map.mjs),未映射时回落 emoji
 */
import { map as iconMap } from '../../../iconfont-src/map.mjs'

definePage({
  name: 'home',
  type: 'home',
  layout: 'tabbar',
  style: {
    navigationBarTitleText: '毕数飞行平台',
  },
})

const router = useRouter()

function toast(title: string) {
  uni.showToast({ title, icon: 'none' })
}

/* ===== Banner 轮播 ===== */
const banners = [
  {
    key: 'fly',
    title: '连接天空 赋能未来',
    sub: '培训 · 服务 · 交易 · 共赢',
    cta: '立即体验',
    ctaTo: 'orders',
    img: '/static/img/hero.jpg',
  },
  {
    key: 'learn',
    title: '低空经济人才摇篮',
    sub: '技能免费学 · CAAC 执照考证一站式',
    cta: '去学习',
    ctaTo: 'learn',
    img: '/static/img/banner-learn.jpg',
  },
  {
    key: 'grab',
    title: '抢单变现 · 合规护航',
    sub: '订单广场 · 资金托管 · 强制保险',
    cta: '去接单',
    ctaTo: 'orders',
    img: '/static/img/demand-farm.jpg',
  },
]

function onBannerCta(ctaTo: string) {
  router.pushTab({ name: ctaTo })
}

/* ===== 金刚区(5×2 统一宫格) ===== */
interface GridItem {
  key: string
  label: string
  emoji: string
  /** 图标浅底色 */
  bg: string
  /** 图标主题色 */
  iconColor: string
  action: { kind: 'tab', name: string } | { kind: 'route', name: string } | { kind: 'toast', text: string }
  /** iconfont 类名(未映射时为 '',回落 emoji) */
  iconClass?: string
}

const gridItems: GridItem[] = ([
  { key: 'skill', label: '技能培训', emoji: '🎓', bg: '#E8F0FE', iconColor: '#1677FF', action: { kind: 'tab', name: 'learn' } },
  { key: 'caac', label: 'CAAC考证', emoji: '🪪', bg: '#E4F6EC', iconColor: '#00A06B', action: { kind: 'tab', name: 'learn' } },
  { key: 'pilot-reg', label: '飞手登记', emoji: '👤', bg: '#EFEAFA', iconColor: '#722ED1', action: { kind: 'toast', text: '飞手登记功能二期开放' } },
  { key: 'device-reg', label: '机器登记', emoji: '🧬', bg: '#E2F4F4', iconColor: '#0E9E9E', action: { kind: 'toast', text: 'UOM 机器登记功能二期开放' } },
  { key: 'publish', label: '需求发布', emoji: '✈️', bg: '#FDEEE0', iconColor: '#F56A00', action: { kind: 'route', name: 'order-publish' } },
  { key: 'grab', label: '抢单大厅', emoji: '⚡', bg: '#FDEEE0', iconColor: '#F56A00', action: { kind: 'tab', name: 'orders' } },
  { key: 'secondhand', label: '二手交易', emoji: '🛒', bg: '#E8F0FE', iconColor: '#1677FF', action: { kind: 'tab', name: 'mall' } },
  { key: 'repair', label: '维修服务', emoji: '🔧', bg: '#E4F6EC', iconColor: '#00A06B', action: { kind: 'route', name: 'repair-apply' } },
  { key: 'mall', label: '线上商城', emoji: '🛍️', bg: '#EFEAFA', iconColor: '#722ED1', action: { kind: 'tab', name: 'mall' } },
  { key: 'parts', label: '机器配件', emoji: '📦', bg: '#E8F0FE', iconColor: '#1677FF', action: { kind: 'tab', name: 'mall' } },
] as GridItem[]).map(item => ({ ...item, iconClass: iconMap[item.key] ? `bs-icon--${item.key}` : '' }))

function onGridTap(item: GridItem) {
  if (item.action.kind === 'tab')
    router.pushTab({ name: item.action.name })
  else if (item.action.kind === 'route')
    router.push({ name: item.action.name })
  else
    toast(item.action.text)
}

/* ===== 平台公告 ===== */
const announcements = [
  { title: '关于开展毕节市无人机飞行安全专项整治行动的通知', date: '05-20' },
  { title: '平台新增飞行申报功能,快来体验!', date: '05-18' },
  { title: '2024 年无人机行业发展报告发布', date: '05-15' },
]

/* ===== 优质培训机构 ===== */
const orgs = [
  { name: '毕节市蓝天飞行学院', certified: true, types: '多旋翼/垂起固定翼', city: '毕节市', score: 4.9, img: '/static/img/school-1.jpg' },
  { name: '贵州翱翔无人机学院', certified: false, types: '多旋翼/垂起固定翼', city: '毕节市', score: 4.8, img: '/static/img/school-2.jpg' },
  { name: '毕节市天鹰无人机学院', certified: true, types: '多旋翼/垂起固定翼', city: '毕节市', score: 4.9, img: '/static/img/school-3.jpg' },
  { name: '毕节中科无人机培训', certified: false, types: '多旋翼/垂起固定翼', city: '毕节市', score: 4.7, img: '/static/img/school-4.jpg' },
]

/* ===== 最新需求 ===== */
const demands = [
  { tag: '植保作业', tagCls: 'tag--green', title: '马铃薯病虫害防治作业', city: '毕节 威宁', date: '05-20', price: '¥800', unit: '/亩' },
  { tag: '航拍服务', tagCls: 'tag--orange', title: '织金洞景区宣传片航拍', city: '毕节 织金', date: '05-19', price: '¥1500', unit: '/单' },
  { tag: '测绘建模', tagCls: 'tag--blue', title: '山地地形测绘建模服务', city: '毕节 大方', date: '05-18', price: '¥3000', unit: '/次' },
  { tag: '巡检作业', tagCls: 'tag--gray', title: '电力线路巡检', city: '毕节 七星关', date: '05-17', price: '¥1200', unit: '/次' },
]

/* ===== 商城推荐 ===== */
const goods: { name: string, desc: string, price: string, img?: string, icon?: string }[] = [
  { name: '大疆 Mavic 3 Pro', desc: '旗舰航拍无人机', price: '¥13888', img: '/static/img/product-drone.jpg' },
  { name: '道通 EVO Lite+', desc: '6K 超清航拍无人机', price: '¥8999', img: '/static/img/product-drone-fold.jpg' },
  { name: '无人机电池', desc: '智能飞行电池', price: '¥699', img: '/static/img/product-battery.jpg' },
  { name: 'GPS 模块', desc: '高精度定位模块', price: '¥359', icon: 'parts' },
  { name: '碳纤维桨叶', desc: '静音桨叶套装', price: '¥129', icon: 'parts' },
]
</script>

<template>
  <view class="bs-page home-page">
    <!-- 顶部:定位 + 消息 -->
    <view class="home-head">
      <view class="city">
        <wd-icon name="location" size="26rpx" color="#595959" />
        <text>毕节市</text>
      </view>
      <view class="notice" @click="toast('暂无新消息')">
        <wd-icon name="notification" size="38rpx" color="#1A1A1A" />
        <view class="notice-dot" />
      </view>
    </view>

    <!-- Banner 轮播 -->
    <view class="banner-wrap">
      <swiper class="banner-swiper" circular autoplay :interval="4000" indicator-dots indicator-color="rgba(255,255,255,0.4)" indicator-active-color="#ffffff">
        <swiper-item v-for="b in banners" :key="b.key">
          <view class="banner">
            <image class="banner-img" :src="b.img" mode="aspectFill" />
            <view class="banner-main">
              <view class="banner-title">
                {{ b.title }}
              </view>
              <view class="banner-sub">
                {{ b.sub }}
              </view>
              <view class="banner-cta" @click="onBannerCta(b.ctaTo)">
                {{ b.cta }}
              </view>
            </view>
          </view>
        </swiper-item>
      </swiper>
    </view>

    <!-- 金刚区(5×2) -->
    <view class="bs-card grid-card">
      <view class="grid-menu">
        <view v-for="item in gridItems" :key="item.key" class="grid-item" @click="onGridTap(item)">
          <view class="grid-icon" :style="{ background: item.bg }">
            <text v-if="item.iconClass" class="bs-icon-font grid-iconfont" :class="item.iconClass" :style="{ color: item.iconColor }" />
            <text v-else class="grid-emoji">
              {{ item.emoji }}
            </text>
          </view>
          <text class="grid-label">
            {{ item.label }}
          </text>
        </view>
      </view>
    </view>

    <!-- 平台公告 -->
    <view class="notice-card">
      <view class="notice-aside">
        <text class="notice-title">
          平台公告
        </text>
        <wd-icon name="notification" size="38rpx" color="#1677FF" />
      </view>
      <view class="notice-list">
        <view v-for="(n, i) in announcements" :key="i" class="notice-row" @click="toast(n.title)">
          <view class="notice-row-head">
            <view class="notice-title-wrap">
              <view class="notice-bullet" />
              <text class="notice-item-title">
                {{ n.title }}
              </text>
            </view>
            <text class="notice-date bs-num">
              {{ n.date }}
            </text>
          </view>
        </view>
      </view>
    </view>

    <!-- 优质培训机构 -->
    <view class="section-head">
      <text class="section-title">
        优质培训机构
      </text>
      <view class="view-more" @click="router.pushTab({ name: 'learn' })">
        查看更多
        <wd-icon name="arrow-right" size="20rpx" color="#8C8C8C" />
      </view>
    </view>
    <scroll-view scroll-x class="org-scroll" :show-scrollbar="false">
      <view v-for="o in orgs" :key="o.name" class="org-card" @click="router.pushTab({ name: 'learn' })">
        <view class="org-cover">
          <image class="org-cover-img" :src="o.img" mode="aspectFill" />
          <text v-if="o.certified" class="org-cert">
            官方认证
          </text>
        </view>
        <view class="org-name">
          {{ o.name }}
        </view>
        <view class="org-meta">
          {{ o.types }}
        </view>
        <view class="org-foot">
          <wd-icon name="location" size="20rpx" color="#8C8C8C" />
          <text class="org-city">
            {{ o.city }}
          </text>
          <text class="org-score bs-num">
            {{ o.score }}分
          </text>
        </view>
      </view>
    </scroll-view>

    <!-- 最新需求 -->
    <view class="section-head">
      <text class="section-title">
        最新需求
      </text>
      <view class="view-more" @click="router.pushTab({ name: 'orders' })">
        查看更多
        <wd-icon name="arrow-right" size="20rpx" color="#8C8C8C" />
      </view>
    </view>
    <view class="demand-grid">
      <view v-for="(d, i) in demands" :key="i" class="bs-card demand-card" @click="router.pushTab({ name: 'orders' })">
        <text class="demand-tag" :class="d.tagCls">
          {{ d.tag }}
        </text>
        <view class="demand-title">
          {{ d.title }}
        </view>
        <view class="demand-loc">
          <wd-icon name="location" size="20rpx" color="#8C8C8C" />
          <text>{{ d.city }}</text>
          <text class="demand-date bs-num">
            {{ d.date }}
          </text>
        </view>
        <view class="demand-price bs-num">
          <text class="dp-num">
            {{ d.price }}
          </text>
          <text class="dp-unit">
            {{ d.unit }}
          </text>
        </view>
      </view>
    </view>

    <!-- 商城推荐 -->
    <view class="section-head">
      <text class="section-title">
        商城推荐
      </text>
      <view class="view-more" @click="router.pushTab({ name: 'mall' })">
        查看更多
        <wd-icon name="arrow-right" size="20rpx" color="#8C8C8C" />
      </view>
    </view>
    <scroll-view scroll-x class="goods-scroll" :show-scrollbar="false">
      <view v-for="g in goods" :key="g.name" class="goods-card" @click="router.pushTab({ name: 'mall' })">
        <view class="goods-cover">
          <image v-if="g.img" class="goods-cover-img" :src="g.img" mode="aspectFill" />
          <text v-else class="bs-icon-font goods-icon" :class="`bs-icon--${g.icon}`" />
        </view>
        <view class="goods-name">
          {{ g.name }}
        </view>
        <view class="goods-desc">
          {{ g.desc }}
        </view>
        <view class="goods-price bs-num">
          {{ g.price }}
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<style lang="scss" scoped>
@use '@/styles/iconfont.scss';

.home-page {
  padding-bottom: 24rpx;
}

/* ===== 顶部:定位 + 消息 ===== */
.home-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx 32rpx 16rpx;
}

.city {
  display: flex;
  align-items: center;
  gap: 8rpx;
  font-size: 27rpx;
  font-weight: 600;
  color: var(--bs-text-primary);
}

.notice {
  position: relative;
}

.notice-dot {
  position: absolute;
  top: 2rpx;
  right: 2rpx;
  width: 12rpx;
  height: 12rpx;
  background: var(--bs-danger);
  border: 2rpx solid var(--bs-bg-page);
  border-radius: 50%;
}

/* ===== Banner 轮播 ===== */
.banner-wrap {
  padding: 0 32rpx;
}

.banner-swiper {
  height: 284rpx;
}

.banner {
  position: relative;
  height: 252rpx;
  border-radius: var(--bs-radius-lg);
  overflow: hidden;
  display: flex;
  align-items: center;
  padding: 0 36rpx;
}

.banner-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

/* 左侧压暗,保证白字在照片上可读 */
.banner::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, rgba(4, 18, 46, 0.5) 0%, rgba(4, 18, 46, 0.15) 55%, transparent 85%);
}

.banner-main {
  flex: 1;
  position: relative;
  z-index: 1;
}

.banner-title {
  font-size: 38rpx;
  font-weight: 700;
  color: #fff;
  line-height: 1.3;
}

.banner-sub {
  font-size: 23rpx;
  color: rgba(255, 255, 255, 0.85);
  margin: 10rpx 0 20rpx;
}

.banner-cta {
  display: inline-flex;
  padding: 10rpx 32rpx;
  border-radius: var(--bs-radius-full);
  background: #fff;
  color: var(--bs-brand-primary);
  font-size: 23rpx;
  font-weight: 600;

  &:active {
    opacity: 0.85;
  }
}

/* ===== 金刚区(5×2) ===== */
.grid-card {
  padding: 32rpx 16rpx;
}

.grid-menu {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 32rpx 0;
}

.grid-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12rpx;
  text-align: center;
}

.grid-item:active .grid-icon {
  transform: scale(0.9);
  transition: transform 0.12s;
}

.grid-icon {
  width: 88rpx;
  height: 88rpx;
  border-radius: 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.15s;
}

.grid-emoji {
  font-size: 42rpx;
  line-height: 1;
}

.grid-iconfont {
  font-size: 44rpx;
}

.grid-label {
  font-size: 23rpx;
  font-weight: 500;
  color: var(--bs-text-primary);
}

/* ===== 平台公告 ===== */
.notice-card {
  margin: 0 32rpx 28rpx;
  background: #fff;
  border-radius: var(--bs-radius-lg);
  padding: 24rpx;
  display: flex;
  gap: 24rpx;
  box-shadow: var(--bs-shadow-card);
}

.notice-aside {
  flex-shrink: 0;
  width: 136rpx;
  border-radius: var(--bs-radius-md);
  background: #EDF4FF;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
}

.notice-title {
  color: var(--bs-brand-primary);
  font-size: 25rpx;
  font-weight: 700;
}

.notice-list {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-width: 0;
}

.notice-row {
  padding: 10rpx 0;
}

.notice-row-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12rpx;
}

.notice-title-wrap {
  display: flex;
  align-items: center;
  gap: 12rpx;
  flex: 1;
  min-width: 0;
}

.notice-bullet {
  flex-shrink: 0;
  width: 8rpx;
  height: 8rpx;
  border-radius: 50%;
  background: var(--bs-brand-primary);
}

.notice-item-title {
  font-size: 23rpx;
  color: var(--bs-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
  min-width: 0;
}

.notice-date {
  font-size: 21rpx;
  color: var(--bs-text-tertiary);
  flex-shrink: 0;
}

/* ===== 区块头 ===== */
.section-head {
  padding: 0 32rpx 18rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.section-title {
  font-size: 30rpx;
  font-weight: 700;
  color: var(--bs-text-primary);
}

.view-more {
  display: flex;
  align-items: center;
  gap: 4rpx;
  font-size: 22rpx;
  color: var(--bs-text-tertiary);
}

/* ===== 优质培训机构(横滑) ===== */
.org-scroll {
  white-space: nowrap;
  padding: 0 32rpx 28rpx;
  box-sizing: border-box;
}

.org-card {
  display: inline-block;
  width: 300rpx;
  background: #fff;
  border-radius: var(--bs-radius-lg);
  padding: 16rpx;
  margin-right: 20rpx;
  box-shadow: var(--bs-shadow-card);
  vertical-align: top;

  &:active {
    opacity: 0.88;
  }
}

.org-cover {
  position: relative;
  height: 180rpx;
  border-radius: var(--bs-radius-md);
  overflow: hidden;
}

.org-cover-img {
  width: 100%;
  height: 100%;
  display: block;
}

.org-cert {
  position: absolute;
  top: 10rpx;
  left: 10rpx;
  background: linear-gradient(135deg, #FFE8B8, #F7BA48);
  color: #6D4C00;
  font-size: 18rpx;
  font-weight: 600;
  padding: 4rpx 12rpx;
  border-radius: 8rpx;
}

.org-name {
  margin-top: 14rpx;
  font-size: 26rpx;
  font-weight: 700;
  color: var(--bs-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.org-meta {
  margin-top: 6rpx;
  font-size: 21rpx;
  color: var(--bs-text-tertiary);
}

.org-foot {
  margin-top: 10rpx;
  display: flex;
  align-items: center;
  gap: 6rpx;
}

.org-city {
  font-size: 21rpx;
  color: var(--bs-text-tertiary);
}

.org-score {
  margin-left: auto;
  font-size: 22rpx;
  font-weight: 600;
  color: var(--bs-brand-accent);
}

/* ===== 最新需求(2x2) ===== */
.demand-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20rpx;
  padding: 0 32rpx 28rpx;
}

.demand-card {
  margin: 0;
  padding: 24rpx;
  transition: transform 0.15s;

  &:active {
    transform: scale(0.97);
  }
}

.demand-tag {
  display: inline-flex;
  align-self: flex-start;
  font-size: 19rpx;
  font-weight: 600;
  padding: 5rpx 14rpx;
  border-radius: 8rpx;

  &.tag--green {
    background: rgba(0, 181, 120, 0.1);
    color: #00A06B;
  }

  &.tag--orange {
    background: rgba(255, 143, 31, 0.12);
    color: #D96A00;
  }

  &.tag--blue {
    background: rgba(22, 119, 255, 0.1);
    color: var(--bs-brand-primary);
  }

  &.tag--gray {
    background: var(--bs-divider);
    color: var(--bs-text-secondary);
  }
}

.demand-title {
  margin-top: 12rpx;
  font-size: 25rpx;
  font-weight: 600;
  color: var(--bs-text-primary);
  line-height: 1.4;
}

.demand-loc {
  margin-top: 12rpx;
  display: flex;
  align-items: center;
  gap: 6rpx;
  font-size: 20rpx;
  color: var(--bs-text-tertiary);
}

.demand-date {
  margin-left: auto;
}

.demand-price {
  margin-top: 10rpx;
  color: var(--bs-danger);
  font-weight: 700;
}

.dp-num {
  font-size: 30rpx;
}

.dp-unit {
  font-size: 20rpx;
  margin-left: 4rpx;
}

/* ===== 商城推荐(横滑) ===== */
.goods-scroll {
  white-space: nowrap;
  padding: 0 32rpx 8rpx;
  box-sizing: border-box;
}

.goods-card {
  display: inline-block;
  width: 216rpx;
  margin-right: 20rpx;
  vertical-align: top;

  &:active {
    opacity: 0.85;
  }
}

.goods-cover {
  height: 150rpx;
  border-radius: var(--bs-radius-md);
  background: #F2F4F7;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.goods-cover-img {
  width: 100%;
  height: 100%;
  display: block;
}

.goods-icon {
  font-size: 60rpx;
  color: #A8B7C9;
}

.goods-name {
  margin-top: 14rpx;
  font-size: 23rpx;
  font-weight: 600;
  color: var(--bs-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.goods-desc {
  margin-top: 4rpx;
  font-size: 19rpx;
  color: var(--bs-text-tertiary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.goods-price {
  margin-top: 8rpx;
  font-size: 26rpx;
  font-weight: 700;
  color: var(--bs-danger);
}
</style>

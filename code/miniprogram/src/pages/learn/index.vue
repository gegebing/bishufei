<script setup lang="ts">
import type { CaacClass, Course } from '@/api'
/**
 * 学习中心(技能培训·人社补贴 / CAAC执照考证)
 * 结构:顶部胶囊切换 → 技能区:绿色 hero + 课程卡列表 → CAAC区:深蓝 hero + 考证班卡列表
 */
import { apiGetCaacList, apiGetCourseList } from '@/api'

definePage({
  name: 'learn',
  layout: 'tabbar',
  style: {
    navigationBarTitleText: '学习中心',
  },
})

const router = useRouter()

const learnTab = ref<'skill' | 'caac'>('skill')

const courseList = ref<Course[]>([])
const caacList = ref<CaacClass[]>([])

/** 课程封面:语义 icon → emoji + 渐变色 */
const coverMap: Record<string, { emoji: string, c1: string, c2: string }> = {
  wheat: { emoji: '🌾', c1: '#00B578', c2: '#5FE3B3' },
  bolt: { emoji: '⚡', c1: '#1677FF', c2: '#69B4FF' },
}

function coverOf(icon: string) {
  return coverMap[icon] || { emoji: '📚', c1: '#1677FF', c2: '#69B4FF' }
}

async function loadCourses() {
  const res = await apiGetCourseList()
  if (res.code === 2000)
    courseList.value = res.data || []
}

async function loadCaac() {
  const res = await apiGetCaacList()
  if (res.code === 2000)
    caacList.value = res.data || []
}

function goCourse(course: Course) {
  router.push({ name: 'course-detail', query: { id: course.id } })
}

function goCaac(item: CaacClass) {
  router.push({ name: 'caac-detail', query: { id: item.id } })
}

onMounted(() => {
  loadCourses()
  loadCaac()
})
</script>

<template>
  <view class="bs-page learn-page">
    <!-- 顶部胶囊切换 -->
    <view class="seg-bar">
      <view class="seg">
        <view class="seg-item" :class="{ on: learnTab === 'skill' }" @click="learnTab = 'skill'">
          技能培训(人社补贴)
        </view>
        <view class="seg-item" :class="{ on: learnTab === 'caac' }" @click="learnTab = 'caac'">
          CAAC执照考证
        </view>
      </view>
    </view>

    <!-- 技能培训专区(零门槛免费学) -->
    <template v-if="learnTab === 'skill'">
      <view class="learn-hero green">
        <view class="lh-kicker">
          国家职业技能普惠补贴政策
        </view>
        <view class="lh-title">
          零费用学无人机技能 · 政府全额补贴
        </view>
        <view class="lh-sub">
          五位一体全流程电子存证 · 颁发官方结业证书
        </view>
        <view class="lh-icon">
          🏅
        </view>
      </view>

      <view v-for="course in courseList" :key="course.id" class="bs-card course-card" @click="goCourse(course)">
        <view class="course-row">
          <view
            class="course-cover"
            :style="{ background: `linear-gradient(150deg, ${coverOf(course.icon).c1}, ${coverOf(course.icon).c2})` }"
          >
            {{ coverOf(course.icon).emoji }}
          </view>
          <view class="course-main">
            <view class="course-title">
              {{ course.title }}
            </view>
            <view class="course-org">
              定点机构:{{ course.org }}
            </view>
            <view class="course-tags">
              <text v-for="tag in course.tags" :key="tag" class="bs-badge" :class="tag.includes('直补') ? 'bs-badge--success' : 'bs-badge--primary'">
                {{ tag }}
              </text>
            </view>
          </view>
        </view>
        <view class="course-foot">
          <text class="course-date">
            开班时间:{{ course.startDate }}
          </text>
          <view class="btn-primary-sm" @click.stop="goCourse(course)">
            免费报名(资格秒查)
          </view>
        </view>
      </view>
    </template>

    <!-- CAAC考证专区(商业接单刚需) -->
    <template v-else>
      <view class="learn-hero blue">
        <view class="lh-kicker">
          中国民用航空局 (CAAC) 官方执照
        </view>
        <view class="lh-title">
          民用无人驾驶航空器操控员执照班
        </view>
        <view class="lh-sub">
          持证即可在平台抢接高薪商业订单 · 可申请人社证书补贴 ¥1,500~5,000
        </view>
        <view class="lh-icon">
          🪪
        </view>
      </view>

      <view v-for="item in caacList" :key="item.id" class="bs-card caac-card" @click="goCaac(item)">
        <view class="caac-row">
          <view class="caac-main">
            <view>
              <text class="bs-badge" :class="item.recommended ? 'bs-badge--gold' : 'bs-badge--primary'">
                {{ item.droneType }} · {{ item.level }}{{ item.recommended ? ' (推荐)' : '' }}
              </text>
            </view>
            <view class="caac-title">
              {{ item.title }}
            </view>
            <view class="caac-sub">
              {{ item.org }} · 周期{{ item.period }}
            </view>
            <view class="caac-tags">
              <text class="bs-badge bs-badge--success">
                人社证书补贴 {{ item.subsidy }}
              </text>
            </view>
          </view>
          <view class="caac-side">
            <view class="caac-price bs-num">
              <text class="cur">
                ¥
              </text>{{ item.price.toLocaleString() }}
            </view>
            <view v-if="item.recommended" class="caac-price-note">
              已享学员券 -¥800
            </view>
          </view>
        </view>
        <view class="course-foot">
          <text class="course-note">
            🛡 资金监管 · {{ item.recommended ? '报名即分账' : '首考未过免费重培' }}
          </text>
          <view class="btn-accent-sm" @click.stop="goCaac(item)">
            立即报名缴费
          </view>
        </view>
      </view>
    </template>
  </view>
</template>

<style lang="scss" scoped>
.learn-page {
  min-height: 100vh;
}

/* 顶部胶囊切换 */
.seg-bar {
  background: #fff;
  padding: 16rpx 32rpx;
  border-bottom: 1rpx solid var(--bs-border);
  display: flex;
  justify-content: center;
}

.seg {
  display: flex;
  width: 560rpx;
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

/* hero 卡 */
.learn-hero {
  border-radius: 24rpx;
  margin: 24rpx 32rpx;
  padding: 32rpx;
  color: #fff;
  position: relative;
  overflow: hidden;
  box-shadow: 0 12rpx 40rpx rgba(15, 42, 90, 0.1);
}

.learn-hero.green {
  background:
    radial-gradient(110% 80% at 88% -8%, #5FE3B3 0%, transparent 55%),
    linear-gradient(150deg, #00875A 0%, #00B578 60%, #1FC98C 100%);
}

.learn-hero.blue {
  background:
    radial-gradient(110% 85% at 85% -10%, #4E7FD9 0%, transparent 55%),
    linear-gradient(155deg, #14295C 0%, #1F3B7A 55%, #2B56A8 100%);
}

.lh-kicker {
  font-size: 22rpx;
  opacity: 0.85;
  letter-spacing: 1rpx;
}

.lh-title {
  font-size: 34rpx;
  font-weight: 700;
  margin: 8rpx 0 6rpx;
}

.lh-sub {
  font-size: 22rpx;
  opacity: 0.85;
  line-height: 1.5;
}

.lh-icon {
  position: absolute;
  right: 28rpx;
  top: 50%;
  transform: translateY(-50%);
  font-size: 80rpx;
  opacity: 0.25;
}

/* 课程卡 */
.course-row {
  display: flex;
  gap: 24rpx;
}

.course-cover {
  width: 168rpx;
  height: 168rpx;
  border-radius: 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 60rpx;
  color: #fff;
  flex-shrink: 0;
  box-shadow: inset 0 2rpx 0 rgba(255, 255, 255, 0.35), 0 8rpx 20rpx rgba(15, 42, 90, 0.12);
}

.course-main {
  flex: 1;
  min-width: 0;
}

.course-title {
  font-size: 30rpx;
  font-weight: 700;
  color: var(--bs-text-primary);
  line-height: 1.35;
}

.course-org {
  font-size: 24rpx;
  color: var(--bs-text-secondary);
  margin: 8rpx 0 12rpx;
}

.course-tags {
  display: flex;
  gap: 12rpx;
  flex-wrap: wrap;
}

.course-foot {
  border-top: 1rpx dashed var(--bs-border);
  margin-top: 20rpx;
  padding-top: 20rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.course-date {
  font-size: 24rpx;
  color: var(--bs-text-tertiary);
}

.course-note {
  font-size: 22rpx;
  color: var(--bs-text-tertiary);
}

/* CAAC 卡 */
.caac-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16rpx;
}

.caac-main {
  flex: 1;
  min-width: 0;
}

.caac-title {
  font-size: 32rpx;
  font-weight: 700;
  color: var(--bs-text-primary);
  line-height: 1.35;
  margin-top: 10rpx;
}

.caac-sub {
  font-size: 24rpx;
  color: var(--bs-text-secondary);
  margin-top: 8rpx;
}

.caac-tags {
  margin-top: 12rpx;
}

.caac-side {
  flex-shrink: 0;
}

.caac-price {
  font-size: 38rpx;
  font-weight: 700;
  color: var(--bs-brand-accent);
  text-align: right;
}

.caac-price .cur {
  font-size: 26rpx;
}

.caac-price-note {
  font-size: 20rpx;
  color: var(--bs-success);
  text-align: right;
  margin-top: 2rpx;
}

/* 小按钮 */
.btn-primary-sm,
.btn-accent-sm {
  font-size: 24rpx;
  font-weight: 600;
  color: #fff;
  padding: 12rpx 26rpx;
  border-radius: var(--bs-radius-full);
}

.btn-primary-sm {
  background: linear-gradient(135deg, #1677FF 0%, #00A6FF 100%);
  box-shadow: 0 8rpx 20rpx rgba(22, 119, 255, 0.3);
}

.btn-accent-sm {
  background: linear-gradient(135deg, #FF9433 0%, #FF7A00 55%, #F56A00 100%);
  box-shadow: 0 8rpx 20rpx rgba(255, 122, 0, 0.3);
}
</style>

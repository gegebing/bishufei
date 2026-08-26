<script setup lang="ts">
import type { Course } from '@/api'
import { apiGetCourseDetail } from '@/api'

definePage({
  name: 'course-detail',
  style: { navigationBarTitleText: '课程详情' },
})

const router = useRouter()
const course = ref<Course | null>(null)
const courseId = ref('')

/** 封面语义图标降级为 emoji */
const coverEmoji = computed(() => {
  const map: Record<string, string> = { wheat: '🌾', bolt: '⚡' }
  return map[course.value?.icon || ''] || '🎓'
})

onLoad(async (query) => {
  courseId.value = (query?.id as string) || ''
  if (!courseId.value)
    return
  const res = await apiGetCourseDetail(courseId.value)
  if (res?.data)
    course.value = res.data
})

function onEnroll() {
  router.push({ name: 'learn-enroll', query: { id: courseId.value, type: 'skill' } })
}
</script>

<template>
  <view class="bs-page cd-page">
    <template v-if="course">
      <!-- 封面区 -->
      <view class="cd-hero">
        <view class="cd-hero-icon">
          {{ coverEmoji }}
        </view>
        <view class="cd-hero-kicker">
          国家职业技能普惠补贴政策
        </view>
        <view class="cd-hero-title">
          {{ course.title }}
        </view>
        <view class="cd-hero-sub">
          定点机构:{{ course.org }}
        </view>
      </view>

      <!-- 课程信息 -->
      <view class="bs-card">
        <view class="cd-badges">
          <text class="bs-badge bs-badge--success">
            人社直补 ¥0
          </text>
          <text class="bs-badge bs-badge--primary">
            {{ course.hours }}总课时
          </text>
          <text v-for="t in course.tags.filter(x => !x.includes('人社直补') && !x.includes('课时'))" :key="t" class="bs-badge bs-badge--warning">
            {{ t }}
          </text>
        </view>
        <view class="cd-rows">
          <view class="cd-row">
            🕐 开班时间:{{ course.startDate }}
          </view>
          <view class="cd-row">
            📖 总课时:{{ course.hours }} 课时(理论 + 线下实操打卡)
          </view>
          <view class="cd-row">
            🏫 培训机构:{{ course.org }}
          </view>
        </view>
      </view>

      <!-- 补贴政策说明 -->
      <view class="bs-card">
        <view class="cd-sec-title">
          人社补贴政策说明
        </view>
        <view class="policy-row">
          <view class="policy-icon policy-icon--green">
            ✓
          </view>
          <view class="policy-main">
            <view class="policy-title">
              零费用学技能
            </view>
            <view class="policy-desc">
              培训费用由人社局直补培训机构,学员全程零费用。
            </view>
          </view>
        </view>
        <view class="policy-row">
          <view class="policy-icon policy-icon--blue">
            🛡
          </view>
          <view class="policy-main">
            <view class="policy-title">
              五位一体全流程电子存证
            </view>
            <view class="policy-desc">
              报名、签到、实操、考核、结业全程上链存证,颁发官方结业证书。
            </view>
          </view>
        </view>
        <view class="policy-row">
          <view class="policy-icon policy-icon--orange">
            👥
          </view>
          <view class="policy-main">
            <view class="policy-title">
              受惠资格
            </view>
            <view class="policy-desc">
              农村转移劳动力、应届毕业生、失业人员等群体可申请,报名页资格秒查。
            </view>
          </view>
        </view>
      </view>
    </template>

    <!-- 吸底主按钮 -->
    <view class="bottom-bar">
      <view class="enroll-btn" @click="onEnroll">
        免费报名(资格秒查)
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.cd-page {
  padding-bottom: 200rpx;
}

.cd-hero {
  background: linear-gradient(150deg, #00875A 0%, #00B578 60%, #1FC98C 100%);
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
  opacity: 0.85;
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
}

.cd-badges {
  display: flex;
  gap: 12rpx;
  flex-wrap: wrap;
  margin-bottom: 20rpx;
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
  margin-bottom: 24rpx;
}

.policy-row {
  display: flex;
  gap: 20rpx;
  margin-bottom: 24rpx;
}

.policy-row:last-child {
  margin-bottom: 0;
}

.policy-icon {
  width: 64rpx;
  height: 64rpx;
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 30rpx;
  flex-shrink: 0;
}

.policy-icon--green {
  background: rgba(0, 181, 120, 0.1);
  color: var(--bs-success);
}

.policy-icon--blue {
  background: rgba(22, 119, 255, 0.1);
}

.policy-icon--orange {
  background: rgba(255, 122, 0, 0.1);
}

.policy-title {
  font-size: 26rpx;
  font-weight: 600;
  color: var(--bs-text-primary);
}

.policy-desc {
  font-size: 24rpx;
  color: var(--bs-text-secondary);
  line-height: 1.55;
  margin-top: 4rpx;
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

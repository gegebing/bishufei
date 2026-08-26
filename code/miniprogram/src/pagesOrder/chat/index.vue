<script setup lang="ts">
/**
 * 订单 IM 沟通(V3.0 防跳单技术隔离层)
 * 平台内置 IM 为唯一沟通渠道,NLP 关键词识别拦截站外联系方式并推送风控
 */
interface ImMsg {
  self: boolean
  text: string
  /** 命中风控词,消息对对方屏蔽 */
  blocked?: boolean
  /** 风控系统提示条 */
  risk?: boolean
}

definePage({
  name: 'order-chat',
  style: { navigationBarTitleText: '订单沟通' },
})

const messages = ref<ImMsg[]>([
  { self: false, text: '王机长好,28 号上午的巡检任务其中 3 基塔位要加拍红外,你的设备没问题吧?' },
  { self: true, text: '没问题,M300 挂 H20T 热成像,红外分辨率 640×512,满足输电规程要求。' },
])
const input = ref('')
const sending = ref(false)

/** 站外联系方式风险词(NLP 关键词演示) */
const riskWords = ['微信', 'vx', 'weixin', '手机号', '电话多少', '线下交易', '私下转', '支付宝', 'qq']

function push(msg: ImMsg) {
  messages.value.push(msg)
}

function send(text: string) {
  const content = text.trim()
  if (!content || sending.value)
    return
  sending.value = true
  const hit = riskWords.some(w => content.toLowerCase().includes(w))
  push({ self: true, text: content, blocked: hit })
  input.value = ''
  setTimeout(() => {
    if (hit) {
      push({
        risk: true,
        self: false,
        text: '[风控提示] 检测到疑似站外联系方式,该消息已对对方屏蔽并推送风控后台复核。请改用平台虚拟号沟通;核实跳单将扣除保证金并追偿订单金额 30% 违约金。',
      })
    }
    else {
      push({ self: false, text: '收到!记得回传 UOM 批文后再开始作业,现场见。' })
    }
    sending.value = false
  }, 600)
}

function onSend() {
  send(input.value)
}
</script>

<template>
  <view class="chat-page">
    <!-- 存证声明 -->
    <view class="sys-tip">
      双方号码已脱敏 · 聊天记录作为纠纷仲裁依据 · 站外联系方式将被自动拦截
    </view>

    <!-- 消息列表 -->
    <scroll-view scroll-y class="msg-list" :scroll-into-view="`msg-${messages.length - 1}`">
      <view v-for="(m, i) in messages" :id="`msg-${i}`" :key="i">
        <!-- 风控提示条 -->
        <view v-if="m.risk" class="risk-tip">
          <wd-icon name="warn-bold" size="28rpx" color="#CF1322" />
          <text>{{ m.text }}</text>
        </view>
        <!-- 对方消息 -->
        <view v-else-if="!m.self" class="msg-row msg-row--left">
          <view class="avatar avatar--peer">
            张
          </view>
          <view class="bubble bubble--left">
            {{ m.text }}
          </view>
        </view>
        <!-- 我方消息(命中风控则划线屏蔽) -->
        <view v-else class="msg-row msg-row--right">
          <view class="bubble bubble--right" :class="{ 'bubble--blocked': m.blocked }">
            {{ m.text }}
          </view>
          <view class="avatar avatar--me">
            王
          </view>
        </view>
      </view>
    </scroll-view>

    <!-- 快捷标签 + 输入区 -->
    <view class="input-area">
      <scroll-view scroll-x class="quick-row" :show-scrollbar="false">
        <text class="quick-tag warn-tag" @click="send('我们加个微信详聊吧,私下方便')">
          试试发送“加微信”
        </text>
        <text class="quick-tag" @click="send('明天 09:00 准时到场 GPS 打卡')">
          确认作业时间
        </text>
        <text class="quick-tag" @click="send('请在平台签署电子合同并支付定金,我这边锁定档期')">
          引导签署合同
        </text>
      </scroll-view>
      <view class="input-row">
        <input v-model="input" class="chat-input" placeholder="输入消息..." confirm-type="send" @confirm="onSend">
        <view class="send-btn" :class="{ 'send-btn--disabled': !input.trim() }" @click="onSend">
          发送
        </view>
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.chat-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #EDEDED;
}

.sys-tip {
  align-self: center;
  background: rgba(0, 0, 0, 0.06);
  color: var(--bs-text-secondary);
  font-size: 20rpx;
  padding: 8rpx 24rpx;
  border-radius: var(--bs-radius-full);
  margin: 16rpx auto 4rpx;
}

.msg-list {
  flex: 1;
  padding: 20rpx 24rpx;
  box-sizing: border-box;
}

.msg-row {
  display: flex;
  gap: 14rpx;
  margin-bottom: 22rpx;

  &--left {
    justify-content: flex-start;
  }

  &--right {
    justify-content: flex-end;
  }
}

.avatar {
  width: 68rpx;
  height: 68rpx;
  border-radius: 14rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 26rpx;
  flex-shrink: 0;
}

.avatar--peer {
  background: #1677FF;
}

.avatar--me {
  background: #00B578;
}

.bubble {
  max-width: 70%;
  padding: 18rpx 22rpx;
  border-radius: 16rpx;
  line-height: 1.55;
  font-size: 26rpx;
}

.bubble--left {
  background: #fff;
  color: #111;
  border: 1rpx solid #E3E3E3;
  border-top-left-radius: 6rpx;
}

.bubble--right {
  background: #95EC69;
  color: #111;
  border-top-right-radius: 6rpx;
}

.bubble--blocked {
  background: #FFE7E9;
  color: #CF1322;
  text-decoration: line-through;
}

.risk-tip {
  display: flex;
  gap: 12rpx;
  align-items: flex-start;
  background: #FFF1F0;
  border: 1rpx solid #FFCCC7;
  color: #CF1322;
  border-radius: 16rpx;
  padding: 16rpx 22rpx;
  font-size: 21rpx;
  line-height: 1.65;
  margin-bottom: 22rpx;
}

/* 输入区 */
.input-area {
  background: #F7F7F7;
  border-top: 1rpx solid #E0E0E0;
  padding-bottom: env(safe-area-inset-bottom);
}

.quick-row {
  white-space: nowrap;
  padding: 14rpx 20rpx 4rpx;
}

.quick-tag {
  display: inline-flex;
  background: #fff;
  border: 1rpx solid #DCDCDC;
  padding: 8rpx 20rpx;
  border-radius: var(--bs-radius-full);
  font-size: 21rpx;
  color: var(--bs-brand-primary);
  margin-right: 14rpx;
}

.warn-tag {
  color: #D46B08;
  border-color: #F7BA48;
}

.input-row {
  display: flex;
  gap: 14rpx;
  align-items: center;
  padding: 14rpx 20rpx;
}

.chat-input {
  flex: 1;
  height: 72rpx;
  border-radius: 14rpx;
  border: 1rpx solid #DDD;
  background: #fff;
  padding: 0 20rpx;
  font-size: 26rpx;
}

.send-btn {
  width: 120rpx;
  height: 72rpx;
  border-radius: 14rpx;
  background: linear-gradient(135deg, #1677FF 0%, #00A6FF 100%);
  color: #fff;
  font-size: 26rpx;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
}

.send-btn--disabled {
  opacity: 0.5;
}
</style>

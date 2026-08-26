/*
 * 维修服务模块 mock 数据(对应后端 /repair/* 接口,V3.0 4.5)
 */
import { defineMock } from '@alova/mock'
import { generateMockData } from '../utils/generators'

const repairOrder = {
  id: 'RO-20260825-018',
  device: 'DJI M300 RTK',
  sn: '1581F4AA9812',
  faultDesc: '图传信号断续,飞行 10 分钟后图传丢失',
  mode: 'mail',
  vendor: '极飞四川维修中心(高级维修商)',
  /** 当前进度:0待检测 1检测中 2定方案 3维修中 4质检中 5已完成 */
  statusIndex: 3,
  parts: [
    { name: '图传排线组件(原厂件)', price: 120 },
    { name: '5.8G 天线馈线 ×1', price: 85 },
    { name: '人工费(高级维修商)', price: 315 },
  ],
  total: 520,
  warrantyDays: 90,
}

export default defineMock({
  /** POST /repair/submit 提交报修(body: device, sn, faultDesc, mode, vendor) */
  '[POST]/repair/submit': ({ data }: any) => {
    console.log('[Mock] 提交报修', data)
    const msg = data?.mode === 'onsite'
      ? '上门报修单已提交,技师将联系您确认上门时段'
      : '寄修报修单已提交,顺丰上门取件已预约,维修商将在 2 小时内响应'
    return generateMockData.baseResponse({ orderId: repairOrder.id }, 2000, msg)
  },

  /** GET /repair/order 当前维修工单详情 */
  '[GET]/repair/order': () => {
    return generateMockData.baseResponse(repairOrder)
  },

  /** POST /repair/accept 验收确认并结算(body: orderId) */
  '[POST]/repair/accept': ({ data }: any) => {
    console.log('[Mock] 验收结算', data)
    return generateMockData.baseResponse({ settled: true }, 2000, '验收确认:托管款 ¥442 已扣佣结算至维修商,90天质保生效')
  },
}, true)

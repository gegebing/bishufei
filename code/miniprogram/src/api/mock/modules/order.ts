/*
 * 订单模块 mock 数据(对应后端 /order/* 接口)
 */
import { defineMock } from '@alova/mock'
import { generateMockData } from '../utils/generators'

const orders = [
  {
    id: 'ORD20260825001',
    title: '成都市温江区 220kV 电力巡检',
    type: '巡检',
    price: 3500,
    airspace: 'controlled',
    licenseReq: '超视距执照',
    droneReq: 'M300/M350 RTK',
    location: '成都市温江区万春镇(5基铁塔精细巡检)',
    time: '2026-08-28 09:00',
    publisher: '成都市某电力工程集团',
    status: 'ongoing',
  },
  {
    id: 'ORD20260825002',
    title: '崇州市 800亩 晚稻飞防农药喷洒',
    type: '植保',
    price: 6400,
    airspace: 'free',
    licenseReq: '视距内/超视距',
    droneReq: '大疆T50/极飞P100',
    location: '崇州市隆兴镇现代农业示范区',
    time: '2026-08-29 全天',
    publisher: '崇州市金穗农机合作社',
    status: 'pending',
  },
  {
    id: 'ORD20260825003',
    title: '天府新区兴隆湖 1:500 倾斜摄影三维建模',
    type: '测绘',
    price: 9800,
    airspace: 'controlled',
    licenseReq: '多旋翼超视距',
    droneReq: 'M350 RTK + P1',
    location: '成都市天府新区兴隆湖',
    time: '2026-08-30 08:30',
    publisher: '四川省空间地理信息测绘院',
    status: 'pending',
  },
  {
    id: 'ORD20260825004',
    title: '简阳市 500亩 水稻飞防植保',
    type: '植保',
    price: 4200,
    airspace: 'free',
    licenseReq: '视距内执照',
    droneReq: '大疆T40 及以上',
    location: '简阳市禾丰镇',
    time: '2026-09-01 全天',
    publisher: '简阳市丰产农业合作社',
    status: 'pending',
  },
]

export default defineMock({
  /** GET /order/list 订单广场列表(query: type 可选筛选) */
  '[GET]/order/list': ({ query }: any) => {
    const list = query?.type && query.type !== 'all'
      ? orders.filter(o => o.type === query.type)
      : orders
    return generateMockData.baseResponse(list)
  },

  /** GET /order/recommend 首页推荐订单 */
  '[GET]/order/recommend': () => {
    return generateMockData.baseResponse(orders.slice(0, 2))
  },

  /** GET /order/{id} 订单详情 */
  '[GET]/order/{id}': ({ params }: any) => {
    const order = orders.find(o => o.id === params.id)
    return generateMockData.baseResponse(order || null, order ? 2000 : 4004, order ? '操作成功' : '订单不存在')
  },

  /** POST /order/grab 飞手抢单(body: orderId) */
  '[POST]/order/grab': ({ data }: any) => {
    console.log('[Mock] 抢单', data)
    return generateMockData.baseResponse({ orderId: data?.orderId, grabbed: true }, 2000, '资质核验通过,订单已锁定')
  },

  /** POST /order/publish 需求方发布订单 */
  '[POST]/order/publish': ({ data }: any) => {
    console.log('[Mock] 发布需求', data)
    return generateMockData.baseResponse({ orderId: `ORD${Date.now()}` }, 2000, '需求发布成功,定金已托管')
  },

  /** POST /order/uom-report 回传 UOM 批文(body: orderId, docNo) */
  '[POST]/order/uom-report': ({ data }: any) => {
    console.log('[Mock] UOM批文回传', data)
    return generateMockData.baseResponse({ verified: true, docNo: 'UOM-20260825-998' }, 2000, '批文核验成功')
  },

  /** POST /order/check-in 现场 GPS 打卡(body: orderId, lat, lng) */
  '[POST]/order/check-in': ({ data }: any) => {
    console.log('[Mock] 现场打卡', data)
    return generateMockData.baseResponse({ checkedIn: true, lat: 30.57, lng: 104.06 }, 2000, '打卡成功')
  },

  /** GET /order/pilot-apps 收到的接单申请列表 */
  '[GET]/order/pilot-apps': () => {
    return generateMockData.baseResponse([
      {
        name: '李国强',
        license: '超视距执照',
        org: '天府低空巡检一组',
        appliedAt: '2小时前',
        quote: 6100,
        creditScore: 99,
        finishedOrders: 217,
        praiseRate: '99.2%',
        responseTime: '5分钟',
      },
      {
        name: '周天磊',
        license: '超视距执照',
        org: '个人飞手 · 押金¥2000',
        appliedAt: '3小时前',
        quote: 6300,
        creditScore: 96,
        finishedOrders: 88,
        praiseRate: '98.1%',
        responseTime: '12分钟',
      },
      {
        name: '吴静怡',
        license: '视距内执照',
        org: '蜀鹰农业植保队',
        appliedAt: '5小时前',
        quote: 5800,
        creditScore: 92,
        finishedOrders: 46,
        praiseRate: '97.3%',
        responseTime: '28分钟',
      },
    ])
  },

  /** POST /order/pilot-choose 需求方选定接单飞手(body: orderId, pilotName) */
  '[POST]/order/pilot-choose': ({ data }: any) => {
    console.log('[Mock] 选定飞手', data)
    return generateMockData.baseResponse({ chosen: true }, 2000, `已选定 ${data?.pilotName},电子合同已推送`)
  },
}, true)

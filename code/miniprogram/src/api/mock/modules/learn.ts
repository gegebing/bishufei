/*
 * 学习中心模块 mock 数据(技能培训 /course/* 与 CAAC 考证 /caac/*)
 */
import { defineMock } from '@alova/mock'
import { generateMockData } from '../utils/generators'

const skillCourses = [
  {
    id: 'COURSE001',
    title: '无人机农业植保飞防应用技能班',
    org: '毕节市无人机职业技能实训基地',
    hours: 24,
    startDate: '2026-08-30',
    price: 0,
    tags: ['人社直补 ¥0', '24总课时', '实操打卡'],
    icon: 'wheat',
  },
  {
    id: 'COURSE002',
    title: '电力架空线路巡检与热成像分析班',
    org: '毕节市通用航空职业技术学院',
    hours: 32,
    startDate: '2026-09-05',
    price: 0,
    tags: ['人社直补 ¥0', '32总课时'],
    icon: 'bolt',
  },
]

const caacClasses = [
  {
    id: 'CAAC001',
    title: 'CAAC 超视距驾驶员(中型/小型)考证班',
    level: '超视距驾驶员',
    droneType: '多旋翼',
    period: '30天',
    price: 8800,
    org: '民航局授权培训基地 · 考官驻点考场',
    subsidy: '¥2,000~3,000',
    recommended: true,
  },
  {
    id: 'CAAC002',
    title: 'CAAC 视距内驾驶员基础考证班',
    level: '视距内驾驶员',
    droneType: '多旋翼',
    period: '15天',
    price: 5800,
    org: '航拍/植保入门首选',
    subsidy: '¥1,500~2,000',
    recommended: false,
  },
]

export default defineMock({
  /** GET /course/list 技能培训课程列表 */
  '[GET]/course/list': () => {
    return generateMockData.baseResponse(skillCourses)
  },

  /** GET /course/{id} 课程详情 */
  '[GET]/course/{id}': ({ params }: any) => {
    const course = skillCourses.find(c => c.id === params.id)
    return generateMockData.baseResponse(course || null)
  },

  /** POST /course/enroll 培训报名(body: courseId, idCard, jobStatus) */
  '[POST]/course/enroll': ({ data }: any) => {
    console.log('[Mock] 培训报名', data)
    return generateMockData.baseResponse({ enrolled: true }, 2000, '人社资格校验通过,零元报名成功')
  },

  /** GET /caac/list CAAC 考证班列表 */
  '[GET]/caac/list': () => {
    return generateMockData.baseResponse(caacClasses)
  },

  /** GET /caac/{id} 考证班详情 */
  '[GET]/caac/{id}': ({ params }: any) => {
    const item = caacClasses.find(c => c.id === params.id)
    return generateMockData.baseResponse(item || null)
  },

  /** POST /caac/enroll CAAC 报名缴费(body: classId) — 报名即分账 */
  '[POST]/caac/enroll': ({ data }: any) => {
    console.log('[Mock] CAAC报名缴费', data)
    return generateMockData.baseResponse({ paid: true, orderId: `EXAM${Date.now()}` }, 2000, '支付成功,已按分账规则 T+1 结算给机构')
  },

  /** POST /caac/subsidy/apply 人社证书补贴申请(body: licenseNo) */
  '[POST]/caac/subsidy/apply': ({ data }: any) => {
    console.log('[Mock] 证书补贴申请', data)
    return generateMockData.baseResponse({
      id: `SUB${Date.now()}`,
      licenseNo: data?.licenseNo,
      amount: 2500,
      status: 'reviewing',
      applyTime: generateMockData.datetime(),
    }, 2000, '补贴申请已提交人社部门')
  },

  /** GET /caac/subsidy/status 补贴申请进度 */
  '[GET]/caac/subsidy/status': () => {
    return generateMockData.baseResponse({
      id: 'SUB20260825001',
      licenseNo: 'CAAC-UAV-2026089912',
      amount: 2500,
      status: 'reviewing',
      applyTime: '2026-08-20 10:30:00',
    })
  },
}, true)

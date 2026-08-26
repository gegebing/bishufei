import type { ApiRes, CaacClass, Course, Order, PilotApp, RepairInfo, SubsidyApply, UserInfo } from './types'
/*
 * 毕数飞行平台 C端 API 层
 * 接口路径与出入参约定见 docs/api-contract.md;后端就绪后将 mock 切换为真实服务即可
 * (mock 开关在 src/api/core/instance.ts 与 mock/mockAdapter.ts)
 */
import alovaInstance from './core/instance'

export * from './types'
export { alovaInstance }

/* ===== 用户 ===== */

/** 微信一键登录 @param code uni.login 返回的 code */
export function apiLogin(code: string) {
  return alovaInstance.Post<ApiRes<{ token: string, userInfo: UserInfo }>>('/user/login', { code })
}

/** 用户资料与资产 */
export function apiGetProfile() {
  return alovaInstance.Get<ApiRes<UserInfo>>('/user/profile')
}

/** 首页角色化待办 */
export function apiGetTodo(role: string) {
  return alovaInstance.Get<ApiRes<any>>('/user/todo', { params: { role } })
}

/* ===== 订单 ===== */

/** 订单广场列表 @param type 类型筛选,'all' 为全部 */
export function apiGetOrderList(type = 'all') {
  return alovaInstance.Get<ApiRes<Order[]>>('/order/list', { params: { type } })
}

/** 首页推荐订单 */
export function apiGetRecommendOrders() {
  return alovaInstance.Get<ApiRes<Order[]>>('/order/recommend')
}

/** 订单详情 */
export function apiGetOrderDetail(id: string) {
  return alovaInstance.Get<ApiRes<Order>>(`/order/${id}`)
}

/** 飞手抢单(含资质硬性校验) */
export function apiGrabOrder(orderId: string) {
  return alovaInstance.Post<ApiRes<{ orderId: string, grabbed: boolean }>>('/order/grab', { orderId })
}

/** 需求方发布订单 */
export function apiPublishOrder(data: { type: string, location: string, price: number, lat?: number, lng?: number }) {
  return alovaInstance.Post<ApiRes<{ orderId: string }>>('/order/publish', data)
}

/** 回传 UOM 飞行批文 */
export function apiReportUom(orderId: string, docNo: string) {
  return alovaInstance.Post<ApiRes<{ verified: boolean, docNo: string }>>('/order/uom-report', { orderId, docNo })
}

/** 现场 GPS 打卡 */
export function apiCheckIn(orderId: string, lat: number, lng: number) {
  return alovaInstance.Post<ApiRes<{ checkedIn: boolean }>>('/order/check-in', { orderId, lat, lng })
}

/* ===== 学习中心 ===== */

/** 技能培训课程列表 */
export function apiGetCourseList() {
  return alovaInstance.Get<ApiRes<Course[]>>('/course/list')
}

/** 课程详情 */
export function apiGetCourseDetail(id: string) {
  return alovaInstance.Get<ApiRes<Course>>(`/course/${id}`)
}

/** 培训报名(零费用,人社资格校验) */
export function apiEnrollCourse(data: { courseId: string, idCard: string, jobStatus: string }) {
  return alovaInstance.Post<ApiRes<{ enrolled: boolean }>>('/course/enroll', data)
}

/** CAAC 考证班列表 */
export function apiGetCaacList() {
  return alovaInstance.Get<ApiRes<CaacClass[]>>('/caac/list')
}

/** CAAC 考证班详情 */
export function apiGetCaacDetail(id: string) {
  return alovaInstance.Get<ApiRes<CaacClass>>(`/caac/${id}`)
}

/** CAAC 报名缴费(报名即分账) */
export function apiEnrollCaac(classId: string) {
  return alovaInstance.Post<ApiRes<{ paid: boolean, orderId: string }>>('/caac/enroll', { classId })
}

/** 人社证书补贴申请 */
export function apiApplySubsidy(licenseNo: string) {
  return alovaInstance.Post<ApiRes<SubsidyApply>>('/caac/subsidy/apply', { licenseNo })
}

/** 补贴申请进度 */
export function apiGetSubsidyStatus() {
  return alovaInstance.Get<ApiRes<SubsidyApply>>('/caac/subsidy/status')
}

/* ===== 维修服务(V3.0 4.5) ===== */

/** 提交报修(mode:mail 寄修 / onsite 上门) */
export function apiSubmitRepair(data: { device: string, sn: string, faultDesc: string, mode: string, vendor: string }) {
  return alovaInstance.Post<ApiRes<{ orderId: string }>>('/repair/submit', data)
}

/** 当前维修工单详情 */
export function apiGetRepairOrder() {
  return alovaInstance.Get<ApiRes<RepairInfo>>('/repair/order')
}

/** 验收确认并结算托管款 */
export function apiAcceptRepair(orderId: string) {
  return alovaInstance.Post<ApiRes<{ settled: boolean }>>('/repair/accept', { orderId })
}

/* ===== 订单撮合 · 选飞手 ===== */

/** 收到的接单申请列表 */
export function apiGetPilotApps() {
  return alovaInstance.Get<ApiRes<PilotApp[]>>('/order/pilot-apps')
}

/** 选定接单飞手 */
export function apiChoosePilot(orderId: string, pilotName: string) {
  return alovaInstance.Post<ApiRes<{ chosen: boolean }>>('/order/pilot-choose', { orderId, pilotName })
}

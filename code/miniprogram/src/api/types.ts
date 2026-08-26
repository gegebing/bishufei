/*
 * 毕数飞行平台 C端 · 业务类型定义
 * 与 docs/api-contract.md 中的接口契约保持一致
 */

/** 用户角色 */
export type UserRole = 'pilot' | 'client' | 'student'

/** 空域属性 */
export type AirspaceType = 'free' | 'controlled' | 'forbidden'

/** 订单 */
export interface Order {
  id: string
  /** 任务标题 */
  title: string
  /** 任务类型:航拍/测绘/巡检/植保/物流/吊运/应急 */
  type: string
  /** 报酬(元) */
  price: number
  /** 空域属性 */
  airspace: AirspaceType
  /** 执照要求,如 "超视距执照" */
  licenseReq: string
  /** 机型要求 */
  droneReq?: string
  /** 作业地点 */
  location: string
  /** 作业时间 */
  time: string
  /** 发包方(脱敏) */
  publisher: string
  /** 状态:pending 待接单 / ongoing 履约中 / done 已完成 */
  status: 'pending' | 'ongoing' | 'done'
}

/** 技能课程 */
export interface Course {
  id: string
  title: string
  /** 定点培训机构 */
  org: string
  /** 总课时 */
  hours: number
  /** 开班时间 */
  startDate: string
  /** 人社直补后价格(一期技能课均为 0) */
  price: number
  /** 标签 */
  tags: string[]
  /** 封面图标(语义) */
  icon: string
}

/** CAAC 考证班 */
export interface CaacClass {
  id: string
  title: string
  /** 执照等级:视距内/超视距/教员 */
  level: string
  /** 机型类别 */
  droneType: string
  /** 培训周期 */
  period: string
  /** 价格(元) */
  price: number
  /** 机构 */
  org: string
  /** 人社证书补贴参考额度 */
  subsidy: string
  /** 是否推荐 */
  recommended?: boolean
}

/** 用户信息 */
export interface UserInfo {
  id: string
  nickname: string
  avatar: string
  /** 当前角色 */
  role: UserRole
  /** 信用分(满分100) */
  creditScore: number
  /** 接单总收益(元) */
  totalIncome: number
  /** 履约保证金(元) */
  deposit: number
  /** CAAC 执照编号,未持证为空 */
  licenseNo: string
  /** 执照等级 */
  licenseLevel: string
  /** 是否已实名 */
  realNameVerified: boolean
  /** 所属机组 */
  crew?: string
}

/** 补贴申请 */
export interface SubsidyApply {
  id: string
  /** 执照编号 */
  licenseNo: string
  /** 补贴金额(元) */
  amount: number
  /** 状态:pending 材料待提交 / reviewing 人社审核中 / approved 已发放 */
  status: 'pending' | 'reviewing' | 'approved'
  /** 申请时间 */
  applyTime: string
}

/** 申请接单的飞手(需求方视角) */
export interface PilotApp {
  /** 展示姓名 */
  name: string
  /** 执照等级,如 "超视距执照" */
  license: string
  /** 所属机组/身份说明 */
  org: string
  /** 申请时间描述 */
  appliedAt: string
  /** 期望报价(元) */
  quote: number
  creditScore: number
  finishedOrders: number
  /** 好评率,如 "99.2%" */
  praiseRate: string
  /** 平均响应时长描述 */
  responseTime: string
}

/** 维修服务方式 */
export type RepairMode = 'mail' | 'onsite'

/** 维修工单 */
export interface RepairInfo {
  id: string
  /** 设备型号 */
  device: string
  /** 设备 SN */
  sn: string
  /** 故障描述 */
  faultDesc: string
  mode: RepairMode
  /** 承修商名称 */
  vendor: string
  /** 当前进度节点(0-based) */
  statusIndex: number
  /** 更换配件清单 */
  parts: { name: string, price: number }[]
  /** 托管总额(元) */
  total: number
  /** 质保天数 */
  warrantyDays: number
}

/** 统一响应包裹 */
export interface ApiRes<T = any> {
  code: number
  data: T
  msg: string
}

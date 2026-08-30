/*
 * 用户模块 mock 数据(对应后端 /user/* 接口)
 */
import { defineMock } from '@alova/mock'
import { generateMockData } from '../utils/generators'

const mockUser = {
  id: 'U10001',
  nickname: '王建军',
  avatar: '',
  role: 'pilot',
  creditScore: 98,
  totalIncome: 14250,
  deposit: 1000,
  licenseNo: 'CAAC-UAV-2026089912',
  licenseLevel: '多旋翼 · 超视距驾驶员',
  realNameVerified: true,
  crew: '毕节市低空巡检一组(机长)',
}

export default defineMock({
  /** POST /user/login 微信一键登录(body: code) */
  '[POST]/user/login': ({ data }: any) => {
    console.log('[Mock] 微信登录', data)
    return generateMockData.baseResponse({
      token: `mock_token_${Date.now()}`,
      userInfo: mockUser,
    })
  },

  /** GET /user/profile 用户资料与资产 */
  '[GET]/user/profile': () => {
    return generateMockData.baseResponse(mockUser)
  },

  /** GET /user/todo 首页角色化待办(query: role) */
  '[GET]/user/todo': ({ query }: any) => {
    const role = query?.role || 'pilot'
    const todos: Record<string, any> = {
      pilot: {
        title: '飞手任务待办',
        badge: '待履约 1 笔',
        content: '今日待作业:毕节市七星关区 220kV 电力巡检',
        hint: '需在作业前回传 UOM 批文(保险已自动附加)',
        hintType: 'warn',
        actionText: '进入履约',
        actionTarget: 'ORD20260825001',
      },
      client: {
        title: '用机需求管理',
        badge: '',
        content: '发布中的需求:毕节市威宁县 500 亩马铃薯飞防植保',
        hint: '已有 3 位持证飞手申请接单',
        hintType: 'info',
        actionText: '查看匹配',
        actionTarget: 'select-pilot',
      },
      student: {
        title: '我的学业进度',
        badge: '技能班在读',
        content: '已完成线下实操:16 / 20 学时 (80%)',
        hint: '人社补贴资格已锁定 (免学费)',
        hintType: 'ok',
        actionText: '继续打卡',
        actionTarget: 'learn',
      },
    }
    return generateMockData.baseResponse(todos[role] || todos.pilot)
  },
}, true)

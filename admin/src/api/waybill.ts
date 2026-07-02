import request from '@/utils/http'

// ==================== 类型定义 ====================

/** 运单状态 */
export type WaybillStatus =
  | 'draft'
  | 'pending'
  | 'transit'
  | 'arrived'
  | 'unloading'
  | 'completed'
  | 'cancelled'

/** 运单状态中文标签 */
export const STATUS_LABELS: Record<WaybillStatus, string> = {
  draft: '草稿',
  pending: '待发运',
  transit: '在途',
  arrived: '到库',
  unloading: '待接卸',
  completed: '已完成',
  cancelled: '已取消'
}

/** 运单状态变更日志 */
export interface WaybillStatusLog {
  id: number
  status: WaybillStatus
  remark: string
  operatedBy: string
  operatedAt: string
}

/** 运单数据类型 */
export interface Waybill {
  id: number
  waybillNo: string
  status: WaybillStatus
  plateNo: string
  refineryName: string
  depotName: string
  oilType: string
  planWeight: number
  carrierName: string
  driverName: string
  createdBy: string
  planDepartTime: string | null
  departTime: string | null
  loadConfirmWeight: number | null
  outboundWeight: number | null
  inboundWeight: number | null
  actualWeight: number | null
  createdAt: string
}

/** 运单详情（含状态日志） */
export type WaybillDetail = Waybill & { statusLogs: WaybillStatusLog[] }

// ==================== 接口方法 ====================

/** 获取运单详情 */
export function getWaybillDetail(id: number) {
  return request.get<WaybillDetail>({ url: `/admin/waybill/detail/${id}` })
}

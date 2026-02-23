// features/ward/types.ts

export interface Ward {
  wardId: string
  wardName: string
  member: number
  createdBy: string
}

export interface WardDetail {
  wardId: string
  wardName: string
  hospitalId: string
  joinCode: string
  joinCodeStatus: string
  status: string
  createdBy: string
  updatedBy: string
}


export interface EnterWardResponse {
  wardId: string
  isMember: boolean
}
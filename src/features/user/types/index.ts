export interface User {
  userId: string
  email: string
  firstName: string
  lastName: string
  hospitalId: string
  profileCompleted: boolean
}

export interface CompleteRegistrationPayload {
  userId: string
  firstName: string
  lastName: string
  hospitalId: string
}
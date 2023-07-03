export class TwitterUser {
  id: string
  createdAt?: number
  updatedAt?: number

  username: string
  name?: string
  protected?: boolean
  verified?: boolean
  verifiedType?: string
  location?: string
  description?: string
  profileImageUrl?: string
  profileBannerUrl?: string
}

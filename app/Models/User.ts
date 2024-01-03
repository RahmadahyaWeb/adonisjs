import { DateTime } from 'luxon'
import { BaseModel, beforeSave, column } from '@ioc:Adonis/Lucid/Orm'
import Hash from '@ioc:Adonis/Core/Hash'

export default class User extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public username: string

  @column()
  public password: string

  @column()
  public remember_me_token: string | null

  @column.dateTime({ autoCreate: true })
  public created_at: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updated_at: DateTime

  @beforeSave()
  public static async HashPassword(user: User) {
    if (user.$dirty.password) {
      user.password = await Hash.make(user.password)
    }
  }

  public static async verifyCredentials(username, password) {
    const user = await this.query().where('username', username).first()

    if (!user) {
      throw new Error('User not found')
    }

    const isPasswordValid = await Hash.verify(password, user.password)

    if (!isPasswordValid) {
      throw new Error('Invalid credentials')
    }

    return user
  }
}

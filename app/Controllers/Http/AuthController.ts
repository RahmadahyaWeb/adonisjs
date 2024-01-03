import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Hash from '@ioc:Adonis/Core/Hash'
import User from 'App/Models/User'
import { DateTime } from 'luxon'
import Database from '@ioc:Adonis/Lucid/Database'
import { schema, rules } from '@ioc:Adonis/Core/Validator'

export default class AuthController {
  public async login({ auth, request, response }: HttpContextContract) {
    const username = request.input('username')
    const password = request.input('password')

    const loginSchema = schema.create({
      username: schema.string(),
      password: schema.string([rules.minLength(4)]),
    })

    try {
      await request.validate({
        schema: loginSchema,
      })
    } catch (error) {
      return response.badRequest(error.messages)
    }

    try {
      const user = await User.query().where('username', username).firstOrFail()

      if (!user || !(await Hash.verify(user.password, password))) {
        return response.unauthorized({ message: 'Invalid credentials' })
      }

      await this.revokeTokens(user.id)

      const token = await auth.use('api').login(user, {
        expiresIn: '10 mins',
      })

      return response.json({ token })
    } catch (error) {
      return response.status(500).json({ message: 'Invalid credentials' })
    }
  }

  public async logout({ auth, response }: HttpContextContract) {
    await auth.use('api').revoke()
    return response.status(200).json({ revoked: true })
  }

  public async revokeTokens(id: any) {
    return Database.from('api_tokens')
      .where('user_id', id)
      .andWhere('created_at', '<', DateTime.local().toSQL())
      .delete()
  }

  public async checkToken({ auth, response }: HttpContextContract) {
    try {
      return await auth.use('api').check()
    } catch (error) {
      return response.status(401).json({ valid: false, message: 'Invalid token' })
    }
  }

  public async getUser({ auth, response }) {
    await auth.use('api').authenticate()

    return response.status(200).json({
      username: auth.user!.username,
    })
  }
}

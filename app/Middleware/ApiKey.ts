import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Env from '@ioc:Adonis/Core/Env'

export default class ApiKey {
  public async handle({ request, response }: HttpContextContract, next: () => Promise<void>) {
    const apiKey = request.header('api_key')

    if (!apiKey || apiKey !== Env.get('API_KEY')) {
      return response.status(401).json({ message: 'Unauthorized' })
    }

    await next()
  }
}

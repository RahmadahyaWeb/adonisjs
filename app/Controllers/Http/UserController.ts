import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'
import CreateUserValidator from 'App/Validators/CreateUserValidator'
import UpdateUserValidator from 'App/Validators/UpdateUserValidator'

export default class UsersController {
  public async index({ response }: HttpContextContract) {
    try {
      const users = await User.all()

      return response.ok(users)
    } catch (error) {
      return response.status(404).json({ message: 'Users not found' })
    }
  }

  public async store({ response, request }: HttpContextContract) {
    try {
      const userData = await request.validate(CreateUserValidator)
      const user = await User.create(userData)

      return response.status(201).json(user)
    } catch (error) {
      return response.badRequest(error.messages)
    }
  }

  public async show({ params, response }: HttpContextContract) {
    try {
      const user = await User.findOrFail(params.id)

      return response.json(user)
    } catch (error) {
      return response.status(404).json({ message: 'User not found' })
    }
  }

  public async update({ response, request, params }: HttpContextContract) {
    try {
      const user = await User.findOrFail(params.id)
      const data = await request.validate(UpdateUserValidator)

      user.merge(data)
      await user.save()

      return response.status(200).json(user)
    } catch (error) {
      return response.badRequest(error.messages)
    }
  }

  public async destroy({ params, response }: HttpContextContract) {
    try {
      const user = await User.findOrFail(params.id)
      await user.delete()

      return response.json({ message: 'User deleted successfully' })
    } catch (error) {
      return response.status(404).json({ message: 'User not found' })
    }
  }
}

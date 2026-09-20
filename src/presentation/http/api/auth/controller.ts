import { NextFunction, Request, Response } from 'express';
import { AuthService } from '../../../../domain/services/auth.service';
import { CreateUserDto } from '../../../../domain/dtos/users/request/create-user.dto';
import { LoginUserDto } from '../../../../domain/dtos/users/request/login-user.dto';
import { ApiResponse } from '../shared/api-response';

export class AuthController {
  constructor(private readonly service: AuthService) {}

  public register = async (req: Request, res: Response, next: NextFunction) => {
    const [error, dto] = CreateUserDto.create(req.body);
    if (error) return res.status(400).json(ApiResponse.error(error));

    try {
      const result = await this.service.register(dto!);
      res.status(201).json(ApiResponse.success(result));
    } catch (error) {
      next(error);
    }
  };

  public login = async (req: Request, res: Response, next: NextFunction) => {
    const [error, dto] = LoginUserDto.create(req.body);
    if (error) return res.status(400).json(ApiResponse.error(error));

    try {
      const result = await this.service.login(dto!);
      res.json(ApiResponse.success(result));
    } catch (error) {
      next(error);
    }
  };
}

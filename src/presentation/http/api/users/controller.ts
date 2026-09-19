import { NextFunction, Request, Response } from 'express';
import { UserService } from '../../../../domain/services/user.service';
import { CreateUserDto } from '../../../../domain/dtos/users/request/create-user.dto';
import { UpdateUserDto } from '../../../../domain/dtos/users/request/update-user.dto';
import { SetRolesDto } from '../../../../domain/dtos/users/request/set-roles.dto';
import { PaginationDto } from '../../../../domain/dtos/shared/pagination.dto';
import { RolePresenter } from '../roles/presenters/role.presenter';
import { ApiResponse } from '../shared/api-response';

export class UserController {
  constructor(private readonly service: UserService) {}

  public getUsers = async (req: Request, res: Response, next: NextFunction) => {
    const [error, pagination] = PaginationDto.create(
      Number(req.query.page ?? 1),
      Number(req.query.limit ?? 10),
    );
    if (error) return res.status(400).json({ error });

    try {
      const users = await this.service.getUsers(pagination!);
      res.json(ApiResponse.success(users));
    } catch (error) {
      next(error);
    }
  };

  public getUser = async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.params;
    if (typeof userId !== 'string')
      return res.status(400).json({ error: 'userId param is required' });

    try {
      const user = await this.service.findById(userId);
      res.json(ApiResponse.success(user));
    } catch (error) {
      next(error);
    }
  };

  public createUser = async (req: Request, res: Response, next: NextFunction) => {
    const [error, dto] = CreateUserDto.create(req.body);
    if (error) return res.status(400).json({ error });

    try {
      const user = await this.service.createUser(dto!);
      res.status(201).json(ApiResponse.success(user));
    } catch (error) {
      next(error);
    }
  };

  public updateUser = async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.params;
    if (typeof userId !== 'string')
      return res.status(400).json({ error: 'userId param is required' });

    const [error, dto] = UpdateUserDto.create(req.body);
    if (error) return res.status(400).json({ error });

    try {
      const user = await this.service.updateUser(userId, dto!);
      res.json(ApiResponse.success(user));
    } catch (error) {
      next(error);
    }
  };

  public deleteUser = async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.params;
    if (typeof userId !== 'string')
      return res.status(400).json({ error: 'userId param is required' });

    try {
      res.json(ApiResponse.success(await this.service.deleteUser(userId)));
    } catch (error) {
      next(error);
    }
  };

  // GET /:userId no incluye roles (Role es un agregado independiente, no
  // parte del agregado User) — por eso este endpoint aparte.
  public getUserRoles = async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.params;
    if (typeof userId !== 'string')
      return res.status(400).json({ error: 'userId param is required' });

    try {
      const roles = await this.service.getUserRoles(userId);
      res.json(ApiResponse.success(RolePresenter.fromEntities(roles)));
    } catch (error) {
      next(error);
    }
  };

  public setUserRoles = async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.params;
    if (typeof userId !== 'string')
      return res.status(400).json({ error: 'userId param is required' });

    const [error, dto] = SetRolesDto.create(req.body);
    if (error) return res.status(400).json({ error });

    try {
      await this.service.setUserRoles(userId, dto!);
      const roles = await this.service.getUserRoles(userId);
      res.json(ApiResponse.success(RolePresenter.fromEntities(roles)));
    } catch (error) {
      next(error);
    }
  };
}

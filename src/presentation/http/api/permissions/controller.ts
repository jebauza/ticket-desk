import { NextFunction, Request, Response } from 'express';
import { PermissionService } from '../../../../domain/services/permission.service';
import { CreatePermissionDto } from '../../../../domain/dtos/permissions/request/create-permission.dto';
import { UpdatePermissionDto } from '../../../../domain/dtos/permissions/request/update-permission.dto';
import { PermissionPresenter } from './presenters/permission.presenter';
import { RolePresenter } from '../roles/presenters/role.presenter';
import { ApiResponse } from '../shared/api-response';

export class PermissionController {
  constructor(private readonly service: PermissionService) {}

  public getPermissions = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const permissions = await this.service.getPermissions();
      res.json(ApiResponse.success(PermissionPresenter.fromEntities(permissions)));
    } catch (error) {
      next(error);
    }
  };

  public getPermission = async (req: Request, res: Response, next: NextFunction) => {
    const { permissionId } = req.params;
    if (typeof permissionId !== 'string')
      return res.status(400).json(ApiResponse.error('permissionId param is required'));

    try {
      const permission = await this.service.findById(permissionId);
      res.json(ApiResponse.success(PermissionPresenter.fromEntity(permission)));
    } catch (error) {
      next(error);
    }
  };

  public createPermission = async (req: Request, res: Response, next: NextFunction) => {
    const [error, dto] = CreatePermissionDto.create(req.body);
    if (error) return res.status(400).json(ApiResponse.error(error));

    try {
      const permission = await this.service.createPermission(dto!);
      res.status(201).json(ApiResponse.success(PermissionPresenter.fromEntity(permission)));
    } catch (error) {
      next(error);
    }
  };

  public updatePermission = async (req: Request, res: Response, next: NextFunction) => {
    const { permissionId } = req.params;
    if (typeof permissionId !== 'string')
      return res.status(400).json(ApiResponse.error('permissionId param is required'));

    const [error, dto] = UpdatePermissionDto.create(req.body);
    if (error) return res.status(400).json(ApiResponse.error(error));

    try {
      const permission = await this.service.updatePermission(permissionId, dto!);
      res.json(ApiResponse.success(PermissionPresenter.fromEntity(permission)));
    } catch (error) {
      next(error);
    }
  };

  public deletePermission = async (req: Request, res: Response, next: NextFunction) => {
    const { permissionId } = req.params;
    if (typeof permissionId !== 'string')
      return res.status(400).json(ApiResponse.error('permissionId param is required'));

    try {
      res.json(ApiResponse.success(await this.service.deletePermission(permissionId)));
    } catch (error) {
      next(error);
    }
  };

  // Lectura inversa: qué roles tienen este permiso.
  public getPermissionRoles = async (req: Request, res: Response, next: NextFunction) => {
    const { permissionId } = req.params;
    if (typeof permissionId !== 'string')
      return res.status(400).json(ApiResponse.error('permissionId param is required'));

    try {
      const roles = await this.service.getPermissionRoles(permissionId);
      res.json(ApiResponse.success(RolePresenter.fromEntities(roles)));
    } catch (error) {
      next(error);
    }
  };
}

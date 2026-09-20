import { NextFunction, Request, Response } from 'express';
import { RoleService } from '../../../../domain/services/role.service';
import { CreateRoleDto } from '../../../../domain/dtos/roles/request/create-role.dto';
import { UpdateRoleDto } from '../../../../domain/dtos/roles/request/update-role.dto';
import { SetPermissionsDto } from '../../../../domain/dtos/roles/request/set-permissions.dto';
import { RolePresenter } from './presenters/role.presenter';
import { PermissionPresenter } from '../permissions/presenters/permission.presenter';
import { ApiResponse } from '../shared/api-response';

export class RoleController {
  constructor(private readonly service: RoleService) {}

  public getRoles = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const roles = await this.service.getRoles();
      res.json(ApiResponse.success(RolePresenter.fromEntities(roles)));
    } catch (error) {
      next(error);
    }
  };

  public getRole = async (req: Request, res: Response, next: NextFunction) => {
    const { roleId } = req.params;
    if (typeof roleId !== 'string')
      return res.status(400).json(ApiResponse.error('roleId param is required'));

    try {
      const role = await this.service.findById(roleId);
      res.json(ApiResponse.success(RolePresenter.fromEntity(role)));
    } catch (error) {
      next(error);
    }
  };

  public createRole = async (req: Request, res: Response, next: NextFunction) => {
    const [error, dto] = CreateRoleDto.create(req.body);
    if (error) return res.status(400).json(ApiResponse.error(error));

    try {
      const role = await this.service.createRole(dto!);
      res.status(201).json(ApiResponse.success(RolePresenter.fromEntity(role)));
    } catch (error) {
      next(error);
    }
  };

  public updateRole = async (req: Request, res: Response, next: NextFunction) => {
    const { roleId } = req.params;
    if (typeof roleId !== 'string')
      return res.status(400).json(ApiResponse.error('roleId param is required'));

    const [error, dto] = UpdateRoleDto.create(req.body);
    if (error) return res.status(400).json(ApiResponse.error(error));

    try {
      const role = await this.service.updateRole(roleId, dto!);
      res.json(ApiResponse.success(RolePresenter.fromEntity(role)));
    } catch (error) {
      next(error);
    }
  };

  public deleteRole = async (req: Request, res: Response, next: NextFunction) => {
    const { roleId } = req.params;
    if (typeof roleId !== 'string')
      return res.status(400).json(ApiResponse.error('roleId param is required'));

    try {
      res.json(ApiResponse.success(await this.service.deleteRole(roleId)));
    } catch (error) {
      next(error);
    }
  };

  public getRolePermissions = async (req: Request, res: Response, next: NextFunction) => {
    const { roleId } = req.params;
    if (typeof roleId !== 'string')
      return res.status(400).json(ApiResponse.error('roleId param is required'));

    try {
      const permissions = await this.service.getRolePermissions(roleId);
      res.json(ApiResponse.success(PermissionPresenter.fromEntities(permissions)));
    } catch (error) {
      next(error);
    }
  };

  public setRolePermissions = async (req: Request, res: Response, next: NextFunction) => {
    const { roleId } = req.params;
    if (typeof roleId !== 'string')
      return res.status(400).json(ApiResponse.error('roleId param is required'));

    const [error, dto] = SetPermissionsDto.create(req.body);
    if (error) return res.status(400).json(ApiResponse.error(error));

    try {
      await this.service.setRolePermissions(roleId, dto!);
      const permissions = await this.service.getRolePermissions(roleId);
      res.json(ApiResponse.success(PermissionPresenter.fromEntities(permissions)));
    } catch (error) {
      next(error);
    }
  };

  public getRoleUsers = async (req: Request, res: Response, next: NextFunction) => {
    const { roleId } = req.params;
    if (typeof roleId !== 'string')
      return res.status(400).json(ApiResponse.error('roleId param is required'));

    try {
      const users = await this.service.getRoleUsers(roleId);
      res.json(ApiResponse.success(users));
    } catch (error) {
      next(error);
    }
  };
}

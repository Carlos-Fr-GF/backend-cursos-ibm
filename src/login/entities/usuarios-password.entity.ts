import { ViewColumn, ViewEntity } from 'typeorm';

@ViewEntity({
  name: 'usuarios_password',
})
export class UsuarioPassword {

  @ViewColumn()
  usuario!: string;

  @ViewColumn()
  pass!: string;
}
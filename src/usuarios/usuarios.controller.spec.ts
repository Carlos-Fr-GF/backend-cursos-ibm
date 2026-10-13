import { UsuariosController } from './usuarios.controller';
import { UsuariosService } from './usuarios.service';

describe('UsuariosController', () => {
  let controller: UsuariosController;

  beforeEach(() => {
    controller = new UsuariosController({} as UsuariosService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

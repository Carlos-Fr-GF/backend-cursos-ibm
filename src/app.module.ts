import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { getDatabaseConfig, getJwtModuleConfig } from './config/app.config';
import { AuthModule } from './auth/auth.module';
import { LoginModule } from './login/login.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { NivelesModule } from './niveles/niveles.module';
import { DependenciasModule } from './dependencias/dependencias.module';
import { CursosModule } from './cursos/cursos.module';
import { AsignacionesCursosModule } from './asignaciones-cursos/asignaciones-cursos.module';
import { InscripcionesCursosModule } from './inscripciones-cursos/inscripciones-cursos.module';
import { CargosModule } from './cargos/cargos.module';
import { SubnivelesModule } from './subniveles/subniveles.module';

@Module({
  imports: [
    // Configuración global
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // Configuración de MySQL
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: getDatabaseConfig,
    }),

    // Configuración de JWT
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: getJwtModuleConfig,
    }),

    AuthModule,
    LoginModule,
    UsuariosModule,
    NivelesModule,
    DependenciasModule,
    CursosModule,
    AsignacionesCursosModule,
    InscripcionesCursosModule,
    CargosModule,
    SubnivelesModule,
  ],

  controllers: [AppController],

  providers: [AppService],
})
export class AppModule {}

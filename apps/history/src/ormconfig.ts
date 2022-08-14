import { DataSource, DataSourceOptions } from 'typeorm'
import { TypeOrmModuleOptions } from '@nestjs/typeorm'
import { config } from 'dotenv'

config()

export const typeormConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.DB_HOST,
  port: +(process.env.DB_PORT || '3306'),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  migrationsTableName: '__migrations',
  entities: ['dist/**/*.entity.js'],
  subscribers: ['dist/**/*.subscriber.js'],
  migrations: ['dist/databases/migrations/**/*.js'],
  synchronize: process.env.NODE_ENV === 'development',
}

const dataSource = new DataSource(typeormConfig as DataSourceOptions)

export default dataSource

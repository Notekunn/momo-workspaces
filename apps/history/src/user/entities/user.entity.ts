import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity({
  name: 'user',
})
export class UserEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column('varchar')
  email: string

  @Column('varchar')
  password: string
}

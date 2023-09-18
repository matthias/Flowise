import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, Check, Unique } from 'typeorm'

@Entity('profiles', { schema: 'public' })
@Unique(['username'])
@Check(`("char_length"("username") >= 3)`)
export class Profile {
    @PrimaryColumn('uuid')
    id: string

    @Column('text', { nullable: true })
    username: string

    @Column('text', { nullable: true })
    full_name: string

    @Column('text', { nullable: true })
    avatar_url: string

    @Column('text', { nullable: true })
    website: string

    @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP', nullable: true })
    created_at: Date

    @UpdateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP', nullable: true })
    updated_at: Date
}

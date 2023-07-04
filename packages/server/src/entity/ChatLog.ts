/* eslint-disable */
import { Entity, OneToMany, CreateDateColumn, PrimaryGeneratedColumn, JoinColumn, Index, Column } from 'typeorm'
import { IChatLog } from '../Interface'
import { ExternalChat } from './ExternalChat'

@Entity()
export class ChatLog implements IChatLog {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Index()
    @Column()
    chatid: string

    @OneToMany(() => ExternalChat, (message) => message.chatLog)
    @JoinColumn({ name: 'chatid' })
    messages: ExternalChat[]

    @CreateDateColumn()
    createdDate: string
}

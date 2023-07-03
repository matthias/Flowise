/* eslint-disable */
import { Entity, OneToMany, CreateDateColumn, PrimaryGeneratedColumn, JoinColumn, Index, Column } from 'typeorm'
import { IChatLog } from '../Interface'
import { ChatMessage } from './ChatMessage'

@Entity()
export class ChatLog implements IChatLog {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Index()
    @Column()
    chatflowid: string

    @OneToMany(() => ChatMessage, (message) => message.chatLog)
    @JoinColumn({ name: 'chatflowid' })
    messages: ChatMessage[]

    @CreateDateColumn()
    createdDate: string
}

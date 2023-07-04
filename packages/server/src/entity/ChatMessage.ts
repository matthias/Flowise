/* eslint-disable */
import { Entity, Column, CreateDateColumn, PrimaryGeneratedColumn, Index } from 'typeorm'
import { IChatMessage, MessageType } from '../Interface'

@Entity()
export abstract class ChatMessage implements IChatMessage {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column()
    role: MessageType

    @Index()
    @Column()
    chatflowid: string

    @Column()
    content: string

    @Column({ nullable: true })
    sourceDocuments: string

    @CreateDateColumn()
    createdDate: Date

    @Column({ nullable: true })
    context: string
}

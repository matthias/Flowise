/* eslint-disable */
import { Entity, Column, CreateDateColumn, PrimaryGeneratedColumn, Index } from 'typeorm'
import { IChatLog } from '../Interface'

@Entity()
export class ChatLog implements IChatLog {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column()
    question: string
    
    @Column()
    text: string
    
    @Index()
    @Column()
    chatId: string
    
    @Column()
    isInternal: Boolean
    
    @Index()
    @Column()
    chatflowId: string
    
    @Column()
    chatflowName: string
    
    @Column()
    _incomingInput: string
    
    @Column()
    _result: string

    @CreateDateColumn()
    createdDate: Date
}

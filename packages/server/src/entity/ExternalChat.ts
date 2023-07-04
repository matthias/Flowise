import { Entity, ManyToOne } from 'typeorm'
import { ChatMessage } from './ChatMessage'
import { ChatLog } from './ChatLog'

@Entity()
export class ExternalChat extends ChatMessage {
    @ManyToOne(() => ChatLog, (chatLog) => chatLog.messages)
    chatLog: ChatLog
}

import { Entity } from 'typeorm'
import { ChatMessage } from './ChatMessage'

@Entity()
export class InternalChat extends ChatMessage {}

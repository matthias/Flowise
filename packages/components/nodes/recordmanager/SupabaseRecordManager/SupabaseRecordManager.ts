import { ICommonObject, INode, INodeData, INodeParams } from '../../../src/Interface'
import { getBaseClasses, getCredentialData, getCredentialParam } from '../../../src/utils'
import { ListKeyOptions, RecordManagerInterface, UpdateOptions } from '@langchain/community/indexes/base'
import { createClient } from '@supabase/supabase-js'
import winston from 'winston'

class SupabaseRecordManager_RecordManager implements INode {
    label: string
    name: string
    version: number
    description: string
    type: string
    icon: string
    category: string
    badge: string
    credential: INodeParams
    baseClasses: string[]
    inputs: INodeParams[]

    constructor() {
        this.label = 'Supabase Record Manager'
        this.name = 'SupabaseRecordManager'
        this.version = 1.0
        this.type = 'Supabase RecordManager'
        this.icon = 'supabase.svg'
        this.category = 'Record Manager'
        this.description = 'Use Supabase to keep track of document writes into the vector databases'
        this.baseClasses = [this.type, 'RecordManager', ...getBaseClasses(SupabaseRecordManager)]
        this.badge = 'CUSTOM'
        this.credential = {
            label: 'Connect Credential',
            name: 'credential',
            type: 'credential',
            credentialNames: ['supabaseApi']
        }
        this.inputs = [
            {
                label: 'Supabase Project URL',
                name: 'supabaseProjUrl',
                type: 'string'
            },
            {
                label: 'Table Name',
                name: 'tableName',
                type: 'string',
                placeholder: 'upsertion_records',
                additionalParams: true,
                optional: true
            },
            {
                label: 'Namespace',
                name: 'namespace',
                type: 'string',
                description: 'If not specified, chatflowid will be used',
                additionalParams: true,
                optional: true
            },
            {
                label: 'Cleanup',
                name: 'cleanup',
                type: 'options',
                description:
                    'Read more on the difference between different cleanup methods <a target="_blank" href="https://js.langchain.com/docs/modules/data_connection/indexing/#deletion-modes">here</a>',
                options: [
                    {
                        label: 'None',
                        name: 'none',
                        description: 'No clean up of old content'
                    },
                    {
                        label: 'Incremental',
                        name: 'incremental',
                        description:
                            'Delete previous versions of the content if content of the source document has changed. Important!! SourceId Key must be specified and document metadata must contains the specified key'
                    },
                    {
                        label: 'Full',
                        name: 'full',
                        description:
                            'Same as incremental, but if the source document has been deleted, it will be deleted from vector store as well, incremental mode will not.'
                    }
                ],
                additionalParams: true,
                default: 'none'
            },
            {
                label: 'SourceId Key',
                name: 'sourceIdKey',
                type: 'string',
                description:
                    'Key used to get the true source of document, to be compared against the record. Document metadata must contains SourceId Key',
                default: 'source',
                placeholder: 'source',
                additionalParams: true,
                optional: true
            }
        ]
    }

    async init(nodeData: INodeData, _: string, options: ICommonObject): Promise<any> {
        const supabaseProjUrl = nodeData.inputs?.supabaseProjUrl as string
        const _tableName = nodeData.inputs?.tableName as string
        const tableName = _tableName ? _tableName : 'upsertion_records'
        const _namespace = nodeData.inputs?.namespace as string
        const namespace = _namespace ? _namespace : options.chatflowid
        const cleanup = nodeData.inputs?.cleanup as string
        const _sourceIdKey = nodeData.inputs?.sourceIdKey as string
        const sourceIdKey = _sourceIdKey ? _sourceIdKey : 'source'

        const credentialData = await getCredentialData(nodeData.credential ?? '', options)
        const supabaseApiKey = getCredentialParam('supabaseApiKey', credentialData, nodeData)

        const client = createClient(supabaseProjUrl, supabaseApiKey)

        const logger = options.logger

        const recordManager = new SupabaseRecordManager(namespace, { client, tableName, logger })

        ;(recordManager as any).cleanup = cleanup
        ;(recordManager as any).sourceIdKey = sourceIdKey

        return recordManager
    }
}

type SupabaseRecordManagerOptions = {
    client: any
    tableName?: string
    logger?: winston.Logger
}

class SupabaseRecordManager implements RecordManagerInterface {
    lc_namespace = ['langchain', 'recordmanagers', 'postgres']
    tableName: string
    namespace: string
    supabase: any // SupabaseClient;
    logger?: winston.Logger

    constructor(namespace: string, config: SupabaseRecordManagerOptions) {
        this.namespace = namespace
        this.tableName = config.tableName || 'upsertion_records'
        this.supabase = config.client
        this.logger = config.logger ?? winston.createLogger()
    }

    async createSchema(): Promise<void> {
        const tableName = this.tableName

        // use the Supabase API to check if the table exists
        const { data: tableExists, error: sbError } = await this.supabase.rpc('has_table', { table_name: tableName })
        if (sbError) {
            console.error('Error fetching data:', sbError)
            return
        }

        const createTableSQL = `
            create table if not exists ${tableName} (
                id uuid primary key default gen_random_uuid(),
                key text not null,
                namespace text not null,
                updated_at double precision not null,
                group_id text,
                unique (key, namespace)
            );
        `

        const createIndexesSQL = [
            `create index if not exists updated_at_index on ${tableName} (updated_at);`,
            `create index if not exists key_index on ${tableName} (key);`,
            `create index if not exists namespace_index on ${tableName} (namespace);`,
            `create index if not exists group_id_index on ${tableName} (group_id);`
        ]

        const createFunctionSQL = `
            create or replace function get_server_timestamp()
                returns double precision as $$
            begin
                return extract(epoch from current_timestamp);
            end; $$ language plpgsql;
        `

        if (!tableExists) {
            // eslint-disable-next-line no-console
            console.log(`
                table ${tableName} is missing.
                Execute the following SQL statement to create the table:

                ${createTableSQL}

            `)
            createIndexesSQL.forEach((sql) => {
                // eslint-disable-next-line no-console
                console.log(`
                    ${sql}
                `)
            })
            // eslint-disable-next-line no-console
            console.log(`
                # SQL statement to create the get_server_timestamp function:

                ${createFunctionSQL}
            `)
            return
        }
    }

    async getTime(): Promise<number> {
        const { error, data: serverTimestamp } = await this.supabase.rpc('get_server_timestamp')
        if (error) {
            throw error
        }
        return Number.parseFloat(serverTimestamp)
    }

    async update(keys: string[], updateOptions?: UpdateOptions): Promise<void> {
        if (keys.length === 0) {
            return
        }

        const updatedAt = await this.getTime()
        const { timeAtLeast, groupIds = keys.map(() => null) } = updateOptions || {}

        if (timeAtLeast && updatedAt < timeAtLeast) {
            throw new Error(`Time sync issue with database ${updatedAt} < ${timeAtLeast}`)
        }

        if (groupIds.length !== keys.length) {
            throw new Error(`Number of keys (${keys.length}) does not match number of group_ids (${groupIds.length})`)
        }

        const recordsToUpsert = keys.map((key, i) => ({
            key,
            namespace: this.namespace,
            updated_at: updatedAt,
            group_id: groupIds[i]
        }))

        const { error } = await this.supabase.from(this.tableName).upsert(recordsToUpsert, {
            onConflict: 'key,namespace'
        })

        if (error) {
            throw error
        }
    }

    async exists(keys: string[]): Promise<boolean[]> {
        if (keys.length === 0) {
            return []
        }

        // Query using the Supabase client
        const { data, error } = await this.supabase.from(this.tableName).select('key').in('key', keys).eq('namespace', this.namespace)

        if (error) {
            console.error('Error fetching data:', error)
            return keys.map(() => false) // Assuming failure to check as non-existence
        }

        // Create a set of existing keys
        const existingKeys = new Set(data.map((item: any) => item.key))

        // Map over original keys to determine existence
        return keys.map((key) => existingKeys.has(key))
    }

    async listKeys(options?: ListKeyOptions): Promise<string[]> {
        const { before, after, limit, groupIds } = options ?? {}

        let query = this.supabase.from(this.tableName).select('key').eq('namespace', this.namespace)

        before && query.lt('updated_at', before)
        after && query.gt('updated_at', after)
        limit && query.limit(limit)
        groupIds && query.in('group_id', groupIds)

        const { data } = await query

        return data.map((row: { key: string }) => row.key)
    }

    async deleteKeys(keys: string[]): Promise<void> {
        if (keys.length === 0) {
            return
        }

        await this.supabase.from(this.tableName).delete().eq('namespace', this.namespace).in('key', keys)
    }
}

module.exports = { nodeClass: SupabaseRecordManager_RecordManager }

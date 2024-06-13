import { omit } from 'lodash'
import { INode, INodeData, INodeParams, ICommonObject } from '../../../src/Interface'
import { getCredentialData, getCredentialParam } from '../../../src/utils'
import { TextSplitter } from 'langchain/text_splitter'
import { ApifyDatasetLoader } from 'langchain/document_loaders/web/apify_dataset'
import { Document } from '@langchain/core/documents'

class CustomApifyWebsiteContentCrawler_DocumentLoaders implements INode {
    label: string
    name: string
    description: string
    type: string
    icon: string
    version: number
    category: string
    baseClasses: string[]
    inputs: INodeParams[]
    credential: INodeParams

    constructor() {
        this.label = 'Custom Apify Website Content Crawler'
        this.name = 'customApifyWebsiteContentCrawler'
        this.type = 'Document'
        this.icon = 'apify-symbol-transparent.svg'
        this.version = 2.0
        this.category = 'Document Loaders'
        this.description = 'Load data from Apify Website Content Crawler'
        this.baseClasses = [this.type]
        this.inputs = [
            {
                label: 'Text Splitter',
                name: 'textSplitter',
                type: 'TextSplitter',
                optional: true
            },
            {
                label: 'Actor ID',
                name: 'actor',
                type: 'string',
                description: 'The name of Apify actor.',
                default: 'apify/website-content-crawler'
            },
            {
                label: 'Start URLs',
                name: 'urls',
                type: 'string',
                description: 'One or more URLs of pages where the crawler will start, separated by commas.',
                placeholder: 'https://js.langchain.com/docs/'
            },
            {
                label: 'Crawler type',
                type: 'options',
                name: 'crawlerType',
                options: [
                    {
                        label: 'Headless web browser (Chrome+Playwright)',
                        name: 'playwright:chrome'
                    },
                    {
                        label: 'Stealthy web browser (Firefox+Playwright)',
                        name: 'playwright:firefox'
                    },
                    {
                        label: 'Raw HTTP client (Cheerio)',
                        name: 'cheerio'
                    },
                    {
                        label: 'Raw HTTP client with JavaScript execution (JSDOM) [experimental]',
                        name: 'jsdom'
                    }
                ],
                description:
                    'Select the crawling engine, see <a target="_blank" href="https://apify.com/apify/website-content-crawler#crawling">documentation</a> for additional information.',
                default: 'playwright:firefox'
            },
            {
                label: 'Max crawling depth',
                name: 'maxCrawlDepth',
                type: 'number',
                optional: true,
                default: 1,
                additionalParams: true
            },
            {
                label: 'Max crawl pages',
                name: 'maxCrawlPages',
                type: 'number',
                optional: true,
                default: 3,
                additionalParams: true
            },
            {
                label: 'Additional input',
                name: 'additionalInput',
                type: 'string',
                rows: 4,
                default: JSON.stringify({
                    aggressivePrune: false,
                    clickElementsCssSelector: '[aria-expanded="false"]',
                    removeElementsCssSelector:
                        'nav, footer, script, style, noscript, svg,\nbody > header,\n[role="search"],\n[role="alert"],\n[role="banner"],\n[role="dialog"],\n[role="alertdialog"],\n[role="region"][aria-label*="skip" i],\n[aria-modal="true"]\n.en-mdl-online_consultant_teaser\n.en-mdl-ninja-form',
                    saveFiles: false,
                    saveHtml: false,
                    saveHtmlAsFile: false,
                    saveMarkdown: true,
                    saveScreenshots: false,
                    useSitemaps: false,
                    excludeUrlGlobs: []
                }),
                description:
                    'For additional input options for the crawler see <a target="_blank" href="https://apify.com/apify/website-content-crawler/input-schema">documentation</a>. You can copy / paste it from the Apify UI.',
                optional: true,
                additionalParams: true
            },
            {
                label: 'Additional Metadata',
                name: 'metadata',
                type: 'json',
                description: 'Additional metadata to be added to the extracted documents',
                optional: true,
                additionalParams: true
            },
            {
                label: 'Omit Metadata Keys',
                name: 'omitMetadataKeys',
                type: 'string',
                rows: 4,
                description:
                    'Each document loader comes with a default set of metadata keys that are extracted from the document. You can use this field to omit some of the default metadata keys. The value should be a list of keys, seperated by comma. Use * to omit all metadata keys execept the ones you specify in the Additional Metadata field',
                placeholder: 'key1, key2, key3.nestedKey1',
                optional: true,
                additionalParams: true
            }
        ]
        this.credential = {
            label: 'Connect Apify API',
            name: 'credential',
            type: 'credential',
            credentialNames: ['apifyApi']
        }
    }

    async init(nodeData: INodeData, _: string, options: ICommonObject): Promise<any> {
        const textSplitter = nodeData.inputs?.textSplitter as TextSplitter
        const metadata = nodeData.inputs?.metadata
        const _omitMetadataKeys = nodeData.inputs?.omitMetadataKeys as string

        let omitMetadataKeys: string[] = []
        if (_omitMetadataKeys) {
            omitMetadataKeys = _omitMetadataKeys.split(',').map((key) => key.trim())
        }

        // Get input options and merge with additional input
        const urls = nodeData.inputs?.urls as string
        const actor = nodeData.inputs?.actor as string
        const crawlerType = nodeData.inputs?.crawlerType as string
        const maxCrawlDepth = nodeData.inputs?.maxCrawlDepth as string
        const maxCrawlPages = nodeData.inputs?.maxCrawlPages as string
        const additionalInput =
            typeof nodeData.inputs?.additionalInput === 'object'
                ? nodeData.inputs?.additionalInput
                : JSON.parse(nodeData.inputs?.additionalInput as string)
        const input = {
            startUrls: urls.split(',').map((url) => ({ url: url.trim() })),
            crawlerType,
            maxCrawlDepth: parseInt(maxCrawlDepth, 10),
            maxCrawlPages: parseInt(maxCrawlPages, 10),
            ...additionalInput
        }

        // Get Apify API token from credential data
        const credentialData = await getCredentialData(nodeData.credential ?? '', options)
        const apifyApiToken = getCredentialParam('apifyApiToken', credentialData, nodeData)

        const loader = await ApifyDatasetLoader.fromActorCall(actor, input, {
            datasetMappingFunction: (item) => {
                const metadata: any = item.metadata
                return new Document({
                    pageContent: (item.markdown || item.text || '') as string,
                    metadata: {
                        source: item.url,
                        title: metadata?.title,
                        description: metadata?.description
                    }
                })
            },
            clientOptions: {
                token: apifyApiToken
            }
        })

        let docs = []

        if (textSplitter) {
            docs = await loader.loadAndSplit(textSplitter)
        } else {
            docs = await loader.load()
        }

        if (metadata) {
            const parsedMetadata = typeof metadata === 'object' ? metadata : JSON.parse(metadata)
            docs = docs.map((doc) => ({
                ...doc,
                metadata:
                    _omitMetadataKeys === '*'
                        ? {
                              ...parsedMetadata
                          }
                        : omit(
                              {
                                  ...doc.metadata,
                                  ...parsedMetadata
                              },
                              omitMetadataKeys
                          )
            }))
        } else {
            docs = docs.map((doc) => ({
                ...doc,
                metadata:
                    _omitMetadataKeys === '*'
                        ? {}
                        : omit(
                              {
                                  ...doc.metadata
                              },
                              omitMetadataKeys
                          )
            }))
        }

        return docs
    }
}

module.exports = { nodeClass: CustomApifyWebsiteContentCrawler_DocumentLoaders }

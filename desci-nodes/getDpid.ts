import { requestUrl } from 'obsidian'
import { type CanvasNode } from '../utils/canvas-internal'
import type ObsidianDecsiPlugin from '../main'
import {
	createNode,
	placeholderNoteHeight,
	assistantColor,
	getNodeText
} from '../utils/canvas-util'
import { AllCanvasNodeData } from 'obsidian/canvas'


const formatHomeNode = (dpid:string, node:any) => {
	return `# ${node.name}\n#dpid/${dpid}\n\n[Browse in Desci Nodes](${node.url})`
}

const formatCreativeWork = (dpid:string, node:any) => {
	const name = node.name ? node.name : 'No Name'
	const description = node.description ? node.description : 'No Description'
	const url = `https://ipfs.desci.com/ipfs/${node['/']}`
	const keywords = node.keywords ? (
		node.keywords.split(', ').map((word:string) => `#${word.replace(' ', '_')}`).join(' ')
		) : ''

	return `# ${name}\n#dpid/${dpid}/Creative_Work\n${keywords}\n${description}\n[Browse in Ipfs](${url})`
}

const formatWebSite = (dpid: string,node:any) => {
	const name = node.name ? node.name : 'No Name'
	const url = node.url ? node.url : 'No URL'
	return `# ${name}\n#dpid/${dpid}/Web_Site\n\n[go to Web Site](${url})`
}

const formatSoftwareSourceCode = (dpid: string, node:any) => {
	const name = node.name ? node.name : 'No Name'
	const url = `https://ipfs.desci.com/ipfs/${node['/']}`
	const description = node.description ? node.description : 'No Description'
	const discussionUrl = node.discussionUrl ? node.discussionUrl : 'No Discussion URL'
	const keywords = node.keywords ? (
		node.keywords.split(', ').map((word:string) => `#${word.replace(' ', '_')}`).join(' ')
		) : ''
	return `# ${name}\n#dpid/${dpid}/Software_Source_Code\n${keywords}\n${description}\n${discussionUrl}\n[go to Software Source Code](${url})`
}

const formatDataset = (dpid: string, node:any) => {
	const name = node.name ? node.name : 'No Name'
	const url = `https://ipfs.desci.com/ipfs/${node['/']}`
	const description = node.description ? node.description : 'No Description'
	const discussionUrl = node.discussionUrl ? node.discussionUrl : 'No Discussion URL'
	const keywords = node.keywords ? (
		node.keywords.split(', ').map((word:string) => `#${word.replace(' ', '_')}`).join(' ')
		) : ''
	return `# ${name}\n#dpid/${dpid}/Dataset\n${keywords}\n${description}\n${discussionUrl}\n[Browse in IPFS](${url})`
}

const formatPerson = (dpid: string, node:any) => {
	const name = node.name ? node.name : 'Anonymous'
	const id = node['@id'] ? node['@id'] : null
	return `# ${name}\n#dpid/${dpid}/Person\n\n${id ? `[go to Person](${id})`: ''}`
}

export const getDpid = async function () {
	console.log('this', this)
	if (this.unloaded) return
	this.logDebug("fetching dpid json from desci nodes")
	const canvas = this.getActiveCanvas()
	if (!canvas) {
		this.logDebug('No active canvas')
		return
	}
	const selection = canvas.selection
	if (selection?.size !== 1) return
	const values = Array.from(selection.values())
	const node = values[0]
	if (node) {
		await canvas.requestSave()
		await sleep(200)

		const settings = this.settings

		//const nodeData = node.getData()
		let nodeText = await getNodeText(node) || ''
		if (nodeText.length == 0) {
			console.log('no node text')
			this.logDebug('no node Text found')
			return
		}

		const created = createNode(canvas, node,
			{
				text: `fetching dpid:  ${nodeText}`,
				size: { height: placeholderNoteHeight*2 }
			},
			{
				color: assistantColor,
				chat_role: 'assistant'
			}
		)
		try {
			const res = await requestUrl(`http://beta.dpid.org/${nodeText}?jsonld`)
			console.log('res.json', res.json)
			const metadataNode = createNode(canvas, created,
				{
					text: `${JSON.stringify(
						res.json['@graph'].find((leaf) => {
							return leaf['@id'] === 'ro-crate-metadata.json'
						})
					)}`,
					size: { height: placeholderNoteHeight }
				},
				{
					color: assistantColor,
					chat_role: 'assistant'
				},
				{ x: -400, y: 0 }
			)

			created.setText(formatHomeNode(nodeText,
				res.json['@graph'].find((leaf) => {
					return leaf['@id'] === './'
				})
			))
			res.json['@graph'].forEach((leaf, i) => {
				if (leaf['@type'] === 'Person') {
					createNode(canvas, metadataNode,
						{
							text: `${formatPerson(nodeText, leaf)}`,
							size: { height: placeholderNoteHeight*2.0 }
						},
						{
							color: assistantColor,
							chat_role: 'assistant'
						},
						{ x: i%2 === 0 ? -100 : -300 , y: -175 }
					)
				} else {
					if (leaf['@id'] === 'ro-crate-metadata.json' || leaf['@id'] === './') {
					} else {
						let formattedContent: string = '';
						switch (leaf['@type']) {
							case 'CreativeWork':
								formattedContent = formatCreativeWork(nodeText, leaf)
								break;
							case 'WebSite':
								formattedContent = formatWebSite(nodeText, leaf)
								break;
							case 'SoftwareSourceCode':
								formattedContent = formatSoftwareSourceCode(nodeText, leaf)
								break;
							case 'Dataset':
								formattedContent = formatDataset(nodeText, leaf)
								break;
							default:
								formattedContent = JSON.stringify(leaf)
						}
						createNode(canvas, created,
							{
								text: `${formattedContent}`,
								size: { height: placeholderNoteHeight*3 }
							},
							{
								color: assistantColor,
								chat_role: 'assistant'
							},
							{ x: i%2 === 0 ? 100 : 300 , y: -250 }
						)
					}
				}
			})

		} catch (e) {
			created.setText(`error :( ${e}`)
			this.logDebug(`error :( : ${e}`)
			return
		}
	}
}
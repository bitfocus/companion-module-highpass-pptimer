import { InstanceBase, InstanceStatus, Regex } from '@companion-module/base'
import { UpgradeScripts } from './upgrades.js'
import { UpdateActions } from './actions.js'
import { UpdateFeedbacks } from './feedbacks.js'
import { UpdateVariableDefinitions, variableValuesFromState } from './variables.js'
import { UpdatePresets } from './presets.js'
import { TimerConnection } from './connection.js'

// Companion (module base 2.x) loads the default export as the instance class.
export { UpgradeScripts }

export default class PPTimerInstance extends InstanceBase {
	constructor(internal) {
		super(internal)
		this.state = null
		this.settings = null
		this.commands = []
		this.layoutNames = []
		this.connection = null
	}

	async init(config, _isFirstInit, secrets) {
		this.config = config
		this.secrets = secrets ?? {}
		this.updateActions()
		this.updateFeedbacks()
		this.updateVariableDefinitions()
		this.updatePresets()
		this.connect()
	}

	async destroy() {
		this.connection?.close()
		this.connection = null
	}

	async configUpdated(config, secrets) {
		this.config = config
		this.secrets = secrets ?? {}
		this.connect()
	}

	getConfigFields() {
		return [
			{
				type: 'static-text',
				id: 'info',
				width: 12,
				label: '',
				value:
					'Connects to PPTimer on the presentation computer (Windows app or Mac app). Port and token are in its config.json: %LOCALAPPDATA%\\PPTimer on Windows, ~/Library/Application Support/PPTimer on a Mac.',
			},
			{
				type: 'textinput',
				id: 'host',
				label: 'Presentation computer (IP or hostname)',
				width: 8,
				default: '',
				regex: Regex.HOSTNAME,
			},
			{
				type: 'number',
				id: 'port',
				label: 'Port',
				width: 4,
				default: 9595,
				min: 1,
				max: 65535,
			},
			{
				type: 'secret-text',
				id: 'token',
				label: 'API token (leave empty if not set)',
				width: 8,
				default: '',
			},
		]
	}

	connect() {
		this.connection?.close()
		this.connection = null
		this.setState(null)

		const host = (this.config.host || '').trim()
		if (!host) {
			this.updateStatus(InstanceStatus.BadConfig, 'Set the presentation computer address')
			return
		}

		this.updateStatus(InstanceStatus.Connecting)
		this.connection = new TimerConnection({
			host,
			port: this.config.port || 9595,
			token: (this.secrets.token || '').trim(),
			log: (level, msg) => this.log(level, msg),
			onStatus: (status, message) => {
				if (status === 'ok') {
					this.updateStatus(InstanceStatus.Ok)
				} else {
					this.updateStatus(InstanceStatus.ConnectionFailure, message ?? null)
					this.setState(null)
				}
			},
			onMessage: (msg) => this.handleMessage(msg),
		})
		this.connection.open()
	}

	handleMessage(msg) {
		switch (msg.type) {
			case 'hello':
				this.settings = msg.settings
				this.commands = Array.isArray(msg.commands) ? msg.commands : []
				this.updateLayouts()
				this.checkFeedbacks('feature', 'layout')
				this.log(
					'info',
					`Connected to PPTimer ${msg.version}${msg.lanAccess ? '' : ' (warning: add-in reports localhost-only)'}`,
				)
				break
			case 'settings':
				this.settings = msg.settings
				this.updateLayouts()
				this.checkFeedbacks('feature', 'layout')
				break
			case 'state':
				this.setState(msg)
				break
			case 'event':
				if (msg.event === 'zero') this.log('info', 'Countdown reached zero')
				break
			case 'result':
				if (!msg.ok) {
					this.log('warn', `PPTimer rejected '${msg.cmd}': ${msg.error}`)
					// Re-fetch settings to undo the value the feature action recorded ahead of the echo (add-ins before 1.0.3).
					if (msg.cmd === 'settings') this.connection?.send({ cmd: 'settings' })
				}
				break
		}
	}

	/** Layout names offered in actions, feedbacks and presets follow the ones saved in PPTimer (1.1.0+). */
	updateLayouts() {
		const layouts = this.settings?.layouts
		const names = Array.isArray(layouts) ? layouts.map((l) => String(l.name)) : []
		if (names.length === 0 || JSON.stringify(names) === JSON.stringify(this.layoutNames)) return
		this.layoutNames = names
		this.updateActions()
		this.updateFeedbacks()
		this.updatePresets()
	}

	setState(state) {
		this.state = state
		if (!state) {
			this.settings = null
			this.commands = []
		}
		this.setVariableValues(variableValuesFromState(state))
		this.checkAllFeedbacks()
	}

	/**
	 * Sends a command to the add-in, e.g. sendCommand('add', { seconds: 60 }).
	 * @returns {boolean} whether it was sent
	 */
	sendCommand(cmd, args = {}) {
		if (this.connection?.send({ cmd, ...args })) return true
		this.log('warn', `Not connected to PPTimer; '${cmd}' dropped`)
		return false
	}

	updateActions() {
		UpdateActions(this)
	}

	updateFeedbacks() {
		UpdateFeedbacks(this)
	}

	updateVariableDefinitions() {
		UpdateVariableDefinitions(this)
	}

	updatePresets() {
		UpdatePresets(this)
	}
}

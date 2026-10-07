export const FEATURES = [
	{ id: 'warnEnabled', label: 'Amber threshold' },
	{ id: 'criticalEnabled', label: 'Red threshold' },
	{ id: 'blinkAtZero', label: 'Blink at zero' },
	{ id: 'countUp', label: 'Count up after zero' },
	{ id: 'showMinus', label: 'Show "-" while over time' },
	{ id: 'soundEnabled', label: 'Sound at zero' },
	{ id: 'transparentBackground', label: 'Transparent background' },
	{ id: 'textOutline', label: 'Dark outline around digits' },
]

/** "90", "3:00" or "1:05:00" to whole seconds; null if empty or invalid (e.g. "1:", "5:75"). */
export function parseTime(text) {
	const parts = String(text ?? '')
		.trim()
		.split(':')
	if (parts.length > 3 || parts.some((p) => !/^\d+$/.test(p))) return null
	const numbers = parts.map(Number)
	// Only the first part may be 60 or more ("90" or "90:00", not "5:75").
	if (numbers.slice(1).some((n) => n >= 60)) return null
	return numbers.reduce((total, n) => total * 60 + n, 0)
}

const TIME_TOOLTIP = 'Seconds ("90"), m:ss ("5:00") or h:mm:ss ("1:05:00")'

function simple(self, name, cmd) {
	return {
		name,
		options: [],
		callback: () => self.sendCommand(cmd),
	}
}

export function UpdateActions(self) {
	self.setActionDefinitions({
		start: simple(self, 'Start', 'start'),
		pause: simple(self, 'Pause', 'pause'),
		toggle: simple(self, 'Start / pause toggle', 'toggle'),
		reset: simple(self, 'Reset (back to duration, paused)', 'reset'),
		restart: simple(self, 'Restart (back to duration, running)', 'restart'),

		set: {
			name: 'Set duration',
			options: [
				{ type: 'textinput', id: 'time', label: 'Duration', default: '5:00', tooltip: TIME_TOOLTIP },
				{
					type: 'dropdown',
					id: 'start',
					label: 'Then',
					default: 'keep',
					choices: [
						{ id: 'keep', label: 'Keep running / paused state' },
						{ id: 'start', label: 'Start' },
						{ id: 'pause', label: 'Pause' },
					],
				},
			],
			callback: ({ options }) => {
				const seconds = parseTime(options.time)
				if (seconds === null) {
					self.log('warn', `Invalid duration: '${options.time}'`)
					return
				}
				const args = { seconds }
				if (options.start === 'start') args.start = true
				if (options.start === 'pause') args.start = false
				self.sendCommand('set', args)
			},
		},

		add: {
			name: 'Add / remove time',
			options: [
				{
					type: 'dropdown',
					id: 'direction',
					label: 'Direction',
					default: 'add',
					choices: [
						{ id: 'add', label: 'Add' },
						{ id: 'subtract', label: 'Subtract' },
					],
				},
				{ type: 'textinput', id: 'time', label: 'Amount', default: '1:00', tooltip: TIME_TOOLTIP },
			],
			callback: ({ options }) => {
				// The direction comes from the dropdown, so a typed sign is ignored.
				const seconds = parseTime(
					String(options.time ?? '')
						.trim()
						.replace(/^[+-]/, ''),
				)
				if (seconds === null) {
					self.log('warn', `Invalid amount: '${options.time}'`)
					return
				}
				self.sendCommand('add', { seconds: options.direction === 'subtract' ? -seconds : seconds })
			},
		},

		speed_adjust: {
			name: 'Speed: run faster / slower',
			description:
				'Changes how fast the countdown runs, without the presenter seeing it (e.g. 105% makes 10:00 last 9:31). Set, reset and restart go back to 100%.',
			options: [
				{
					type: 'dropdown',
					id: 'direction',
					label: 'Direction',
					default: 'faster',
					choices: [
						{ id: 'faster', label: 'Faster' },
						{ id: 'slower', label: 'Slower' },
					],
				},
				{ type: 'number', id: 'step', label: 'Step (%)', default: 5, min: 0.5, max: 50, step: 0.5 },
			],
			callback: ({ options }) => {
				const step = Math.abs(Number(options.step) || 0)
				self.sendCommand('speed', { step: options.direction === 'slower' ? -step : step })
			},
		},

		speed_set: {
			name: 'Speed: set',
			description: '100% = real time. 50–200%.',
			options: [{ type: 'number', id: 'percent', label: 'Speed (%)', default: 100, min: 50, max: 200, step: 0.5 }],
			callback: ({ options }) => self.sendCommand('speed', { percent: Number(options.percent) }),
		},

		overlay: {
			name: 'Overlay show / hide',
			options: [
				{
					type: 'dropdown',
					id: 'mode',
					label: 'Overlay',
					default: 'togglevisible',
					choices: [
						{ id: 'show', label: 'Show' },
						{ id: 'hide', label: 'Hide' },
						{ id: 'togglevisible', label: 'Toggle' },
					],
				},
			],
			callback: ({ options }) => self.sendCommand(options.mode),
		},

		layout: {
			name: 'Overlay position / size',
			description: 'In % of the presenter view. Easiest to set by dragging on the PPTimer web page.',
			options: [
				{ type: 'number', id: 'xPercent', label: 'Left (%)', default: 22, min: 0, max: 100 },
				{ type: 'number', id: 'yPercent', label: 'Top (%)', default: 74, min: 0, max: 100 },
				{ type: 'number', id: 'widthPercent', label: 'Width (%)', default: 16, min: 2, max: 100 },
				{ type: 'number', id: 'heightPercent', label: 'Height (%)', default: 9, min: 2, max: 100 },
				{ type: 'number', id: 'opacity', label: 'Opacity (%)', default: 100, min: 20, max: 100 },
			],
			callback: ({ options }) =>
				self.sendCommand('settings', {
					xPercent: Number(options.xPercent),
					yPercent: Number(options.yPercent),
					widthPercent: Number(options.widthPercent),
					heightPercent: Number(options.heightPercent),
					opacity: Number(options.opacity) / 100,
				}),
		},

		thresholds: {
			name: 'Colour thresholds',
			options: [
				{ type: 'textinput', id: 'warn', label: 'Amber from (time left)', default: '3:00', tooltip: TIME_TOOLTIP },
				{ type: 'textinput', id: 'critical', label: 'Red from (time left)', default: '1:00', tooltip: TIME_TOOLTIP },
			],
			callback: ({ options }) => {
				const warnSeconds = parseTime(options.warn)
				const criticalSeconds = parseTime(options.critical)
				if (warnSeconds === null || criticalSeconds === null) {
					self.log('warn', `Invalid threshold: '${options.warn}' / '${options.critical}'`)
					return
				}
				self.sendCommand('settings', { warnSeconds, criticalSeconds })
			},
		},

		feature: {
			name: 'Turn a feature on / off',
			options: [
				{ type: 'dropdown', id: 'feature', label: 'Feature', default: 'soundEnabled', choices: FEATURES },
				{
					type: 'dropdown',
					id: 'mode',
					label: 'Set to',
					default: 'toggle',
					choices: [
						{ id: 'on', label: 'On' },
						{ id: 'off', label: 'Off' },
						{ id: 'toggle', label: 'Toggle' },
					],
				},
			],
			callback: ({ options }) => {
				const current = self.settings?.[options.feature]
				if (options.mode === 'toggle' && current === undefined) {
					self.log('warn', 'Not connected to PPTimer; cannot toggle')
					return
				}
				const value = options.mode === 'toggle' ? !current : options.mode === 'on'
				// The add-in has no toggle command, so record the new value right away: a second
				// press before the settings echo arrives then toggles back instead of repeating.
				if (self.sendCommand('settings', { [options.feature]: value })) {
					self.settings = { ...self.settings, [options.feature]: value }
					self.checkFeedbacks('feature')
				}
			},
		},

		testsound: simple(self, 'Play test sound', 'testsound'),
	})
}

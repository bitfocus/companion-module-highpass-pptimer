import { combineRgb } from '@companion-module/base'
import { FEATURES, layoutChoices } from './actions.js'

export function UpdateFeedbacks(self) {
	self.setFeedbackDefinitions({
		phase: {
			type: 'boolean',
			name: 'Timer phase',
			description: 'normal → warning (amber) → critical (red) → expired (00:00 / overtime)',
			defaultStyle: {
				bgcolor: combineRgb(200, 30, 30),
				color: combineRgb(255, 255, 255),
			},
			options: [
				{
					type: 'dropdown',
					id: 'phase',
					label: 'Phase',
					default: 'critical',
					choices: [
						{ id: 'normal', label: 'Normal' },
						{ id: 'warning', label: 'Warning' },
						{ id: 'critical', label: 'Critical' },
						{ id: 'expired', label: 'Expired (00:00 / overtime)' },
					],
				},
			],
			callback: ({ options }) => self.state?.phase === options.phase,
		},

		running: {
			type: 'boolean',
			name: 'Timer running',
			defaultStyle: {
				bgcolor: combineRgb(0, 150, 0),
				color: combineRgb(255, 255, 255),
			},
			options: [],
			callback: () => self.state?.running === true,
		},

		paused: {
			type: 'boolean',
			name: 'Timer paused',
			defaultStyle: {
				color: combineRgb(150, 150, 150),
			},
			options: [],
			callback: () => self.state?.running === false,
		},

		overlay_visible: {
			type: 'boolean',
			name: 'Overlay visible',
			defaultStyle: {
				bgcolor: combineRgb(0, 90, 170),
				color: combineRgb(255, 255, 255),
			},
			options: [],
			callback: () => self.state?.visible === true,
		},

		presenter_view: {
			type: 'boolean',
			name: 'Timer placed (presenter view / screen found)',
			description:
				"True while the active layout's target is there: the presenter view during a slide show, or the layout's screen",
			defaultStyle: {
				bgcolor: combineRgb(0, 120, 60),
				color: combineRgb(255, 255, 255),
			},
			options: [],
			callback: () => self.state?.presenterView === true,
		},

		speed: {
			type: 'boolean',
			name: 'Speed changed',
			description: 'Whether the countdown runs faster or slower than real time',
			defaultStyle: {
				bgcolor: combineRgb(150, 60, 160),
				color: combineRgb(255, 255, 255),
			},
			options: [
				{
					type: 'dropdown',
					id: 'mode',
					label: 'When',
					default: 'changed',
					choices: [
						{ id: 'changed', label: 'Not 100%' },
						{ id: 'faster', label: 'Faster than 100%' },
						{ id: 'slower', label: 'Slower than 100%' },
					],
				},
			],
			callback: ({ options }) => {
				const speed = self.state?.speedPercent
				if (speed === undefined) return false
				if (options.mode === 'faster') return speed > 100
				if (options.mode === 'slower') return speed < 100
				return speed !== 100
			},
		},

		feature: {
			type: 'boolean',
			name: 'Feature enabled',
			defaultStyle: {
				bgcolor: combineRgb(0, 90, 170),
				color: combineRgb(255, 255, 255),
			},
			options: [{ type: 'dropdown', id: 'feature', label: 'Feature', default: 'soundEnabled', choices: FEATURES }],
			callback: ({ options }) => self.settings?.[options.feature] === true,
		},

		layout: {
			type: 'boolean',
			name: 'Layout active',
			description: 'PPTimer 1.1.0+',
			defaultStyle: {
				bgcolor: combineRgb(0, 90, 170),
				color: combineRgb(255, 255, 255),
			},
			options: [
				{
					type: 'dropdown',
					id: 'name',
					label: 'Layout',
					default: layoutChoices(self)[0].id,
					choices: layoutChoices(self),
					allowCustom: true,
				},
			],
			callback: ({ options }) => {
				const active = self.state?.layout ?? self.settings?.layout
				return (
					typeof active === 'string' &&
					active.toLowerCase() ===
						String(options.name ?? '')
							.trim()
							.toLowerCase()
				)
			},
		},

		disconnected: {
			type: 'boolean',
			name: 'Not connected to PPTimer',
			defaultStyle: {
				bgcolor: combineRgb(80, 80, 80),
				color: combineRgb(255, 120, 120),
			},
			options: [],
			callback: () => self.state == null,
		},
	})
}

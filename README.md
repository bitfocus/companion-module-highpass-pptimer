## PPTimer – PowerPoint presenter view countdown

Controls **PPTimer**, which draws a countdown on top of the presenter view (visible to the
presenter only, never on the audience screen): the PowerPoint add-in on Windows, or the PPTimer
menu bar app on a Mac (Keynote and PowerPoint). Needs PPTimer 1.0.0 or later.

### Setup

1. Windows: install the PPTimer add-in on the presentation PC with `install.cmd` (accept the admin prompt, so it accepts network connections). Mac: open PPTimer.app.
2. Enter the PC's IP address here. The default port is **9595**. If you set `apiToken` in the add-in's `config.json`, enter the same token (it is stored as a secret).
3. Drag presets from **Timer control**, **Adjust time**, **Speed (hidden from the presenter)**, **Features on / off** and **Set duration** onto your buttons.

### Actions

- Start, Pause, Start/pause toggle, Reset (to duration, paused), Restart (to duration, running)
- Set duration: `90`, `5:00` or `1:05:00`, optionally start or pause afterwards
- Add / remove time (same formats)
- **Speed: run faster / slower**: changes the speed by a step (%, default 5)
- **Speed: set**: sets the speed (100% = real time, 50–200%)

  The presenter never sees the speed, only the time. At 105%, 10:00 lasts 9:31. Set duration,
  Reset and Restart go back to 100%.

- Overlay show / hide / toggle
- Overlay position / size / opacity (easier: drag it on the PPTimer web page, `http://<PC>:9595/`)
- Colour thresholds (amber / red, as `m:ss`)
- Turn a feature on / off / toggle: amber, red, blink at zero, count up after zero, minus sign, sound at zero, transparent background, outline
- Play test sound

Invalid times (empty, `1:`, `5:75`) are not sent; a warning goes to the connection log.

### Variables

`$(pptimer:remaining)`, `remaining_seconds`, `duration`, `duration_seconds`, `progress_percent`,
`phase` (normal / warning / critical / expired / offline), `status` (running / paused / offline),
`running`, `overlay_visible`, `presenter_view`, `speed` ("105%"), `speed_percent` (105)

### Feedbacks

Timer phase, Running, Paused, Overlay visible, Presenter view detected, **Speed changed** (not
100% / faster / slower), Feature enabled, Not connected

### Connection

The add-in sends its state on every change plus a heartbeat every 5 s. Once the first heartbeat
has arrived, the module reconnects if nothing arrives for 12 s.

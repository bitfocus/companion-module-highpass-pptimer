## PPTimer – presenter view countdown

Controls **PPTimer**, which draws a countdown on top of the presenter view (visible to the
presenter only, never on the audience screen), or on any screen: the PPTimer app on Windows
(PowerPoint) or on a Mac (Keynote and PowerPoint). Needs PPTimer 1.0.0 or later; **layouts** need
1.1.0 or later, and 1.0.3 or later is recommended so feature toggles stay correct when pressed quickly.

### Setup

1. Windows: run `install.cmd` from the PPTimer folder on the presentation PC (accept the admin prompt, so it accepts network connections). Mac: open PPTimer.app.
2. Enter the computer's IP address here. The default port is **9595**. If you set `apiToken` in PPTimer's `config.json`, enter the same token (it is stored as a secret).
3. Drag presets from **Timer control**, **Adjust time**, **Speed (hidden from the presenter)**, **Features on / off**, **Set duration** and **Layouts** onto your buttons.

### Layouts

A layout is a saved preset of where the timer is shown and how: on PowerPoint's or Keynote's presenter
view, or on a screen (main, external, or a numbered one), with its position, size and look, optionally
with the rest of the screen black (a fullscreen timer). PPTimer starts with *PowerPoint*, *Keynote* (Mac),
*Screen* and *Fullscreen*; create, rename and edit them on the PPTimer web page (`http://<computer>:9595/`).
The layout dropdowns list the layouts PPTimer reports; you can also type a name.

### Actions

- Start, Pause, Start/pause toggle, Reset (to duration, paused), Restart (to duration, running)
- Set duration: `90`, `5:00` or `1:05:00`, optionally start or pause afterwards
- Add / remove time (same formats)
- **Speed: run faster / slower**: changes the speed by a step (%, default 5)
- **Speed: set**: sets the speed (100% = real time, 50–200%)

  The presenter never sees the speed, only the time. At 105%, 10:00 lasts 9:31. Set duration,
  Reset and Restart go back to 100%.

- **Layout: select** (by name) and **Layout: next / previous**
- Overlay show / hide / toggle
- Overlay position / size / opacity of the active layout (easier: drag it on the PPTimer web page)
- Colour thresholds (amber / red, as `m:ss`)
- Turn a feature on / off / toggle: amber, red, blink at zero, count up after zero, minus sign, sound at zero, and for the active layout: transparent background, outline, black screen behind the timer
- Play test sound

Invalid times (empty, `1:`, `5:75`) are not sent; a warning goes to the connection log.

### Variables

`$(pptimer:remaining)`, `remaining_seconds`, `duration`, `duration_seconds`, `progress_percent`,
`phase` (normal / warning / critical / expired / offline), `status` (running / paused / offline),
`running`, `overlay_visible`, `presenter_view` (the timer is placed: presenter view or screen found),
`layout`, `target` ("PowerPoint presenter view", "Screen 2 · DELL U2720Q"), `speed` ("105%"), `speed_percent` (105)

### Feedbacks

Timer phase, Running, Paused, Overlay visible, Timer placed, **Layout active**, **Speed changed** (not
100% / faster / slower), Feature enabled, Not connected

### Connection

PPTimer sends its state on every change plus a heartbeat every 5 s. Once the first heartbeat
has arrived, the module reconnects if nothing arrives for 12 s.

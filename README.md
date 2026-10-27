# Floating Page Save

![ProcessWire 3.0+](https://img.shields.io/badge/ProcessWire-3.0+-orange.svg)
![License MIT](https://img.shields.io/badge/License-MIT-blue.svg)

> Adds a floating copy of the native Save control to ProcessWire's page editor so it stays within reach while you scroll long pages.

Clicks go to the original Save controls, so ProcessWire validation, permissions, and save hooks work as usual.

## Features

- Floating Save button that follows the editing form
- Mirrors the native Save label and split menu (Save + Exit, Save + View, etc.)
- Stays in sync with the original control's label and disabled state
- Repositions on scroll, resize, and browser zoom
- Hides automatically when space is limited or the native Save is unavailable

## Requirements

- ProcessWire 3.0 or later
- PHP 7.4 or later
- An admin theme with the standard `ProcessPageEdit` Save control

## Installation

1. Download or clone this repository.
2. Copy the module files into a folder named exactly `FloatingPageSave` under your ProcessWire `site/modules/` directory:

   ```
   site/modules/FloatingPageSave/
   ├── FloatingPageSave.module.php
   └── FloatingPageSave.js
   ```

   To clone directly instead:

   ```
   cd site/modules/
   git clone https://github.com/dlzi/FloatingPageSave.git FloatingPageSave
   ```

3. In the ProcessWire admin, go to **Modules → Refresh**.
4. Find **Floating Page Save** and click **Install**.

## Usage

Open any regular page edit screen. A floating Save button appears beside the editor and stays visible as you scroll. Use it exactly like the native Save button.

## Configuration

Go to **Modules → Configure → Floating Page Save**.

| Option | Default | Description |
|--------|---------|-------------|
| Vertical position | Middle | Top, Middle, or Bottom, relative to the visible portion of the editing form. |
| Side | Right | Right or Left of the editor. |

> **Note:** The button uses existing space beside the editor. It does not widen or move the form.

## Behavior

- Appears only on regular page edit screens, and only when the chosen side has enough room.
- Hides when the browser window narrows or the native Save control is unavailable.
- Leaves the original Save buttons in place.
- Tracks scrolling, including nested scroll containers, as well as resizing and browser zoom.

## License

MIT

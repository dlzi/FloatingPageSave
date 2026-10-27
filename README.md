# Floating Page Save

![ProcessWire 3.0+](https://img.shields.io/badge/ProcessWire-3.0+-orange.svg)
![License MIT](https://img.shields.io/badge/License-MIT-blue.svg)

> Adds a floating copy of the native Save control to ProcessWire’s page editor so it stays within reach while you scroll long pages.

## Features
- Floating Save button that follows the editing form
- Copies the native Save label and split menu (Save + Exit, Save + View, etc.)
- Keeps label and disabled state in sync with the original control
- Repositions correctly on scroll, resize, and browser zoom
- Hides automatically when there is not enough space or the native Save is unavailable

## Requirements
- ProcessWire 3.0 or later
- PHP 7.4 or later
- An admin theme with the standard `ProcessPageEdit` Save control

## Installation
1. Copy the whole `FloatingPageSave` directory into `site/modules/`, so the result is:
2. In the ProcessWire admin, open **Modules → Refresh**.
3. Find **Floating Page Save** and select **Install**.

## Usage
Once installed, a floating Save button appears beside the page editor on regular page edit screens.  
It stays visible as you scroll and sends clicks to the original Save controls, preserving all ProcessWire validation, permissions, and save hooks.

## Configuration
**Modules → Configure → Floating Page Save**

| Setting            | Choices          | Default |
|--------------------|------------------|---------|
| Vertical position  | Top, Middle, Bottom | Middle |
| Side               | Right, Left      | Right  |

Vertical positions use the visible portion of the editing form. The button uses existing space beside the editor and does not widen or move the form.

## Behavior
- Appears only on regular page edit screens when the chosen side has enough room.
- Hides when the browser window narrows or the native Save control is unavailable.
- Copies the native Save label and split menu actions.
- Keeps the copied label and disabled state in step with the original control.
- Sends clicks to the original controls (original Save buttons remain in place).
- Repositions on scrolling (including nested scroll containers) and resizing, including browser zoom.

## License
MIT

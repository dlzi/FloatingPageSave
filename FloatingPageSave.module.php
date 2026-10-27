<?php namespace ProcessWire;

/**
 * Floating Page Save
 *
 * Adds a viewport Save shortcut to the page editor when there is room beside the form.
 */
class FloatingPageSave extends WireData implements Module, ConfigurableModule {

    const POSITIONS = ['top', 'middle', 'bottom'];
    const SIDES = ['right', 'left'];

    public static function getModuleInfo(): array {
        return [
            'title' => 'Floating Page Save',
            'summary' => 'Shows a Save shortcut beside the page editor when space permits.',
            'author' => 'Daniel Zilli',
            'href' => 'https://github.com/dlzi/floatingpagesave',
            'version' => 107,
            'autoload' => 'template=admin, process=ProcessPageEdit',
            'singular' => true,
            'requires' => 'ProcessWire>=3.0.0, PHP>=7.4',
            'icon' => 'save',
        ];
    }

    public function getModuleConfigInputfields(InputfieldWrapper $inputfields): void {
        $modules = $this->wire()->modules;
        $settings = $this->settings();

        $position = $modules->get('InputfieldSelect');
        $position->name = 'vertical_position';
        $position->label = $this->_('Vertical position');
        $position->required = true;
        $position->requiredAttr = false;
        foreach (['top' => $this->_('Top'), 'middle' => $this->_('Middle'), 'bottom' => $this->_('Bottom')] as $value => $label) {
            $position->addOption($value, $label);
        }
        $position->value = $settings['vertical_position'];
        $inputfields->add($position);

        $side = $modules->get('InputfieldSelect');
        $side->name = 'side';
        $side->label = $this->_('Side');
        $side->required = true;
        $side->requiredAttr = false;
        foreach (['right' => $this->_('Right'), 'left' => $this->_('Left')] as $value => $label) {
            $side->addOption($value, $label);
        }
        $side->value = $settings['side'];
        $inputfields->add($side);
    }

    public function ready(): void {
        $this->addHookBefore('ProcessPageEdit::execute', function (): void {
            $wire = $this->wire();
            if ($wire->config->ajax || $wire->input->get('modal')) return;

            $settings = $this->settings();
            $wire->config->js('FloatingPageSave', [
                'position' => $settings['vertical_position'],
                'side' => $settings['side'],
            ]);
            $wire->config->scripts->add(
                $wire->config->urls('FloatingPageSave') . 'FloatingPageSave.js?v=' . $this->version()
            );
        });
    }

    /**
     * Returns saved settings, falling back to defaults for missing or invalid values.
     */
    private function settings(): array {
        $position = $this->get('vertical_position');
        $side = $this->get('side');

        return [
            'vertical_position' => in_array($position, self::POSITIONS, true) ? $position : 'middle',
            'side' => in_array($side, self::SIDES, true) ? $side : 'right',
        ];
    }

    /**
     * The version comes from getModuleInfo() so it is defined in one place only.
     */
    private function version(): int {
        return (int) self::getModuleInfo()['version'];
    }
}

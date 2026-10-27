(function () {
    'use strict';

    // Admin chrome and interactive controls that the floating button must not cover.
    var CONTROL_SELECTOR = '#pw-masthead, #pw-masthead-mobile, #pw-admin-side, #pw-footer, #pw-content-head-buttons, #offcanvas-toggle, .ui-dialog, .uk-offcanvas, a, button, input, select, textarea, [role="button"]';

    // Removes IDs from copied descendants so every ID stays unique on the page.
    function stripDescendantIds(root) {
        var nodes = root.querySelectorAll('[id]');
        for (var i = 0; i < nodes.length; i++) nodes[i].removeAttribute('id');
    }

    // Copies a native control's markup, without its IDs.
    function copyContent(from, to) {
        to.innerHTML = from.innerHTML;
        stripDescendantIds(to);
    }

    function intersects(a, b) {
        return a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
    }

    function start() {
        var form = document.getElementById('ProcessPageEdit');
        var content = document.getElementById('content');
        if (!form || !content || document.body.classList.contains('modal')) return;

        var config = (window.ProcessWire && ProcessWire.config.FloatingPageSave) || {};
        var side = config.side === 'left' ? 'left' : 'right';
        var position = ['top', 'middle', 'bottom'].indexOf(config.position) >= 0 ? config.position : 'middle';
        var source = form.querySelector('#submit_save_unpublished') ||
            form.querySelector('#submit_save') || form.querySelector('#submit_publish');
        if (!source) return;

        // Copy the native controls, while keeping all submissions on the original form.
        var wrapper = document.createElement('span');
        wrapper.className = 'pw-button-dropdown-wrap';
        wrapper.style.cssText = 'position:fixed;z-index:100;visibility:hidden;white-space:nowrap;';

        var button = document.createElement('button');
        button.id = 'FloatingPageSaveButton';
        button.type = 'button';
        button.className = source.className;
        button.title = source.title;
        if (source.hasAttribute('aria-label')) button.setAttribute('aria-label', source.getAttribute('aria-label'));
        button.classList.remove('pw-head-button', 'pw-button-dropdown-required');
        copyContent(source, button);
        button.disabled = source.disabled;
        wrapper.appendChild(button);

        var nativeToggle = source.nextElementSibling;
        var nativeMenu = nativeToggle && nativeToggle.nextElementSibling;
        var toggle = null;
        var menu = null;
        var menuLimit = -1;
        var controlCache = null;

        if (nativeToggle && nativeToggle.classList.contains('pw-button-dropdown-toggle') &&
            nativeMenu && nativeMenu.classList.contains('pw-button-dropdown')) {
            toggle = document.createElement('button');
            toggle.id = 'FloatingPageSaveToggle';
            toggle.type = 'button';
            toggle.className = nativeToggle.className;
            toggle.classList.remove('pw-head-button', 'pw-dropdown-init', 'pw-dropdown-toggle', 'pw-dropdown-toggle-click');
            toggle.setAttribute('aria-label', nativeToggle.getAttribute('aria-label') || source.textContent.trim());
            toggle.setAttribute('aria-haspopup', 'menu');
            toggle.setAttribute('aria-expanded', 'false');
            copyContent(nativeToggle, toggle);
            toggle.disabled = !!nativeToggle.disabled;
            wrapper.appendChild(toggle);

            menu = nativeMenu.cloneNode(true);
            stripDescendantIds(menu);
            menu.id = 'FloatingPageSaveMenu';
            menu.classList.remove('pw-dropdown-ready');
            menu.style.position = 'fixed';
            menu.style.display = 'none';
            menu.style.zIndex = '200';
            // The theme's 200px minimum can exceed the gutter for a short menu.
            // Allow its action labels to wrap when that happens.
            menu.style.minWidth = '0';
            menu.style.boxSizing = 'border-box';
            var menuItems = menu.querySelectorAll('li');
            var menuLinks = menu.querySelectorAll('a');
            for (var j = 0; j < menuItems.length; j++) menuItems[j].style.minWidth = '0';
            for (var k = 0; k < menuLinks.length; k++) {
                menuLinks[k].style.whiteSpace = 'normal';
                menuLinks[k].style.overflowWrap = 'anywhere';
            }
            toggle.setAttribute('aria-controls', menu.id);

            var nativeItems = nativeMenu.querySelectorAll('a');
            var copiedItems = menu.querySelectorAll('a');
            for (var i = 0; i < copiedItems.length; i++) {
                (function (copied, original) {
                    // If the menus differ in length, hide the extra copy rather than failing on click.
                    if (!original) {
                        (copied.closest('li') || copied).style.display = 'none';
                        return;
                    }
                    copied.addEventListener('click', function (event) {
                        event.preventDefault();
                        hideMenu();
                        original.click();
                    });
                }(copiedItems[i], nativeItems[i]));
            }
            document.body.appendChild(menu);
        }
        document.body.appendChild(wrapper);

        // Keep the copies in step with the native controls when ProcessWire changes their label or state.
        function sync() {
            copyContent(source, button);
            button.disabled = source.disabled;
            if (toggle) {
                copyContent(nativeToggle, toggle);
                toggle.disabled = !!nativeToggle.disabled;
            }
        }

        if (toggle) {
            toggle.addEventListener('click', function () {
                if (menu.style.display === 'block') hideMenu();
                else showMenu();
            });
            document.addEventListener('pointerdown', function (event) {
                if (!wrapper.contains(event.target) && !menu.contains(event.target)) hideMenu();
            });
            document.addEventListener('keydown', function (event) {
                if (event.key === 'Escape' && menu.style.display === 'block') {
                    hideMenu();
                    toggle.focus();
                }
            });
        }

        button.addEventListener('click', function () {
            if (!source.disabled && source.getClientRects().length) source.click();
        });

        // Cached so scroll-driven placement does not requery the whole page on every frame.
        // The cache is cleared on resize, tab changes and template changes.
        function controls() {
            if (!controlCache) controlCache = document.querySelectorAll(CONTROL_SELECTOR);
            return controlCache;
        }

        function available(rect) {
            var list = controls();
            for (var i = 0; i < list.length; i++) {
                var control = list[i];
                if (wrapper.contains(control) || control === menu || (menu && menu.contains(control)) || content.contains(control)) continue;
                if (control.getClientRects().length && intersects(rect, control.getBoundingClientRect())) return false;
            }
            var xs = [rect.left + 2, (rect.left + rect.right) / 2, rect.right - 2];
            var ys = [rect.top + 2, (rect.top + rect.bottom) / 2, rect.bottom - 2];
            for (var x = 0; x < xs.length; x++) {
                for (var y = 0; y < ys.length; y++) {
                    var hit = document.elementFromPoint(xs[x], ys[y]);
                    if (hit && hit !== menu && !(menu && menu.contains(hit)) &&
                        hit.closest('a, button, input, select, textarea, [role="button"], nav, header, footer, .ui-dialog')) return false;
                }
            }
            return true;
        }

        function hideMenu() {
            if (!menu || menu.style.display === 'none') return;
            menu.style.display = 'none';
            toggle.setAttribute('aria-expanded', 'false');
        }

        function showMenu() {
            if (wrapper.style.visibility !== 'visible') return;
            if (window.jQuery && window.jQuery.fn.menu && !menu.classList.contains('ui-menu')) {
                window.jQuery(menu).menu();
            }
            menu.style.visibility = 'hidden';
            menu.style.display = 'block';
            var rect = menu.getBoundingClientRect();
            var edge = content.getBoundingClientRect();
            var minLeft = side === 'right' ? edge.right + 16 : 16;
            var maxRight = side === 'right' ? document.documentElement.clientWidth - 16 : edge.left - 16;
            var maxTop = document.documentElement.clientHeight - rect.height - 16;
            if (rect.width > maxRight - minLeft || maxTop < 16) {
                hideMenu();
                return;
            }
            var buttonRect = wrapper.getBoundingClientRect();
            var wantedLeft = side === 'right' ? buttonRect.right - rect.width : buttonRect.left;
            var left = Math.max(minLeft, Math.min(maxRight - rect.width, wantedLeft));
            var wantedTop = buttonRect.bottom + 1;
            if (wantedTop > maxTop) wantedTop = buttonRect.top - rect.height - 1;
            var top = Math.max(16, Math.min(maxTop, wantedTop));
            menu.style.left = left + 'px';
            menu.style.top = top + 'px';
            if (!available({ left: left, right: left + rect.width, top: top, bottom: top + rect.height })) {
                hideMenu();
                return;
            }
            menu.style.visibility = '';
            toggle.setAttribute('aria-expanded', 'true');
        }

        function place() {
            hideMenu();
            wrapper.style.visibility = 'hidden';
            if (!source.isConnected || source.disabled || !source.getClientRects().length) return;

            if (toggle) {
                var showToggle = nativeToggle.getClientRects().length > 0;
                toggle.style.display = showToggle ? '' : 'none';
                button.classList.toggle('pw-button-dropdown-main', showToggle);
            }

            var width = document.documentElement.clientWidth;
            var height = document.documentElement.clientHeight;
            var contentRect = content.getBoundingClientRect();
            var formRect = form.getBoundingClientRect();
            var buttonWidth = wrapper.offsetWidth;
            var buttonHeight = wrapper.offsetHeight;
            var gapStart = side === 'right' ? contentRect.right : 0;
            var gapEnd = side === 'right' ? width : contentRect.left;
            var gap = gapEnd - gapStart;
            if (!buttonWidth || !buttonHeight || gap < buttonWidth + 32) return;
            var visibleTop = Math.max(16, formRect.top);
            var visibleBottom = Math.min(height - 16, formRect.bottom);
            if (visibleBottom - visibleTop < buttonHeight + 32) return;
            if (menu) {
                var limit = Math.floor(gap - 32);
                if (limit !== menuLimit) {
                    menu.style.maxWidth = limit + 'px';
                    menuLimit = limit;
                }
            }

            var left = gapStart + (gap - buttonWidth) / 2;
            var top = position === 'top' ? visibleTop + 16 :
                position === 'bottom' ? visibleBottom - buttonHeight - 16 :
                    (visibleTop + visibleBottom - buttonHeight) / 2;
            var rect = { left: left, right: left + buttonWidth, top: top, bottom: top + buttonHeight };
            if (!available(rect)) return;

            wrapper.style.left = left + 'px';
            wrapper.style.top = top + 'px';
            wrapper.style.visibility = 'visible';
        }

        var pending = false;
        function schedule() {
            if (pending) return;
            pending = true;
            requestAnimationFrame(function () { pending = false; place(); });
        }

        window.addEventListener('resize', function () {
            menuLimit = -1;
            controlCache = null;
            schedule();
        });
        // Capture scroll events from any element, so nested scroll containers also reposition the button.
        document.addEventListener('scroll', schedule, { passive: true, capture: true });
        document.addEventListener('wiretabclick', function () {
            controlCache = null;
            schedule();
        });
        var template = document.getElementById('template');
        if (template) {
            template.addEventListener('change', function () {
                controlCache = null;
                schedule();
            });
        }

        if (window.MutationObserver) {
            var mutations = new MutationObserver(function () {
                sync();
                schedule();
            });
            var observed = toggle ? [source, nativeToggle] : [source];
            for (var o = 0; o < observed.length; o++) {
                mutations.observe(observed[o], { attributes: true, characterData: true, childList: true, subtree: true });
            }
        }
        if (window.ResizeObserver) {
            var observer = new ResizeObserver(schedule);
            observer.observe(content);
            observer.observe(wrapper);
        }
        schedule();
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
    else start();
}());

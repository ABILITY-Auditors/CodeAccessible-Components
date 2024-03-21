// Encapsulation
(() => {
    // TODO: updated positionMenu for 1.4.10 Reflow, 
    // and make a test for a menu that may appear off screen.
    rovingMain();

    function rovingMain() {
        // components that open a menu have been given the attribute 'data-controller'
        let menuControllers = document.querySelectorAll('[data-controller]');
        for (let menuController of menuControllers) {
            let menu = getMenuFromController(menuController);
            if (menu.dataset.type !== 'roving') continue;
            initMenu(menu);
            menu.addEventListener('keydown', rovingMoveFocus);
            menu.addEventListener('keydown', closeMenu);
            menu.addEventListener('keydown', keyboardActivateFunction);
            menu.addEventListener('click', activateFunction);
            menuController.addEventListener('click', controllerActivation);
            menuController.addEventListener('keydown', controllerActivation);
        }
        let menuWidgets = document.querySelectorAll('[data-menu-component]');
        for (let menuWidget of menuWidgets) {
            menuWidget.addEventListener('focusout', closeAllMenus);
        }
    }


    /* (non-simple) Functions called in main(), ordered by appearance */

    /**
     * Given a menu, for each menuitem this prepares that menuitem HTML Element's dataset
     * to include the id of the next/previous menuitem. 
     * @param {HTMLElement} menu [role="menu"] element
     */
    function initMenu(menu) {
        // only get menutitems part of the scope
        let menuitems = [...menu.querySelectorAll(':is([role="menuitem"], [data-controller])')];
        // iterate over all menuitems and add dataset.next and dataset.previous
        for (let i = 0; i < menuitems.length; i++) {
            let menuitem = menuitems[i];
            // if this opens a submenu
            if ('controller' in menuitem.dataset) {
                menuitem.setAttribute('role', 'menuitem');
            }
            // handle first/last
            let nextIndex = i + 1 >= menuitems.length ? 0 : i + 1;
            let prevIndex = i <= 0 ? menuitems.length - 1 : i - 1;
            // set the next/previous dataset
            menuitem.dataset.next = menuitems[nextIndex].id;
            menuitem.dataset.previous = menuitems[prevIndex].id;
        }
    }

    /**
     * Handles moving focus using ArrowUp, ArrowDown, and Tab navigation.
     * @param {KeydownEvent} e event
     */
    function rovingMoveFocus(e) {
        const acceptableKeys = ['ArrowUp', 'ArrowDown', 'Tab'];
        if (!acceptableKeys.includes(e.key)) return;
        let menuitem = e.target;
        let nextMenuitem;
        switch (e.key) {
            case 'ArrowUp':
                nextMenuitem = document.getElementById(menuitem.dataset.previous);
            case 'ArrowDown':
                nextMenuitem ||= document.getElementById(menuitem.dataset.next);
                menuitem.tabIndex = -1;
                nextMenuitem.tabIndex = 0;
                nextMenuitem.focus();
                break;
            case 'Tab':
                let movingBackwards = e.getModifierState('Shift');
                let menu = menuitem.closest('[role="menu"]');
                if (movingBackwards) {
                    // if moving focus backwards, close the current menu
                    // toggleMenu will handle focus and place it on the controller
                    toggleMenu(menu);
                }
                else {
                    /* 1. if there's an open submenu, focus will naturally move to the next 
                     * focusable element in that menu
                     * 2. if there isn't an open submenu, then focus will naturally leave 
                     * the menu, and the focusout event will fire and close the entire 
                     * menu widget; So ultimately we don't need to do anything except let 
                     * focus move naturally. We return to ensure that the e.preventDefault()
                     * is not called allowing the focus to move naturally.*/
                    return;
                }
                break;
        }
        e.preventDefault();
    }

    /**
     * Handles Escape and ArrowLeft, and closes the current menu. Focus is handled.
     * @param {KeydownEvent} e e.currentTarget = menu
     */
    function closeMenu(e) {
        const acceptedKeys = ['Escape', 'ArrowLeft'];
        if (!acceptedKeys.includes(e.key)) return;
        toggleMenu(e.currentTarget);
        e.preventDefault();
    }

    /**
     * Handles keyboard activation of menuitems. Checks keys, if good 
     * calls activateFunction.
     * @param {KeydownEvent} e event
     */
    function keyboardActivateFunction(e) {
        const acceptedKeys = ['Enter', ' '];
        if (!acceptedKeys.includes(e.key)) return;
        activateFunction(e);
    }

    /**
     * Pretends to activate the function of the menuitem
     * @param {Event} e e.target
     */
    function activateFunction(e) {
        let menuitem = e.target;
        if ('controller' in menuitem.dataset) return;
        alert(`activated the menuitem: ${menuitem.textContent}`);
        // gets the highest level menu
        let menu = menuitem.closest('[data-menu-component]').querySelector('[role="menu"]');
        toggleMenu(menu);
        e.preventDefault();
    }

    /**
     * Handles ArrowRight, Enter, and Space keys, and clicks.
     * @param {Event} e keydown or click event
     */
    function controllerActivation(e) {
        const acceptedKeys = ["ArrowRight", "Enter", " "];
        if (e.type === 'keydown' && !acceptedKeys.includes(e.key)) return;
        let controller = e.currentTarget;
        let menu = getMenuFromController(controller);
        if (!menu) {
            throw new Error('malformed menu, could not find menu from controller', controller);
        }
        toggleMenu(menu);
        e.preventDefault();
    }

    /**
     * Closes all menus when focus moves outside of the widget.
     * @param {FocusoutEvent} e the focusout event
     */
    function closeAllMenus(e) {
        let widget = e.currentTarget;
        let focusTarget = e.relatedTarget;
        let menu = widget.querySelector('[role="menu"]');
        // called on focusout which bubbles up, so if the widget contains the 
        // focusTarget the other eventlisteners should be dealing with focus 
        // management. if the menu is hidden, then we do not want to open it.
        if (!focusTarget || widget.contains(focusTarget) || menu.hidden) return;
        toggleMenu(menu, false);
    }

    /**
     * Opens or closes a menu. 
     * @param {HTMLElement} menu [role="menu"] element
     * @param {Boolean} handleFocus if true focus will be placed on the menu's controller
     */
    function toggleMenu(menu, handleFocus = true) {
        let controller = getControllerOfMenu(menu);
        menu.hidden = !menu.hidden;
        // set controller's state
        controller.setAttribute('aria-expanded', !menu.hidden);
        // if menu is closed, hide submenus
        if (menu.hidden) {
            let openSubControllers = menu.querySelectorAll(
                '[data-controller][aria-expanded="true"]'
            );
            for (let openSubController of openSubControllers) {
                let submenu = getMenuFromController(openSubController);
                // we do not handle focus on recursive calls
                toggleMenu(submenu, false);
            }
            if (handleFocus) controller.focus();
        }
        else {
            openRovingMenu(menu);
            positionMenu(menu);
        }
    }


    /* (non-simple) Functions not called directly in main() */

    /**
     * Reposition a menu. Should be called after opening the menu or when the 
     * viewport size is changed to ensure that WACG SC 1.4.10 Reflow is satisfied.
     * @param {HTMLElement} controller the component that opens a menu, 
     *                                 "controls" the presence of the menu
     */
    function positionMenu(menu) {
        let controller = getControllerOfMenu(menu);
        let ancestor = controller.closest('[data-menu-component]');
        if (!ancestor) {
            console.warn("can't position submenu, ancestor not found!");
            return;
        }
        // reset the styling
        menu.style.removeProperty('width');
        menu.style.removeProperty('left');
        menu.style.removeProperty('white-space');
        // get menu dimensions
        let menuRect = menu.getBoundingClientRect();
        let ancestorRect = ancestor.getBoundingClientRect();
        let controllerRect = controller.getBoundingClientRect();

        // this positions the new menu directly below the controlling menuitem/button
        let zeroY = controllerRect.y - ancestorRect.y + controllerRect.height;
        menu.style.top = zeroY + 'px';
        // set the width of submenus equal to parent
        if (menuRect.width < controllerRect.width) {
            let borderWidth =
                getPropertyAsNumber(menu, 'border-left-width')
                + getPropertyAsNumber(menu, 'border-right-width');
            menu.style.width = controllerRect.width + borderWidth + 'px';
        }
    }

    /**
     * Opens a menu and sets focus appropriately.
     * @param {HTMLElement[role="menu"]} menu the menu element
     */
    function openRovingMenu(menu) {
        let currentMenuitem = menu.querySelector('[tabindex="0"]');
        // if we want to reset focus to the first menu item each time it is opened
        if ('resetFocus' in menu.dataset) {
            currentMenuitem.tabIndex = -1;
            let firstMenuitem = menu.querySelector('[role="menuitem"]');
            firstMenuitem.tabIndex = 0;
            firstMenuitem.focus();
        }
        else {
            currentMenuitem.focus();
        }
    } 


    /* Simple Functions */

    /**
     * Gets the element that controls this menu.
     * @param {HTMLElement} menu [role="menu"] element
     * @returns the element that controls the given menu
     */
    function getControllerOfMenu(menu) {
        return document.getElementById(menu.getAttribute('aria-labelledby'));
    }

    /**
     * Gets the [role="menu"] element that the controller controls.
     * @param {HTMLElement} controller button or menuitem that controls the presence of a menu
     * @returns HTMLElement[role="menu"]
     */
    function getMenuFromController(controller) {
        return document.getElementById(controller.getAttribute('aria-controls'));
    }

    /**
     * Gets the value of a CSS property for an element as a number. 
     * @param {HTMLElement} element gets the CSS property of this element
     * @param {String} property the CSS property name
     * @returns the CSS property's value as a Number (note CSS values are typically in pixels)
     */
    function getPropertyAsNumber(element, property) {
        return Number(
            window
                .getComputedStyle(element)
                .getPropertyValue(property)
                .match(/\d+(\.\d+)?/gi)
        );
    }
})();
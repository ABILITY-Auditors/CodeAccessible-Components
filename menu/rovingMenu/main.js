(() => {
    const maxWidth = 500;

    rovingMain();

    /**
     * Opens or closes a menu.
     * @param {HTMLElement} menu [role="menu"] element
     */
    function toggleMenu(menu) {
        // close submenus
        let openedControllers = menu.querySelectorAll(
            '[data-opener][aria-expanded="true"]'
        );
        for (let controller of openedControllers) {
            let submenu = getMenuFromController(controller);
            toggleMenu(submenu);
        }
        // get controller of current menu
        let controller = getControllerFromMenu(menu);
        // toggle visibility
        menu.hidden = !menu.hidden;
        // set controller's state
        controller.setAttribute('aria-expanded', !menu.hidden);
        if (menu.hidden) {
            // set focus on menu dismissal
            controller.focus();
        }
        else {
            openRovingMenu(menu);
            positionMenu(menu);
        }
    }
    

    /**
     * Reposition a menu. Should be called after opening the menu or when the 
     * viewport size is changed to ensure that WACG SC 1.4.10 Reflow is satisfied.
     * @param {HTMLElement} controller the component that opens a menu, 
     *                                 "controls" the presence of the menu
     * @returns null
     */
    function positionMenu(menu) {
        let controller = getControllerFromMenu(menu);
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
        // set max-width
        if (menuRect.width > maxWidth) {
            menu.style.width = maxWidth + 'px';
            menu.style.whiteSpace = 'normal';
        }
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

    function rovingMain() {
        // components that open a menu have been given the attribute 'data-opener'
        let menuControllers = document.querySelectorAll('[data-opener]');
        for (let menuController of menuControllers) {
            let menu = getMenuFromController(menuController);
            initMenu(menu);
            // add event listeners
            menu.addEventListener('keydown', rovingMoveFocus);
            menu.addEventListener('keydown', closeMenu);
            menu.addEventListener('keydown', keyboardActivation);
            menu.addEventListener('click', activateFunction);
            menuController.addEventListener('click', (e) => toggleMenu(menu));
            menuController.addEventListener('keydown', controllerKeyboardActivation);
        }
    }

    function controllerKeyboardActivation(e) {
        let acceptedKeys = ["ArrowRight", "Enter", " "];
        if (!acceptedKeys.includes(e.key)) return;
        let controller = e.currentTarget;
        let nextMenu = document.getElementById(controller.getAttribute('aria-controls'));
        if (nextMenu) {
            toggleMenu(nextMenu);
            e.preventDefault();
            e.stopPropagation();
        }
    }

    /**
     * Given a menu, for each menuitem this prepares that menuitem HTML Element's dataset
     * to include the id of the next/previous menuitem. 
     * @param {HTMLElement} menu [role="menu"] element
     */
    function initMenu(menu) {
        // only get menutitems part of the scope
        let menuitems = [...menu.querySelectorAll(':is([role="menuitem"], [data-opener])')];
        // iterate over all menuitems and add dataset.next and dataset.previous
        for (let i = 0; i < menuitems.length; i++) {
            let menuitem = menuitems[i];
            // if this opens a submenu
            if ('opener' in menuitem.dataset) {
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
     * Handles keyboard navigation of menus.
     * @param {KeyboardEvent} e event
     */
    function rovingMoveFocus(e) {
        // if not moving through the menu, return
        if (!['ArrowUp', 'ArrowDown', 'ArrowRight'].includes(e.key)) return;
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
        }
        e.preventDefault();
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

    /**
     * Handles keyboard closing of menus
     * @param {KeyboardEvent} e e.currentTarget
     */
    function closeMenu(e) {
        const acceptedKeys = ['Escape', 'ArrowLeft'];
        if (!acceptedKeys.includes(e.key)) return;
        toggleMenu(e.currentTarget);
        e.preventDefault();
    }

    /**
     * Handles keyboard activation of components
     * @param {KeyboardEvent} e event
     */
    function keyboardActivation(e) {
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
        if ('opener' in menuitem.dataset) return;
        if (menuitem.hasAttribute('role') && menuitem.getAttribute('role') === 'menuitem') {
            alert(`activated the menuitem: ${menuitem.textContent}`);
        }
        fullyCloseMenu(menuitem.closest('[role="menu"]'));
        e.preventDefault();
    }

    /**
     * Closes the menu and all parent menus.
     * @param {HTMLElement} menu [role="menu"] element
     */
    function fullyCloseMenu(menu) {
        while (menu) {
            toggleMenu(menu);
            // the controller of this menu will be outside of the menu
            let controller = getControllerFromMenu(menu);
            // if there is no ancestor menu, then the menu variable will be null
            // and the while loop will end
            menu = controller.closest('[role="menu"]');
        }
    }

    /**
     * Gets the element that controls this menu.
     * @param {HTMLElement} menu [role="menu"] element
     * @returns the element that controls the given menu
     */
    function getControllerFromMenu(menu) {
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
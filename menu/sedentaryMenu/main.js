(() => {
    const maxWidth = 500;

    sedentaryMain();

    function sedentaryMain() {
        let menuControllers = document.querySelectorAll('[data-opener]');
        for (let menuController of menuControllers) {
            let menu = getMenuFromController(menuController);
            if (menu.dataset.type !== 'sedentary') continue;
            initMenu(menu);
            menu.addEventListener('keydown', sedentaryMoveFocus);
            menu.addEventListener('keydown', closeMenu);
            menu.addEventListener('keydown', keyboardActivation);
            menu.addEventListener('click', pointerActivation);
            menuController.addEventListener('click', controllerActivation);
        }
    }

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
            if (isMenuitem(controller)) {
                // this section is only relevant when there are nested menus
                let ancestorMenu = controller.closest('[role="menu"]');
                ancestorMenu.focus();
            }
            else {
                // for a sedentary focus management style, the controller will only
                // be focused if it is not part of a menu.
                controller.focus();
            }
        }
        else {
            // if menu was opened

            // in sedentary focus management, focus remains on the menu element
            // and assistive technology is notified of the element in focus by 
            // updating the ARIA-ACTIVEDESCENDANT attribute.
            menu.focus();
            let menuitem;
            if ('resetFocus' in menu.dataset) {
                menuitem = menu.querySelector('[role="menuitem"]');
            }
            else {
                menuitem = document.getElementById(
                    menu.getAttribute('aria-activedescendant')
                );
            }
            setSedentaryFocus(menu, menuitem);
            positionMenu(menu);
        }
    }

    /**
     * Given a menu that uses sedentary focus management, set focus on the given
     * menuitem.
     * @param {HTMLElement[role="menu"]} menu 
     * @param {HTMLElement[role="menuitem"]} menuitem 
     */
    function setSedentaryFocus(menu, menuitem) {
        let previousMenuitem = document.getElementById(
            menu.getAttribute('aria-activedescendant')
        );
        menu.setAttribute('aria-activedescendant', menuitem.id);
        previousMenuitem.classList.remove('active');
        menuitem.classList.add('active');
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

    function controllerActivation(e) {
        //let acceptedKeys = ["ArrowRight", "Enter", " "];
        //if (e.type === 'keydown' && !acceptedKeys.includes(e.key)) return;
        let controller = e.currentTarget;
        let nextMenu = document.getElementById(controller.getAttribute('aria-controls'));
        if (nextMenu) {
            toggleMenu(nextMenu);
            e.preventDefault();
        }
    }

    /**
     * Prepares the HTML dataset to include next/previous
     * element.
     * @param {HTMLElement} menu [role="menu"] element
     */
    function initMenu(menu) {
        // only get menutitems part of the scope
        // filter out any menuitems not part of the current menu
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
     * Handles keyboard closing of menus
     * @param {KeyboardEvent} e e.currentTarget
     */
    function closeMenu(e) {
        if (e.key !== 'Escape' && e.key !== 'ArrowLeft') return;
        toggleMenu(e.currentTarget);
        e.preventDefault();
    }

    /**
     * Handles keyboard activation of components
     * @param {KeyboardEvent} e event
     */
    function keyboardActivation(e) {
        if (e.key !== 'Enter' && e.key !== ' ') return;
        let menu = e.currentTarget;
        let menuitem = document.getElementById(
            menu.getAttribute('aria-activedescendant')
        );
        e.preventDefault();
        activateFunction(menuitem);
    }

    function pointerActivation(e) {
        let menuitem = e.target;

        // we handle menuitems that open submenus separately
        if (!('opener' in menuitem.dataset)) activateFunction(menuitem);
        e.preventDefault();
    }

    /**
     * Pretends to activate the function of the menuitem
     * @param {Event} e e.target
     */
    function activateFunction(menuitem) {
        if ('opener' in menuitem.dataset) {
            menuitem.click();
            return;
        }
        if (isMenuitem(menuitem)) {
            alert(`activated the menuitem: ${menuitem.textContent}`);
        }
        fullyCloseMenu(menuitem.closest('[role="menu"]'));
    }

    /**
     * Closes the menu and all parent menus. Calls
     * the toggleMenu() function which handles focus.
     * @param {HTMLElement} menu [role="menu"] element
     */
    function fullyCloseMenu(menu) {
        while (menu) {
            toggleMenu(menu);
            let controller = getControllerFromMenu(menu);
            menu = controller.closest('[role="menu"]');
        }
    }

    /**
     * Gets the element that controls this menu
     * @param {HTMLElement} menu [role="menu"] element
     * @returns the element that controls the given menu
     */
    function getControllerFromMenu(menu) {
        return document.getElementById(menu.getAttribute('aria-labelledby'));
    }

    function getMenuFromController(controller) {
        return document.getElementById(controller.getAttribute('aria-controls'));
    }



    /**
     * 
     * @param {Event} e 
     * @returns 
     */
    function sedentaryMoveFocus(e) {
        // if not moving through the menu, return
        let menu = e.currentTarget;
        let menuitem = document.getElementById(menu.getAttribute('aria-activedescendant'));
        if (!['ArrowUp', 'ArrowDown', 'ArrowRight'].includes(e.key)) return;
        if (e.key === 'ArrowRight' && !menuitem.matches('[data-opener]')) return;

        // get the next menu item to be focused
        let nextMenuitem, nextMenu;
        if (e.key === 'ArrowUp') {
            nextMenuitem = document.getElementById(menuitem.dataset.previous);
        }
        else if (e.key === 'ArrowDown') {
            nextMenuitem = document.getElementById(menuitem.dataset.next);
        }
        else {
            // ArrowRight
            // open the associated menu if it exists
            nextMenu = document.getElementById(
                menuitem.getAttribute('aria-controls')
            );
            toggleMenu(nextMenu);
            nextMenuitem = document.getElementById(
                nextMenu.getAttribute('aria-activedescendant')
            );
        }
        nextMenu ||= menu;
        // set focus
        // note that "aria-activedescendant" effectively sets the focus for
        // assistive technology, even though the browser's focus remains on the
        // [role="menu"] element
        setSedentaryFocus(nextMenu, nextMenuitem);
        e.preventDefault();
    }

    /**
     * Checks if an element is a menuitem.
     * @param {HTMLElement} element the html element to check
     * @returns Boolean
     */
    function isMenuitem(element) {
        return element.hasAttribute('role') && element.getAttribute('role') === 'menuitem';
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
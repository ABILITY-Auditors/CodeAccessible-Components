(() => {
    const maxWidth = 500;

    rovingMain();

    /*** Section 1: functions used by both roving and sedentary focus management examples ***/
    
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
            controller.focus();
        }
        else {
            if (menu.dataset.type === 'roving') {
                openRovingMenu(menu);
            }
            else {
                openSedentaryMenu(menu);
            }
            positionMenu(controller);
        }
    }

    /**
     * Reposition a menu. Should be called after opening the menu or when the 
     * viewport size is changed to ensure that WACG SC 1.4.10 Reflow is satisfied.
     * @param {HTMLElement} controller the component that opens a menu, 
     *                                 "controls" the presence of the menu
     * @returns null
     */
    function positionMenu(controller) {
        let ancestor = controller.closest('[data-menu-component]');
        if (!ancestor) {
            console.warn("can't position submenu, ancestor not found!");
            return;
        }
        // get menu element
        let menu = document.getElementById(
            controller.getAttribute('aria-controls')
        );
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
        // viewport width minus body margin
        let vw = document.body.clientWidth + 2 * getPropertyAsNumber(document.body, 'margin');
        // get the padding of the tooltip

        let paddingLeft = getPropertyAsNumber(menu, 'padding-left');
        let borderWidth = getPropertyAsNumber(menu, 'border-right-width');
        // TODO: handle small viewport/out of viewport
        let ancestorRect = ancestor.getBoundingClientRect();
        let controllerRect = controller.getBoundingClientRect();

        /*
        // basic
        let x, y;
        let opensBottom = 
            'openDirection' in menu.dataset && menu.dataset.openDirection === 'bottom';
        let controllerLargerThanViewportWidth = controllerRect.width + borderWidth * 2 >= vw;
        if (opensBottom || controllerLargerThanViewportWidth) {
            x = -1 * borderWidth;
            y = controllerRect.y - ancestorRect.y + controllerRect.height;
        }
        else {
            y = controllerRect.y - ancestorRect.y;
            x = controllerRect.x - ancestorRect.x + controllerRect.width;
        }
        
        menu.style.top = y + 'px';
        menu.style.left = x + 'px';
        // get new rect
        menuRect = menu.getBoundingClientRect();
        // check if width larger than vw
        if (menuRect.width >= vw) {
            let widthOffset = (vw - (2 * paddingLeft));
            let leftOffset = (-1 * controllerRect.x) + paddingLeft;
            menu.style.width = widthOffset + 'px';
            menu.style.left = leftOffset + 'px';
            let offset = 1;
            while (menu.offsetWidth >= vw) {
                menu.style.width = (-1 * offset + widthOffset) + 'px';
            }
            // in the style sheet we've set the "white-space" CSS property
            // to nowrap, but when the text is longer than the width of the
            // viewport, we need to wrap the text
            menu.style.whiteSpace = 'normal';
        }
        // if it starts off screen to the left
        else if (menuRect.x < 0) {
            let offset = (controllerRect.x) + paddingLeft;
            menu.style.left = offset + 'px';
        }
        // if it is off screen to the right
        else if ((menuRect.x + menuRect.width) > vw) {
            let offset = (-1 * (controllerRect.x - menuRect.width - paddingLeft - borderWidth * 4));
            menu.style.left = offset + 'px';
        }*/
    }

    /*** End Section 1 ***/

    function rovingMain() {
        // components that open a menu have been given the attribute 'data-opener'
        let menuControllers = document.querySelectorAll('[data-opener]');
        for (let menuController of menuControllers) {
            let controllerParent = menuController.parentElement;
            let menu = getMenuFromController(menuController);
            // only setup roving focus example(s)
            if (menu.dataset.type !== 'roving') continue;
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
     * Prepares the HTML dataset to include next/previous
     * element.
     * @param {HTMLElement} menu [role="menu"] element
     */
    function initMenu(menu) {
        // only get menutitems part of the scope
        // filter out any menuitems not part of the current menu
        let menuitems =
            [...menu.querySelectorAll(':is([role="menuitem"], [data-opener])')]
                .filter(e => e.closest('[role="menu"]') === menu);
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
            case 'ArrowRight':
                break;
                if (!menuitem.matches('[data-opener]')) return;
                let nextMenu = document.getElementById(menuitem.getAttribute('aria-controls'));
                if (nextMenu) {
                    toggleMenu(nextMenu);
                    e.preventDefault();
                    e.stopPropagation();
                }
                break;
        }
        e.preventDefault();
    }

    

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

    function openSedentaryMenu(menu) {
        menu.focus();
        let currentMenuitem = document.getElementById(
            menu.getAttribute('aria-activedescendant')
        );
        if ('resetFocus' in menu.dataset) {
            currentMenuitem.classList.toggle('active');
            currentMenuitem = menu.querySelector('[role="menuitem"]');
            menu.setAttribute('aria-activedescendant', currentMenuitem.id);
        }
        currentMenuitem.classList.toggle('active');
    }

    /**
     * Handles keyboard closing of menus
     * @param {KeyboardEvent} e e.currentTarget
     */
    function closeMenu(e) {
        if (e.key !== 'Escape' && e.key !== 'ArrowLeft') return;
        toggleMenu(e.currentTarget);
        e.preventDefault();
        e.stopPropagation();
    }

    /**
     * Handles keyboard activation of components
     * @param {KeyboardEvent} e event
     */
    function keyboardActivation(e) {
        if (e.key !== 'Enter' && e.key !== ' ') return;
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

        e.preventDefault();
        e.stopPropagation();

        fullyCloseMenu(menuitem.closest('[role="menu"]'));
    }

    /**
     * Closes the menu and all parent menus.
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



    function sedentaryMoveFocus(e) {
        // if not moving through the menu, return
        let menu = e.currentTarget;
        let menuitem = document.getElementById(menu.getAttribute('aria-activedescendant'));
        if (!['ArrowUp', 'ArrowDown', 'ArrowRight'].includes(e.key)) return;
        if (e.key === 'ArrowRight' && !menuitem.matches('[data-opener]')) return;

        let nextMenuitem, nextMenu;
        if (e.key === 'ArrowUp') {
            nextMenuitem = document.getElementById(menuitem.dataset.previous);
        }
        else if (e.key === 'ArrowDown') {
            nextMenuitem = document.getElementById(menuitem.dataset.next);
        }
        else {
            // ArrowRight
            nextMenu = document.getElementById(menuitem.getAttribute('aria-controls'));
            toggleMenu(nextMenu);
            nextMenuitem = document.getElementById(nextMenu.getAttribute('aria-activedescendant'));
        }
        nextMenu ||= menu;
        menuitem.classList.toggle('active');
        nextMenuitem.classList.toggle('active');
        // set focus
        // note that "aria-activedescendant" effectively sets the focus for
        // assistive technology, even though the browser's focus remains on the
        // [role="menu"] element
        nextMenu.setAttribute('aria-activedescendant', nextMenuitem.id);
        nextMenu.focus();
        e.preventDefault();
        e.stopPropagation();
    }

    function sedentaryMain() {
        let menuControllers = document.querySelectorAll('[data-opener]');
        for (let menuController of menuControllers) {
            let menu = getMenuFromController(menuController);
            if (menu.dataset.type !== 'sedentary') continue;
            initMenu(menu);
            menu.addEventListener('keydown', sedentaryMoveFocus);
            menu.addEventListener('keydown', closeMenu);
            menu.addEventListener('keydown', keyboardActivation);
            menu.addEventListener('click', activateFunction);
            menuController.addEventListener('click', (e) => toggleMenu(menu));
        }
    }

    sedentaryMain();

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
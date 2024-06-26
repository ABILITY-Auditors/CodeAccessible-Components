/***** SEDENTARY FOCUS MANAGEMENT *****/
// Encapsulation
(() => {
    sedentaryMain();

    function sedentaryMain() {
        // only want sedentary menu widgets
        let menuWidgets = document.querySelectorAll('[data-menu-widget="sedentary"]');
        for (let menuWidget of menuWidgets) {
            menuWidget.addEventListener('focusout', closeAllMenus);

            window.addEventListener('resize', (e) => {
                let menus = menuWidget.querySelectorAll('[role="menu"]:not([hidden])');
                for(let menu of menus) {
                    positionMenu(menu);
                }
            });

            let menuControllers = menuWidget.querySelectorAll('[data-controller]');
            for (let menuController of menuControllers) {
                let menu = getControlledMenu(menuController);
                initMenu(menu);
                menu.addEventListener('keydown', sedentaryKeyEventRouter);
                menu.addEventListener('click', pointerActivation);
                menuController.addEventListener('click', controllerActivation);
            }
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
        let menuitems = [...menu.querySelectorAll(
            ':is([role="menuitem"], [data-controller])'
        )];
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
     * Takes keyboard events and handles focus. 
     * @param {KeyboardEvent} e the keyboard event
     */
    function sedentaryKeyEventRouter(e) {
        // if not moving through the menu, return
        let menu = e.currentTarget;
        let menuitem = document.getElementById(
            menu.getAttribute('aria-activedescendant')
        );
        // we can't use a regex in switch without getting nifty, so
        // we set a-z or A-Z as "Letter" and use that in the switch statement
        let key = e.key.match(/^[a-zA-Z]$/) ? 'Letter' : e.key;

        if (e.key === 'ArrowRight' && !menuitem.matches('[data-controller]')) return;

        let nextMenuitem;
        switch (key) {
            case 'Letter':
                nextMenuitem = matchMenuitemFromLetter(menu, menuitem, e.key);
                if (!nextMenuitem) return;
            case 'ArrowUp':
                nextMenuitem ||= document.getElementById(menuitem.dataset.previous);
            case 'ArrowDown':
                nextMenuitem ||= document.getElementById(menuitem.dataset.next);
            case 'Home':
                nextMenuitem ||= menu.querySelector('[role="menuitem"]');
            case 'End':
                nextMenuitem ||= menu.querySelector('[role="menuitem"]:last-child');
                setSedentaryFocus(menu, nextMenuitem);
                e.preventDefault();
                break;
            case 'ArrowRight':
                let nextMenu = document.getElementById(
                    menuitem.getAttribute('aria-controls')
                );
                toggleMenu(nextMenu);
                nextMenuitem = document.getElementById(
                    nextMenu.getAttribute('aria-activedescendant')
                );
                setSedentaryFocus(nextMenu, nextMenuitem);
                e.preventDefault();
                break;
            case 'ArrowLeft':
            case 'Escape':
                toggleMenu(e.currentTarget);
                e.preventDefault();
                break;
            case 'Enter':
            case ' ':
                activateFunction(menuitem);
                e.preventDefault();
                break;
            case 'Tab':
                if (e.getModifierState('Shift')) {
                    let controller = getControllerOfMenu(menu);
                    controller.click();
                    e.preventDefault();
                }
                break;
            case 'F6':
                // Browsers let users cycle between panels using F6
                // In Chrome, when the user cycles back onto the viewport panel
                // focus is placed back onto the element that had focus before 
                // cycling between panels. Without this code, the menu will still
                // collapse, but Chrome tries to return focus to an element that is
                // hidden. With this code, we prepare and place focus on the menu 
                // controller. This does not affect Firefox, as Firefox returns focus
                // to the beginning of the viewport document.
                let widget = menu.closest('[data-menu-widget]');
                let firstLevelMenu = widget.querySelector('[role="menu"]');
                let controller = getControllerOfMenu(firstLevelMenu);
                toggleMenu(firstLevelMenu, false);
                controller.focus();
                // we do not preventDefault, default behavior is to move focus between
                // panels in the browser.
                break;
        }
    }

    /**
     * Matches the next menuitem in the current menu based on the menuitems 
     * first letter and the given letter.
     * @param {HTMLElement<role=menu>} menu the currently opened menu
     * @param {HTMLElement<role=menuitem>} menuitem the currently focused menuitem
     * @param {String} letter the character to match
     * @returns HTMLElement<role=menuitem> if a match is found. null if no match is found.
     */
    function matchMenuitemFromLetter(menu, menuitem, letter) {
        let menuitems = [...menu.querySelectorAll('[role="menuitem"]')];
        let i = menuitems.indexOf(menuitem);
        // gets the next menuitem, wraps around from last back to first
        const next = () => {
            i = (i + 1) % menuitems.length;
            return menuitems[i];
        }
        let curMenuitem;
        let foundMenuitem;
        while ((curMenuitem = next()) !== menuitem) {
            let firstLetter = curMenuitem.textContent.trim().charAt(0);
            if (letter.toLowerCase() === firstLetter.toLowerCase()) {
                foundMenuitem = curMenuitem;
                break;
            }
        }
        return foundMenuitem;
    }

    /**
     * Handles clicks.
     * @param {Event} e click event
     */
    function pointerActivation(e) {
        let menuitem = e.target;
        if (!isMenuitem(menuitem)) {
            e.preventDefault();
            e.stopPropagation();
            return;
        }

        // we handle menuitems that open submenus separately
        if (!('controller' in menuitem.dataset)) activateFunction(menuitem);
        e.preventDefault();
    }

    /**
     * Handles users clicking on a menu controller.
     * @param {Event} e event
     */
    function controllerActivation(e) {
        let controller = e.currentTarget;
        let menu = controller.closest('[role="menu"]');

        if (menu) setSedentaryFocus(menu, controller);
        let nextMenu = document.getElementById(controller.getAttribute('aria-controls'));
        if (nextMenu) {
            toggleMenu(nextMenu);
            e.preventDefault();
        }
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
        if (widget.contains(focusTarget) || menu.hidden) return;
        toggleMenu(menu, false);
    }

    /**
     * Opens or closes a menu.
     * @param {HTMLElement} menu [role="menu"] element
     */
    function toggleMenu(menu, handleFocus = true) {
        let controller = getControllerOfMenu(menu);
        // close submenus
        let openedControllers = menu.querySelectorAll(
            '[data-controller][aria-expanded="true"]'
        );
        for (let controller of openedControllers) {
            let submenu = getControlledMenu(controller);
            toggleMenu(submenu, false);
        }

        // set controller's state
        controller.setAttribute('aria-expanded', menu.hidden);

        if (!menu.hidden) {
            if (isMenuitem(controller)) {
                // this section is only relevant when there are nested menus
                let ancestorMenu = controller.closest('[role="menu"]');
                if (handleFocus) ancestorMenu.focus();
            }
            else {
                // for a sedentary focus management style, the controller will only
                // be focused if it is not part of a menu.
                if (handleFocus) controller.focus();
            }
            menu.hidden = !menu.hidden;

        }
        else {
            // this happens if menu was opened

            // in sedentary focus management, focus remains on the menu element
            // and assistive technology is notified of the element in focus by 
            // updating the ARIA-ACTIVEDESCENDANT attribute.
            menu.hidden = !menu.hidden;
            if (handleFocus) menu.focus();
            let menuitem;
            if ('resetFocus' in menu.dataset) {
                menuitem = menu.querySelector('[role="menuitem"]');
            }
            else {
                menuitem = document.getElementById(
                    menu.getAttribute('aria-activedescendant')
                );
            }
            // we position the menu BEFORE we scroll into view,
            // otherwise the positionMenu() function won't work properly
            positionMenu(menu);
            setSedentaryFocus(menu, menuitem);
        }
    }

    /**
     * Set programmatic focus within a role=menu using ARIA-ACTIVEDESCENDANT. 
     * Note this does not set the actual focus the same way that .focus() does.
     * @param {HTMLElement[role="menu"]} menu the current menu
     * @param {HTMLElement[role="menuitem"]} menuitem the menuitem to focus
     */
    function setSedentaryFocus(menu, menuitem) {
        let previousMenuitem = document.getElementById(
            menu.getAttribute('aria-activedescendant')
        );
        // setting the programmatic focus
        menu.setAttribute('aria-activedescendant', menuitem.id);
        // changing the visual focus indicator
        previousMenuitem.classList.remove('active');
        menuitem.classList.add('active');
        // we only need to scroll the menuitem into view for sedentary focus
        // management. Roving focus management will always scroll the menuitem
        // in focus because browsers automatically scroll an item receiving focus
        // into view.
        menuitem.scrollIntoView({ block: 'nearest' });
    }

    /**
     * Reposition a menu. Should be called after opening the menu or when the 
     * viewport size is changed to ensure that WACG SC 1.4.10 Reflow is satisfied.
     * @param {HTMLElement} menu the menu being repositioned
     */
    function positionMenu(menu) {
        let controller = getControllerOfMenu(menu);
        let widget = controller.closest('[data-menu-widget]').querySelector('[data-controller]');
        let controllersMenu = controller.closest('[role="menu"]') || widget;
        if (!widget) {
            console.warn("can't position submenu, widget not found!");
            return;
        }
        // reset the styling
        menu.style.removeProperty('width');
        menu.style.removeProperty('left');
        menu.style.removeProperty('white-space');
        // get menu dimensions
        let menuRect = menu.getBoundingClientRect();
        let widgetRect = widget.getBoundingClientRect();
        let menuControllerRect = controllersMenu.getBoundingClientRect();
        let controllersMenuRect = controllersMenu.getBoundingClientRect();
        let controllerRect = controller.getBoundingClientRect();

        
        // this positions the new menu directly below the controlling menuitem/button
        let zeroY = controllerRect.y - widgetRect.y + controllerRect.height;
        menu.style.top = zeroY + 2 + 'px';
        
        // set the width of submenus equal to parent
        if (menuRect.width < menuControllerRect.width) {
            menu.style.width = menuControllerRect.width + 'px';
        }
        // we may have changed to size, so we want to updated the rect
        // so that we can ensure that it is fully within the viewport
        // and does not cause horizontal scrolling (this is important for
        // 1.4.10 Reflow)
        menuRect = menu.getBoundingClientRect();
        // this assumes that the documentElement is the HTML element
        // clientWidth will include everything but the vertical scrollbar
        // when used on the html element
        let vw = document.documentElement.clientWidth;
        if (menuRect.width > vw || menuRect.x + menuRect.width > vw) {
            let widthOffset, leftOffset;
            if (isMenuitem(controller)) {
                widthOffset = controllersMenuRect.width;
                leftOffset = -1 * Math.abs(controllersMenuRect.x - widgetRect.x);
            }
            else {
                let twoPercentVW = (2 * (vw / 100));
                widthOffset = vw - 2 * twoPercentVW;
                leftOffset = twoPercentVW - controllersMenuRect.x;
            }
            
            menu.style.width = widthOffset + 'px';
            menu.style.left = leftOffset + 'px';
            // in the style sheet we've set the "white-space" CSS property
            // to nowrap, but when the text is longer than the width of the
            // viewport, we need to wrap the text
            menu.style.whiteSpace = 'normal';
        }
    }

    /**
     * Pretends to activate the function of the menuitem
     * @param {Event} e e.target
     */
    function activateFunction(menuitem) {
        if ('controller' in menuitem.dataset) {
            // clicking a menu controller toggles the associated menu
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
     * the toggleMenu() function. To prevent focusout event from occuring,
     * we do not want toggleMenu to handle focus.
     * @param {HTMLElement} menu [role="menu"] element
     */
    function fullyCloseMenu(menu) {
        let widget = menu.closest('[data-menu-widget]');
        // find root menu
        let rootMenu = widget.querySelector('[role="menu"]');
        toggleMenu(rootMenu, false);
        getControllerOfMenu(rootMenu).focus();
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
    function getControlledMenu(controller) {
        return document.getElementById(controller.getAttribute('aria-controls'));
    }

    /**
     * Checks if an element is a menuitem.
     * @param {HTMLElement} element the html element to check
     * @returns Boolean
     */
    function isMenuitem(element) {
        return element.hasAttribute('role') && element.getAttribute('role') === 'menuitem';
    }
})();

/***** ROVING FOCUS MANAGEMENT *****/
// Encapsulation
(() => {
    rovingMain();

    function rovingMain() {
        // only want roving menu widgets
        let menuWidgets = document.querySelectorAll('[data-menu-widget="roving"]');
        for (let menuWidget of menuWidgets) {
            // since we use focusout, we need to add tabindex=-1 to the
            // menuitems to ensure that when they are clicked they can 
            // receive focus, and the focusout event will populate the
            // event.relatedTarget value with the clicked menuitem. We
            // add tabindex=-1 in the HTML, but it can be added with js.
            // We use event.relatedTarget to ensure that when a focusout
            // event occurs, it only closes all menus if the relatedTarget
            // (e.g. element to be focused) is not inside the menu
            menuWidget.addEventListener('focusout', closeAllMenus);

            // resize and position all open menus within the menu widget
            window.addEventListener('resize', (e) => {
                let menus = menuWidget.querySelectorAll('[role="menu"]:not([hidden])');
                for(let menu of menus) {
                    positionMenu(menu);
                }
            });

            let menuControllers = menuWidget.querySelectorAll('[data-controller]');
            for (let menuController of menuControllers) {
                let menu = getControlledMenu(menuController);
                initMenu(menu);
                menu.addEventListener('keydown', rovingKeyEventRouter);
                menu.addEventListener('click', activateFunction);
                menuController.addEventListener('click', controllerActivation);
            }
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
     * Handles keyboard events.
     * @param {KeydownEvent} e event
     */
    function rovingKeyEventRouter(e) {
        let menuitem = e.target;
        let menu = e.currentTarget;
        let nextMenuitem;
        // we can't use a regex in switch without getting nifty, so
        // we set a-z or A-Z as "Letter" and use that in the switch statement
        let key = e.key.match(/^[a-zA-Z]$/) ? 'Letter' : e.key;

        switch (key) {
            case 'Letter':
                nextMenuitem = matchMenuitemFromLetter(menu, menuitem, e.key);
                if (!nextMenuitem) return;
            case 'ArrowUp':
                nextMenuitem ||= document.getElementById(menuitem.dataset.previous);
            case 'ArrowDown':
                nextMenuitem ||= document.getElementById(menuitem.dataset.next);
            case 'Home':
                nextMenuitem ||= menu.querySelector('[role="menuitem"]');
            case 'End':
                nextMenuitem ||= menu.querySelector('[role="menuitem"]:last-child');
                // change focus
                menuitem.tabIndex = -1;
                nextMenuitem.tabIndex = 0;
                nextMenuitem.focus();
                e.preventDefault();
                break;
            case 'ArrowRight':
                if (!('controller' in menuitem.dataset)) return;
                nextMenu = document.getElementById(
                    menuitem.getAttribute('aria-controls')
                );
                toggleMenu(nextMenu);
                break;
            case 'ArrowLeft':
            case 'Escape':
                toggleMenu(e.currentTarget);
                e.preventDefault();
                break;
            case 'Tab':
                if (e.getModifierState('Shift')) {
                    toggleMenu(menu);
                    e.preventDefault();
                }
                break;
            case 'Enter':
            case ' ':
                if ('controller' in menuitem.dataset) menuitem.click();
                else activateFunction(e);
                break;
            case 'F6':
                // Browsers let users cycle between panels using F6
                // In Chrome, when the user cycles back onto the viewport panel
                // focus is placed back onto the element that had focus before 
                // cycling between panels. Without this code, the menu will still
                // collapse, but Chrome tries to return focus to an element that is
                // hidden. With this code, we prepare and place focus on the menu 
                // controller. This does not affect Firefox, as Firefox returns focus
                // to the beginning of the viewport document.
                let widget = menu.closest('[data-menu-widget]');
                let firstLevelMenu = widget.querySelector('[role="menu"]');
                let controller = getControllerOfMenu(firstLevelMenu);
                toggleMenu(firstLevelMenu, false);
                controller.focus();
                // we do not preventDefault, default behavior is to move focus between
                // panels in the browser.
                break;
        }
    }

    /**
     * Matches the next menuitem in the current menu based on the menuitems 
     * first letter and the given letter.
     * @param {HTMLElement<role=menu>} menu the currently opened menu
     * @param {HTMLElement<role=menuitem>} menuitem the currently focused menuitem
     * @param {String} letter the character to match
     * @returns HTMLElement<role=menuitem> if a match is found. null if no match is found.
     */
    function matchMenuitemFromLetter(menu, menuitem, letter) {
        let menuitems = [...menu.querySelectorAll('[role="menuitem"]')];
        let i = menuitems.indexOf(menuitem);
        const next = () => {
            i = (i + 1) % menuitems.length;
            return menuitems[i];
        }
        let curMenuitem;
        let foundMenuitem;
        while ((curMenuitem = next()) !== menuitem) {
            let firstLetter = curMenuitem.textContent.trim().charAt(0);
            if (letter.toLowerCase() === firstLetter.toLowerCase()) {
                foundMenuitem = curMenuitem;
                break;
            }
        }
        return foundMenuitem;
    }

    /**
     * Pretends to activate the function of the menuitem
     * @param {Event} e e.target
     */
    function activateFunction(e) {
        let menuitem = e.target;
        if ('controller' in menuitem.dataset ) {
            return;
        }
        else if (e.target.role === 'menu') {
            e.preventDefault();
            e.stopPropagation();
            return;
        }
        alert(`activated the menuitem: ${menuitem.textContent}`);
        // gets the highest level menu
        let menu = menuitem.closest('[data-menu-widget]').querySelector('[role="menu"]');
        toggleMenu(menu);
        e.preventDefault();
    }

    /**
     * Handles ArrowRight, Enter, and Space keys, and clicks.
     * @param {Event} e keydown or click event
     */
    function controllerActivation(e) {
        let controller = e.currentTarget;
        let menu = getControlledMenu(controller);
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
        
        if (widget.contains(focusTarget) || menu.hidden) return;
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
                let submenu = getControlledMenu(openSubController);
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
     * @param {HTMLElement} menu the menu being repositioned
     */
    function positionMenu(menu) {
        let controller = getControllerOfMenu(menu);
        let widget = controller.closest('[data-menu-widget]').querySelector('[data-controller]');
        let controllersMenu = controller.closest('[role="menu"]') || widget;
        if (!widget) {
            console.warn("can't position submenu, widget not found!");
            return;
        }
        // reset the styling
        menu.style.removeProperty('width');
        menu.style.removeProperty('left');
        menu.style.removeProperty('white-space');
        // get menu dimensions
        let menuRect = menu.getBoundingClientRect();
        let widgetRect = widget.getBoundingClientRect();
        let menuControllerRect = controllersMenu.getBoundingClientRect();
        let controllersMenuRect = controllersMenu.getBoundingClientRect();
        let controllerRect = controller.getBoundingClientRect();

        
        // this positions the new menu directly below the controlling menuitem/button
        let zeroY = controllerRect.y - widgetRect.y + controllerRect.height;
        menu.style.top = zeroY + 2 + 'px';
        
        // set the width of submenus equal to parent
        if (menuRect.width < menuControllerRect.width) {
            menu.style.width = menuControllerRect.width + 'px';
        }
        // we may have changed to size, so we want to updated the rect
        // so that we can ensure that it is fully within the viewport
        // and does not cause horizontal scrolling (this is important for
        // 1.4.10 Reflow)
        menuRect = menu.getBoundingClientRect();
        // this assumes that the documentElement is the HTML element
        // clientWidth will include everything but the vertical scrollbar
        // when used on the html element
        let vw = document.documentElement.clientWidth;
        if (menuRect.width > vw || menuRect.x + menuRect.width > vw) {
            let widthOffset, leftOffset;
            if (isMenuitem(controller)) {
                // submenus
                widthOffset = controllersMenuRect.width;
                leftOffset = -1 * Math.abs(controllersMenuRect.x - widgetRect.x);
            }
            else {
                // first level menu
                let twoPercentVW = (2 * (vw / 100));
                widthOffset = vw - 2 * twoPercentVW;
                leftOffset = twoPercentVW - controllersMenuRect.x;
            }
            menu.style.width = widthOffset + 'px';
            menu.style.left = leftOffset + 'px';
            // in the style sheet we've set the "white-space" CSS property
            // to nowrap, but when the text is longer than the width of the
            // viewport, we need to wrap the text
            menu.style.whiteSpace = 'normal';
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
    function getControlledMenu(controller) {
        return document.getElementById(controller.getAttribute('aria-controls'));
    }

    /**
     * Checks if an element is a menuitem.
     * @param {HTMLElement} element the html element to check
     * @returns Boolean
     */
    function isMenuitem(element) {
        return element.hasAttribute('role') && element.getAttribute('role') === 'menuitem';
    }
})();
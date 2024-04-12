
# ARIA Menu Widget

## Table of content:
 - [Focus Indicator](#focus-indicator)
 - [Complexity](#complexity)
 - [Focus Management](#focus-management)
 - [Focus Indicator](#focus-indicator)
 - [Reflow](#reflow)
 - [Obscuring Content](#obscuring-content)
 - [Nested Menus](#nested-menus)
 - [Alternate Menuitem Roles](#alternate-menuitems)

## <a id="focus-indicator">Focus Indicator</a>

1. **Concern:** Users must be able to identify when a menu widget’s menuitem is in focus. 

2. **Mitigation:** Focus indicators must have a 3:1 color contrast against adjacent colors and/or the unfocused state to ensure users can identify the menuitem in focus.


## <a id="complexity">Complexity</a>

1. **Concern:** Menu widgets can be rather complex and authors are expected to handle keyboard interactions. If the widget is improperly constructed this can easily create a blocker for assistive technology users.

2. **Mitigation:** We recommend using a more basic interactive pattern, such as a disclosure widget containing a list of interactive elements, if possible. Typically, a menu role is used when the content is similar to a menu in a desktop application; such as a file menu (save, load, print, exit, etc), or a text editor’s menu of text properties that can be changed (bold, italics, underline, indent, etc).


## <a id="focus-management">Focus Management</a>

1. **Concern:** Menu roles expect authors (web developers) to manage focus. Screen readers typically capture most keystrokes (some exceptions include Tab and Shift+Tab) and do not relay these keystrokes to the browser. However, when an element with a complex widget role such as MENU is focused, screen readers will no longer capture most keystrokes as it expects authors to handle certain keyboard interactions. For example, an element with a MENU role expects users to navigate between descendant menuitems using arrow keys. However screen readers often capture arrow key presses which are used to move the [**virtual cursor (read more here)**](https://support.microsoft.com/en-us/office/use-microsoft-teams-with-the-jaws-virtual-cursor-79a8b669-c95b-4a6c-a2fa-c3d6dbb1b9c3#bkmk_whatwhy) in the DOM and read its contents to the user. So when a screen reader encounters an element with a role of MENU it will no longer capture the arrow keys and assumes the content author (web developer) has implemented a way to manage focus using these arrow keys. If arrow keys are not used to manage focus, this may cause confusion for screen reader users. More experienced users are likely to assume that they can move focus using arrow keys and find it frustrating if they can’t. For inexperienced users, they may not realize that they are not able to use their virtual cursor while interacting with a MENU, and when there is no response to arrow key presses they may think that the web application is broken or they have encountered a bug.

2. **Mitigation:** Ensure that the menu manages focus. We recommend ensuring that arrow keys can be used to move focus as this is the expected behavior. Focus should either be managed using a 1) Sedentary Focus Management style, or a 2) Roving Focus Management style. To ensure that screen readers act appropriately, DOM focus should either 1) (Sedentary Focus Management) remain on a role=menu element and use the ARIA-ACTIVEDESCENDANT attribute to indicate the descendant menuitem that is in focus or 2) (Roving Focus Management) be placed on a role=menuitem element that is in focus.


## <a id="reflow">Reflow</a>

1. **Concern:** Menu widgets may be position absolution using CSS. When this happens there is a chance that, when setting the viewport to 320 CSS pixels width by 256 CSS pixels height, the menu is either cut off screen or causes the screen to scroll in more than one direction.

2. **Mitigation:** Ensure that menu widgets are repositioned and are reformatted when the viewport shrinks. In this example we use the positionMenu() function to ensure that the menu is never off screen, and as a result should always be visible and never cause the viewport to scroll horizontally and vertically at the same time.


## <a id="obscuring-content">Obscuring Content</a>

1. **Concern:** Menu widgets may be position absolution using CSS. When this happens there is a chance that the menu obscures other content on the page. If users move focus away from the menu, and it remains open, keyboard users may miss or have a difficult time using this obscured content.

2. **Mitigation:** We recommend collapsing the menu widget when focus is moved away from it. In our example 1) we collapse the entire menu when focus is moved forward and outside the menu, and 2) we collapse submenus when focus is moved backwards onto an ancestor menu.


## <a id="nested-menus">Nested Menus</a>

1. **Concern:** The ARIA specification is a bit ambiguous regarding whether it allows menus nested in other menus (in the DOM). While we have not encountered an issue with implementations that have nested menus, we do not recommend nesting menus inside other menus as we interpret the specification as disallowing nested menus; User Agents (browsers, screen readers) may not support nested menus in the future.

2. **Mitigation:** Ensure that elements with a role of MENU do not have a descendant element with the same role.


## <a id="alternate-menuitems">Alternate Menuitem Roles: Menuitemradio and Menuitemcheckbox</a>

1. **Concern:** This demonstration does not include a demonstration of the menuitemradio and menuitemcheckbox roles. These roles are effectively radio buttons and checkboxes, but those roles are not allowed in a menu.

2. **Mitigation:** Ensure that these alternate roles are properly constructed: 1) Both menuitemradio and menuitemcheckbox require the ARIA-CHECKED attribute to ensure that their state is available to AT. 2) Menuitemradio elements that are related should be grouped together inside an element with ROLE=GROUP that has an accessible name.
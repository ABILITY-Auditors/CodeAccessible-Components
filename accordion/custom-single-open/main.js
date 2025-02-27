(() => {
    // find all accordion groups
    let accordionGroup = document.getElementById('cso-accordion-group');
    // find all accordion controllers in the example group
    let accordionControllers = accordionGroup.querySelectorAll(".accordion-controller")
    // add event listener to each controller
    for (const controller of accordionControllers) {
        controller.addEventListener('click', switchAccordion)
    }

    function switchAccordion(event) {
        // the accordion controller that was activated
        let accordionController = event.currentTarget;
        let accordionGroup = accordionController.closest('cso-accordion-group');
        let wasOpen = accordionController.getAttribute('aria-expanded') === 'true';
        // all controllers
        let accordionControllers = accordionGroup.querySelectorAll(".accordion-controller");

        // we collapse all accordions
        for (let controller of accordionControllers) {
            controller.setAttribute('aria-expanded', 'false');
        }
        // we toggle the expanded state of the activated controller
        accordionController.setAttribute('aria-expanded', !wasOpen);
        // CSS is used to hide/show the associated content
        // If the content is only visually hidden while collapsed (e.g.
        // opacity is set to 0, or height is set to 0, typically done
        // to ensure an animation works properly) then the content will
        // need to be hidden using ARIA-HIDDEN attribute and any focusable
        // elements will need to be removed from focus order (can be done
        // by adding TABINDEX=-1)
    }
})();

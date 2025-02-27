// find all accordion groups
let accordionGroup = document.getElementById('cmo-accordion-group');
// find all accordion controllers in the example group
let accordionControllers = accordionGroup.querySelectorAll(".accordion-controller")
// add event listener to each controller
for(const controller of accordionControllers) {
    controller.addEventListener('click', switchAccordion)
}

function switchAccordion(event) {
    // the accordion controller that was activated
    let accordionController = event.currentTarget;
    let wasOpen = accordionController.getAttribute('aria-expanded') === 'true';
    
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
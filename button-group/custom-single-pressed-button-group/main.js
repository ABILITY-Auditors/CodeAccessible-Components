(() => {
    main();

    function main() {
        let context = document.getElementById('csp-button-group');
        // we get all data-btn-group widget/components
        let buttons = context.querySelectorAll('button');
        for (let button of buttons) {
            button.addEventListener('click', togglePressed);
        }
    }

    function togglePressed(e) {
        let button = e.currentTarget;
        let buttons = 
            e.currentTarget
             .closest('[role="group"]')
             .querySelectorAll('button');
        // remove any other buttons pressed state
        for (let otherButton of buttons) {
            otherButton.setAttribute('aria-pressed', 'false');
        }
        // set the current button pressed state to true
        button.setAttribute('aria-pressed', 'true');
    }
})();

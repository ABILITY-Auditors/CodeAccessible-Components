# Keyboard Navigation:
Accordion controller should be focusable and operable using a keyboard only.
# Focus Management:
Focus should remain on the accordion controller. Moving focus may be considered a 3.2.2 On Input SC failure.
# Accordion Names
Accordion controllers should have a name that describes their purpose. 
# ARIA Roles and Attributes:
ARIA-EXPANDED is necessary to indicate to AT users whether the associated content that is controlled by this accordion controller is currently available.
# Visual and Auditory Cues:
Provide clear visual cues (such as icons or text) to indicate the open or closed state of accordion sections.
# native HTML
The SUMMARY element must be the first descendant element of the DETAILS element - the SUMMARY element cannot be wrapped in another element. One typical disclosure widget pattern are FAQs where each question is a HEADING wrapping a BUTTON that controls the presence of the answer. This is not possible with a native HTML implementation, but is possible with custom ARIA.
# native HTML, NAME attribute and single-open
When multiple DETAILS elements are given the same NAME attribute (similar to INPUT of TYPE=RADIO) only one DETAILS can be open at a time. If a DETAILS is opened, all other DETAILS with the same NAME will close. This allows authors accomplish a single-open accordion pattern using only native HTML.
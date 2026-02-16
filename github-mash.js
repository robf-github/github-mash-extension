// ==UserScript==
// @name         GitHub Mash
// @version      0.0.2
// @description  Warns if the default GitHub Merge or Squash button is "wrong" based on where you are merging into
// @match https://github.com/*
// @license MIT
// @author robf-github
// @grant none
// ==/UserScript==

(function () {
    'use strict';

    console.log('GitMash loaded');

    const selector = '[data-testid="mergebox-partial"] [class*="prc-ButtonGroup-"] button';

    const observer = new MutationObserver((mutationList, observer) => {
        mutationList.forEach(mutation => {
            if (mutation.type === 'childList') {
                const target = document.querySelector(selector);
                if (target) {
                    observer.disconnect()
                    gitMash(selector);
                    observer.observe(document.body, { childList: true, subtree: true });
                    return;
                }
            }
        });
    });

    console.log('GitMash listening...');
    observer.observe(document.body, { childList: true, subtree: true });

    gitMash(selector);
})();

function gitMash(selector) {
    const isPullRequest = window.location.href.match('https:\/\/github.com\/.*?\/pull\/.*');

    if (!isPullRequest) {
        return;
    }
    const developBranch = 'develop';
    const featureBranchPrefix = 'feature/';

    const branchElements = document.querySelectorAll('[class*="prc-BranchName-"]');
    const baseBranch = branchElements[0]?.textContent;
    const headBranch = branchElements[1]?.textContent;

    if (!baseBranch || !headBranch) {
        return;
    }

    let mergeMethod;
    if (baseBranch === developBranch && headBranch.startsWith(featureBranchPrefix)) {
        mergeMethod = 'squash';
    } else {
        mergeMethod = 'merge';
    }

    let element = document.querySelector(selector);

    if (element) {
        showGitMash(element, mergeMethod);
    }
}

function showGitMash(element, mergeMethod) {
    const currentMethod = element.innerText.toLowerCase().trim();

    let mashMessageElement = document.querySelector('.mash-message');
    if (!mashMessageElement) {
        const mergeMessageElement = document.querySelector('[data-testid="mergebox-partial"] [class*="prc-ButtonGroup-"]')
            ?.parentElement?.parentElement;
        if (mergeMessageElement) {
            span = document.createElement('span');
            span.classList.add('mash-message');
            span.style.float = 'right';
            mergeMessageElement.prepend(span);
            mashMessageElement = span;
        }
    }

    let message;
    if ((mergeMethod == 'squash' && currentMethod == 'squash and merge') ||
        (mergeMethod == 'merge' && currentMethod == 'merge pull request')) {
        mashMessageElement.getAnimations().forEach(a => a.cancel());
        message = '\u{1f954} Mashed! \u{1f954}';
    } else {
        message = '\u{274C} Mismashed! \u{274C}';

        mashMessageElement.animate(
            [
                { opacity: 0 },
                { opacity: 1 },
                { opacity: 0 },
            ],
            {
                duration: 1000,
                iterations: Infinity
            }
        );
    }

    mashMessageElement.innerText = message;
}

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

    // Handle the SPA nature of github, listen for navigation changes and act on those.
    window.navigation.addEventListener("navigate", (event) => {
        if (event.navigationType === 'replace') {
            gitMash();
        }
    });
})();

let observer;

function gitMash() {
    if (observer) {
        observer.disconnect();
        observer = undefined;
        console.log('GitMash not listening...');
    }

    if (window.location.href.match('https:\/\/github.com\/.*?\/pull\/.*') == null) {
        return;
    }

    console.log(window.location.href);

    const developBranch = 'develop';
    const featureBranchPrefix = 'feature/';

    const baseBranch = document.querySelector('.base-ref')?.textContent;
    const headBranch = document.querySelector('.head-ref')?.textContent;

    if (!baseBranch || !headBranch) {
        return;
    }

    let mergeMethod;
    if (baseBranch === developBranch && headBranch.startsWith(featureBranchPrefix)) {
        mergeMethod = 'squash';
    } else {
        mergeMethod = 'merge';
    }

    const selector = '[aria-label="Conflicts"] + div button';

    let element = document.querySelector(selector);

    if (element) {
        showGitMash(element, mergeMethod);
    }

    observer = new MutationObserver(_ => {
        let element = document.querySelector(selector);
        if (element) {
            observer.disconnect();
            observer = undefined;
            console.log('GitMash not listening...')
            showGitMash(element, mergeMethod);
        }
    });
    console.log('GitMash listening...');
    observer.observe(document.body, { childList: true, subtree: true });
}

function showGitMash(element, mergeMethod) {
    const currentMethod = element.innerText.toLowerCase().trim();
    console.log('Current method: ' + currentMethod);

    let mashMessageElement = document.querySelector('.mash-message');
    if (!mashMessageElement) {
        const mergeMessageElement = document.querySelector('[aria-label="Conflicts"]').nextSibling;
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

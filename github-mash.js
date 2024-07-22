// ==UserScript==
// @name         GitHub Mash
// @version      0.0.1
// @description  Set your PR default GitHub Merge or Squash button based on where you are merging into
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

    const baseBranch = document.querySelector('.base-ref').textContent;
    const headBranch = document.querySelector('.head-ref').textContent;

    if (!baseBranch || !headBranch) {
        return;
    }

    let selector;
    if (baseBranch === developBranch && headBranch.startsWith(featureBranchPrefix)) {
        selector = '.js-merge-box-button-squash';
    } else {
        selector = '.js-merge-box-button-merge';
    }

    let element = document.querySelector(selector);

    if (element) {
        selectGitMash(element);
    } else {
        observer = new MutationObserver(_ => {
            let element = document.querySelector(selector);
            if (element) {
                observer.disconnect();
                observer = undefined;
                selectGitMash(element);
                console.log('GitMash not listening...')
            }
        });
        console.log('GitMash listening...');
        observer.observe(document.body, { childList: true, subtree: true });
    }
}

function selectGitMash(element) {
    element.click();
    console.log(element.textContent + ' selected!');
    const mergeMessage = document.querySelector('.merge-message');
    if (mergeMessage) {
        const span = document.createElement('span');
        span.innerText = '\u{1f954} Mashed! \u{1f954}';
        span.style.float = 'right';
        mergeMessage.prepend(span);
    }
}

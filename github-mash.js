// ==UserScript==
// @name         GitHub Mash
// @version      0.0.1
// @description  Set your PR default GitHub Merge or Squash button based on where you are merging into
// @match https://github.com/*/pull/*
// @license MIT
// @author robf-github
// @grant none
// ==/UserScript==

(function () {
    'use strict';

    const developBranch = 'develop';
    const featureBranchPrefix = 'feature/';

    const baseBranch = document.querySelector('.base-ref').textContent;
    const headBranch = document.querySelector('.head-ref').textContent;

    let selector;
    if (baseBranch === developBranch && headBranch.startsWith(featureBranchPrefix)) {
        selector = '.js-merge-box-button-squash';
    } else {
        selector = '.js-merge-box-button-merge';
    }

    waitForElement(selector).then(elm => {
        console.log(elm.textContent);
        document.querySelector(selector).click();
        console.log('Merge button type selected!');
    });
})();

function waitForElement(selector) {
    return new Promise(resolve => {
        if (document.querySelector(selector)) {
            return resolve(document.querySelector(selector));
        }
        const observer = new MutationObserver(mutations => {
            if (document.querySelector(selector)) {
                observer.disconnect();
                resolve(document.querySelector(selector));
            }
        });
        observer.observe(document.body, { childList: true, subtree: true });
    });
}
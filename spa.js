(function (exports) {
    'use strict';
    /* globals document, window, XMLHttpRequest */
    var
        spa = {
            settings: {
                createElement: function () {
                    return document.createElement.apply(document, arguments);
                },
                getElementById: function () {
                    return document.getElementById.apply(document, arguments);
                },
                geometry: function () {
                    return window;
                },
                insertPlaceholder: function (container) {
                    var ph = spa.settings.createElement('div');
                    ph.style.height = '1000px';
                    container.appendChild(ph);
                    return function () {
                        container.removeChild(ph);
                    };
                },
                loadPage: function (href, callback) {
                    var req = new XMLHttpRequest();
                    req.open('GET', href, true);
                    req.setRequestHeader('Accept', 'application/json');
                    req.onreadystatechange = function () {
                        if (req.readyState === 4) {
                            if (req.status === 200) {
                                callback(req.responseText);
                            } else {
                                console.log('Error loading page\n');
                            }
                        }
                    };
                    req.send(null);
                },
                loadCallback: function (container, responseText) {
                    var div = spa.settings.createElement('div');
                    div.innerHTML = responseText;
                    container.appendChild(div);
                    div.scrollIntoView();
                },
                menuOnClick: function (a, div) {
                    div.scrollIntoView();
                    return false;
                }
            }
        },
        forEach = function (nodes, callback) {
            for (var i in nodes) {
                if (nodes.hasOwnProperty(i)) {
                    callback(nodes[i]);
                }
            }
        },
        isScrolledIntoView = function (el, geometry) {
            var elemTop = el.getBoundingClientRect().top,
                isVisible = elemTop <= geometry().innerHeight;

            return isVisible;
        },
        loadedPages = [],
        fillDefaults = function (settings) {
            if (typeof settings === 'undefined') {
                settings = {};
            }
            for (var i in settings) {
                if (spa.settings.hasOwnProperty(i) && settings.hasOwnProperty(i)) {
                    spa.settings[i] = settings[i];
                }
            }
            return spa.settings;
        };
    spa.init = function (element, container, settings) {
        var child = container.children[0];

        settings = fillDefaults(settings);
        container.removeChild(child);
        forEach(element.children, function (a) {
            var div = settings.createElement('div');
            div.id = a.id + '_content';
            if (a.classList.contains('active')) {
                loadedPages.push(div.id);
                div.appendChild(child);
            }
            container.appendChild(div);
            a.onclick = function () {
                return settings.menuOnClick(a, div);
            };
        });
    };
    spa.scroll = function (element, settings) {
        var prevNav = null;
        settings = fillDefaults(settings);
        forEach(element.children, function (a) {
            var content = settings.getElementById(a.id + '_content'),
                removePlaceholder;
            if (isScrolledIntoView(content, settings.geometry)) {
                if (loadedPages.indexOf(content.id) === -1) {
                    removePlaceholder = settings.insertPlaceholder(content, settings.createElement);
                    loadedPages.push(content.id);
                    settings.loadPage(a.getAttribute('href'), function (responseText) {
                        removePlaceholder();
                        settings.loadCallback(content, responseText);
                    });
                }
                a.classList.add('active');
                if (prevNav) {
                    prevNav.classList.remove('active');
                }
                prevNav = a;
            } else {
                a.classList.remove('active');
            }
        });
    };
    exports.spa = spa;
})(typeof exports !== 'undefined' ? exports : window);

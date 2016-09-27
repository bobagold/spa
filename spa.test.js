describe('spa', function () {
    'use strict';
    var assert = require('assert'),
        sinon = require('sinon'),
        spa = require('./spa').spa,
        createLink = function (id) {
            return {
                id: id,
                classList: {contains: sinon.stub(), add: sinon.spy(), remove: sinon.spy()},
                getAttribute: sinon.stub()
            };
        },
        link = createLink('menu1'),
        menu = {children: [link]},
        createContainer = function (children) {
            return {
                children: children,
                removeChild: sinon.spy(),
                appendChild: sinon.spy()
            };
        };
    describe('init', function () {
        it('sets onclick on menu', function () {
            var
                originalContent = {},
                container = createContainer([originalContent]),
                newContent = createContainer([]),
                settings = {
                    menuOnClick: sinon.spy(),
                    createElement: sinon.stub()
                };
            link.classList.contains.returns(true);
            settings.createElement.returns(newContent);
            spa.init(menu, container, settings);
            assert(container.removeChild.calledWith(originalContent));
            assert(container.appendChild.calledWith(newContent));
            assert(newContent.appendChild.calledWith(originalContent));
            link.onclick();
            assert.equal('menu1_content', newContent.id);
            assert(settings.menuOnClick.calledWith(link, newContent));
        });
    });
    describe('scroll', function () {
        it('loads page', function () {
            var
                newContent = createContainer([]),
                settings = {
                    createElement: sinon.stub(),
                    getElementById: sinon.stub(),
                    geometry: sinon.stub(),
                    loadPage: sinon.stub(),
                    loadCallback: sinon.spy()
                };
            link.getAttribute.returns('/some-url');
            settings.createElement.returns({style: {}});
            settings.getElementById.withArgs('menu1_content').returns(newContent);
            settings.geometry.returns({innerHeight: 0});
            settings.loadPage.withArgs('/some-url').yields('text contents');
            newContent.getBoundingClientRect = sinon.stub().returns({top: 0});
            spa.scroll(menu, settings);
            assert(settings.loadCallback.called);
            assert.equal('text contents', settings.loadCallback.getCall(0).args[1]);
        });
    });
});

/**
 * @license
 * Copyright (c) 2018 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */

import {
  PropertyValues,
  UpdatingElement,
  Controller,
} from '../updating-element.js';
import {generateElementName} from './test-helpers.js';
import {assert} from '@esm-bundle/chai';

suite('UpdatingElement controllers', () => {
  class MyController implements Controller {
    host: UpdatingElement;
    willUpdateCount = 0;
    updateCount = 0;
    didUpdateCount = 0;
    connectedCount = 0;
    disconnectedCount = 0;
    callbackOrder: string[] = [];

    constructor(host: UpdatingElement) {
      this.host = host;
      this.host.addController(this);
    }

    connectedCallback() {
      this.connectedCount++;
      this.callbackOrder.push('connectedCallback');
    }

    disconnectedCallback() {
      this.disconnectedCount++;
      this.callbackOrder.push('disconnectedCallback');
    }

    willUpdate() {
      this.willUpdateCount++;
      this.callbackOrder.push('willUpdate');
    }

    update() {
      this.updateCount++;
      this.callbackOrder.push('update');
    }

    didUpdate() {
      this.didUpdateCount++;
      this.callbackOrder.push('didUpdate');
    }
  }

  class A extends UpdatingElement {
    static properties = {foo: {}};
    foo = 'foo';
    willUpdateCount = 0;
    updateCount = 0;
    didUpdateCount = 0;
    connectedCount = 0;
    disconnectedCount = 0;

    controller = new MyController(this);

    connectedCallback() {
      this.connectedCount++;
      super.connectedCallback();
    }

    disconnectedCallback() {
      this.disconnectedCount++;
      super.disconnectedCallback();
    }

    willUpdate(changedProperties: PropertyValues) {
      this.willUpdateCount++;
      super.willUpdate(changedProperties);
    }

    update(changedProperties: PropertyValues) {
      this.updateCount++;
      super.update(changedProperties);
    }

    didUpdate(changedProperties: PropertyValues) {
      this.didUpdateCount++;
      super.didUpdate(changedProperties);
    }
  }
  customElements.define(generateElementName(), A);

  let container: HTMLElement;
  let el!: A;

  setup(async () => {
    container = document.createElement('div');
    document.body.appendChild(container);
    el = new A();
    container.appendChild(el);
    await el.updateComplete;
  });

  teardown(() => {
    if (container && container.parentNode) {
      container.parentNode.removeChild(container);
    }
  });

  test('controllers can implement connectedCallback/disconnectedCallback', () => {
    assert.equal(el.connectedCount, 1);
    assert.equal(el.disconnectedCount, 0);
    assert.equal(el.controller.connectedCount, 1);
    assert.equal(el.controller.disconnectedCount, 0);
    container.removeChild(el);
    assert.equal(el.connectedCount, 1);
    assert.equal(el.disconnectedCount, 1);
    assert.equal(el.controller.connectedCount, 1);
    assert.equal(el.controller.disconnectedCount, 1);
    container.appendChild(el);
    assert.equal(el.connectedCount, 2);
    assert.equal(el.disconnectedCount, 1);
    assert.equal(el.controller.connectedCount, 2);
    assert.equal(el.controller.disconnectedCount, 1);
  });

  test('controllers can implement willUpdate/update/didUpdate', async () => {
    assert.equal(el.willUpdateCount, 1);
    assert.equal(el.updateCount, 1);
    assert.equal(el.didUpdateCount, 1);
    assert.equal(el.controller.willUpdateCount, 1);
    assert.equal(el.controller.updateCount, 1);
    assert.equal(el.controller.didUpdateCount, 1);
    el.foo = 'new';
    await el.updateComplete;
    assert.equal(el.willUpdateCount, 2);
    assert.equal(el.updateCount, 2);
    assert.equal(el.didUpdateCount, 2);
    assert.equal(el.controller.willUpdateCount, 2);
    assert.equal(el.controller.updateCount, 2);
    assert.equal(el.controller.didUpdateCount, 2);
  });

  test('controllers callback order', async () => {
    assert.deepEqual(el.controller.callbackOrder, [
      'connectedCallback',
      'willUpdate',
      'update',
      'didUpdate',
    ]);
    el.controller.callbackOrder = [];
    el.foo = 'new';
    await el.updateComplete;
    assert.deepEqual(el.controller.callbackOrder, [
      'willUpdate',
      'update',
      'didUpdate',
    ]);
    el.controller.callbackOrder = [];
    container.removeChild(el);
    assert.deepEqual(el.controller.callbackOrder, ['disconnectedCallback']);
  });
});
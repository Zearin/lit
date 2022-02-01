/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
import '../../polyfill-support-lite.js';
import {html, render} from '../../lit-html.js';
import {
  litCustomElements,
  LitHTMLElement,
} from '../../directives/lit-custom-element.js';
import {litSlot, renderLitShadow, flush} from '../../directives/lit-shadow.js';
import {range} from '../../directives/range.js';
import {map} from '../../directives/map.js';
import {assert} from '@esm-bundle/chai';

import '../lit-html_test.js';
// selected directive tests
import '../directives/class-map_test.js';
import '../directives/style-map_test.js';
import '../directives/live_test.js';
import '../directives/ref_test.js';
import '../directives/repeat_test.js';
import '../directives/template-content_test.js';
import '../directives/unsafe-html_test.js';

suite('polyfill-support-lite', () => {
  const nextFrame = () => new Promise<number>(requestAnimationFrame);

  let container: HTMLDivElement;

  setup(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });
  teardown(() => {
    container.remove();
  });

  suite('lit custom element', () => {
    test('upgrades when rendered', () => {
      class MyElement extends LitHTMLElement {
        upgraded = false;
        constructor() {
          super();
          this.upgraded = true;
        }

        method(v: string) {
          return v;
        }
      }
      litCustomElements.define('my-element', MyElement);
      //
      render(html`<my-element>Hi</my-element>`, container);
      const el = container.firstElementChild as MyElement;
      assert.isTrue(el.upgraded);
      const v = 'test';
      assert.equal(el.method(v), v);
    });

    test('upgrades lazily when rendered/updated', () => {
      const renderCe = () =>
        render(html`<my-element2>Hi</my-element2>`, container);
      renderCe();
      // not upgraded on initial render
      const el = container.firstElementChild;
      assert.notOk((el as MyElement).upgraded);
      class MyElement extends LitHTMLElement {
        upgraded = false;
        constructor() {
          super();
          this.upgraded = true;
        }
      }
      litCustomElements.define('my-element2', MyElement);
      // TODO: not upgraded on define, should it be?
      assert.notOk((el as MyElement).upgraded);
      // upgraded on re-render/update
      renderCe();
      assert.isTrue((el as MyElement).upgraded);
    });

    test('attributeChangedCallback/observedAttributes', () => {
      class MyElementOA extends LitHTMLElement {
        static override observedAttributes = ['foo'];
        attrChanges: Array<{
          name: string;
          old: null | string;
          value: null | string;
        }> = [];
        attributeChangedCallback(
          name: string,
          old: null | string,
          value: null | string
        ) {
          this.attrChanges.push({name, old, value});
        }
      }
      litCustomElements.define('my-element-oa', MyElementOA);
      //
      render(html`<my-element-oa>Hi</my-element-oa>`, container);
      const el = container.firstElementChild as MyElementOA;
      el.setAttribute('foo', '1');
      assert.equal(el.attrChanges.length, 1);
      assert.deepEqual(el.attrChanges[0], {name: 'foo', old: null, value: '1'});
      el.setAttribute('foo', '2');
      assert.equal(el.attrChanges.length, 2);
      assert.deepEqual(el.attrChanges[1], {name: 'foo', old: '1', value: '2'});
      el.removeAttribute('foo');
      assert.equal(el.attrChanges.length, 3);
      assert.deepEqual(el.attrChanges[2], {name: 'foo', old: '2', value: null});
      el.setAttribute('foo', '3');
      assert.equal(el.attrChanges.length, 4);
      assert.deepEqual(el.attrChanges[3], {name: 'foo', old: null, value: '3'});
      el.setAttribute('bar', '4');
      assert.equal(el.attrChanges.length, 4);
      el.removeAttribute('bar');
      assert.equal(el.attrChanges.length, 4);
    });

    test('connected/disconnected', () => {
      class MyElementCD extends LitHTMLElement {
        litConnected?: boolean;
        connectedCallback() {
          this.litConnected = true;
        }

        disconnectedCallback() {
          this.litConnected = false;
        }
      }
      litCustomElements.define('my-element-cd', MyElementCD);
      //
      const part = render(html`<my-element-cd>Hi</my-element-cd>`, container);
      let el = container.firstElementChild as MyElementCD;
      assert.isTrue(el.litConnected);
      part.setConnected(false);
      assert.isFalse(el.litConnected);
      part.setConnected(true);
      assert.isTrue(el.litConnected);
      const t = (v: boolean) =>
        html`${v ? html`<my-element-cd>Hi</my-element-cd>` : ''}`;
      render(t(true), container);
      // element disconnected when rendering another template
      assert.isFalse(el.litConnected);
      // element connected when rendered as nested template
      el = container.firstElementChild as MyElementCD;
      assert.isTrue(el.litConnected);
      // element disconnected when nested template is removed.
      render(t(false), container);
      assert.isFalse(el.litConnected);
    });
  });

  suite('lit shadow', () => {
    test('renders litShadow', () => {
      renderLitShadow(html`<div>shadow</div>`, container);
      render(html`<div>light</div>`, container);
      const shadowNode = container.firstElementChild;
      assert.equal(shadowNode!.textContent, 'shadow');
      const lightNode = container.lastElementChild;
      assert.equal(lightNode!.textContent, 'light');
      renderLitShadow(html`<div>shadow</div>`, container);
      // light content removed after rendering.
      assert.notOk(lightNode!.parentNode);
    });

    test('renders litSlot', async () => {
      const host = container;
      const renderLight = (count = 2) => {
        render(
          html`${map(range(count), (i) => html`<div id=${i}>${i}</div>`)}`,
          host
        );
      };
      const renderShadow = () => {
        renderLitShadow(html`<div>${litSlot()}</div>`, host);
      };
      renderShadow();
      const slotContainer = host.firstElementChild!;
      assert.equal(slotContainer.children.length, 0);
      assert.equal(host.children.length, 1);
      renderLight();
      assert.equal(host.children.length, 3);
      // renderShadow();
      // flush();
      await nextFrame();
      assert.equal(host.children.length, 1);
      assert.equal(slotContainer.children.length, 2);
      renderLight(5);
      await nextFrame();
      // flush();
      // renderShadow();
      assert.equal(host.children.length, 1);
      assert.equal(slotContainer.children.length, 5);
      renderLight(0);
      await nextFrame();
      // flush();
      // renderShadow();
      assert.equal(host.children.length, 1);
      assert.equal(slotContainer.children.length, 0);
      renderLight(10);
      flush();
      // renderShadow();
      await nextFrame();
      assert.equal(host.children.length, 1);
      assert.equal(slotContainer.children.length, 10);
      renderLight(4);
      // flush();
      // renderShadow();
      await nextFrame();
      assert.equal(host.children.length, 1);
      assert.equal(slotContainer.children.length, 4);
      // distributes when shadow renders
      renderLight(2);
      renderShadow();
      assert.equal(host.children.length, 1);
      assert.equal(slotContainer.children.length, 2);
      // distributes when flushed
      // distributes when shadow renders
      renderLight(6);
      flush();
      assert.equal(host.children.length, 1);
      assert.equal(slotContainer.children.length, 6);
    });

    test('renders litSlot into named slot', async () => {
      const host = container;
      const slotName = 'special';
      const renderLight = (count = 2) => {
        render(
          html`${map(
            range(count),
            (i) => html`<div slot=${i % 2 ? slotName : ''} id=${i}>${i}</div>`
          )}`,
          host
        );
      };
      const renderShadow = () => {
        renderLitShadow(html`<div>${litSlot(slotName)}</div>`, host);
      };
      renderShadow();
      const slotContainer = host.firstElementChild!;
      assert.equal(host.children.length, 1);
      assert.equal(slotContainer.children.length, 0);
      renderLight();
      await nextFrame();
      assert.equal(slotContainer.children.length, 1);
      renderLight(6);
      await nextFrame();
      assert.equal(host.children.length, 1);
      assert.equal(slotContainer.children.length, 3);
      renderLight(0);
      await nextFrame();
      assert.equal(host.children.length, 1);
      assert.equal(slotContainer.children.length, 0);
    });
  });
});
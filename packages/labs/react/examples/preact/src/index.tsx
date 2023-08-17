/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

/**
 * @fileoverview This file serves to test that React components made with
 * `@lit-labs/react` can be used in Preact projects without any type errors.
 */

import {render} from 'preact';
import {ElementA} from '@lit-internal/test-elements-react/element-a.js';
import {
  ElementEvents,
  EventSubclass,
  MyDetail,
  SpecialEvent,
} from '@lit-internal/test-elements-react/element-events.js';
import {ElementProps} from '@lit-internal/test-elements-react/element-props.js';

export function App() {
  return (
    <>
      <ElementA foo="foo" onAChanged={() => {}} />
      <ElementEvents
        foo="foo"
        onStringCustomEvent={(e: CustomEvent<String>) => {
          console.log(e);
        }}
        onNumberCustomEvent={(e: CustomEvent<Number>) => {
          console.log(e);
        }}
        onMyDetailCustomEvent={(e: CustomEvent<MyDetail>) => {
          console.log(e);
        }}
        onEventSubclass={(e: EventSubclass) => {
          console.log(e);
        }}
        onSpecialEvent={(e: SpecialEvent) => {
          console.log(e);
        }}
      />
      <ElementProps
        aStr="aStr"
        aNum={-1}
        aBool={false}
        aStrArray={['a', 'b']}
        aMyType={{
          a: 'a',
          b: -1,
          c: false,
          d: ['a', 'b'],
          e: 'isUnknown',
          strOrNum: 'strOrNum',
        }}
      />
    </>
  );
}

render(<App />, document.getElementById('app'));

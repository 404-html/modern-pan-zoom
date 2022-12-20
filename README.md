# Simple, Google Maps like, pan/zoom for the web

[Production demo](https://recordscanner.com/user/record-scanner/collection)

## Installation

```
yarn add modern-pan-zoom
```

## Example usage in React

```js
import ModernPanZoom from "modern-pan-zoom";
import { useEffect, useRef } from "react";

export default function App() {
  const elRef = useRef(null);

  useEffect(() => {
    if (!elRef.current) return;
    const panZoom = new ModernPanZoom(elRef.current, {
      autoScale: true, // sets initial zoom for child(s) to fit the parent, default: false
      onHint: (type, acknowledge) => {
        type === "pan" && alert("Use two fingers to navigate");
        type === "wheel" && alert("Use ⌘ + scroll to zoom");
      },
    });
  }, []);

  return (
    <div ref={elRef}>
      <h1>Wooohooooo!!!</h1>
    </div>
  );
}
```
